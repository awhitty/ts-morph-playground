import React from 'react';

interface ErrorOverlayProps {
  error: Error;
}

export function ErrorOverlay(props: ErrorOverlayProps) {
  return (
    <div className="bg-gray-50 absolute font-mono top-0 left-0 right-0 bottom-0 p-8 flex items-center justify-center overflow-auto dark:bg-gray-800">
      <div className="max-w-md">
        <div className="font-bold text-lg text-red-900 dark:text-red-400">
          {props.error.name}
        </div>
        <div className="text-red-700 dark:text-red-200">
          {props.error.message}
        </div>
      </div>
    </div>
  );
}
