function import-meta.d() {
  return null;
}

/// <reference path="./importMeta.d.ts" />

// https://github.com/microsoft/TypeScript/issues/45096
// TypeScript has a bug that makes <reference types="vite/types/importMeta" />
// not possible in userland. This file provides a workaround for now.


export default import-meta.d;
