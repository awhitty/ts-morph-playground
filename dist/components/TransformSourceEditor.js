import Editor from "../pkg/@monaco-editor/react.js";
import React from "../pkg/react.js";
import {DEFAULT_EDITOR_OPTIONS} from "../constants.js";
export function TransformSourceEditor({
  value,
  onModelChange
}) {
  return /* @__PURE__ */ React.createElement(Editor, {
    defaultValue: value,
    language: "typescript",
    path: "file:///transformer.ts",
    onChange: onModelChange,
    options: DEFAULT_EDITOR_OPTIONS
  });
}
