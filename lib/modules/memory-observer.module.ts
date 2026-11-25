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

/** Qualunque logger con un metodo log() (LoggerService di Nest, ConsoleLogger, il tuo servizio...). */
export interface MemoryObserverLogger {
  log(message: any, ...optionalParams: any[]): any;
}

export interface MemoryObserverOptions {
  /** Ogni quanti ms scrivere una riga. Default: 5 minuti. */
  intervalMs?: number;
  /** Se assente usa console.log. */
  logger?: MemoryObserverLogger;
}

export const MEMORY_OBSERVER_OPTIONS = Symbol('MEMORY_OBSERVER_OPTIONS');
const DEFAULT_INTERVAL_MS = 5 * 60 * 1000;
const MB = (n: number) => Math.round(n / 1048576);

@Injectable()
export class MemoryObserverService implements OnModuleInit, OnModuleDestroy {
  private readonly intervalMs: number;
  private readonly logger?: MemoryObserverLogger;
  private timer?: NodeJS.Timeout;
  private observer?: PerformanceObserver;

  // contatori azzerati a ogni riga di log
  private majorCount = 0;
  private majorMs = 0;
  // ultimo valore di heapUsed misurato subito dopo un GC completo (approssimato)
  private afterMajorGC = 0;

  constructor(@Inject(MEMORY_OBSERVER_OPTIONS) options: MemoryObserverOptions) {
    this.intervalMs = options?.intervalMs ?? DEFAULT_INTERVAL_MS;
    this.logger = options?.logger;
  }

  onModuleInit() {
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
    this.timer.unref(); // non tiene vivo il processo
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
      // il log di diagnostica non deve mai far cadere l'app
    }
  }
}

@Module({})
export class MemoryObserverModule {
  /** Opzioni statiche: MemoryObserverModule.forRoot() oppure forRoot({ intervalMs, logger }). */
  static forRoot(options: MemoryObserverOptions = {}): DynamicModule {
    return {
      module: MemoryObserverModule,
      providers: [
        { provide: MEMORY_OBSERVER_OPTIONS, useValue: options },
        MemoryObserverService,
      ],
    };
  }

  /** Per prendere il logger dall'injection di Nest. */
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