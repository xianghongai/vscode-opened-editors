import { workspace, env, window } from 'vscode';
import { creator } from '../../utils/file-tree';

/**
 * 文件树生成器命令处理函数
 * @param uri 右键选中的文件夹 URI
 */
export async function fileTreeGenerator(uri?: unknown): Promise<void> {
  try {
    if (
      typeof uri !== 'object' ||
      uri === null ||
      !('fsPath' in uri) ||
      typeof uri.fsPath !== 'string'
    ) {
      throw new TypeError('A folder URI with a file-system path is required');
    }

    // 异步生成文件树
    const content: string = await creator(uri.fsPath, () => workspace.getConfiguration());

    // 复制到剪贴板
    env.clipboard.writeText(content);

    // 显示成功提示
    window.setStatusBarMessage(
      'The file tree has been copied to the clipboard :)',
      4000
    );
  } catch (error) {
    // 错误处理
    const message = error instanceof Error ? error.message : String(error);
    window.showErrorMessage(`Failed to generate file tree: ${message}`);
    console.error('File tree generation error:', error);
  }
}
