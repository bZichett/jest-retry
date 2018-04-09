function deepEqual(a, b) {
  const ka = Object.keys(a)
  const kb = Object.keys(b)

  if (ka.length !== kb.length)
    return false;

  ka.sort();
  kb.sort();

  for (let i = ka.length - 1; i >= 0; i--) {
    if (ka[i] !== kb[i])
      return false;
  }

  let key
  for (let i = ka.length - 1; i >= 0; i--) {
    key = ka[i];
    if (!deepEqual(a[key], b[key])) return false;
  }

  return typeof(a) === typeof(b)
}

module.exports = deepEqual