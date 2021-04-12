import {useMonaco} from "../_snowpack/pkg/@monaco-editor/react.js";
import React, {useEffect, useState} from "../_snowpack/pkg/react.js";
import SplitPane from "../_snowpack/pkg/react-splitter-layout.js";
import "../_snowpack/pkg/react-splitter-layout/lib/index.css.proxy.js";
import "./App.css.proxy.js";
import {compileModule} from "./compileModule.js";
import {ErrorOverlay} from "./components/ErrorOverlay.js";
import {SourceEditor} from "./components/SourceEditor.js";
import {TransformedCodeViewer} from "./components/TransformedCodeViewer.js";
import {TransformSourceEditor} from "./components/TransformSourceEditor.js";
import {TreeNodeViewer} from "./components/TreeNodeViewer.js";
import {INITIAL_SOURCE, INITIAL_TRANSFORM} from "./constants.js";
import {useAddSimpleTypescriptLanguage} from "./hooks/useAddSimpleTypescriptLanguage.js";
import {useConfigureTypescriptEditor} from "./hooks/useConfigureTypescriptEditor.js";
import {useDebounce} from "./hooks/useDebounce.js";
import {useLoadTypings} from "./hooks/useLoadTypings.js";
import {tsm} from "./lib/ts-morph/index.js";
const sourceProject = new tsm.Project({
  useInMemoryFileSystem: true
});
const transformedProject = new tsm.Project({
  useInMemoryFileSystem: true
});
export function App({}) {
  const [inputSource, setInputSource] = useState(localStorage.getItem("inputSource") ?? INITIAL_SOURCE);
  const debouncedInputSource = useDebounce(inputSource, 50);
  const [inputSourceFile, setInputSourceFile] = useState();
  const [cursorOffset, setCursorOffset] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [transformSource, setTransformSource] = useState(localStorage.getItem("transformSource") ?? INITIAL_TRANSFORM);
  const debouncedTransformSource = useDebounce(transformSource, 50);
  const [transformedModel, setTransformedModel] = useState();
  const [error, setError] = useState(null);
  const monaco = useMonaco();
  useLoadTypings(monaco);
  useAddSimpleTypescriptLanguage(monaco);
  useConfigureTypescriptEditor(monaco);
  function setInputSourceAndPersist(newSource) {
    setInputSource(newSource);
    localStorage.setItem("inputSource", newSource);
  }
  function setTransformSourceAndPersist(newSource) {
    setTransformSource(newSource);
    localStorage.setItem("transformSource", newSource);
  }
  useEffect(() => {
    const file = sourceProject.createSourceFile("input.ts", debouncedInputSource, {
      overwrite: true
    });
    setInputSourceFile({node: file});
  }, [debouncedInputSource]);
  useEffect(() => {
    if (inputSourceFile && cursorOffset) {
      setSelectedNode(inputSourceFile.node.getDescendantAtPos(cursorOffset) ?? null);
    }
  }, [inputSourceFile, cursorOffset]);
  useEffect(() => {
    function transform(file2) {
      const copied = transformedProject.createSourceFile("transformed", file2.getStructure(), {overwrite: true});
      const transformerStr = tsm.ts.transpile(debouncedTransformSource, {
        target: tsm.ScriptTarget.ES5,
        module: tsm.ModuleKind.CommonJS
      });
      let transformFn = null;
      try {
        transformFn = compileModule(transformerStr, {}, {"ts-morph": tsm}).default;
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
  return /* @__PURE__ */ React.createElement("div", {
    className: "h-screen w-screen flex flex-col"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "flex-shrink p-4 border-b-2"
  }, /* @__PURE__ */ React.createElement("div", {
    className: "text-lg font-bold"
  }, "ts-morph-playground")), /* @__PURE__ */ React.createElement("div", {
    className: "relative h-full w-full"
  }, /* @__PURE__ */ React.createElement(SplitPane, {
    percentage: true
  }, /* @__PURE__ */ React.createElement(SplitPane, {
    percentage: true,
    vertical: true
  }, /* @__PURE__ */ React.createElement(SourceEditor, {
    value: inputSource,
    onModelChange: (model) => setInputSourceAndPersist(model ?? ""),
    onCursorOffsetChange: setCursorOffset
  }), /* @__PURE__ */ React.createElement(TransformSourceEditor, {
    value: transformSource,
    onModelChange: (model) => setTransformSourceAndPersist(model ?? "")
  })), /* @__PURE__ */ React.createElement(SplitPane, {
    percentage: true,
    vertical: true
  }, inputSourceFile && /* @__PURE__ */ React.createElement(TreeNodeViewer, {
    node: inputSourceFile.node,
    selectedNode
  }), error ? /* @__PURE__ */ React.createElement(ErrorOverlay, {
    error
  }) : /* @__PURE__ */ React.createElement(TransformedCodeViewer, {
    transformedSource: transformedModel ?? ""
  })))));
}
