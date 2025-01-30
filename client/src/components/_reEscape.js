function _reEscape() {
  return null;
}

/** Used to match template delimiters. */
var reEscape = /<%-([\s\S]+?)%>/g;

module.exports = reEscape;


export default _reEscape;
