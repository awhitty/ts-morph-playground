import Editor from '@monaco-editor/react';
import type { editor } from 'monaco-editor';
import React, { useEffect, useState } from 'react';
import { DEFAULT_EDITOR_OPTIONS } from '../constants';

interface SourceEditorProps {
  value: string;
  onModelChange: (model: string | undefined) => void;
  onCursorOffsetChange: (offset: number | null) => void;
}

export function SourceEditor({
  value,
  onCursorOffsetChange,
  onModelChange,
}: SourceEditorProps) {
  const [editor, setEditor] = useState<editor.IStandaloneCodeEditor>();

  useEffect(() => {
    onModelChange(value);
  }, []);

  useEffect(() => {
    if (editor) {
      return editor.onDidChangeCursorPosition(
        (e: editor.ICursorPositionChangedEvent) => {
          const offset = editor.getModel()?.getOffsetAt(e.position) ?? null;
          onCursorOffsetChange(offset);
        },
      ).dispose;
    }
  }, [editor]);

  return (
    <Editor
      defaultValue={value}
      path="test.ts"
      language="simple_typescript"
      options={DEFAULT_EDITOR_OPTIONS}
      onChange={onModelChange}
      onMount={(editor) => setEditor(editor)}
    />
  );
}
