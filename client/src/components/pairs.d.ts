function pairs.d() {
  return null;
}

import type { CreateNodeContext } from '@/../doc/createNode';
import type { ParsedNode } from '@/../nodes/Node';
import { Pair } from '@/../nodes/Pair';
import type { YAMLMap } from '@/../nodes/YAMLMap';
import { YAMLSeq } from '@/../nodes/YAMLSeq';
import type { Schema } from '@/../schema/Schema';
import type { CollectionTag } from '@/types';
export declare function resolvePairs(seq: YAMLSeq.Parsed<ParsedNode | Pair<ParsedNode, ParsedNode | null>> | YAMLMap.Parsed, onError: (message: string) => void): YAMLSeq.Parsed<Pair<ParsedNode, ParsedNode | null>>;
export declare function createPairs(schema: Schema, iterable: unknown, ctx: CreateNodeContext): YAMLSeq<unknown>;
export declare const pairs: CollectionTag;


export default pairs.d;
