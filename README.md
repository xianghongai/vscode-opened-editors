<p>
  <h1 align="center">VSCode Opened Editors</h1>
</p>

<p align="center">
  <a href="https://github.com/xianghongai/vscode-opened-editors">
    <img src="https://img.shields.io/github/repo-size/xianghongai/vscode-opened-editors?color=4ac51c&style=plastic&?cacheSeconds=3600">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=nicholashsiang.vscode-opened-editors">
    <img src="https://img.shields.io/visual-studio-marketplace/v/nicholashsiang.vscode-opened-editors?color=%234ac51c&style=plastic&?cacheSeconds=3600">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=nicholashsiang.vscode-opened-editors">
    <img src="https://img.shields.io/visual-studio-marketplace/d/nicholashsiang.vscode-opened-editors?color=4ac51c&style=plastic&?cacheSeconds=3600">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=nicholashsiang.vscode-opened-editors">
    <img src="https://img.shields.io/visual-studio-marketplace/r/nicholashsiang.vscode-opened-editors?color=4ac51c&style=plastic&?cacheSeconds=3600">
  </a>
  <a href="https://marketplace.visualstudio.com/items?itemName=nicholashsiang.vscode-opened-editors">
    <img src="https://img.shields.io/github/license/xianghongai/vscode-opened-editors?color=4ac51c&style=plastic&?cacheSeconds=3600">
  </a>
</p>

![ScreenShots](https://raw.githubusercontent.com/caringrun/assets/master/vscode-opened-editors.gif)

快捷键自行按需绑定。

## 标题菜单栏

- `Opened Editors: Reveal In Side Bar` - 在侧边栏中显示 (文件在侧边栏资源中的位置)
- `Opened Editors: Opened Editors` - 已打开的编辑器列表
- `Opened Editors: Copy Folder Name` - 复制目录名 (复制父层文件夹名，可选择不同层级)
- `Opened Editors: Copy File Name` - 复制文件名
- `Opened Editors: Fold` - 折叠 (可在配置中设定不同语言类型的折叠层级)
- `Opened Editors: Unfold` - 展开
- `Opened Editors: Format Document` - 格式化文档

## 命令

- `Opened Editors: Copy Path` - 复制文件路径 (可选择不同层级)

### 复制命名风格

- `Copy Case: Commands` - 命名风格复制...
- `Copy Case: constant` - 以 `constant` 命名风格复制 (`FOO_BAR`)
- `Copy Case: camel` - 以 `camel` 命名风格复制 (`fooBar`)
- `Copy Case: pascal` - 以 `pascal` 命名风格复制 (`FooBar`)
- `Copy Case: kebab` - 以 `kebab` 命名风格复制 (`foo-bar`)
- `Copy Case: snake` - 以 `snake` 命名风格复制 (`foo_bar`)
- `Copy Case: dot` - 以 `dot` 命名风格复制 (`foo.bar`)
- `Copy Case: path` - 以 `path` 命名风格复制 (`foo/bar`)
- `Copy Case: title` - 以 `title` 命名风格复制 (`Foo Bar`)
- `Copy Case: lower` - 以 `lower` 命名风格复制 (`foo bar`)
- `Copy Case: upper` - 以 `upper` 命名风格复制 (`FOO BAR`)

### 粘贴命名风格

- `Paste Case: Commands` - 命名风格粘贴...
- `Paste Case: constant` - 以 `constant` 命名风格粘贴 (`FOO_BAR`)
- `Paste Case: camel` - 以 `camel` 命名风格粘贴 (`fooBar`)
- `Paste Case: pascal` - 以 `pascal` 命名风格粘贴 (`FooBar`)
- `Paste Case: kebab` - 以 `kebab` 命名风格粘贴 (`foo-bar`)
- `Paste Case: snake` - 以 `snake` 命名风格粘贴 (`foo_bar`)
- `Paste Case: dot` - 以 `dot` 命名风格粘贴 (`foo.bar`)
- `Paste Case: path` - 以 `path` 命名风格粘贴 (`foo/bar`)
- `Paste Case: title` - 以 `title` 命名风格粘贴 (`Foo Bar`)
- `Paste Case: lower` - 以 `lower` 命名风格粘贴 (`foo bar`)
- `Paste Case: upper` - 以 `upper` 命名风格粘贴 (`FOO BAR`)

## 资源右键菜单

- `Opened Editors: File Tree Generator` - 文件结构树 (侧边栏右键复制目录树结构)

## 状态栏

- 底部面板开关

---

## License 📃

MIT License

<!-- [package.json - contributes/configuration/properties](https://github.com/microsoft/vscode/blob/main/src/vs/workbench/api/common/configurationExtensionPoint.ts) -->