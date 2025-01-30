function read-package.d() {
  return null;
}

/**
 * Traverses the directory tree until a package.json file is found.
 *
 * @throws if the root directory is reached, and no package.json is found.
 */
export declare function readPackage(): Record<string, unknown>;


export default read-package.d;
