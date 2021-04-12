// [snowpack] add styles to the page (skip if no document exists)
if (typeof document !== 'undefined') {
  const code = ".splitter-layout {\n  position: absolute;\n  display: flex;\n  flex-direction: row;\n  width: 100%;\n  height: 100%;\n  overflow: hidden;\n}\n\n.splitter-layout .layout-pane {\n  position: relative;\n  flex: 0 0 auto;\n  overflow: auto;\n}\n\n.splitter-layout .layout-pane.layout-pane-primary {\n  flex: 1 1 auto;\n}\n\n.splitter-layout > .layout-splitter {\n  flex: 0 0 auto;\n  width: 4px;\n  height: 100%;\n  cursor: col-resize;\n  background-color: #ccc;\n}\n\n.splitter-layout .layout-splitter:hover {\n  background-color: #bbb;\n}\n\n.splitter-layout.layout-changing {\n  cursor: col-resize;\n}\n\n.splitter-layout.layout-changing > .layout-splitter {\n  background-color: #aaa;\n}\n\n.splitter-layout.splitter-layout-vertical {\n  flex-direction: column;\n}\n\n.splitter-layout.splitter-layout-vertical.layout-changing {\n  cursor: row-resize;\n}\n\n.splitter-layout.splitter-layout-vertical > .layout-splitter {\n  width: 100%;\n  height: 4px;\n  cursor: row-resize;\n}\n";

  const styleEl = document.createElement("style");
  const codeEl = document.createTextNode(code);
  styleEl.type = 'text/css';
  styleEl.appendChild(codeEl);
  document.head.appendChild(styleEl);
}