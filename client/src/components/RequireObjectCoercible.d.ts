function RequireObjectCoercible.d() {
  return null;
}

declare function RequireObjectCoercible<T extends {}>(value: T, optMessage?: string): T;

export = RequireObjectCoercible;


export default RequireObjectCoercible.d;
