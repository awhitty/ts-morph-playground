import Editor from "../../_snowpack/pkg/@monaco-editor/react.js";
import React from "../../_snowpack/pkg/react.js";
import {DEFAULT_EDITOR_OPTIONS} from "../constants.js";
export function TransformedCodeViewer({
  transformedSource
}) {
  return /* @__PURE__ */ React.createElement(Editor, {
    value: transformedSource,
    path: "transformed.ts",
    language: "simple_typescript",
    options: {...DEFAULT_EDITOR_OPTIONS, readOnly: true}
  });
}
