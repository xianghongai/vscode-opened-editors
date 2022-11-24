import * as path from 'path';
import * as fs from 'fs';
import ignore from 'ignore';

const EXCLUDE = ['.gitignore'];

let depth = 0;
let currentDepth = 0;

const getIgnore = (dir: string = '', files: Array<any> = []) => {
  let ignores: any[] = [];

  files.forEach((fileItem) => {
    const filePath = path.join(dir, fileItem);
    const fileStatus = fs.statSync(filePath);

    if (fileStatus.isFile()) {
      let content = fs.readFileSync(filePath, 'utf-8');
      let _ignores = content
        .split(/\r?\n/)
        .map((line: string) => {
          return line.trim();
        })
        .filter((line: any) => !!line);
      ignores = ignores.concat(_ignores);
    }
  });

  if (!ignores.length) {
    return null;
  }

  return ignore().add(ignores);
}

const render = (name: string, isLast: boolean, deep: any, filePath: string) => {
  const line = deep.map((line: any) => `${line ? '│' : ' '}  `).join('');
  const text = `${line}${isLast ? '└─' : '├─'} ${name}`;

  return {
    path: filePath,
    name,
    text,
  };
}

const parser = (target: string, deep: Array<any> = [], rules: Array<any> = []) => {
  let root = target;
  let branches: any[] = [];
  let children = fs.readdirSync(target);
  let excludeFiles = children.filter((item: string) => {
    return EXCLUDE.includes(item);
  });
  let rule = getIgnore(target, excludeFiles);

  if (rule) {
    rules.push({
      root,
      rule,
    });
  }

  let folders: any[] = [];
  let files: any[] = [];

  if (currentDepth >= depth) {
    return branches;
  }

  currentDepth += 1;

  children.forEach(function (item: string) {
    let folder = path.join(target, item);
    let isExclude = false;

    for (let i = 0; i < rules.length; i++) {
      const { rule, root } = rules[i];
      let relativePath = path.relative(root, folder);
      let excludePath = path.join(relativePath, item);

      if (excludePath.startsWith('..')) {
        continue;
      }

      if (rule.ignores(excludePath)) {
        isExclude = true;
        break;
      }
    }
    if (!isExclude) {
      let fileStatus = fs.statSync(folder);

      if (fileStatus.isFile()) {
        files.push(item);
      } else {
        folders.push(item);
      }
    }
  });

  // 获取子层
  folders.forEach(function (folder, index) {
    let filePath = path.join(target, folder);
    let isLast = index === folders.length - 1 && files.length === 0;

    branches.push(render(folder, isLast, deep, filePath));

    let subBranches = parser(filePath, [...deep, !isLast], rules);

    branches = branches.concat(subBranches);
  });

  // 渲染子层
  files.forEach(function (fileItem, index) {
    let filePath = path.join(target, fileItem);
    let isLast = index === files.length - 1;

    branches.push(render(fileItem, isLast, deep, filePath));
  });

  return branches;
}

const handler = (dir: string, EXCLUDE = []) => {
  let branches = [
    {
      name: path.basename(dir),
      text: path.basename(dir),
    },
  ];
  let rules: { root: string; rule: any; }[] | undefined = [];

  if (EXCLUDE.length) {
    rules = [
      {
        root: dir,
        rule: ignore().add(EXCLUDE),
      },
    ];
  }

  let subBranches = parser(dir, [], rules);
  currentDepth = 0;

  branches = branches.concat(subBranches);

  return branches.map((item) => {
    let { name, text } = item;
    return { name, text };
  });
}

export const creater = (dir: string, getConfiguration: () => any) => {
  const configuration = getConfiguration();
  const FILE_TREE_EXCLUDE = configuration.get('opened-editors.fileTreeExclude');
  depth = configuration.get('opened-editors.fileTreeGeneratorDepth');
  // prettier-ignore
  const FILE_TREE_EXPORT_TYPE = configuration.get('opened-editors.fileTreeExportType');
  let branches = handler(dir, FILE_TREE_EXCLUDE);
  let paddingSpace = Math.max(...branches.map((item) => item.text.length));
  let tree = branches
    .map((item) => item.text + ' '.repeat(paddingSpace - item.text.length + 2) + '\n')
    .join('');

  if (FILE_TREE_EXPORT_TYPE == 'markdown') {
    let mdCode = '```';
    tree = [
      mdCode,
      tree,
      mdCode,
    ].join('\n');
  }

  return tree;
}

