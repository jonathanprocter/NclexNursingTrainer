function types-Cxp8y2TL.d() {
  return null;
}

type RequiredProperty<Type, Keys extends keyof Type> = Type & {
    [P in Keys]-?: Type[P];
};

export type { RequiredProperty as R };


export default types-Cxp8y2TL.d;
