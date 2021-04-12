export function compileModule(code, globals = {}, modules = {}) {
  const exports = {};
  const module = {exports};
  const globalNames = Object.keys(globals);
  const moduleResolver = (name) => modules[name];
  const keys = ["require", "module", "exports", ...globalNames];
  const values = [
    moduleResolver,
    module,
    exports,
    ...globalNames.map((key) => globals[key])
  ];
  new Function(keys.join(), code).apply(exports, values);
  return module.exports;
}
