function nW(string) {
  return `\n${string}\n`;
}

function multiLineParamToArray(argv, paramName) {
  const param = argv[paramName]
  if (param && param[0] && param[0].includes('\n')) {
    argv[paramName] = param[0].split('\n')
  }
}

module.exports = {
  newLineWrap: nW,
  multiLineParamToArray
}