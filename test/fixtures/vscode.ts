/**
 * VS Code API 的测试替身。
 *
 * `vitest.config.mts` 把 `vscode` 这个 specifier 别名到本文件，被测模块因此拿到它
 * 而不是真实 API。类型按替身实际暴露的契约写，刻意不去实现 `@types/vscode` 的完整接口，
 * 那既做不到也无必要；测试只断言这里记录下来的调用。
 */

/** `window.createStatusBarItem()` 返回的替身。 */
export interface FakeStatusBarItem {
  id: string;
  alignment: number;
  priority: number;
  disposed: boolean;
  visible: boolean;
  text?: string;
  tooltip?: string;
  command?: string;
  show(): void;
  hide(): void;
  dispose(): void;
}

/** `window.activeTextEditor` 替身，只保留被测代码读取的字段。 */
interface FakeTextEditor {
  document: {
    fileName: string;
    uri: { scheme: string };
  };
}

interface ConfigurationChangeEvent {
  affectsConfiguration(candidate: string): boolean;
}

interface ConfigurationListenerEntry {
  disposed: boolean;
  listener: (event: ConfigurationChangeEvent) => void;
  subscription: { dispose(): void };
}

export const createdStatusBarItems: FakeStatusBarItem[] = [];
export const clipboardWrites: string[] = [];
export const executedCommands: string[] = [];
export const shownErrorMessages: string[] = [];
export const statusBarMessages: string[] = [];
const configurationListeners: ConfigurationListenerEntry[] = [];
const configurationValues = new Map<string, unknown>();
let clipboardWriteImplementation: (value: string) => Promise<void> = () => Promise.resolve();
let commandExecutionImplementation: (command: string) => Promise<void> = () => Promise.resolve();

export const StatusBarAlignment = {
  Right: 2,
};

export class Disposable {}
export class StatusBarItem {}
export class WorkspaceConfiguration {}

export const workspace = {
  getConfiguration(section?: string) {
    return {
      get(key: string, defaultValue?: unknown) {
        const settingId = section ? `${section}.${key}` : key;
        return configurationValues.get(settingId) ?? defaultValue;
      },
    };
  },
  onDidChangeConfiguration(listener: (event: ConfigurationChangeEvent) => void) {
    const entry: ConfigurationListenerEntry = {
      disposed: false,
      listener,
      subscription: {
        dispose() {
          entry.disposed = true;
        },
      },
    };

    configurationListeners.push(entry);
    return entry.subscription;
  },
};

export const commands = {
  executeCommand(command: string) {
    executedCommands.push(command);
    return commandExecutionImplementation(command);
  },
};

export const window = {
  activeTextEditor: undefined as FakeTextEditor | undefined,
  createStatusBarItem(id: string, alignment: number, priority: number): FakeStatusBarItem {
    const item: FakeStatusBarItem = {
      id,
      alignment,
      priority,
      disposed: false,
      visible: false,
      show() {
        this.visible = true;
      },
      hide() {
        this.visible = false;
      },
      dispose() {
        this.disposed = true;
      },
    };

    createdStatusBarItems.push(item);
    return item;
  },
  showErrorMessage(message: string) {
    shownErrorMessages.push(message);
    return Promise.resolve(undefined);
  },
  setStatusBarMessage(message: string, _hideAfterTimeout?: number) {
    statusBarMessages.push(message);
    return { dispose() {} };
  },
};

export function emitConfigurationChange(settingId: string) {
  const event: ConfigurationChangeEvent = {
    affectsConfiguration(candidate: string) {
      return candidate === settingId;
    },
  };

  configurationListeners.filter(({ disposed }) => !disposed).forEach(({ listener }) => listener(event));
}

export function setConfiguration(settingId: string, value: unknown) {
  configurationValues.set(settingId, value);
}

export const env = {
  clipboard: {
    writeText(value: string) {
      clipboardWrites.push(value);
      return clipboardWriteImplementation(value);
    },
  },
};

export function setClipboardWriteImplementation(implementation: (value: string) => Promise<void>) {
  clipboardWriteImplementation = implementation;
}

export function setCommandExecutionImplementation(implementation: (command: string) => Promise<void>) {
  commandExecutionImplementation = implementation;
}

export function setActiveTextEditor(fileName?: string) {
  window.activeTextEditor = fileName
    ? {
        document: {
          fileName,
          uri: {
            scheme: 'file',
          },
        },
      }
    : undefined;
}

export function resetVscodeTestState() {
  createdStatusBarItems.length = 0;
  clipboardWrites.length = 0;
  executedCommands.length = 0;
  shownErrorMessages.length = 0;
  statusBarMessages.length = 0;
  configurationListeners.length = 0;
  configurationValues.clear();
  clipboardWriteImplementation = () => Promise.resolve();
  commandExecutionImplementation = () => Promise.resolve();
  window.activeTextEditor = undefined;
}
