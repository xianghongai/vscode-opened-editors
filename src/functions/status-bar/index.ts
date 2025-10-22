import { workspace, window, StatusBarAlignment, StatusBarItem, Disposable } from 'vscode';

/**
 * 状态栏按钮配置接口
 */
interface StatusBarButtonConfig {
  configKey: string;        // 配置项键名
  text: string;             // 按钮显示文本
  tooltip: string;          // 鼠标悬停提示
  command: string;          // 按钮关联的命令
  priority: number;         // 显示优先级（数字越大越靠左）
  defaultValue?: boolean;   // 默认是否显示
}

/**
 * 创建状态栏按钮（工厂函数）
 * @param config 按钮配置
 * @param subscriptions 订阅列表（用于生命周期管理）
 * @returns 状态栏项
 */
function createStatusBarButton(
  config: StatusBarButtonConfig,
  subscriptions: Disposable[]
): StatusBarItem {
  const {
    configKey,
    text,
    tooltip,
    command,
    priority,
    defaultValue = true,
  } = config;

  // 读取配置
  let isEnabled = workspace.getConfiguration('opened-editors').get(configKey, defaultValue);

  // 创建状态栏项
  const statusBarItem = window.createStatusBarItem(StatusBarAlignment.Right, priority);
  statusBarItem.text = text;
  statusBarItem.tooltip = tooltip;
  statusBarItem.command = command;
  subscriptions.push(statusBarItem);

  // 根据配置显示或隐藏
  if (isEnabled) {
    statusBarItem.show();
  }

  // 监听配置变更
  workspace.onDidChangeConfiguration(() => {
    isEnabled = workspace.getConfiguration('opened-editors').get(configKey, defaultValue);

    if (isEnabled) {
      statusBarItem.show();
    } else {
      statusBarItem.hide();
    }
  });

  return statusBarItem;
}

/**
 * 创建 Toggle Panel 状态栏按钮
 */
export function togglePanel(subscriptions: Disposable[]): void {
  createStatusBarButton(
    {
      configKey: 'togglePanel',
      text: '$(terminal-powershell)',
      tooltip: 'Toggle Panel',
      command: 'workbench.action.togglePanel',
      priority: 2,
      defaultValue: true,
    },
    subscriptions
  );
}

/**
 * 创建 Open Welcome 状态栏按钮
 */
export function openWelcome(subscriptions: Disposable[]): void {
  createStatusBarButton(
    {
      configKey: 'openWelcome',
      text: '$(heart)',
      tooltip: 'Open Welcome',
      command: 'workbench.action.openWalkthrough',
      priority: 1,
      defaultValue: false,
    },
    subscriptions
  );
}
