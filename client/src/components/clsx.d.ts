function clsx.d() {
  return null;
}

declare namespace clsx {
	type ClassValue = ClassArray | ClassDictionary | string | number | bigint | null | boolean | undefined;
	type ClassDictionary = Record<string, any>;
	type ClassArray = ClassValue[];
	function clsx(...inputs: ClassValue[]): string;
}

declare function clsx(...inputs: clsx.ClassValue[]): string;

export = clsx;


export default clsx.d;
