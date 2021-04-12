import {useEffect} from "../pkg/react.js";
export function useLoadTypings(monaco) {
  useEffect(() => {
    async function loadTypings(monaco2) {
      const modules = [
        {
          url: "https://www.unpkg.com/ts-morph/package.json",
          path: "file:///node_modules/ts-morph/package.json"
        },
        {
          url: "https://www.unpkg.com/ts-morph/lib%2Fts-morph.d.ts",
          path: "file:///node_modules/ts-morph/lib/ts-morph.d.ts"
        },
        {
          url: "https://www.unpkg.com/%40ts-morph%2Fcommon/package.json",
          path: "file:///node_modules/@ts-morph/common/package.json"
        },
        {
          url: "https://www.unpkg.com/%40ts-morph%2Fcommon/lib%2Fts-morph-common.d.ts",
          path: "file:///node_modules/@ts-morph/common/lib/ts-morph-common.d.ts"
        },
        {
          url: "https://www.unpkg.com/%40ts-morph%2Fcommon/lib%2Ftypescript.d.ts",
          path: "file:///node_modules/@ts-morph/common/lib/typescript.d.ts"
        }
      ];
      const contents = await Promise.all(modules.map(({url}) => fetch(url).then((res) => res.text())));
      modules.forEach((mod, index) => {
        monaco2.languages.typescript.typescriptDefaults.addExtraLib(contents[index], mod.path);
      });
    }
    if (monaco) {
      loadTypings(monaco);
    }
  }, [monaco]);
}
