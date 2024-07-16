# 踩坑记

原始需求是通过 npm 发布包，在通过 JsDelivr 创建 CDN 链接加速资源加载过程。 由于我们使用了 GitHub 来管理代码仓库，所以可以构建一套自动化流程：

1. 团队开发上传代码，等到需求成熟之后在 GitHub 上发版
2. Release 触发 GitHub actions 来构建和发布到 npm 上

GitHub workflow actions 的内容包括：

1. Build package
2. Npm publish

由于用到了 `pnpm` 来做 `MonoRepo` 管理，所以需要配置 pnpm， 使用的工具是 `pnpm/action-setup@v4`.

在串联GitHub和npm publish的过程中，踩了不少坑。

## GitHub workflow jobs

1. 找不到编译文件

最开始的 workflow 是分为两个 job: `build` 和 `publish`. 在运行之后发现 `publish` 任务始终找不到编译的目录，后来通过 debug 发现目录不存在。

**解决方案**： 将两个 jobs 合并成一个

2. pnpm 不在 GitHub 包管理工具列表中

GitHub 默认支持 `npm` 和 `yarn`， 由于我们用了 `pnpm` 来实现 `MonoRepo` 的管理，在编译时也需要使用 `pnpm`.

**解决方案**: 在 jobs 中配置 `pnpm`

```yaml
- uses: pnpm/action-setup@v4
  name: Setup pnpm
  with:
    run_install: false
    version: 9
```

3. 配置 `npm` 源

在配置 node 的步骤中设置一下就可以了:

```yaml
- uses: actions/setup-node@v3
  with:
    node-version: 18
    cache: pnpm # 配置 pnpm
    registry-url: 'https://registry.npmjs.org'
    cache-dependency-path: 'pnpm-lock.yaml' # 配置 pnpm
```

4. 设置 npm version 时报错

为了自动读取 release 的版本号来设置 package 的版本号，需要运行

```bash
npm version ${{ github.event.release.tag_name }}
```

这个命令在 GitHub workflow 中会触发错误，需要我们去设置 git 的用户信息。

```yaml
- run: git config --global user.name "Github CD bot"
- run: git config --global user.email "aaron.hui.ji@outlook.com"
```

5. package 目标文件位置不对

由于我们开发的过程中需要安装各种依赖，并且有些文件不需要被打包或者打包之后的有些文件不需要被发布出去，这里有几种解决方法:

1. `.gitignore` 中包含的文件会被忽略掉
2. 可以使用 `.npmignore` 来排除文件或文件夹，优先级高于 `.gitignore`
3. 在 `package.json` 中使用 `files` 字段来包含文件或文件夹，优先级最高。

综合以上三个方法可以满足我们的需求，但是当前 `package.json` 会被一并发布到 `npm`, 其中包含了依赖，这样看起来不是很干净。

可以单独写一个 `package.json`, 打包之后复制到 `dist` 文件夹下。但是这样在 GitHub workflow 中会出现问题，运行 `npm publish` 始终是通过 `root` 目录下的 `package.json` 来识别发布文件的。

**解决方案**

在 workflow 中配置 `working-directory`

```yaml
- name: publish 🚀️
  run: npm publish
  working-directory: /your/path
```

_注意_

这里需要注意的一点是我们的需求是只让用户通过 CDN 来使用，所以相关的依赖都一起打包了，最终用户获取到资源文件也会大一些。如果想让用户通过导入到方式开发自己的应用，这样是需要完整的项目结构的，包括原文件和 `package.json`. 这样可以减少用户的打包体积，有些公共的库可以共享。

6. 相关 Token 是空值

发布到 npm 是需要配置 `npm token` 并添加到 GitHub 里的， 然后通过 `{{secrets.TOKEN_NAME}}` 来获取。这里出现的问题是配置了相关 `secrets` 之后，在 workflow 里面读取出来的值一直是空的。后来发现原因是配置的 secrets 位置不对， 我们配置了 `Environment secrets`, 正确的做法是配置 `Repository secrets`。

7. 发布失败

这里的原因可能有很多种，比如 token 失效或者 token 权限设置有问题等等。

## 后续任务

1. 了解 `.npmignore`
2. 了解 GitHub workflow 运行机制，为什么不同的 steps 会清除之前构建的文件目录
3. 了解什么时候使用 `Environment secrets`
