import classNames from 'classnames';
import React, { useEffect, useRef } from 'react';
import type { tsm } from '../lib/ts-morph';

interface TreeNodeViewerProps {
  node: tsm.Node;
  selectedNode: tsm.Node | null;
}

export function TreeNodeViewer({ node, selectedNode }: TreeNodeViewerProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isSelected = node === selectedNode;

  useEffect(() => {
    if (isSelected) {
      ref.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [isSelected]);

  return (
    <div>
      <div
        ref={ref}
        className={classNames('inline-flex p-1 rounded font-mono text-sm', {
          'font-bold bg-pink-200 dark:bg-pink-800': isSelected,
        })}
      >
        {node.getKindName()}
      </div>
      <ul>
        {node.getChildren().map((child, index) => {
          return (
            <li key={index} className="pl-6">
              <TreeNodeViewer node={child} selectedNode={selectedNode} />
            </li>
          );
        })}
      </ul>
    </div>
  );
}
