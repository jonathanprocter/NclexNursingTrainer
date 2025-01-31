import { worker } from './setup';

if (import.meta.env.DEV) {
  worker.start({
    onUnhandledRequest: 'bypass',
  }).catch(console.error);
}

export { worker };