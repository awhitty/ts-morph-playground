export function compileModule(
  code: string,
  globals: Record<string, any> = {},
  modules: Record<string, any> = {},
) {
  const exports = {};
  const module = { exports };
  const globalNames = Object.keys(globals);
  const moduleResolver = (name: string) => modules[name];
  const keys = ['require', 'module', 'exports', ...globalNames];
  const values = [
    moduleResolver,
    module,
    exports,
    ...globalNames.map((key) => globals[key]),
  ];
  new Function(keys.join(), code).apply(exports, values);
  return module.exports;
}
