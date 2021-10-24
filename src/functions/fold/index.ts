import { workspace, commands } from 'vscode';
import { extname } from 'path';
import { getPath } from '../../utils/path';

function getConfiguration() {
  const configuration = workspace.getConfiguration();
  const globalFoldLevel: string = configuration.get<{}>(
    'opened-editors.fold'
  ) as string;
  const foldSpecialConfig = configuration.get<{}>('opened-editors.foldSpecial');
  const foldNest = configuration.get<{}>('opened-editors.foldNest');
  const foldSpecials: { [key: string]: string } = { ...foldSpecialConfig };

  return { globalFoldLevel, foldSpecials, foldNest };
}

export const foldHandler = (...args: any) => {
  const { globalFoldLevel, foldSpecials, foldNest } = getConfiguration();
  let foldLevel = globalFoldLevel;
  let foldSpecialsKey: string = '';
  const fullPath = getPath(args);
  const extName = extname(fullPath);
  const foldSpecialsKeys = Object.keys(foldSpecials);
  const inSpecial = foldSpecialsKeys.some((key) => {
    const extNames = key.split(',');
    const match = extNames.some((item) => item.trim() === extName);

    if (match) {
      foldSpecialsKey = key;
    }

    return match;
  });

  // 如果当前文件：
  // 1、在特殊设定中，按特殊设定执行
  // 2、不在特殊设定中，按普通设定执行
  if (inSpecial) {
    foldLevel = foldSpecials[foldSpecialsKey];
  }

  if (foldNest) {
    foldByNest(foldLevel);
    return;
  }

  foldByNormal(foldLevel);
};

export const unfoldHandler = (...args: any) => {
  let command = '';
  const { globalFoldLevel } = getConfiguration();

  if (globalFoldLevel === 'All Regions Except Selected') {
    command = 'editor.unfoldAllExcept';
  } else if (globalFoldLevel === 'All Regions') {
    command = 'editor.unfoldAllMarkerRegions';
  } else if (globalFoldLevel === 'Recursively') {
    command = 'editor.unfoldRecursively';
  } else {
    command = 'editor.unfoldAll';
  }

  executeCommand(command);
};

/**
 * 同时折叠内部嵌套层级
 */
function foldByNest(foldLevel: string) {
  if (foldLevel === 'All') {
    executeCommand('editor.foldAll');
    return;
  }

  let levelDeep = 0;
  let levelValue = foldLevel.split('Level ')[1];

  if (levelValue) {
    levelDeep = Number.parseInt(levelValue);
  }

  for (let index = 7; index >= levelDeep; index -= 1) {
    executeCommand(`editor.foldLevel${index}`);
  }
}

/**
 * 仅折叠指定层级
 */
function foldByNormal(foldLevel: string) {
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

function executeCommand(command: string) {
  commands.executeCommand(command);
}
