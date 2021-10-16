import { workspace, env, window } from 'vscode';
import { creater } from '../../utils/file-tree';
import localize from '../../utils/localize';

export const fileTreeGenerator = (uri: any) => {
  const content: string = creater(uri.fsPath, () =>
    workspace.getConfiguration()
  );

  env.clipboard.writeText(content);
  window.setStatusBarMessage(
    localize('opened-editors.message.fileTreeHasBeenCopied'),
    4000
  );
};
