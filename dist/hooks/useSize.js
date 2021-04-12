import useResizeObserver from "../../_snowpack/pkg/@react-hook/resize-observer.js";
import React from "../../_snowpack/pkg/react.js";
export function useSize(target) {
  const [size, setSize] = React.useState();
  React.useLayoutEffect(() => {
    setSize(target.current?.getBoundingClientRect());
  }, [target]);
  useResizeObserver(target, (entry) => setSize(entry.contentRect));
  return size;
}
