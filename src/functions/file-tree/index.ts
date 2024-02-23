import { workspace, env, window } from 'vscode';
import { creator } from '../../utils/file-tree';
// import localize from '../../utils/localize';

export function fileTreeGenerator(uri: any) {
  const content: string = creator(uri.fsPath, () => workspace.getConfiguration()
  );

  env.clipboard.writeText(content);
  window.setStatusBarMessage(
    // localize('opened-editors.message.fileTreeHasBeenCopied'),
    'The file tree has been copied to the clipboard :)',
    4000
  );
}
