import { useMonaco } from '@monaco-editor/react';
import base64url from 'base64url';
import produce from 'immer';
import React, { useEffect, useState } from 'react';
import SplitPane from 'react-splitter-layout';
import 'react-splitter-layout/lib/index.css';
import './App.css';
import { compileModule } from './compileModule';
import {
  EditorModel,
  FancyTypescriptEditor,
} from './components/FancyTypescriptEditor';
import { TreeNodeViewer } from './components/TreeNodeViewer';
import { INITIAL_TRANSFORM } from './constants';
import { darkTheme } from './editor/dark_theme';
import { useAddSimpleTypescriptLanguage } from './hooks/useAddSimpleTypescriptLanguage';
import { useConfigureTypescriptEditor } from './hooks/useConfigureTypescriptEditor';
import { useDebounce } from './hooks/useDebounce';
import { useLoadTypings } from './hooks/useLoadTypings';
import { usePrefersDarkMode } from './hooks/usePrefersDarkMode';
import { tsm } from './lib/ts-morph';

const sourceProject = new tsm.Project({
  useInMemoryFileSystem: true,
});

interface AppProps {}

const EDITOR_DEBOUNCE_MS = 500;

const PRESETS = {
  blank: {
    name: 'Blank',
    state: {
      inputs: [
        {
          path: 'index.ts',
          content: `
// File intentionally left blank
    `.trim(),
        },
      ],
      transform: {
        path: 'transform.ts',
        content: `
import { Project } from 'ts-morph';

export default function transform(project: Project) {
  // to-do!
};
        `.trim(),
      },
    },
  },
  replaceVarWithConst: {
    name: 'Replace var with const',
    state: {
      inputs: [
        {
          path: 'index.ts',
          content: `
export var someVariable = "Never change";
    `.trim(),
        },
      ],
      transform: {
        path: 'transform.ts',
        content: INITIAL_TRANSFORM,
      },
    },
  },
  renameAcrossFiles: {
    name: 'Rename across files',
    state: {
      inputs: [
        {
          path: 'file_a.ts',
          content: `
export function getString(): string {
  return 'Rising crust pizza';
}
    `.trim(),
        },
        {
          path: 'file_b.ts',
          content: `
import { getString } from './file_a';

getString();
    `.trim(),
        },
      ],
      transform: {
        path: 'transform.ts',
        content: `
import { Project } from 'ts-morph';

export default function transform(project: Project) {
  const file = project.getSourceFileOrThrow('file_a.ts');
  const declaration = file.getFunctionOrThrow('getString');
  declaration.rename('getPizzaKind');
}
        `.trim(),
      },
    },
  },
};

function useDarkModeClassName(prefersDarkMode: boolean) {
  useEffect(() => {
    if (prefersDarkMode) {
      document.body.classList.add('dark');
    } else {
      document.body.classList.remove('dark');
    }
  }, [prefersDarkMode]);
}

type WrappedSourceFile = {
  node: tsm.SourceFile;
};

type CoreState = {
  inputs: EditorModel[];
  transform: EditorModel;
};

function isString(val: unknown): val is string {
  return typeof val === 'string';
}

function isObject(val: unknown): val is Object {
  return val instanceof Object;
}

function isEditorModel(val: unknown): val is EditorModel {
  return (
    isObject(val) &&
    'path' in val &&
    isString(val['path']) &&
    'content' in val &&
    isString(val['content'])
  );
}

function isCoreState(val: unknown): val is CoreState {
  return (
    isObject(val) &&
    'inputs' in val &&
    Array.isArray(val['inputs']) &&
    (val['inputs'] as Array<unknown>).every(isEditorModel) &&
    'transform' in val &&
    isEditorModel(val['transform'])
  );
}

function getStateFromHash(hash: string): CoreState | null {
  if (hash.length === 0) {
    return null;
  }

  try {
    const parsed = JSON.parse(
      base64url.decode(hash.slice(1).split('code/')[1]),
    );
    return isCoreState(parsed) ? parsed : null;
  } catch (e) {
    console.error(e);
    return null;
  }
}

function getStateFromLocalStorage(): CoreState | null {
  const item = localStorage.getItem('coreState');

  if (!item) {
    return null;
  }

  try {
    const parsed = JSON.parse(item);
    return isCoreState(parsed) ? parsed : null;
  } catch (e) {
    console.error(e);
    return null;
  }
}

function encodeStateForHash(state: CoreState) {
  return `code/${base64url.encode(JSON.stringify(state))}`;
}

export function App({}: AppProps) {
  const initialState =
    getStateFromHash(window.location.hash) ??
    getStateFromLocalStorage() ??
    PRESETS.replaceVarWithConst.state;

  const [coreState, setCoreState] = useState<CoreState>(initialState);

  const [selectedPresetKey, setSelectedPresetKey] = useState<
    keyof typeof PRESETS | null
  >(null);

  const [debouncedState, isDebouncePending] = useDebounce(
    coreState,
    EDITOR_DEBOUNCE_MS,
  );

  useEffect(() => {
    const encoded = encodeStateForHash(debouncedState);
    const { title } = document;
    const url = `${window.location.pathname}#${encoded}`;
    window.history.replaceState(undefined, title, url);
  }, [debouncedState]);

  useEffect(() => {
    const encoded = JSON.stringify(debouncedState);
    localStorage.setItem('coreState', encoded);
  }, [debouncedState]);

  const [transformedModels, setTransformedModels] = useState<EditorModel[]>([]);

  const [
    selectedInputFile,
    setSelectedInputFile,
  ] = useState<WrappedSourceFile>();
  const [cursorOffsetInInputFile, setCursorOffsetInInputFile] = useState<
    number | null
  >(null);

  const [selectedNode, setSelectedNode] = useState<tsm.Node | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const prefersDarkMode = usePrefersDarkMode();
  useDarkModeClassName(prefersDarkMode);

  const [selectedModelPath, setSelectedModelPath] = useState(
    coreState.inputs[0].path,
  );
  const monaco = useMonaco();

  useEffect(() => {
    if (monaco) {
      monaco.editor.defineTheme(darkTheme.name, darkTheme.theme);
    }
  }, [monaco]);

  useLoadTypings(monaco);
  useAddSimpleTypescriptLanguage(monaco);
  useConfigureTypescriptEditor(monaco);

  useEffect(() => {
    if (!coreState.inputs.some((m) => m.path === selectedModelPath)) {
      setSelectedModelPath(coreState.inputs[0].path ?? '');
    }
  }, [coreState, selectedModelPath]);

  useEffect(() => {
    if (selectedPresetKey && PRESETS[selectedPresetKey]) {
      setCoreState(PRESETS[selectedPresetKey].state);
    }
  }, [selectedPresetKey]);

  function setInputModels(models: EditorModel[]) {
    setCoreState(
      produce((draft) => {
        draft.inputs = models;
      }),
    );
  }

  function setTransformModel(model: EditorModel) {
    setCoreState(
      produce((draft) => {
        draft.transform = model;
      }),
    );
  }

  useEffect(() => {
    const debouncedSelectedInput = debouncedState.inputs.find(
      (m) => m.path === selectedModelPath,
    );

    if (debouncedSelectedInput) {
      const file = sourceProject.createSourceFile(
        debouncedSelectedInput.path,
        debouncedSelectedInput.content,
        {
          overwrite: true,
        },
      );

      setSelectedInputFile({ node: file });
    }
  }, [debouncedState, selectedModelPath]);

  useEffect(() => {
    if (selectedInputFile && cursorOffsetInInputFile) {
      setSelectedNode(
        selectedInputFile.node.getDescendantAtPos(cursorOffsetInInputFile) ??
          null,
      );
    }
  }, [selectedInputFile, cursorOffsetInInputFile]);

  useEffect(() => {
    function transform(models: EditorModel[]) {
      const transformedProject = new tsm.Project({
        useInMemoryFileSystem: true,
      });

      let transformFn: Function | null = null;

      try {
        models.forEach((model) => {
          transformedProject.createSourceFile(model.path, model.content);
        });

        const transformSource = debouncedState.transform.content;

        const transformerStr = tsm.ts.transpile(transformSource, {
          target: tsm.ScriptTarget.ES5,
          module: tsm.ModuleKind.CommonJS,
          checkJs: false,
        });

        transformFn = (compileModule(
          transformerStr,
          {},
          { 'ts-morph': tsm },
        ) as any).default;
      } catch (e) {
        console.error(e);
      }

      if (transformFn) {
        try {
          transformFn(transformedProject);
          setError(null);
        } catch (e) {
          setError(e);
        }

        setTransformedModels(
          transformedProject.getSourceFiles().map((file) => ({
            path: `transformed${file.getFilePath()}`,
            content: file.getText(),
          })),
        );
      }
    }

    transform(debouncedState.inputs);
  }, [debouncedState]);

  const editorTheme = prefersDarkMode ? darkTheme.name : 'vs-light';

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="flex flex-shrink px-6 py-4 border-b-4 dark:border-gray-700 items-baseline">
        <div className="flex items-baseline">
          <div className="text-lg font-bold">ts-morph-playground</div>
          <div className="ml-24 flex space-x-6">
            <div className="space-x-4">
              <label htmlFor="presetPicker" className="text-sm font-bold">
                Examples
              </label>
              <select
                id="presetPicker"
                className="bg-gray-300 dark:bg-gray-800 leading-4 outline-none focus:ring-2 px-2 py-1 rounded"
                onChange={(e) => setSelectedPresetKey(e.target.value as any)}
              >
                <option value="" disabled selected>
                  Select example
                </option>
                {Object.entries(PRESETS).map(([key, preset]) => (
                  <option value={key}>{preset.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        <div className="ml-auto">
          <a
            className="px-2 py-1 rounded text-gray-700 bg-gray-300 outline-none focus:ring-2 hover:text-gray-800 hover:bg-gray-400 dark:text-gray-50 dark:bg-gray-800 dark:hover:text-gray-50 dark:hover:bg-gray-700"
            href="https://github.com/awhitty/ts-morph-playground/"
          >
            GitHub
          </a>
        </div>
      </div>
      <div className="relative h-full w-full">
        <SplitPane percentage>
          <SplitPane percentage vertical>
            <FancyTypescriptEditor
              theme={editorTheme}
              models={coreState.inputs}
              selectedModelPath={selectedModelPath}
              onChangeModels={setInputModels}
              onSelectModel={setSelectedModelPath}
              onChangeCursorOffset={setCursorOffsetInInputFile}
            />
            <FancyTypescriptEditor
              theme={editorTheme}
              models={[coreState.transform]}
              selectedModelPath={coreState.transform.path}
              onChangeModels={([model]) => setTransformModel(model)}
              shouldShowTabBar={false}
            />
          </SplitPane>
          <SplitPane percentage vertical>
            {selectedInputFile && (
              <TreeNodeViewer
                node={selectedInputFile.node}
                selectedNode={selectedNode}
              />
            )}
            <FancyTypescriptEditor
              theme={editorTheme}
              models={transformedModels}
              selectedModelPath={'transformed/' + selectedModelPath}
              error={error}
              status={isDebouncePending ? 'pending' : 'current'}
              onSelectModel={(path) =>
                setSelectedModelPath(path.replace('transformed/', ''))
              }
              readOnly
            />
          </SplitPane>
        </SplitPane>
      </div>
    </div>
  );
}
