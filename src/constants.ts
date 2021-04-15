import type { editor } from 'monaco-editor';

export const DEFAULT_EDITOR_OPTIONS: editor.IStandaloneEditorConstructionOptions = {
  padding: { top: 16, bottom: 16 },
  minimap: { enabled: false },
  fixedOverflowWidgets: true,
  folding: false,
  codeLens: false,
  fontSize: 14,
  fontFamily:
    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
  lineHeight: 28,
};

export const INITIAL_TRANSFORM = `
import { Project, SyntaxKind, VariableDeclarationKind } from 'ts-morph';

export default function transform(project: Project) {
  project.getSourceFiles().forEach((file) => {
    const variableStatements = file.getDescendantsOfKind(
      SyntaxKind.VariableStatement,
    );

    variableStatements.forEach((variableStatement) => {
      const declarationKind = variableStatement.getDeclarationKind();
      if (declarationKind === VariableDeclarationKind.Var) {
        variableStatement.setDeclarationKind(VariableDeclarationKind.Const);
      }
    });
  });
}
`.trim();
