import {useEffect} from "../../_snowpack/pkg/react.js";
export function useConfigureTypescriptEditor(monaco) {
  useEffect(() => {
    if (monaco) {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2016,
        allowNonTsExtensions: true,
        moduleResolution: monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        noEmit: true,
        esModuleInterop: true
      });
    }
  }, [monaco]);
}
