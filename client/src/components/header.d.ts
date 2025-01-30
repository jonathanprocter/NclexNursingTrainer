function header.d() {
  return null;
}

/**
 * The header type declaration of `undici`.
 */
export type IncomingHttpHeaders = Record<string, string | string[] | undefined>;


export default header.d;
