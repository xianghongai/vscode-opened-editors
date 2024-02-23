
import { window, env, QuickPickItem } from "vscode";
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
} from 'change-case';

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

const QUICK_ACTIONS = [
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
    description:
      'Convert a string to pascal case (`FooBar`).',
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

export function quickCopyCase() {
  const editor = window.activeTextEditor;

  if (!editor) {
    return;
  }

  const text = editor.document.getText(editor.selection)

  if (!text) {
    return;
  }

  const items: QuickPickItem[] = QUICK_ACTIONS.map((item) => ({
    label: item.label,
    description: text
      ? `Copy Case: ${item.handler(text)}`
      : item.description,
  }));

  window
    .showQuickPick(items)
    .then((command) => copyCase(command?.label));
}

export function copyCase(label: string | undefined) {
  const action = QUICK_ACTIONS.filter(
    (item) => item.label === label
  )[0];

  if (!action) return;

  const editor = window.activeTextEditor;

  if (!editor) {
    return; // no editor
  }

  let text = editor.document.getText(editor.selection);

  env.clipboard.writeText((action.handler(text)));
}
