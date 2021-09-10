<img align="right" width="110" src="https://cdn.jsdelivr.net/gh/qishibo/img/202109031653244.png">

# Another Redis Desktop Manager

<hr/>

> 🚀🚀🚀 一个更快，更好，更稳定的redis桌面连接管理工具，兼容Linux, windows, mac。更重要的是，在加载大量的key时，它仍能很好的工作。

[![MIT](https://img.shields.io/badge/license-MIT-000000.svg)](LICENSE)
[![Download](https://img.shields.io/github/release/qishibo/AnotherRedisDesktopManager.svg?label=Download)](https://github.com/qishibo/AnotherRedisDesktopManager/releases)
[![Download Analysis](https://img.shields.io/badge/Download-Analysis-blue.svg)](https://qii404.me/github-release-statistics/?repo=/qishibo/AnotherRedisDesktopManager/)
[![shiboooo](https://img.shields.io/badge/Weibo-@shiboooo-red.svg)](https://weibo.com/shiboooo?is_hot=1)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fqishibo%2FAnotherRedisDesktopManager.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fqishibo%2FAnotherRedisDesktopManager?ref=badge_shield)


## Windows

下载最新的 [exe](https://github.com/qishibo/AnotherRedisDesktopManager/releases) 包 从 [release](https://github.com/qishibo/AnotherRedisDesktopManager/releases) [or [gitee](https://gitee.com/qishibo/AnotherRedisDesktopManager/releases) in China], 双击点击安装即可.

## Linux

下载最新的 [AppImage](https://github.com/qishibo/AnotherRedisDesktopManager/releases) 包 从 [release](https://github.com/qishibo/AnotherRedisDesktopManager/releases) [or [gitee](https://gitee.com/qishibo/AnotherRedisDesktopManager/releases) in China], `chmod +x`, 双击点击运行即可.

## Mac

- 下载最新的 [dmg](https://github.com/qishibo/AnotherRedisDesktopManager/releases) 包 从 [release](https://github.com/qishibo/AnotherRedisDesktopManager/releases) [or [gitee](https://gitee.com/qishibo/AnotherRedisDesktopManager/releases) in China], 双击点击安装即可.
- Or by **brew**: `brew install --cask another-redis-desktop-manager`
- Or **sponsor** by app store, 这是收费的, 同时我也会非常感谢您的.
<br/>[![app store](https://cdn.jsdelivr.net/gh/qishibo/img/202109031654242.png)](https://apps.apple.com/app/id1516451072)

<!--
> If **Mac** warning `Another Desktop Manager can't be opened because it is from an unidentified developer`. Open `Settings->Security` and click **`Open Anyway`**

![can't be opened because it is from an unidentified developer](https://cdn.jsdelivr.net/gh/qishibo/img/1630655841115-mac-warning.png)

![Settings->Security Open Anyway](https://cdn.jsdelivr.net/gh/qishibo/img/1630655842331-5d11c4feeaf6f.jpg)
-->

## 使用技巧 & 常见问题
- 注意 右键功能 ，点击鼠标右键包含多选删除，新建tab页，复制等等功能
- 连接里的 分隔符 作用： 
1：可以关闭 key 的树形目录展示。使用者可以通过把 分隔符 置空 或者 设置为 key 中不存在的符号，如等号。结果是一样的。
2：如有key是用多个符号连接的，可以新建多个连接设置多个 分隔符 来查看。[查看为什么作者没有加在一个连接内设置多个分隔符的原因](https://github.com/qishibo/AnotherRedisDesktopManager/issues/661)
- 如有 Key 比较长时需要删除时，点击删除无法显示确认按钮时，左侧选择 key 右键可删除（注意右键功能）

- AnotherRedisDesktopManager 如何连接需要多次 ssh 后的 redis 服务器： 比如先 ssh到跳板机，然后再在跳板机上ssh到redis服务器的场景：
1：使用外部工具(比如xshell)跳到跳板机的ssh端口,假设映射端口为5022 AnotherRedisDesktopManager 的ssh配置为localhost:5022 在跳板机开个ssh映射，映射到目标redis-server服务器对应端口，然后用Another ssh跳板机，host填127就行了。 from:  [issue#345](https://github.com/qishibo/AnotherRedisDesktopManager/issues/345)

- 以上所有都来自项目的 [issue](https://github.com/qishibo/AnotherRedisDesktopManager/issues) ，有几个是很多使用者都问过的问题，里面也有很多用户的踩坑和作者的解答，使用者有疑问或者某些功能没有的，可以先去这里搜下，看下是否真的没有还是没有找到入口，希望大家可以补充更多的使用技巧。
## 起飞吧!

![redis status dark](https://cdn.jsdelivr.net/gh/qishibo/img/1630655843497-status.png)

![redis key hash dark](https://cdn.jsdelivr.net/gh/qishibo/img/1630655844559-str.png)

![redis console dark](https://cdn.jsdelivr.net/gh/qishibo/img/1630655846107-cli.png)

![redis exec log](https://cdn.jsdelivr.net/gh/qishibo/img/1630655847740-log.png)


## 功能更新日志

- 2021-08-30: 支持历史执行日志查看 && 增加 Hot Keys 查询 [详情](https://github.com/qishibo/AnotherRedisDesktopManager/releases/tag/v1.4.9)
- 2021-08-16: 查看key的值时支持自定义格式! 
- 2021-06-30: 支持哨兵模式!! [详情](https://github.com/qishibo/AnotherRedisDesktopManager/releases/tag/v1.4.8)
- 2021-06-24: 支持 ACL
- 2021-05-03: 支持 Stream  && 支持命令行命令提示 [详情](https://github.com/qishibo/AnotherRedisDesktopManager/releases/tag/v1.4.5)
- 2021-02-28: 加入连接颜色标记 && 搜索命令历史支持 [详情](https://github.com/qishibo/AnotherRedisDesktopManager/releases/tag/v1.4.2)
- 2021-02-03: 加入右键多选和删除 && 支持 Msgpack 格式查看 [详情](https://github.com/qishibo/AnotherRedisDesktopManager/releases/tag/v1.4.1)
- 2020-12-30: 支持树形查看 key!!!
- 2020-11-03: 支持 Binary 类型查看 && 支持 SSH Passphrase和超时机制 [详情](https://github.com/qishibo/AnotherRedisDesktopManager/releases/tag/v1.3.9)
- 2020-09-04: 支持 SSH 连接集群 && 支持 Extension Commands [详情](https://github.com/qishibo/AnotherRedisDesktopManager/releases/tag/v1.3.8)
- 2020-06-18: 支持 SSL/TLS !!! [详情](https://github.com/qishibo/AnotherRedisDesktopManager/releases/tag/v1.3.7)
- 2020-04-28: Page Zoom && 加入 Scan 方式加载大量的 key && value 自动 Json 格式化 [详情](https://github.com/qishibo/AnotherRedisDesktopManager/releases/tag/v1.3.5)
- 2020-04-18: 支持 Unvisible Key\Value 
- 2020-04-04: 支持 Cluster !!! [详情](https://github.com/qishibo/AnotherRedisDesktopManager/releases/tag/v1.3.3)
- 2020-03-13: 支持 Dark Mode !!! && JsonView In Other Place
- 2020-02-16: 支持 SSH 私钥连接
- 2020-02-13: Tabs 加入可以打开 redis 控制台 Cli 操作
- 2019-06-14: 支持自定义字体
- 2019-05-28: 支持 list 类型 修改等等操作
- 2019-05-09: Hash List Set Zset 等类型加入搜索功能
- 2019-04-26: 加入自动更新
- 2019-04-09: SSH 隧道连接支持
- 2019-04-01: 加入搜索key
- 2019-02-22: 支持简单的连接
- 2019-01-08: 项目开始


## Dev Build

### Linux Or Mac

```bash
# clone code
git clone https://github.com/qishibo/AnotherRedisDesktopManager.git --depth=1
cd AnotherRedisDesktopManager

# install dependencies
npm install

# if download electron failed during installing, use this command
# ELECTRON_MIRROR="https://npm.taobao.org/mirrors/electron/" npm install

# serve with hot reload at localhost:9988
npm start


# after the previous step is completed to 100%, open another tab, build up a desktop client
npm run electron
```

If linux errors like this:

```bash
# if error like this
../src/FontManagerLinux.cc:1:35: fatal error: fontconfig/fontconfig.h: No such file or directory

# then try this
sudo apt install libfontconfig1-dev
```


### Windows

``` bash
# 第一时间安装编译工具，只需要执行以下命令（用于window编译C/C++库的，node.js的某些模块需要）
npm install -g windows-build-tools

# clone code
git clone https://github.com/qishibo/AnotherRedisDesktopManager.git --depth=1
cd AnotherRedisDesktopManager

# install dependencies, 32-bit or 64-bit all use win32
npm install --platform=win32

# if download electron failed during installing, use this command
# npm config set ELECTRON_MIRROR http://npm.taobao.org/mirrors/electron/
# npm install --platform=win32

# serve with hot reload at localhost:9988
npm start


# after the previous step is completed to 100%, open another tab, build up a desktop client
npm run electron
```

### Build Package

```bash
# prepare before package
npm run pack:prepare

# build package on respective platforms
# on windows build 64bit package
npm run pack:win
# on windows build 32bit package
npm run pack:win32

# on mac
npm run pack:mac

# on linux
npm run pack:linux
```

## 赞助

- 给我点个 ⭐!
- 通过 [OpenCollective](https://opencollective.com/AnotherRedisDesktopManager)
- 如果你是 Mac 用户, 您也可以从 [app store](https://apps.apple.com/app/id1516451072) 购买赞助, 然后应用商店自动会为您更新.

  [![app store](https://cdn.jsdelivr.net/gh/qishibo/img/202109031654242.png)](https://apps.apple.com/app/id1516451072)
- 微信赞助码

  <img width="150px" src="https://cdn.jsdelivr.net/gh/qishibo/img/202109031655807.jpeg" />


## 贡献者

在这里感谢所有为此项目做出贡献的人.
[![contributors](https://opencollective.com/AnotherRedisDesktopManager/contributors.svg?width=890&button=false)](https://github.com/qishibo/AnotherRedisDesktopManager/graphs/contributors)
[![backers](https://opencollective.com/AnotherRedisDesktopManager/backers.svg)](https://opencollective.com/AnotherRedisDesktopManager)



## License

[MIT](LICENSE)


## Support

[qii404.me](https://qii404.me/)  [@shiboooo](https://weibo.com/shiboooo?is_hot=1)  [Download Analysis](https://qii404.me/github-release-statistics/?repo=/qishibo/AnotherRedisDesktopManager/)

