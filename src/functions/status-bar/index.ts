import { workspace, window, StatusBarAlignment, StatusBarItem, Disposable } from 'vscode';

/**
 * 状态栏按钮配置接口
 */
interface StatusBarButtonConfig {
  configKey: string; // 配置项键名
  text: string; // 按钮显示文本
  tooltip: string; // 鼠标悬停提示
  command: string; // 按钮关联的命令
  priority: number; // 显示优先级（数字越大越靠左）
  defaultValue: boolean; // 默认是否显示
}

const statusBarButtons = [
  {
    configKey: 'closeWindow',
    text: '$(chrome-close)',
    tooltip: 'Close Window',
    command: 'workbench.action.closeWindow',
    priority: 3,
    defaultValue: true,
  },
  {
    configKey: 'togglePanel',
    text: '$(terminal-powershell)',
    tooltip: 'Toggle Panel',
    command: 'workbench.action.togglePanel',
    priority: 2,
    defaultValue: true,
  },
  {
    configKey: 'openWelcome',
    text: '$(heart)',
    tooltip: 'Open Welcome',
    command: 'workbench.action.openWalkthrough',
    priority: 1,
    defaultValue: false,
  },
] satisfies readonly StatusBarButtonConfig[];

/**
 * 创建状态栏按钮（工厂函数）
 * @param config 按钮配置
 * @param subscriptions 订阅列表（用于生命周期管理）
 * @returns 状态栏项
 */
function createStatusBarButton(config: StatusBarButtonConfig, subscriptions: Disposable[]): StatusBarItem {
  const { configKey, text, tooltip, command, priority, defaultValue } = config;
  const settingId = `opened-editors.${configKey}`;

  const statusBarItem = window.createStatusBarItem(settingId, StatusBarAlignment.Right, priority);
  statusBarItem.text = text;
  statusBarItem.tooltip = tooltip;
  statusBarItem.command = command;

  const updateVisibility = (): void => {
    const isEnabled = workspace.getConfiguration('opened-editors').get<boolean>(configKey, defaultValue);

    if (isEnabled === true) {
      statusBarItem.show();
    } else {
      statusBarItem.hide();
    }
  };

  updateVisibility();

  const configurationSubscription = workspace.onDidChangeConfiguration((event) => {
    if (event.affectsConfiguration(settingId)) {
      updateVisibility();
    }
  });

  subscriptions.push(statusBarItem, configurationSubscription);

  return statusBarItem;
}

/**
 * 注册全部状态栏按钮
 */
export function registerStatusBarButtons(subscriptions: Disposable[]): void {
  statusBarButtons.forEach((config) => createStatusBarButton(config, subscriptions));
}
