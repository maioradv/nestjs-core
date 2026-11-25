import {
  DynamicModule,
  Inject,
  Injectable,
  Module,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import * as v8 from 'v8';
import { PerformanceObserver, constants } from 'perf_hooks';

/** Any logger exposing a log() method (Nest LoggerService, ConsoleLogger, a custom service...). */
export interface MemoryObserverLogger {
  log(message: any, ...optionalParams: any[]): any;
}

export interface MemoryObserverOptions {
  /** Milliseconds between log lines. Default: 5 minutes. */
  intervalMs?: number;
  /** Falls back to console.log when omitted. */
  logger?: MemoryObserverLogger;
  /** When false the module does nothing (no observer, no timer). Default: true. */
  enabled?: boolean;
}

export const MEMORY_OBSERVER_OPTIONS = Symbol('MEMORY_OBSERVER_OPTIONS');
const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;
const MB = (n: number) => Math.round(n / 1048576);

@Injectable()
export class MemoryObserverService implements OnModuleInit, OnModuleDestroy {
  private readonly enabled: boolean;
  private readonly intervalMs: number;
  private readonly logger?: MemoryObserverLogger;
  private timer?: NodeJS.Timeout;
  private observer?: PerformanceObserver;

  private majorCount = 0;
  private majorMs = 0;
  // Heap used right after the last major GC; approximate, since the observer is notified asynchronously
  private afterMajorGC = 0;

  constructor(@Inject(MEMORY_OBSERVER_OPTIONS) options: MemoryObserverOptions) {
    this.enabled = options?.enabled ?? true;
    this.intervalMs = options?.intervalMs ?? DEFAULT_INTERVAL_MS;
    this.logger = options?.logger;
  }

  onModuleInit() {
    if (!this.enabled) return;

    this.observer = new PerformanceObserver((list) => {
      for (const entry of list.getEntries() as any[]) {
        const kind = entry.detail?.kind ?? entry.kind;
        if (kind === constants.NODE_PERFORMANCE_GC_MAJOR) {
          this.majorCount++;
          this.majorMs += entry.duration;
          this.afterMajorGC = v8.getHeapStatistics().used_heap_size;
        }
      }
    });
    this.observer.observe({ entryTypes: ['gc'] });

    this.timer = setInterval(() => this.write(), this.intervalMs);
    this.timer.unref();
  }

  onModuleDestroy() {
    if (this.timer) clearInterval(this.timer);
    this.observer?.disconnect();
  }

  private write() {
    try {
      const m = process.memoryUsage();
      const old = v8
        .getHeapSpaceStatistics()
        .find((s) => s.space_name === 'old_space');

      const line = JSON.stringify({
        tag: 'memlog',
        rss: MB(m.rss),
        heapUsed: MB(m.heapUsed),
        heapTotal: MB(m.heapTotal),
        oldUsed: MB(old?.space_used_size ?? 0),
        external: MB(m.external),
        arrayBuffers: MB(m.arrayBuffers),
        afterMajorGC: MB(this.afterMajorGC),
        majorGCs: this.majorCount,
        majorGCms: Math.round(this.majorMs),
        limit: MB(v8.getHeapStatistics().heap_size_limit),
      });

      this.majorCount = 0;
      this.majorMs = 0;

      if (this.logger) this.logger.log(line, 'MemoryObserver');
      else console.log(line);
    } catch {
      // diagnostics must never crash the app
    }
  }
}

@Module({})
export class MemoryObserverModule {
  static forRoot(options: MemoryObserverOptions = {}): DynamicModule {
    return {
      module: MemoryObserverModule,
      providers: [
        { provide: MEMORY_OBSERVER_OPTIONS, useValue: options },
        MemoryObserverService,
      ],
    };
  }

  static forRootAsync(options: {
    imports?: any[];
    inject?: any[];
    useFactory: (...args: any[]) => MemoryObserverOptions | Promise<MemoryObserverOptions>;
  }): DynamicModule {
    return {
      module: MemoryObserverModule,
      imports: options.imports ?? [],
      providers: [
        {
          provide: MEMORY_OBSERVER_OPTIONS,
          useFactory: options.useFactory,
          inject: options.inject ?? [],
        },
        MemoryObserverService,
      ],
    };
  }
}