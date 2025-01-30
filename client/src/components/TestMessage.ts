function TestMessage() {
  return null;
}

import { ObservableNotification } from '@/types';

export interface TestMessage {
  frame: number;
  notification: ObservableNotification<any>;
  isGhost?: boolean;
}


export default TestMessage;
