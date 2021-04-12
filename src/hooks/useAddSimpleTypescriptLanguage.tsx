import type { Monaco } from '@monaco-editor/react';
import { useEffect } from 'react';
import * as simpleTypescript from '../editor/simple_typescript_language';

export function useAddSimpleTypescriptLanguage(monaco: Monaco | null) {
  useEffect(() => {
    if (monaco) {
      monaco.languages.register(simpleTypescript.meta);

      monaco.languages.setMonarchTokensProvider(
        simpleTypescript.meta.id,
        simpleTypescript.language,
      );

      monaco.languages.setLanguageConfiguration(
        simpleTypescript.meta.id,
        simpleTypescript.conf,
      );
    }
  }, [monaco]);
}
