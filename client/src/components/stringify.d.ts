function stringify.d() {
  return null;
}

import type { Document } from '@/doc/Document';
import type { Alias } from '@/nodes/Alias';
import type { ToStringOptions } from '@/options';
export type StringifyContext = {
    actualString?: boolean;
    allNullValues?: boolean;
    anchors: Set<string>;
    doc: Document;
    forceBlockIndent?: boolean;
    implicitKey?: boolean;
    indent: string;
    indentStep: string;
    indentAtStart?: number;
    inFlow: boolean | null;
    inStringifyKey?: boolean;
    flowCollectionPadding: string;
    options: Readonly<Required<Omit<ToStringOptions, 'collectionStyle' | 'indent'>>>;
    resolvedAliases?: Set<Alias>;
};
export declare function createStringifyContext(doc: Document, options: ToStringOptions): StringifyContext;
export declare function stringify(item: unknown, ctx: StringifyContext, onComment?: () => void, onChompKeep?: () => void): string;


export default stringify.d;
