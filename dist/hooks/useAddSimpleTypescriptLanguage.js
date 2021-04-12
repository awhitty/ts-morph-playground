import {useEffect} from "../pkg/react.js";
import * as simpleTypescript from "../editor/simple_typescript_language.js";
export function useAddSimpleTypescriptLanguage(monaco) {
  useEffect(() => {
    if (monaco) {
      monaco.languages.register(simpleTypescript.meta);
      monaco.languages.setMonarchTokensProvider(simpleTypescript.meta.id, simpleTypescript.language);
      monaco.languages.setLanguageConfiguration(simpleTypescript.meta.id, simpleTypescript.conf);
    }
  }, [monaco]);
}
