import React from "../../_snowpack/pkg/react.js";
export function ErrorOverlay(props) {
  return /* @__PURE__ */ React.createElement("div", {
    className: "bg-gray-50 absolute font-mono top-0 left-0 right-0 bottom-0 flex items-center justify-center overflow-auto"
  }, /* @__PURE__ */ React.createElement("div", null, /* @__PURE__ */ React.createElement("div", {
    className: "font-bold text-lg text-red-900"
  }, props.error.name), /* @__PURE__ */ React.createElement("div", {
    className: "text-red-700"
  }, props.error.message)));
}
