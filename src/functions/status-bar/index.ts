import { commands, ExtensionContext, window, StatusBarAlignment, workspace } from 'vscode';

export function togglePanel(subscriptions: any) {
  let togglePanelEnable = workspace.getConfiguration("opened-editors").get('togglePanel', true);

  // Status Bar add 'Toggle Panel'
  const statusBarTerminal = window.createStatusBarItem(StatusBarAlignment.Right, 2);
  statusBarTerminal.text = '$(terminal-powershell)';
  statusBarTerminal.tooltip = 'Toggle Panel';
  statusBarTerminal.command = 'workbench.action.togglePanel';
  subscriptions.push(statusBarTerminal);

  if (togglePanelEnable) {
    statusBarTerminal.show();
  }

  workspace.onDidChangeConfiguration(() => {
    togglePanelEnable = workspace.getConfiguration("opened-editors").get('togglePanel', true);

    if (togglePanelEnable) {
      statusBarTerminal.show();
    } else {
      statusBarTerminal.hide();
    }
  });
}

export function openWelcome(subscriptions: any) {
  let openWelcomeEnable = workspace.getConfiguration("opened-editors").get('openWelcome', true);

  const statusBarWelcome = window.createStatusBarItem(StatusBarAlignment.Right, 1);
  statusBarWelcome.text = '$(heart)';
  statusBarWelcome.tooltip = 'Open Welcome';
  statusBarWelcome.command = 'workbench.action.openWalkthrough';
  subscriptions.push(statusBarWelcome);

  if (openWelcomeEnable) {
    statusBarWelcome.show();
  }

  workspace.onDidChangeConfiguration(() => {
    openWelcomeEnable = workspace.getConfiguration("opened-editors").get('openWelcome', false);

    if (openWelcomeEnable) {
      statusBarWelcome.show();
    } else {
      statusBarWelcome.hide();
    }
  });
}
