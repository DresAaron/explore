/**
 * RequestQueue is a class that manages a queue of requests.
 * It will execute requests parallelly maxing out at a certain number of requests at the same time.
 */

export interface RequestQueueOptions {
  maxConcurrentRequests: number;
  ignoreNextFlush?: boolean;
}

export class RequestQueue {
  private __queue: any[] = [];
  private __maxConcurrentRequests!: number;

  private __next = false;
  private __pendingRequests = 0;
  private __ignoreNextFlush = false;

  constructor(options: RequestQueueOptions) {
    this.__maxConcurrentRequests = options.maxConcurrentRequests ?? 6;
    this.__queue = [];
    this.__pendingRequests = 0;
    this.__ignoreNextFlush = options.ignoreNextFlush ?? false;
  }

  private __eventMap = new Map<string, any>();
  on(event: string, callback: any) {
    const eventCallbacks = this.__eventMap.get(event) ?? [];
    eventCallbacks.push(callback);
    this.__eventMap.set(event, eventCallbacks);
  }

  off(event: string, callback: any) {
    const eventCallbacks = this.__eventMap.get(event) ?? [];
    const newCallbacks = eventCallbacks.filter((cb: any) => cb !== callback);
    this.__eventMap.set(event, newCallbacks);
  }

  once(event: string, callback: any) {
    return new Promise((resolve) => {
      const onceCallback = async (data: any) => {
        await callback(data);
        resolve(undefined);
        this.off(event, onceCallback);
      };
      this.on(event, onceCallback);
    });
  }

  private __emit(event: string, data: any) {
    const eventCallbacks = this.__eventMap.get(event) ?? [];
    eventCallbacks.forEach((cb: any) => cb(data));
  }

  /**
   * Add a request to the queue
   */
  insert(request: any) {
    this.__queue.push(request);
    this.__next = true;
    this.selfExecute();
  }

  /**
   * Execute a request
   */
  private async selfExecute() {
    if (!this.__next) {
      return;
    }

    if (this.__queue.length === 0) {
      return;
    }

    if (this.__pendingRequests == this.__maxConcurrentRequests) {
      return;
    }

    const request = this.__queue.shift();
    this.__pendingRequests++;
    await request();
    this.__pendingRequests--;

    if (
      this.__queue.length === 0 &&
      this.__pendingRequests === 0 &&
      !this.__ignoreNextFlush
    ) {
      this.stop();
      this.__emit('queueCompleted', null);
      return;
    }

    this.selfExecute();
  }

  /**
   * Stop the queue
   */
  stop() {
    this.__next = false;
  }

  ignoreNextFlush(value: boolean) {
    this.__ignoreNextFlush = value;
  }
}
