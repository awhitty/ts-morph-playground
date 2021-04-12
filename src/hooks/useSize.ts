import useResizeObserver from '@react-hook/resize-observer';
import React, { MutableRefObject } from 'react';

export function useSize(target: MutableRefObject<HTMLElement | null>) {
  const [size, setSize] = React.useState<DOMRect>();

  React.useLayoutEffect(() => {
    setSize(target.current?.getBoundingClientRect());
  }, [target]);

  useResizeObserver(target, (entry) => setSize(entry.contentRect));

  return size;
}
