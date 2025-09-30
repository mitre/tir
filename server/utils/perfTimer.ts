interface Timer {
  startTime: number;
  totalTime: number;
  maxTime: number;
  count: number;
}

interface Summary {
  name: string;
  maxTime: number;
  averageTime: number;
  count: number;
  percentageOfGlobal: string;
}

export class PerfTimer {
  private timers: Record<string, Timer>;
  private globalStartTime: number;
  private globalTotalTime: number;
  private enabled: boolean;

  constructor() {
    this.timers = {};
    this.globalStartTime = performance.now();
    this.globalTotalTime = 0;
    this.enabled = false;
  }

  enable(): void {
    this.enabled = true;
  }

  start(name: string): void {
    if (this.enabled) {
      if (!this.timers[name]) {
        this.timers[name] = { startTime: 0, totalTime: 0, maxTime: 0, count: 0 };
      }
      this.timers[name].startTime = performance.now();
    }
  }

  stop(name: string): void {
    if (this.enabled) {
      if (!this.timers[name] || !this.timers[name].startTime) {
        console.error(`Timer ${name} was not started or already stopped.`);
        return;
      }

      const elapsedTime = performance.now() - this.timers[name].startTime;
      this.timers[name].totalTime += elapsedTime;
      this.timers[name].maxTime = Math.max(this.timers[name].maxTime, elapsedTime);
      this.timers[name].count += 1;
      this.timers[name].startTime = 0; // Reset start time

      // Update global total time
      this.globalTotalTime = performance.now() - this.globalStartTime;
    }
  }

  summary(name: string): Summary | undefined {
    if (this.enabled) {
      if (!this.timers[name]) {
        console.error(`Timer ${name} does not exist.`);
        return;
      }

      const { totalTime, maxTime, count } = this.timers[name];
      const averageTime = totalTime / count;
      const percentageOfGlobal = (totalTime / this.globalTotalTime) * 100;

      return {
        name,
        maxTime,
        averageTime,
        count,
        percentageOfGlobal: percentageOfGlobal.toFixed(2) + "%",
      };
    }
  }

  globalSummaryPrint(): void {
    if (this.enabled) {
      console.log({
        globalTotalTime: this.globalTotalTime,
        timers: Object.keys(this.timers).map((name) => this.summary(name)!),
      });
    }
  }
}
