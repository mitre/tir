type Resolve = () => void;
type Reject = (e?: unknown) => void;

interface Signal {
  promise: Promise<void>;
  resolve: Resolve;
  reject: Reject;
}

const signals = new Map<string, Signal>();

export function getSignal(name: string): Signal {
  if (!signals.has(name)) {
    let resolveFn!: Resolve;
    let rejectFn!: Reject;

    const promise = new Promise<void>((resolve, reject) => {
      resolveFn = resolve;
      rejectFn = reject;
    });

    signals.set(name, { promise, resolve: resolveFn, reject: rejectFn });
  }
  return signals.get(name)!;
}

export function waitForSignal(name: string): Promise<void> {
  return getSignal(name).promise;
}

export function signalReady(name: string): void {
  getSignal(name).resolve();
}
