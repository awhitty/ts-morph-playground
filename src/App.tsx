import { useMonaco } from '@monaco-editor/react';
import React, { useEffect, useState } from 'react';
import SplitPane from 'react-splitter-layout';
import 'react-splitter-layout/lib/index.css';
import './App.css';
import { compileModule } from './compileModule';
import { ErrorOverlay } from './components/ErrorOverlay';
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

const INTIAL_INPUT_MODELS = [
  {
    path: 'foo.ts',
    content: `
export function foo(str: string): number {
  var someVar = 'Hello, '
  return (someVar + str).length;
}
    `.trim(),
  },
  {
    path: 'bar.ts',
    content: `
import { foo } from './foo';

var result = foo('world!');
    `.trim(),
  },
];

const INITIAL_TRANSFORM_MODELS = [
  { path: 'transform.ts', content: INITIAL_TRANSFORM },
];

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

export function App({}: AppProps) {
  const localInputModels = localStorage.getItem('inputModels');
  const localTransformModels = localStorage.getItem('transformModels');

  const [inputModels, setInputModels] = useState<EditorModel[]>(
    localInputModels ? JSON.parse(localInputModels) : INTIAL_INPUT_MODELS,
  );

  const [transformModels, setTransformModels] = useState<EditorModel[]>(
    localTransformModels
      ? JSON.parse(localTransformModels)
      : INITIAL_TRANSFORM_MODELS,
  );

  const [transformedModels, setTransformedModels] = useState<EditorModel[]>([]);

  const debouncedInputModels = useDebounce(inputModels, 50);

  const [
    selectedInputFile,
    setSelectedInputFile,
  ] = useState<WrappedSourceFile>();
  const [cursorOffsetInInputFile, setCursorOffsetInInputFile] = useState<
    number | null
  >(null);

  const [selectedNode, setSelectedNode] = useState<tsm.Node | null>(null);
  const debouncedTransformSource = useDebounce(transformModels, 50);
  const [error, setError] = useState<Error | null>(null);

  const prefersDarkMode = usePrefersDarkMode();
  useDarkModeClassName(prefersDarkMode);

  const [selectedModelPath, setSelectedModelPath] = useState(
    inputModels[0].path,
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

  function setInputModelsAndPersist(models: EditorModel[]) {
    setInputModels(models);
    localStorage.setItem('inputModels', JSON.stringify(models));
  }

  function setTransformModelsAndPersist(models: EditorModel[]) {
    setTransformModels(models);
    localStorage.setItem('transformModels', JSON.stringify(models));
  }

  useEffect(() => {
    const debouncedSelectedInput = debouncedInputModels.find(
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
  }, [debouncedInputModels, selectedModelPath]);

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

        const transformSource = debouncedTransformSource[0].content ?? '';

        const transformerStr = tsm.ts.transpile(transformSource, {
          target: tsm.ScriptTarget.ES5,
          module: tsm.ModuleKind.CommonJS,
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

    transform(debouncedInputModels);
  }, [debouncedTransformSource, debouncedInputModels]);

  const editorTheme = prefersDarkMode ? darkTheme.name : 'vs-light';

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="flex flex-shrink px-6 py-4 border-b-4 dark:border-gray-700 items-baseline">
        <div className="text-lg font-bold">ts-morph-playground</div>
        <a
          className="ml-auto px-2 py-1 rounded text-gray-700 bg-gray-300 hover:text-gray-800 hover:bg-gray-400 dark:text-gray-50 dark:bg-gray-800 dark:hover:text-gray-50 dark:hover:bg-gray-700"
          href="https://github.com/awhitty/ts-morph-playground/"
        >
          GitHub
        </a>
      </div>
      <div className="relative h-full w-full">
        <SplitPane percentage>
          <SplitPane percentage vertical>
            <FancyTypescriptEditor
              theme={editorTheme}
              models={inputModels}
              selectedModelPath={selectedModelPath}
              onChangeModels={setInputModelsAndPersist}
              onSelectModel={setSelectedModelPath}
              onChangeCursorOffset={setCursorOffsetInInputFile}
            />
            <FancyTypescriptEditor
              theme={editorTheme}
              models={transformModels}
              selectedModelPath={transformModels[0].path}
              onChangeModels={setTransformModelsAndPersist}
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
            {error ? (
              <ErrorOverlay error={error} />
            ) : (
              <FancyTypescriptEditor
                theme={editorTheme}
                models={transformedModels}
                selectedModelPath={'transformed/' + selectedModelPath}
                onSelectModel={(path) =>
                  setSelectedModelPath(path.replace('transformed/', ''))
                }
                readOnly
              />
            )}
          </SplitPane>
        </SplitPane>
      </div>
    </div>
  );
}
