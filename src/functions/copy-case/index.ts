
import { window, env, QuickPickItem, TextEditor } from "vscode";
// change-case 5.x Not Support CommonJS
import {
  constantCase,
  camelCase,
  paramCase as kebabCase,
  snakeCase,
  pascalCase,
  dotCase,
  pathCase,
  capitalCase,
  noCase,
  Options,
} from 'change-case';

export const ACTION_TYPE = {
  copy: 'copy',
  paste: 'paste',
} as const;

type ACTION_TYPE_VALUES = typeof ACTION_TYPE[keyof typeof ACTION_TYPE];

export const ACTIONS = {
  commands: 'commands',
  constant: 'constant',
  camel: 'camel',
  pascal: 'pascal',
  kebab: 'kebab',
  snake: 'snake',
  dot: 'dot',
  path: 'path',
  title: 'title',
  lower: 'lower',
  upper: 'upper',
};

type QuickAction = {
  label: string;
  description: string;
  handler: (input: string, options?: Options) => string;
};

const QUICK_ACTIONS: QuickAction[] = [
  {
    label: ACTIONS.constant,
    description: 'Convert a string to constant case (`FOO_BAR`).',
    handler: constantCase,
  },
  {
    label: ACTIONS.camel,
    description: 'Convert a string to camel case (`fooBar`).',
    handler: camelCase,
  },
  {
    label: ACTIONS.pascal,
    description: 'Convert a string to pascal case (`FooBar`).',
    handler: pascalCase,
  },
  {
    label: ACTIONS.kebab,
    description: 'Convert a string to kebab case (`foo-bar`).',
    handler: kebabCase,
  },
  {
    label: ACTIONS.snake,
    description: 'Convert a string to snake case (`foo_bar`).',
    handler: snakeCase,
  },

  {
    label: ACTIONS.dot,
    description: 'Convert a string to dot case (`foo.bar`).',
    handler: dotCase,
  },
  {
    label: ACTIONS.path,
    description: 'Convert a string to path case (`foo/bar`).',
    handler: pathCase,
  },
  {
    label: ACTIONS.title,
    description: 'Convert a string to capital case (`Foo Bar`).',
    handler: capitalCase,
  },
  {
    label: ACTIONS.lower,
    description: 'Convert a string to space separated lower case (`foo bar`).',
    handler: noCase,
  },
  {
    label: ACTIONS.upper,
    description: 'Convert a string to capital case (`FOO BAR`).',
    handler: (input: string) => noCase(input).toUpperCase(),
  },
];


export async function quickCaseAction(actionType: ACTION_TYPE_VALUES) {
  const editor = window.activeTextEditor;

  if (!editor) {
    return;
  }

  let text: string | undefined;
  let actionName: string;

  switch (actionType) {
    case ACTION_TYPE.copy:
      actionName = 'Copy Case';
      text = editor.document.getText(editor.selection);
      break;
    case ACTION_TYPE.paste:
      actionName = 'Paste Case';
      text = await env.clipboard.readText();
      break;
  }

  if (!text) {
    return;
  }

  const items: QuickPickItem[] = QUICK_ACTIONS.map((item) => ({
    label: item.label,
    description: text
      ? `${actionName}: ${item.handler(text)}`
      : item.description,
  }));

  window
    .showQuickPick(items)
    .then((command: any) => caseAction(command?.label, actionType));
}

function copyCase(action: QuickAction, editor: TextEditor) {
  let text = editor.document.getText(editor.selection);
  env.clipboard.writeText((action.handler(text)));
}

function pasteCase(action: QuickAction, editor: TextEditor) {
  env.clipboard.readText().then((text) => {
    editor.edit((editBuilder) => {
      editor.selections.forEach(selection => {
        if (selection.isEmpty) {
          editBuilder.insert(editor.selection.active, action.handler(text));
        } else {
          editBuilder.replace(selection, action.handler(text));
        }
      });
    });
  });
}

export function caseAction(label: string | undefined, actionType: ACTION_TYPE_VALUES) {
  const action = QUICK_ACTIONS.filter(
    (item) => item.label === label
  )[0];

  if (!action) return;

  const editor = window.activeTextEditor;

  if (!editor) {
    return; // no editor
  }

  switch (actionType) {
    case ACTION_TYPE.copy:
      copyCase(action, editor);
      break;
    case ACTION_TYPE.paste:
      pasteCase(action, editor);
      break;
  }
}
