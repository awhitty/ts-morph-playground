import classNames from "../pkg/classnames.js";
import React, {useEffect, useRef} from "../pkg/react.js";
export function TreeNodeViewer({node, selectedNode}) {
  const ref = useRef(null);
  const isSelected = node === selectedNode;
  useEffect(() => {
    if (isSelected) {
      ref.current?.scrollIntoView({behavior: "smooth", block: "center"});
    }
  }, [isSelected]);
  return /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", {
    ref,
    className: classNames("inline-flex p-1 rounded", {
      "bg-pink-200 font-bold": isSelected
    })
  }, node.getKindName()), /* @__PURE__ */ React.createElement("ul", null, node.getChildren().map((child, index) => {
    return /* @__PURE__ */ React.createElement("li", {
      key: index,
      className: "pl-6"
    }, /* @__PURE__ */ React.createElement(TreeNodeViewer, {
      node: child,
      selectedNode
    }));
  })));
}
