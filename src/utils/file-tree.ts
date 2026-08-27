/**
 * 文件树生成器
 * 功能：生成指定目录的树状结构，支持 .gitignore 规则、深度限制、自定义排除
 */

import * as path from 'path';
import * as fs from 'fs/promises';
import type { Dirent } from 'fs';
import type { WorkspaceConfiguration } from 'vscode';
import ignore from 'ignore';
import { printTree } from 'tree-dump';

const EXCLUDE = ['.gitignore'];

// 类型定义
interface FileNode {
  name: string;
  path: string;
  children?: FileNode[];
}

interface ParserParams {
  target: string;
  rules: ScopedIgnoreRule[];
  rootExclude: ScopedIgnoreRule | null;
  currentDepth: number;
  depth: number;
}

interface ScopedIgnoreRule {
  root: string;
  rule: ReturnType<typeof ignore>;
}

/**
 * 读取目录下的 .gitignore 文件并解析规则
 * @param dir 目录路径
 * @param entries 当前目录项
 * @returns ignore 规则对象或 null
 */
async function getIgnore(
  dir: string,
  entries: readonly Dirent[]
): Promise<ReturnType<typeof ignore> | null> {
  const ignoreEntry = entries.find(
    (entry) => entry.isFile() && EXCLUDE.includes(entry.name)
  );
  if (!ignoreEntry) {
    return null;
  }

  const filePath = path.join(dir, ignoreEntry.name);
  try {
    const content = await fs.readFile(filePath, 'utf-8');
    return content ? ignore().add(content) : null;
  } catch (error) {
    console.warn(`无法读取 .gitignore 文件: ${filePath}`, error);
    return null;
  }
}

/**
 * 递归解析目录树结构
 * @param params 解析参数
 * @returns 文件节点数组
 */
async function parser(params: ParserParams): Promise<FileNode[]> {
  const {
    target,
    rules = [],
    rootExclude,
    currentDepth = 0,
    depth = Number.MAX_SAFE_INTEGER,
  } = params;

  // 达到指定深度，停止递归
  if (currentDepth >= depth) {
    return [];
  }

  const nodes: FileNode[] = [];

  try {
    const children = await fs.readdir(target, { withFileTypes: true });
    const rule = await getIgnore(target, children);
    const effectiveRules = rule
      ? [...rules, { root: target, rule }]
      : rules;

    // 分类文件和文件夹
    const { folders, files } = classifyItems(
      target,
      children,
      effectiveRules,
      rootExclude
    );

    // 处理文件夹（递归）
    for (const folder of folders) {
      const filePath = path.join(target, folder);

      const subChildren = await parser({
        target: filePath,
        rules: effectiveRules,
        rootExclude,
        currentDepth: currentDepth + 1,
        depth,
      });

      nodes.push({
        name: folder,
        path: filePath,
        children: subChildren.length > 0 ? subChildren : undefined,
      });
    }

    // 处理文件
    files.forEach((fileItem) => {
      const filePath = path.join(target, fileItem);
      nodes.push({
        name: fileItem,
        path: filePath,
      });
    });
  } catch (error) {
    // 无权限访问或其他错误，跳过该目录
    console.warn(`无法访问目录: ${target}`, error);
  }

  return nodes;
}

/**
 * 分类目录中的文件和文件夹
 * @param target 目标目录
 * @param children 子项列表
 * @param rules 忽略规则列表
 * @returns 分类后的文件夹和文件数组
 */
function classifyItems(
  target: string,
  children: readonly Dirent[],
  rules: readonly ScopedIgnoreRule[],
  rootExclude: ScopedIgnoreRule | null
): { folders: string[]; files: string[] } {
  const folders: string[] = [];
  const files: string[] = [];

  for (const entry of children) {
    const itemPath = path.join(target, entry.name);
    const isDirectory = entry.isDirectory();

    // 检查是否应该忽略
    if (shouldIgnore(itemPath, isDirectory, rules, rootExclude)) {
      continue;
    }

    if (isDirectory) {
      folders.push(entry.name);
    } else if (entry.isFile() || entry.isSymbolicLink()) {
      files.push(entry.name);
    }
  }

  return { folders, files };
}

/**
 * 检查文件或文件夹是否应该被忽略
 * @param itemPath 项目完整路径
 * @param isDirectory 是否为目录
 * @param rules 忽略规则列表
 * @returns 是否应该忽略
 */
function shouldIgnore(
  itemPath: string,
  isDirectory: boolean,
  rules: readonly ScopedIgnoreRule[],
  rootExclude: ScopedIgnoreRule | null
): boolean {
  if (rootExclude && evaluateRules(itemPath, isDirectory, [rootExclude])) {
    return true;
  }

  return evaluateRules(itemPath, isDirectory, rules);
}

function evaluateRules(
  itemPath: string,
  isDirectory: boolean,
  rules: readonly ScopedIgnoreRule[]
): boolean {
  let isIgnored = false;

  for (const { rule, root } of rules) {
    const relativePath = path.relative(root, itemPath);

    // 如果路径在规则的根目录之外，跳过此规则
    if (
      !relativePath ||
      relativePath === '..' ||
      relativePath.startsWith(`..${path.sep}`) ||
      path.isAbsolute(relativePath)
    ) {
      continue;
    }

    const normalizedPath = relativePath.split(path.sep).join('/');
    const candidate = isDirectory ? `${normalizedPath}/` : normalizedPath;
    const result = rule.test(candidate);

    if (result.ignored) {
      isIgnored = true;
    } else if (result.unignored) {
      isIgnored = false;
    }
  }

  return isIgnored;
}

/**
 * 将文件节点转换为 tree-dump 函数数组
 * @param nodes 文件节点数组
 * @returns tree-dump 函数数组
 */
function toTreeFunctions(nodes: FileNode[]): Array<(tab: string) => string> {
  return nodes.map(node => (tab: string) => {
    if (node.children && node.children.length > 0) {
      return node.name + printTree(tab, toTreeFunctions(node.children));
    }
    return node.name;
  });
}

/**
 * 处理目录结构，生成树节点
 * @param dir 目录路径
 * @param exclude 排除规则
 * @param depth 最大深度
 * @returns 根节点
 */
async function buildTree(
  dir: string,
  exclude: string[] = [],
  depth: number
): Promise<FileNode> {
  const rootExclude: ScopedIgnoreRule | null = exclude.length
    ? { root: dir, rule: ignore().add(exclude) }
    : null;

  const children = await parser({
    target: dir,
    rules: [],
    rootExclude,
    currentDepth: 0,
    depth,
  });

  return {
    name: path.basename(dir),
    path: dir,
    children,
  };
}

/**
 * 创建文件树（异步）
 * @param dir 目录路径
 * @param getConfiguration 获取配置的函数
 * @returns 格式化后的文件树字符串
 */
export async function creator(dir: string, getConfiguration: () => WorkspaceConfiguration): Promise<string> {
  const configuration = getConfiguration();
  const fileTreeExclude = configuration.get<string[]>('opened-editors.fileTreeExclude') || [];
  let depth = configuration.get<number>('opened-editors.fileTreeGeneratorDepth') || 0;

  // depth 为 0 表示不限制深度
  if (depth === 0) {
    depth = Number.MAX_SAFE_INTEGER;
  }

  const fileTreeExportType = configuration.get<string>('opened-editors.fileTreeExportType') || 'markdown';

  // 构建树结构
  const rootNode = await buildTree(dir, fileTreeExclude, depth);

  // 使用 tree-dump 生成树状字符串
  let tree: string;
  if (rootNode.children && rootNode.children.length > 0) {
    tree = rootNode.name + printTree('', toTreeFunctions(rootNode.children));
  } else {
    tree = rootNode.name + '\n';
  }

  // 根据配置包装为 Markdown 代码块
  if (fileTreeExportType === 'markdown') {
    tree = '```\n' + tree + '\n```\n';
  }

  return tree;
}
