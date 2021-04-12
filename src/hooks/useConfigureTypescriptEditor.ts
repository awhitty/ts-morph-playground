import type { Monaco } from '@monaco-editor/react';
import { useEffect } from 'react';

export function useConfigureTypescriptEditor(monaco: Monaco | null) {
  useEffect(() => {
    if (monaco) {
      monaco.languages.typescript.typescriptDefaults.setCompilerOptions({
        target: monaco.languages.typescript.ScriptTarget.ES2016,
        allowNonTsExtensions: true,
        moduleResolution:
          monaco.languages.typescript.ModuleResolutionKind.NodeJs,
        noEmit: true,
        esModuleInterop: true,
      });
    }
  }, [monaco]);
}
