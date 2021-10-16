import * as vscode from 'vscode';

function getConfiguration() {
  const configuration = vscode.workspace.getConfiguration();
  const value = configuration.get<{}>('opened-editors.fold');
  const foldSpecialConfig = configuration.get<{}>('opened-editors.foldSpecial');
  const foldNest = configuration.get<{}>('opened-editors.foldNest');
  const foldSpecialValue = { ...foldSpecialConfig };

  return { value, foldSpecialValue, foldNest };
}

export const foldHandler = (...args: any) => {
  let command = '';
  const { value } = getConfiguration();

  switch (value) {
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
    case 'All Recursively':
      command = 'editor.foldRecursively';
      break;
  }

  vscode.commands.executeCommand(command);
};

export const unfoldHandler = (...args: any) => {
  let command = '';
  const { value } = getConfiguration();

  if (value === 'All Regions Except Selected') {
    command = 'editor.unfoldAllExcept';
  } else if (value === 'All Regions') {
    command = 'editor.unfoldAllMarkerRegions';
  } else if (value === 'All Recursively') {
    command = 'editor.unfoldRecursively';
  } else {
    command = 'editor.unfoldAll';
  }

  vscode.commands.executeCommand(command);
};
