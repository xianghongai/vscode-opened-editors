/**
 * 这段代码的作用是生成一个指定目录下的文件树，根据目录结构递归生成一个数组，数组的每一项代表了目录下的一个文件或文件夹。
 * 该代码包含了三个函数：
 *     getIgnore：获取指定目录下的 .gitignore 文件中的忽略规则。
 *     render：根据目录深度、文件名等信息生成树状结构中每个节点的文本。
 *     parser：递归生成指定目录下的文件树，并返回文件树的每个节点的信息。
 * 该代码主要依赖了 Node.js 的核心模块 path 和 fs，以及第三方模块 ignore。
 */

import * as path from 'path';
import * as fs from 'fs';
import ignore from 'ignore';

const EXCLUDE = ['.gitignore'];

/**
 * 函数 getIgnore() 用于从一个目录下的文件中读取 .gitignore 文件，并返回一个由 ignore 包创建的忽略规则对象。
 * 这样就可以在遍历目录时应用忽略规则，忽略某些指定的文件和文件夹。
 * 该函数的输入参数 dir 表示目录路径，files 表示目录下的所有文件数组。
 * 函数首先对每个文件进行遍历，对于每个是文件的元素，读取其内容并解析出 .gitignore 中的规则，将规则存储在一个数组中。
 * 如果在目录下没有 .gitignore 文件或者文件内容为空，则返回 null，否则返回由 ignore() 包创建的规则对象。
 */
function getIgnore(dir: string = '', files: Array<any> = []) {
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

interface IRender {
  name: string,
  isLast: boolean,
  deep: any,
  filePath: string,
}
/**
 * render 函数是用来渲染文件树结构中每个文件或目录的名称和层级关系的函数。它的主要作用是将文件或目录名称以及其所处的层级关系格式化成一个字符串，以便在控制台或其他输出场景中展示文件树结构。
 *
 * render 函数接受一个包含以下属性的参数对象 params：
 *
 *     name: 字符串类型，表示要渲染的文件或目录的名称。
 *     isLast: 布尔类型，表示当前文件或目录是否是当前文件夹下最后一个。
 *     deep: 一个数组，表示当前文件或目录所处的层级关系。数组中每个元素的值为布尔类型，表示该层级是否是文件夹下最后一个文件或目录。
 *     filePath: 字符串类型，表示要渲染的文件或目录的绝对路径。
 *
 * render 函数返回一个包含以下属性的对象：
 *
 *     path: 字符串类型，表示文件或目录的绝对路径。
 *     name: 字符串类型，表示文件或目录的名称。
 *     text: 字符串类型，表示渲染后的文件或目录的名称和层级关系。
 */
function render(params: IRender) {
  let { name, isLast, deep, filePath } = params;
  const line = deep.map((line: any) => `${line ? '│' : ' '}  `).join('');
  const text = `${line}${isLast ? '└─' : '├─'} ${name}`;

  return {
    path: filePath,
    name,
    text,
  };
}

interface IParser {
  target: string,
  deep: Array<any>,
  rules: Array<any>,
  currentDepth: number,
  depth: number,
}

/**
 *  函数 parser 的作用是遍历目录树，返回指定目录下的所有文件和文件夹信息，以及它们的路径和层级信息，并且忽略指定的文件和文件夹。
 *
 * parser 函数的实现主要分为以下几个步骤：
 *
 *     1. 获取指定目录下的所有文件和文件夹的名称，并将它们区分为两个数组，分别存储文件夹和文件的名称。
 *     2. 对于每个文件夹，递归调用 parser 函数，获取其子层的文件和文件夹信息，并将结果合并到结果数组中。
 *     3. 对于每个文件，将其信息存储到结果数组中。
 *     4. 在处理每个文件夹和文件之前，首先排除指定的文件和文件夹。排除指定文件和文件夹的方法是读取目录下的 .gitignore 文件，并解析其中的规则，将符合规则的文件或文件夹排除掉。
 *     5. 在处理每个文件夹时，会记录它的深度信息，并将它的深度信息以及它的父级文件夹信息传递给 render 函数，用于生成输出字符串。
 *     6. 在处理每个文件时，也会记录它的深度信息，并将它的深度信息以及它的父级文件夹信息传递给 render 函数，用于生成输出字符串。
 *
 * parser 函数接受一个包含以下属性的参数对象 params：
 *
 *     target：指定当前处理的目录或文件路径。
 *     deep：存储当前路径的深度信息，用于绘制树形结构时渲染节点前面的空格占位符。
 *     rules：存储 .gitignore 文件中定义的规则，用于过滤掉指定的目录或文件。
 *     currentDepth：记录当前处理的目录或文件所在的深度，用于控制递归深度。
 *     depth：指定递归处理的最大深度，用于限制递归深度，避免无限递归。
 *
 * parser 返回的是根据目录结构解析出的文件夹和文件的层级结构 (branches) (数组)。数组中的每个元素都是一个对象，代表一个文件或一个文件夹的信息，包括文件或文件夹的名称、路径、层级和输出字符串等信息。
 * 这个返回值在函数 handler 中被使用，用于构建最终的目录树。
 */
function parser(params: IParser) {
  let {
    target,
    deep = [],
    rules = [],
    currentDepth = 0,
    depth = Number.MAX_SAFE_INTEGER,
  } = params;

  // 判断是否达到指定深度，如果是则直接返回空数组
  if (currentDepth >= depth) {
    return [];
  }

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

    branches.push(render({ name: folder, isLast, deep, filePath }));

    // 递归调用之前将 currentDepth 加 1
    currentDepth += 1;

    let subBranches = parser({
      target: filePath,
      deep: [...deep, !isLast],
      rules,
      currentDepth,
      depth,
    });
    // 递归调用之后将 currentDepth 减 1
    currentDepth -= 1;

    branches = branches.concat(subBranches);
  });

  // 渲染子层
  files.forEach(function (fileItem, index) {
    let filePath = path.join(target, fileItem);
    let isLast = index === files.length - 1;

    branches.push(render({ name: fileItem, isLast, deep, filePath }));
  });

  return branches;
}

/**
 * handler 是 creator 函数的内部函数，用于处理目录结构，生成用于展示的目录树。
 * 它会调用 parser 函数来解析目录，并将解析出的结果渲染成目录树的节点，然后将所有节点组成目录树，作为最终的结果返回。
 * handler 函数的作用是将目录转换成一个数组，数组中的每个元素都代表一个目录树节点，包含节点的名称和文本，节点的深度信息以及节点对应的文件路径信息。
 * 这个数组可以用于生成目录树的图形化展示，也可以用于其他需要目录结构信息的场景，例如根据目录结构生成文件索引，或是统计目录中的文件数量等。
 *
 *  handler 函数有三个参数：
 *     dir：指定要生成文件树的目录路径；
 *     EXCLUDE：一个字符串数组，用于指定要排除的文件和目录，排除规则由 .gitignore 文件中的内容解析而来；
 *     depth：指定生成文件树的深度，即显示到第几层目录。默认不限制层级，表示只显示目录下的一级子目录和文件。
 */
function handler(dir: string,
  EXCLUDE = [],
  depth: number) {
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

  const currentDepth = 0;

  let subBranches = parser({
    target: dir,
    deep: [],
    rules,
    currentDepth,
    depth,
  });

  branches = branches.concat(subBranches);

  return branches.map((item) => {
    let { name, text } = item;
    return { name, text };
  });
}

/**
 * creator 函数是用于创建一个文件树的函数。
 * 它的作用是接收一个目录路径参数 dir 和一个获取配置参数的函数 getConfiguration，并生成一个以目录为根节点的树形结构，表示该目录下所有的文件和子目录。
 * 在具体的实现中，creator 函数会使用 handler 函数获取目录下的文件和子目录，并调用 parser 函数将这些文件和子目录按照一定的深度规则转换为树形结构。
 * 最后，creator 函数会对树形结构进行格式化和渲染，并根据配置决定导出文件类型和文件名。
 *
 * 函数内部调用了 getConfiguration 函数来获取配置信息：
 *     opened-editors.fileTreeExclude 指定要排除的文件和目录，
 *     opened-editors.fileTreeGeneratorDepth 指定生成文件树的深度，
 *     opened-editors.fileTreeExportType 指定生成的文件树的输出类型 (文本或 Markdown)。
 */
export function creator (dir: string, getConfiguration: () => any) {
  const configuration = getConfiguration();
  const FILE_TREE_EXCLUDE = configuration.get('opened-editors.fileTreeExclude');
  let depth = configuration.get('opened-editors.fileTreeGeneratorDepth');

  if (depth === 0) {
    depth = Number.MAX_SAFE_INTEGER;
  }

  // prettier-ignore
  const FILE_TREE_EXPORT_TYPE = configuration.get('opened-editors.fileTreeExportType');
  let branches = handler(dir, FILE_TREE_EXCLUDE, depth);
  let paddingSpace = Math.max(...branches.map((item) => item.text.length));
  let tree = branches
    .map(
      (item) => item.text + ' '.repeat(paddingSpace - item.text.length + 2) + '\n'
    )
    .join('');

  if (FILE_TREE_EXPORT_TYPE == 'markdown') {
    let mdCode = '```';
    tree = [mdCode, tree, mdCode].join('\n');
  }

  return tree;
}
