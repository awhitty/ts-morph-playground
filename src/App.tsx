import { useMonaco } from '@monaco-editor/react';
import React, { useEffect, useState } from 'react';
import SplitPane from 'react-splitter-layout';
import 'react-splitter-layout/lib/index.css';
import './App.css';
import { compileModule } from './compileModule';
import { ErrorOverlay } from './components/ErrorOverlay';
import { SourceEditor } from './components/SourceEditor';
import { TransformedCodeViewer } from './components/TransformedCodeViewer';
import { TransformSourceEditor } from './components/TransformSourceEditor';
import { TreeNodeViewer } from './components/TreeNodeViewer';
import { INITIAL_SOURCE, INITIAL_TRANSFORM } from './constants';
import { useAddSimpleTypescriptLanguage } from './hooks/useAddSimpleTypescriptLanguage';
import { useConfigureTypescriptEditor } from './hooks/useConfigureTypescriptEditor';
import { useDebounce } from './hooks/useDebounce';
import { useLoadTypings } from './hooks/useLoadTypings';
import { tsm } from './lib/ts-morph';

const sourceProject = new tsm.Project({
  useInMemoryFileSystem: true,
});

const transformedProject = new tsm.Project({
  useInMemoryFileSystem: true,
});

interface AppProps {}

export function App({}: AppProps) {
  const [inputSource, setInputSource] = useState<string>(
    localStorage.getItem('inputSource') ?? INITIAL_SOURCE,
  );
  const debouncedInputSource = useDebounce(inputSource, 50);
  const [inputSourceFile, setInputSourceFile] = useState<
    { node: tsm.SourceFile } | undefined
  >();
  const [cursorOffset, setCursorOffset] = useState<number | null>(null);
  const [selectedNode, setSelectedNode] = useState<tsm.Node | null>(null);

  const [transformSource, setTransformSource] = useState<string>(
    localStorage.getItem('transformSource') ?? INITIAL_TRANSFORM,
  );
  const debouncedTransformSource = useDebounce(transformSource, 50);
  const [transformedModel, setTransformedModel] = useState<
    string | undefined
  >();
  const [error, setError] = useState<Error | null>(null);

  const monaco = useMonaco();

  useLoadTypings(monaco);
  useAddSimpleTypescriptLanguage(monaco);
  useConfigureTypescriptEditor(monaco);

  function setInputSourceAndPersist(newSource: string) {
    setInputSource(newSource);
    localStorage.setItem('inputSource', newSource);
  }

  function setTransformSourceAndPersist(newSource: string) {
    setTransformSource(newSource);
    localStorage.setItem('transformSource', newSource);
  }

  useEffect(() => {
    const file = sourceProject.createSourceFile(
      'input.ts',
      debouncedInputSource,
      {
        overwrite: true,
      },
    );

    setInputSourceFile({ node: file });
  }, [debouncedInputSource]);

  useEffect(() => {
    if (inputSourceFile && cursorOffset) {
      setSelectedNode(
        inputSourceFile.node.getDescendantAtPos(cursorOffset) ?? null,
      );
    }
  }, [inputSourceFile, cursorOffset]);

  useEffect(() => {
    function transform(file: tsm.SourceFile) {
      const copied = transformedProject.createSourceFile(
        'transformed',
        file.getStructure(),
        { overwrite: true },
      );
      const transformerStr = tsm.ts.transpile(debouncedTransformSource, {
        target: tsm.ScriptTarget.ES5,
        module: tsm.ModuleKind.CommonJS,
      });

      let transformFn: Function | null = null;
      try {
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
          transformFn(copied);
          setError(null);
        } catch (e) {
          setError(e);
        }
      }

      setTransformedModel(copied.getText());
    }

    const file = inputSourceFile?.node;
    if (file) {
      transform(file);
    }
  }, [debouncedTransformSource, inputSourceFile]);

  return (
    <div className="h-screen w-screen flex flex-col">
      <div className="flex-shrink p-4 border-b-2">
        <div className="text-lg font-bold">ts-morph-playground</div>
      </div>
      <div className="relative h-full w-full">
        <SplitPane percentage>
          <SplitPane percentage vertical>
            <SourceEditor
              value={inputSource}
              onModelChange={(model) => setInputSourceAndPersist(model ?? '')}
              onCursorOffsetChange={setCursorOffset}
            />
            <TransformSourceEditor
              value={transformSource}
              onModelChange={(model) =>
                setTransformSourceAndPersist(model ?? '')
              }
            />
          </SplitPane>
          <SplitPane percentage vertical>
            {inputSourceFile && (
              <TreeNodeViewer
                node={inputSourceFile.node}
                selectedNode={selectedNode}
              />
            )}
            {error ? (
              <ErrorOverlay error={error} />
            ) : (
              <TransformedCodeViewer
                transformedSource={transformedModel ?? ''}
              />
            )}
          </SplitPane>
        </SplitPane>
      </div>
    </div>
  );
}
