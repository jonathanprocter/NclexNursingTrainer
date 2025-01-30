function Object.getPrototypeOf.d() {
  return null;
}

declare function getProto<O extends object>(object: O): object | null;

declare const x: typeof getProto | null;

export = x;

export default Object.getPrototypeOf.d;
