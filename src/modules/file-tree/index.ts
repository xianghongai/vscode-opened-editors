import * as vscode from 'vscode';
import { creater } from '../../utils/file-tree';
import localize from '../../utils/localize';

export const fileTreeGenerator = (uri: any) => {
  const content: string = creater(uri.fsPath, () =>
    vscode.workspace.getConfiguration()
  );
  
  vscode.env.clipboard.writeText(content);
  vscode.window.setStatusBarMessage(
    localize('opened-editors.fileTreeHasBeenCopied'),
    4000
  );
};
