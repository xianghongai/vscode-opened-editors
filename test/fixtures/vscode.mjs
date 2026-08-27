export const createdStatusBarItems = [];
export const clipboardWrites = [];
export const executedCommands = [];
const configurationListeners = [];
const configurationValues = new Map();
let clipboardWriteImplementation = () => Promise.resolve();
let commandExecutionImplementation = () => Promise.resolve();

export const StatusBarAlignment = {
  Right: 2,
};

export class Disposable {}
export class StatusBarItem {}
export class WorkspaceConfiguration {}

export const workspace = {
  getConfiguration(section) {
    return {
      get(key, defaultValue) {
        const settingId = section ? `${section}.${key}` : key;
        return configurationValues.get(settingId) ?? defaultValue;
      },
    };
  },
  onDidChangeConfiguration(listener) {
    const entry = {
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
  executeCommand(command) {
    executedCommands.push(command);
    return commandExecutionImplementation(command);
  },
};

export const window = {
  activeTextEditor: undefined,
  createStatusBarItem(id, alignment, priority) {
    const item = {
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
};

export function emitConfigurationChange(settingId) {
  const event = {
    affectsConfiguration(candidate) {
      return candidate === settingId;
    },
  };

  configurationListeners
    .filter(({ disposed }) => !disposed)
    .forEach(({ listener }) => listener(event));
}

export function setConfiguration(settingId, value) {
  configurationValues.set(settingId, value);
}

export const env = {
  clipboard: {
    writeText(value) {
      clipboardWrites.push(value);
      return clipboardWriteImplementation(value);
    },
  },
};

export function setClipboardWriteImplementation(implementation) {
  clipboardWriteImplementation = implementation;
}

export function setCommandExecutionImplementation(implementation) {
  commandExecutionImplementation = implementation;
}

export function setActiveTextEditor(fileName) {
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
  configurationListeners.length = 0;
  configurationValues.clear();
  clipboardWriteImplementation = () => Promise.resolve();
  commandExecutionImplementation = () => Promise.resolve();
  window.activeTextEditor = undefined;
}
