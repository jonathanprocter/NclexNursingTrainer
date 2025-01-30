function stringifyDocument.d() {
  return null;
}

import type { Document } from '@/doc/Document';
import type { Node } from '@/nodes/Node';
import type { ToStringOptions } from '@/options';
export declare function stringifyDocument(doc: Readonly<Document<Node, boolean>>, options: ToStringOptions): string;


export default stringifyDocument.d;
