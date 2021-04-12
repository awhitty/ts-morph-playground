import type { editor } from 'monaco-editor';

export const DEFAULT_EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  padding: { top: 16, bottom: 16 },
  minimap: { enabled: false },
  fixedOverflowWidgets: true,
  folding: false,
  codeLens: false,
};

export const INITIAL_SOURCE = `
export var foo = 'some string';
`.trim();

export const INITIAL_TRANSFORM = `
import {SourceFile, SyntaxKind, VariableDeclarationKind} from 'ts-morph';

export default function transform(file: SourceFile) {
  const variableStatements = file.getDescendantsOfKind(
    SyntaxKind.VariableStatement,
  );

  variableStatements.forEach((variableStatement) => {
    const declarationKind = variableStatement.getDeclarationKind();
    if (declarationKind === VariableDeclarationKind.Var) {
      variableStatement.setDeclarationKind(VariableDeclarationKind.Const);
    }
  });
};
`.trim();
