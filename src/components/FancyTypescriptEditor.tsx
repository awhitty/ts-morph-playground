import Editor, { useMonaco } from '@monaco-editor/react';
import classNames from 'classnames';
import produce from 'immer';
import type { editor } from 'monaco-editor';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { DEFAULT_EDITOR_OPTIONS } from '../constants';
import { useFocusWithin } from '@react-aria/interactions';

export interface EditorModel {
  path: string;
  content: string;
}

interface FancyTypescriptEditorProps {
  theme: string;
  models: EditorModel[];
  selectedModelPath: string;
  shouldShowTabBar?: boolean;
  readOnly?: boolean;
  onSelectModel?: (path: string) => void;
  onChangeModels?: (models: EditorModel[]) => void;
  onChangeCursorOffset?: (offset: number | null) => void;
}

export function FancyTypescriptEditor({
  models,
  theme,
  readOnly = false,
  shouldShowTabBar = true,
  selectedModelPath,
  onChangeModels,
  onSelectModel,
  onChangeCursorOffset,
}: FancyTypescriptEditorProps) {
  const monaco = useMonaco();
  // TRICKY: We only want to update the language when the focus is truly leaving
  // the editor. Calling `editor.focus()` happens to blur the editor
  // temporarily, so this ref is a hack to skip side effects while that happens.
  // Oy!
  const shouldUpdateModelLanguages = useRef(true);

  const handleFocus = useCallback(() => {
    if (monaco && shouldUpdateModelLanguages.current) {
      models.forEach((m) => {
        const uri = monaco.Uri.parse(m.path);
        const model = monaco.editor.getModel(uri);
        if (model) {
          monaco.editor.setModelLanguage(model, 'typescript');
        } else {
          monaco.editor.createModel(m.content, 'typescript', uri);
        }
      });
    }

    shouldUpdateModelLanguages.current = true;
  }, [monaco]);

  const handleBlur = useCallback(() => {
    if (monaco && shouldUpdateModelLanguages.current) {
      models.forEach((m) => {
        const model = monaco.editor.getModel(monaco.Uri.parse(m.path));
        if (model) {
          monaco.editor.setModelLanguage(model, 'simple_typescript');
        }
      });

      // TRICKY: Set diagnostics options to force typescript to reload.
      // Based on
      // https://github.com/microsoft/monaco-editor/issues/208#issuecomment-272878955
      // Maybe there's a better way?
      monaco.languages.typescript.typescriptDefaults.setDiagnosticsOptions({});
    }
  }, [monaco]);

  const { focusWithinProps } = useFocusWithin({
    onFocusWithin: handleFocus,
    onBlurWithin: handleBlur,
  });
  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor>();

  const selectedModel = models.find((m) => m.path === selectedModelPath);

  useEffect(() => {
    if (editor) {
      return editor.onDidChangeCursorPosition(
        (e: editor.ICursorPositionChangedEvent) => {
          if (onChangeCursorOffset) {
            const offset = editor.getModel()?.getOffsetAt(e.position) ?? null;
            onChangeCursorOffset(offset);
          }
        },
      ).dispose;
    }
  }, [editor, onChangeCursorOffset]);

  function changeSelectedModel(content: string) {
    if (onChangeModels) {
      onChangeModels(
        produce(models, (draft: EditorModel[]) => {
          const model = draft.find((m) => m.path === selectedModelPath);
          if (model) {
            model.content = content;
          } else {
            draft.push({ path: selectedModelPath, content });
          }
        }),
      );
    }
  }

  return (
    <div className="flex flex-col w-full h-full" {...focusWithinProps}>
      {shouldShowTabBar && (
        <div className="flex flex-row space-x-1 px-2 pt-1 pb-0 text-sm border-b-2 dark:border-gray-800">
          {models.map((model) => {
            const isSelected = selectedModelPath === model.path;
            return (
              <button
                key={model.path}
                className={classNames('p-1 px-2 rounded-t focus:ring-2', {
                  'text-gray-600 dark:text-gray-300': !isSelected,
                  'text-gray-800 bg-gray-200 dark:text-gray-50 dark:bg-gray-800': isSelected,
                })}
                onClick={() => {
                  if (onSelectModel) {
                    onSelectModel(model.path);
                    shouldUpdateModelLanguages.current = false;
                    editor?.focus();
                  }
                }}
              >
                {model.path}
              </button>
            );
          })}
        </div>
      )}
      <div className="flex-grow overflow-auto relative">
        <Editor
          path={selectedModelPath}
          value={selectedModel?.content ?? ''}
          theme={theme}
          options={{ ...DEFAULT_EDITOR_OPTIONS, readOnly }}
          onChange={(content) => changeSelectedModel(content ?? '')}
          onMount={setEditor}
        />
      </div>
    </div>
  );
}
