import { RequestQueue } from '../src/request-queue';

const requestQueue = new RequestQueue({
  maxConcurrentRequests: 3,
  ignoreNextFlush: true,
});

requestQueue.on('queueCompleted', () => {
  console.log('All requests finished');
});

const request = async (data: number) => {
  console.log(`Request started with data: ${data}`);
  await new Promise((resolve) => setTimeout(resolve, 1000));
  console.log(`Request finished with data: ${data}`);
};

Array.from({ length: 10 }, (_, i) => requestQueue.insert(() => request(i)));

new Promise((resolve) => setTimeout(resolve, 13000)).then(() => {
  Array.from({ length: 4 }, (_, i) => requestQueue.insert(() => request(i)));
  requestQueue.ignoreNextFlush(false);
});

// promise?.then(() => {
//   console.log('All requests finished');
// });

// requestQueue.pendingProcess?.then(() => {
//   console.log('All requests finished');
// });
