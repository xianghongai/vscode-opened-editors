import { workspace, commands } from 'vscode';
import { extname } from 'path';
import { getPath } from '@/utils/path';

// 常量定义
const MAX_FOLD_LEVEL = 7; // VS Code 支持的最大折叠层级

// 类型定义
type FoldLevel = 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4' | 'Level 5' | 'Level 6' | 'Level 7' | 'All';

const FOLD_COMMANDS: Record<FoldLevel, string> = {
  'Level 1': 'editor.foldLevel1',
  'Level 2': 'editor.foldLevel2',
  'Level 3': 'editor.foldLevel3',
  'Level 4': 'editor.foldLevel4',
  'Level 5': 'editor.foldLevel5',
  'Level 6': 'editor.foldLevel6',
  'Level 7': 'editor.foldLevel7',
  All: 'editor.foldAll',
};

interface FoldConfiguration {
  globalFoldLevel: FoldLevel;
  foldSpecials: Record<string, FoldLevel>;
  foldNest: boolean;
}

/**
 * 获取折叠相关配置
 * @returns 折叠配置对象
 */
function getConfiguration(): FoldConfiguration {
  const configuration = workspace.getConfiguration('opened-editors');

  const globalFoldLevel = configuration.get<FoldLevel>('fold', 'All');
  const foldSpecialConfig = configuration.get<Record<string, FoldLevel>>('foldSpecial', {});
  const foldNest = configuration.get<boolean>('foldNest', false);

  return {
    globalFoldLevel,
    foldSpecials: { ...foldSpecialConfig },
    foldNest,
  };
}

/**
 * 折叠命令处理函数
 * @param args 命令参数
 */
export const foldHandler = async (...args: unknown[]): Promise<void> => {
  const { globalFoldLevel, foldSpecials, foldNest } = getConfiguration();

  let foldLevel: FoldLevel = globalFoldLevel;
  const fullPath = getPath(args);

  if (fullPath) {
    const extName = extname(fullPath);
    const foldSpecialsKeys = Object.keys(foldSpecials);

    // 检查当前文件扩展名是否在特殊配置中
    for (const key of foldSpecialsKeys) {
      const extNames = key.split(',').map((item) => item.trim());

      if (extNames.includes(extName)) {
        foldLevel = foldSpecials[key];
        break;
      }
    }
  }

  // 根据配置选择折叠方式
  if (foldNest) {
    await foldByNest(foldLevel);
  } else {
    await foldByNormal(foldLevel);
  }
};

/**
 * 展开命令处理函数
 */
export const unfoldHandler = async (): Promise<void> => {
  await executeCommand('editor.unfoldAll');
};

/**
 * 嵌套折叠：同时折叠内部嵌套层级
 * @param foldLevel 折叠层级
 */
async function foldByNest(foldLevel: FoldLevel): Promise<void> {
  if (foldLevel === 'All') {
    await executeCommand(FOLD_COMMANDS.All);
    return;
  }

  // 提取层级数字
  const levelMatch = foldLevel.match(/Level (\d+)/);
  if (!levelMatch) {
    return;
  }

  const levelDeep = parseInt(levelMatch[1], 10);

  // 从最大层级折叠到指定层级
  for (let level = MAX_FOLD_LEVEL; level >= levelDeep; level--) {
    await executeCommand(`editor.foldLevel${level}`);
  }
}

/**
 * 普通折叠：仅折叠指定层级
 * @param foldLevel 折叠层级
 */
async function foldByNormal(foldLevel: FoldLevel): Promise<void> {
  await executeCommand(FOLD_COMMANDS[foldLevel]);
}

/**
 * 执行 VS Code 命令
 * @param command 命令名称
 */
async function executeCommand(command: string): Promise<void> {
  await commands.executeCommand(command);
}
