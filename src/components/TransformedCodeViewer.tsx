import Editor from '@monaco-editor/react';
import React from 'react';
import { DEFAULT_EDITOR_OPTIONS } from '../constants';

interface TransformedCodeViewerProps {
  transformedSource: string;
}

export function TransformedCodeViewer({
  transformedSource,
}: TransformedCodeViewerProps) {
  return (
    <Editor
      value={transformedSource}
      path="transformed.ts"
      language="simple_typescript"
      options={{ ...DEFAULT_EDITOR_OPTIONS, readOnly: true }}
    />
  );
}
