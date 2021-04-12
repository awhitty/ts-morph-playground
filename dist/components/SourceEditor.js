import Editor from "../../_snowpack/pkg/@monaco-editor/react.js";
import React, {useEffect, useState} from "../../_snowpack/pkg/react.js";
import {DEFAULT_EDITOR_OPTIONS} from "../constants.js";
export function SourceEditor({
  value,
  onCursorOffsetChange,
  onModelChange
}) {
  const [editor, setEditor] = useState();
  useEffect(() => {
    onModelChange(value);
  }, []);
  useEffect(() => {
    if (editor) {
      return editor.onDidChangeCursorPosition((e) => {
        const offset = editor.getModel()?.getOffsetAt(e.position) ?? null;
        onCursorOffsetChange(offset);
      }).dispose;
    }
  }, [editor]);
  return /* @__PURE__ */ React.createElement(Editor, {
    defaultValue: value,
    path: "test.ts",
    language: "simple_typescript",
    options: DEFAULT_EDITOR_OPTIONS,
    onChange: onModelChange,
    onMount: (editor2) => setEditor(editor2)
  });
}
