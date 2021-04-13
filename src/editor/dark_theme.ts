import type { editor } from 'monaco-editor';
import colors from 'tailwindcss/colors';

export const darkTheme: { name: string; theme: editor.IStandaloneThemeData } = {
  name: 'dark-theme',
  theme: {
    base: 'vs-dark',
    inherit: true,
    rules: [],
    colors: {
      'editor.background': colors.gray['900'],
    },
  },
};
