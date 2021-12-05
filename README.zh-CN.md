<img align="right" width="110" src="https://cdn.jsdelivr.net/gh/qishibo/img/202109031653244.png">

# Another Redis Desktop Manager

<hr/>

🚀🚀🚀 更快、更好、更稳定的Redis桌面(GUI)管理客户端，兼容Windows、Mac、Linux，性能出众，轻松加载海量键值

[![MIT](https://img.shields.io/badge/license-MIT-000000.svg)](LICENSE)
[![Download](https://img.shields.io/github/release/qishibo/AnotherRedisDesktopManager.svg?label=Download)](https://github.com/qishibo/AnotherRedisDesktopManager/releases)
[![Download Analysis](https://img.shields.io/badge/Download-Analysis-blue.svg)](https://qii404.me/github-release-statistics/?repo=/qishibo/AnotherRedisDesktopManager/)
[![twitter @qii404](https://img.shields.io/badge/Twitter-@qii404-blue.svg)](https://twitter.com/qii404)
[![shiboooo](https://img.shields.io/badge/Weibo-@shiboooo-blue.svg)](https://weibo.com/shiboooo?is_hot=1)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fqishibo%2FAnotherRedisDesktopManager.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fqishibo%2FAnotherRedisDesktopManager?ref=badge_shield)


## Windows

- 可以在[github](https://github.com/qishibo/AnotherRedisDesktopManager/releases) 或者 [gitee](https://gitee.com/qishibo/AnotherRedisDesktopManager/releases)下载`exe`安装包
- 或者通过**winget**: `winget install qishibo.AnotherRedisDesktopManager`

## Linux

- 可以在[github](https://github.com/qishibo/AnotherRedisDesktopManager/releases) 或者 [gitee](https://gitee.com/qishibo/AnotherRedisDesktopManager/releases)下载`AppImage`包，`chmod +x`, 双击运行
- 或者通过**snap**: `sudo snap install another-redis-desktop-manager`
**Tips**: 如果选择私钥时提示权限不足，执行`sudo snap connect another-redis-desktop-manager:ssh-keys`来获取对~/.ssh文件夹的权限
<br/>[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/another-redis-desktop-manager)

## Mac

- 通过 **brew**: `brew install --cask another-redis-desktop-manager`
- 或者通过App Store**赞助**, 然后让App Store帮你自动更新版本
<br/>[![app store](https://cdn.jsdelivr.net/gh/qishibo/img/202109031654242.png)](https://apps.apple.com/app/id1516451072)

<!--
> If **Mac** warning `Another Desktop Manager can't be opened because it is from an unidentified developer`. Open `Settings->Security` and click **`Open Anyway`**

![can't be opened because it is from an unidentified developer](https://cdn.jsdelivr.net/gh/qishibo/img/1630655841115-mac-warning.png)

![Settings->Security Open Anyway](https://cdn.jsdelivr.net/gh/qishibo/img/1630655842331-5d11c4feeaf6f.jpg)
-->


## 起飞吧!

![redis status dark](https://cdn.jsdelivr.net/gh/qishibo/img/1630655843497-status.png)

![redis key hash dark](https://cdn.jsdelivr.net/gh/qishibo/img/1630655844559-str.png)

![redis console dark](https://cdn.jsdelivr.net/gh/qishibo/img/1630655846107-cli.png)

![redis exec log](https://cdn.jsdelivr.net/gh/qishibo/img/1630655847740-log.png)


## 里程碑

- 2021-11-26: JSON可编辑 && Subscribe支持
- 2021-08-30: 命令执行日志 && 快捷键
- 2021-08-16: 自定义文本视图
- 2021-06-30: 哨兵支持
- 2021-06-24: Redis>=6.0的ACL支持
- 2021-05-03: Stream 视图支持 && Cli命令行提示
- 2021-02-28: 链接颜色标记 && 搜索历史提示
- 2021-02-03: 多选支持 && Msgpack视图支持
- 2020-12-30: 树状列表
- 2020-11-03: Binary视图 && SSH Passparse\Timeout 支持
- 2020-09-04: SSH 集群支持 
- 2020-06-18: SSL/TLS 支持
- 2020-04-28: 页面缩放 && 大键值Scan操作 && 自动Json
- 2020-04-18: 不可见键值对支持
- 2020-04-04: 集群支持
- 2020-03-13: 暗黑模式
- 2020-02-16: SSH 私钥支持
- 2020-02-13: Cli新Tab打开
- 2019-06-14: 自定义字体支持
- 2019-05-28: Key列表调节宽度
- 2019-05-09: Hash List Set Zset搜索支持
- 2019-04-26: 自动更新
- 2019-04-09: SSH 通道支持
- 2019-04-01: 精确搜索
- 2019-02-22: 单链接支持
- 2019-01-08: 项目孵化


## Dev Build

> Tips: 此为开发环境，用于运行完整项目，**普通用户**直接从前面下载安装包即可


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
# install build tools for the first time, just execute once
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

- 给我点个Star⭐⭐
- 通过 [OpenCollective](https://opencollective.com/AnotherRedisDesktopManager)
- 如果你是Mac用户, 也可以通过从[App Store](https://apps.apple.com/app/id1516451072)购买来赞助, 然后应用商店会为你自动更新

  [![app store](https://cdn.jsdelivr.net/gh/qishibo/img/202109031654242.png)](https://apps.apple.com/app/id1516451072)
- 微信赞助码 [觉得好用就赞助一杯咖啡]

  <img width="150px" src="https://cdn.jsdelivr.net/gh/qishibo/img/202109031655807.jpeg" />


## 贡献者

在这里感谢所有为此项目做出贡献的人.
[![contributors](https://opencollective.com/AnotherRedisDesktopManager/contributors.svg?width=890&button=false)](https://github.com/qishibo/AnotherRedisDesktopManager/graphs/contributors)
[![backers](https://opencollective.com/AnotherRedisDesktopManager/backers.svg)](https://opencollective.com/AnotherRedisDesktopManager)


## License

[MIT](LICENSE)


## Support

[goanother.com](https://goanother.com/) &nbsp; [tw@qii404](https://twitter.com/qii404) &nbsp; [wb@shiboooo](https://weibo.com/shiboooo?is_hot=1) &nbsp; [Download Analysis](https://qii404.me/github-release-statistics/?repo=/qishibo/AnotherRedisDesktopManager/)


