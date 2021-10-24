import { window } from 'vscode';
import wrap from './wrap';

const wrapSelection = (editor: any, symbol: any) => {
  if (!symbol) {
    return;
  }

  const { document, selections } = editor;

  editor.edit((originText: any) => {
    selections.forEach((selection: any) => {
      if (!selection.isEmpty) {
        const text = document.getText(selection);

        originText.replace(selection, wrap(text, symbol));
      }
    });
  });
};

const wrapSelectionHandler = (symbol: string) => () => {
  const { activeTextEditor: editor } = window;
  wrapSelection(editor, symbol);
};

export default wrapSelectionHandler;
