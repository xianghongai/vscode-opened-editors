import { workspace, commands } from 'vscode';
import { extname } from 'path';
import { getPath } from '../../utils/path';

// 常量定义
const MAX_FOLD_LEVEL = 7; // VS Code 支持的最大折叠层级

// 类型定义
type FoldLevel =
  | 'Level 1'
  | 'Level 2'
  | 'Level 3'
  | 'Level 4'
  | 'Level 5'
  | 'Level 6'
  | 'Level 7'
  | 'All'
  | 'All Block Comments'
  | 'All Regions'
  | 'All Regions Except Selected'
  | 'Recursively';

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
  const configuration = workspace.getConfiguration();

  const globalFoldLevel = configuration.get<FoldLevel>('opened-editors.fold') || 'All';
  const foldSpecialConfig = configuration.get<Record<string, FoldLevel>>('opened-editors.foldSpecial') || {};
  const foldNest = configuration.get<boolean>('opened-editors.foldNest') || false;

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
export const foldHandler = (...args: any[]): void => {
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
    foldByNest(foldLevel);
  } else {
    foldByNormal(foldLevel);
  }
};

/**
 * 展开命令处理函数
 * @param args 命令参数
 */
export const unfoldHandler = (...args: any[]): void => {
  const { globalFoldLevel } = getConfiguration();

  let command = 'editor.unfoldAll';

  // 根据配置选择展开方式
  switch (globalFoldLevel) {
    case 'All Regions Except Selected':
      command = 'editor.unfoldAllExcept';
      break;
    case 'All Regions':
      command = 'editor.unfoldAllMarkerRegions';
      break;
    case 'Recursively':
      command = 'editor.unfoldRecursively';
      break;
  }

  executeCommand(command);
};

/**
 * 嵌套折叠：同时折叠内部嵌套层级
 * @param foldLevel 折叠层级
 */
function foldByNest(foldLevel: FoldLevel): void {
  if (foldLevel === 'All') {
    executeCommand('editor.foldAll');
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
    executeCommand(`editor.foldLevel${level}`);
  }
}

/**
 * 普通折叠：仅折叠指定层级
 * @param foldLevel 折叠层级
 */
function foldByNormal(foldLevel: FoldLevel): void {
  let command = '';

  switch (foldLevel) {
    case 'Level 1':
      command = 'editor.foldLevel1';
      break;
    case 'Level 2':
      command = 'editor.foldLevel2';
      break;
    case 'Level 3':
      command = 'editor.foldLevel3';
      break;
    case 'Level 4':
      command = 'editor.foldLevel4';
      break;
    case 'Level 5':
      command = 'editor.foldLevel5';
      break;
    case 'Level 6':
      command = 'editor.foldLevel6';
      break;
    case 'Level 7':
      command = 'editor.foldLevel7';
      break;
    case 'All':
      command = 'editor.foldAll';
      break;
    case 'All Block Comments':
      command = 'editor.foldAllBlockComments';
      break;
    case 'All Regions':
      command = 'editor.foldAllMarkerRegions';
      break;
    case 'All Regions Except Selected':
      command = 'editor.foldAllExcept';
      break;
    case 'Recursively':
      command = 'editor.foldRecursively';
      break;
  }

  executeCommand(command);
}

/**
 * 执行 VS Code 命令
 * @param command 命令名称
 */
function executeCommand(command: string): void {
  if (command) {
    commands.executeCommand(command);
  }
}
