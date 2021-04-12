import Editor from '@monaco-editor/react';
import React from 'react';
import { DEFAULT_EDITOR_OPTIONS } from '../constants';

interface TransformSourceEditorProps {
  value: string;
  onModelChange: (model: string | undefined) => void;
}

export function TransformSourceEditor({
  value,
  onModelChange,
}: TransformSourceEditorProps) {
  return (
    <Editor
      defaultValue={value}
      language="typescript"
      path="file:///transformer.ts"
      onChange={onModelChange}
      options={DEFAULT_EDITOR_OPTIONS}
    />
  );
}