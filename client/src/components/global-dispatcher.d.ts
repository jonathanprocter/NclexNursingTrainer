function global-dispatcher.d() {
  return null;
}

import Dispatcher from '@/dispatcher';

export {
  getGlobalDispatcher,
  setGlobalDispatcher
}

declare function setGlobalDispatcher<DispatcherImplementation extends Dispatcher>(dispatcher: DispatcherImplementation): void;
declare function getGlobalDispatcher(): Dispatcher;


export default global-dispatcher.d;
