import { LoggerService } from '@nestjs/common';

export type ResourceGuardOptions = {
  /** CPU limit in percent (per core). Optional. */
  cpuLimit?: number;

  /** Memory limit in MB (RSS). Optional. */
  memoryLimitMb?: number;

  /** Interval in ms to check CPU/memory. Default: 2000 */
  sampleIntervalMs?: number;

  /** How long in ms the limit must be exceeded before shutdown. Default: 10000 */
  sustainForMs?: number;

  /** Maximum time in ms to wait for shutdownFn before hard kill. Default: 5000 */
  hardKillAfterMs?: number;

  /** Optional async shutdown function. If provided, will be called before hard exit. */
  shutdownFn?: () => Promise<void>;

  /** Optional NestJS LoggerService to use for logging. */
  logger?: LoggerService;
};

export class ResourceGuard {
  private lastCpu = process.cpuUsage();
  private lastTime = Date.now();
  private overSince: number | null = null;
  private shuttingDown = false;

  constructor(private readonly opts: ResourceGuardOptions) {
    this.opts.sampleIntervalMs ??= 2000;
    this.opts.sustainForMs ??= 10000;
    this.opts.hardKillAfterMs ??= 5000;
  }

  /** Start monitoring CPU and memory */
  start() {
    if (!this.opts.cpuLimit && !this.opts.memoryLimitMb) return;
    setInterval(() => this.check(), this.opts.sampleIntervalMs!).unref();
  }

  private async check() {
    if (this.shuttingDown) return;

    const nowTime = Date.now();
    let over = false;
    let currentCpuPercent: number | null = null;
    let currentMemMb: number | null = null;

    if (this.opts.cpuLimit) {
      const now = process.cpuUsage(this.lastCpu);
      const elapsedMs = nowTime - this.lastTime;
      const cpuMs = (now.user + now.system) / 1000;
      currentCpuPercent = (cpuMs / elapsedMs) * 100;

      if (currentCpuPercent > this.opts.cpuLimit) over = true;
      this.lastCpu = process.cpuUsage();
    }

    if (this.opts.memoryLimitMb) {
      currentMemMb = process.memoryUsage().rss / 1024 / 1024;
      if (currentMemMb > this.opts.memoryLimitMb) over = true;
    }

    this.lastTime = nowTime;

    if (over) {
      if (!this.overSince) this.overSince = nowTime;

      if (nowTime - this.overSince! >= this.opts.sustainForMs!) {
        await this.shutdown(currentCpuPercent, currentMemMb);
      }
    } else {
      this.overSince = null;
    }
  }

  private async shutdown(currentCpu: number | null, currentMem: number | null) {
    if (this.shuttingDown) return;
    this.shuttingDown = true;

    const log = (msg: string) => {
      if (this.opts.logger) this.opts.logger.error(`${msg}`);
      else console.error(`${msg}`);
    };

    const overTimeMs = this.overSince ? Date.now() - this.overSince : 0;
    const cpuMsg = this.opts.cpuLimit ? ` CPU: ${currentCpu?.toFixed(1)}% (${this.opts.cpuLimit}%)` : '';
    const memMsg = this.opts.memoryLimitMb ? ` Memory: ${currentMem?.toFixed(0)}MB (${this.opts.memoryLimitMb}MB)` : '';
    const append = [cpuMsg, memMsg, ` Exceeded for: ${overTimeMs}ms (${this.opts.sustainForMs}ms)`].filter(Boolean).join(';');
    log(`LIMIT EXCEEDED → initiating shutdown;${append}`);

    const hardKill = setTimeout(() => {
      log('HARD EXIT');
      process.exit(1);
    }, this.opts.hardKillAfterMs);

    try {
      if (this.opts.shutdownFn) {
        await this.opts.shutdownFn();
        log('Soft shutdown completed successfully');
      }
    } catch (e) {
      log(`shutdownFn failed: ${(e as Error).message}`);
    } finally {
      clearTimeout(hardKill);
      process.exit(1);
    }
  }
}
