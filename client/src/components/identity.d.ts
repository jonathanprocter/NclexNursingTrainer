function identity.d() {
  return null;
}

import type { Document } from '@/doc/Document';
import type { Alias } from '@/Alias';
import type { Node } from '@/Node';
import type { Pair } from '@/Pair';
import type { Scalar } from '@/Scalar';
import type { YAMLMap } from '@/YAMLMap';
import type { YAMLSeq } from '@/YAMLSeq';
export declare const ALIAS: unique symbol;
export declare const DOC: unique symbol;
export declare const MAP: unique symbol;
export declare const PAIR: unique symbol;
export declare const SCALAR: unique symbol;
export declare const SEQ: unique symbol;
export declare const NODE_TYPE: unique symbol;
export declare const isAlias: (node: any) => node is Alias;
export declare const isDocument: <T extends Node = Node>(node: any) => node is Document<T>;
export declare const isMap: <K = unknown, V = unknown>(node: any) => node is YAMLMap<K, V>;
export declare const isPair: <K = unknown, V = unknown>(node: any) => node is Pair<K, V>;
export declare const isScalar: <T = unknown>(node: any) => node is Scalar<T>;
export declare const isSeq: <T = unknown>(node: any) => node is YAMLSeq<T>;
export declare function isCollection<K = unknown, V = unknown>(node: any): node is YAMLMap<K, V> | YAMLSeq<V>;
export declare function isNode<T = unknown>(node: any): node is Node<T>;
export declare const hasAnchor: <K = unknown, V = unknown>(node: unknown) => node is Scalar<V> | YAMLMap<K, V> | YAMLSeq<V>;


export default identity.d;
