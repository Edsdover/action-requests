export function titlecase(str) {
  if (!str) { return ''; }
  return str.replace(/\b\S/g, function(t) { return t.toUpperCase(); });
}
