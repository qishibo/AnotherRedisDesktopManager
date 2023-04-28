<img align="right" width="120" src="https://cdn.jsdelivr.net/gh/qishibo/img/ano-square-icon-128.png">

# Another Redis Desktop Manager

<hr/>

🚀🚀🚀 更快、更好、更稳定的Redis桌面(GUI)管理客户端，兼容Windows、Mac、Linux，性能出众，轻松加载海量键值

[![MIT](https://img.shields.io/badge/license-MIT-000000.svg)](LICENSE)
[![Download](https://img.shields.io/github/release/qishibo/AnotherRedisDesktopManager.svg?label=Download)](https://github.com/qishibo/AnotherRedisDesktopManager/releases)
[![Download Analysis](https://img.shields.io/badge/Download-Analysis-blue.svg)](https://qii404.me/github-release-statistics/?repo=/qishibo/AnotherRedisDesktopManager/)
[![Weibo](https://img.shields.io/badge/Weibo-@shiboooo-blue.svg)](https://weibo.com/shiboooo?is_hot=1)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fqishibo%2FAnotherRedisDesktopManager.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fqishibo%2FAnotherRedisDesktopManager?ref=badge_shield)
<a href="https://www.producthunt.com/posts/another-redis-desktop-manager?utm_source=badge-featured"><img src="https://api.producthunt.com/widgets/embed-image/v1/featured.svg?post_id=340552&theme=dark" height="20" width="93" /></a>


## Windows

- 可以在[github](https://github.com/qishibo/AnotherRedisDesktopManager/releases) 或者 [gitee](https://gitee.com/qishibo/AnotherRedisDesktopManager/releases)下载`exe`安装包
- 或者通过**chocolatey**: `choco install another-redis-desktop-manager`
- 或者通过**winget**: `winget install qishibo.AnotherRedisDesktopManager`
- 或者通过Win Store**赞助**，然后让Win Store帮你自动更新版本
<br/><a href="https://www.microsoft.com/store/apps/9MTD84X0JFHZ?cid=storebadge&ocid=badge"><img src="https://cdn.jsdelivr.net/gh/qishibo/img/microsoft-store.png" height="58" width="180" alt="get from microsoft store"></a>

## Linux

- 可以在[github](https://github.com/qishibo/AnotherRedisDesktopManager/releases) 或者 [gitee](https://gitee.com/qishibo/AnotherRedisDesktopManager/releases)下载`AppImage`包，`chmod +x`, 双击运行
- 或者通过**snap**: `sudo snap install another-redis-desktop-manager`
**Tips**: 如果选择私钥时提示权限不足，执行`sudo snap connect another-redis-desktop-manager:ssh-keys`来获取对~/.ssh文件夹的权限
<br/>[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/another-redis-desktop-manager)

## Mac

> 如果通过brew或者dmg安装后无法打开，报错**不受信任**或者**移到垃圾箱**，执行下面命令后再启动即可:<br>`sudo xattr -rd com.apple.quarantine /Applications/Another\ Redis\ Desktop\ Manager.app`

- 可以在[github](https://github.com/qishibo/AnotherRedisDesktopManager/releases) 或者 [gitee](https://gitee.com/qishibo/AnotherRedisDesktopManager/releases)下载`dmg`安装包
- 通过 **brew**: `brew install --cask another-redis-desktop-manager`
- 或者通过App Store**赞助**, 然后让App Store帮你自动更新版本
<br/>[![app store](https://cdn.jsdelivr.net/gh/qishibo/img/avail_app_store180.svg)](https://apps.apple.com/app/id1516451072)

<!--
> If **Mac** warning `Another Desktop Manager can't be opened because it is from an unidentified developer`. Open `Settings->Security` and click **`Open Anyway`**

![can't be opened because it is from an unidentified developer](https://cdn.jsdelivr.net/gh/qishibo/img/1630655841115-mac-warning.png)

![Settings->Security Open Anyway](https://cdn.jsdelivr.net/gh/qishibo/img/1630655842331-5d11c4feeaf6f.jpg)
-->


## 起飞!

![redis status dark](https://cdn.jsdelivr.net/gh/qishibo/img/1630655843497-status.png)

![redis key hash dark](https://cdn.jsdelivr.net/gh/qishibo/img/1630655844559-str.png)

![redis console dark](https://cdn.jsdelivr.net/gh/qishibo/img/1630655846107-cli.png)

![redis exec log](https://cdn.jsdelivr.net/gh/qishibo/img/1630655847740-log.png)


## 里程碑

- 2022-10-07: Key列表方向键 && 内存分析支持指定文件夹
- 2022-08-05: 克隆连接 && Tabs右键和滚轮支持
- 2022-04-01: Protobuf 支持 && 内存占用分析
- 2022-03-03: 只读模式 && Mointor 支持
- 2022-01-01: Brotli\Gzip\Deflate 解压缩支持 && RedisJSON 支持
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

- 给我点个Star⭐⭐ 或者 [Producthunt](https://www.producthunt.com/posts/another-redis-desktop-manager)点个赞
- 通过 [OpenCollective](https://opencollective.com/AnotherRedisDesktopManager)
- 如果你是Mac用户, 也可以通过从[App Store](https://apps.apple.com/app/id1516451072)购买来赞助, 然后应用商店会为你自动更新
<br>[![app store](https://cdn.jsdelivr.net/gh/qishibo/img/avail_app_store180.svg)](https://apps.apple.com/app/id1516451072)
- 如果你是Windows用户，还可以通过从[Windows Store](https://www.microsoft.com/store/apps/9MTD84X0JFHZ)购买来赞助，商店就会帮你自动更新
<br>[![windows store](https://cdn.jsdelivr.net/gh/qishibo/img/windows-store-icon182-56.png)](https://www.microsoft.com/store/apps/9MTD84X0JFHZ)
- 微信赞助码 [觉得好用，赞助一些大白兔🐇奶糖!]

  <img width="150px" src="https://cdn.jsdelivr.net/gh/qishibo/img/202109031655807.jpeg" />


## 贡献者

在这里感谢所有为此项目做出贡献的人.
[![contributors](https://opencollective.com/AnotherRedisDesktopManager/contributors.svg?width=890&button=false)](https://github.com/qishibo/AnotherRedisDesktopManager/graphs/contributors)
[![backers](https://opencollective.com/AnotherRedisDesktopManager/backers.svg)](https://opencollective.com/AnotherRedisDesktopManager)


## 自定义格式化

> 当默认可视化方式不满足需求时，可以使用自定义脚本来格式化你的内容。
<br>方式：可视化列表下拉到底部，点击"自定义->新增"，然后参考下面说明。
<br>注意：脚本需要通过`print` `console.log` `echo`等输出格式化好的内容，可以是任意字符串或者JSON字符串


| 配置项 | 参数说明 |
| ------ | ------ |
| `Name` | 自定义名称 |
| `Command` | 可执行命令，如`xxx.py` `xxx.js` `xxx.class`等，该文件需要具有可执行的`x`权限，可以通过形如`./xxx.py`方式执行；也可以直接用系统命令`/bin/node` `/bin/bash`等，此时需要把脚本路径放到Params里 |
| `Params` | 拼接在`Command`后的参数，如"--key `{KEY}` --value `{VALUE}`"，其中`{KEY}`和`{VALUE}`在执行时会被替换成对应的Redis key和value。注意如果内容为二进制等不可见字符时，可以使用`{HEX}`代替`{VALUE}`，`{HEX}`会被替换成对应value的16进制即hex编码 |

### 配置样例：
> 脚本文件首行要增加env说明，最终执行的命令如: `./home/qii/pickle_decoder.py {HEX}`, 脚本中可以使用`argv[1]`接收参数

| Command | Params |
| ------ | ------ |
| `/home/qii/pickle_decoder.py` | `{HEX}` |
| `/home/qii/shell_decoder.sh` | `{VALUE}` |

### 脚本文件无执行权限时：
> 最终执行的命令如: `/bin/node /home/qii/node_decoder.js {HEX}`, 脚本中可以使用`argv[1]`接收参数

| Command | Params |
| ------ | ------ |
| `/bin/bash` | `/home/qii/shell_decoder.sh {VALUE}` |
| `/bin/node` | `/home/qii/node_decoder.js {HEX} --key={KEY}` |


## License

[MIT](LICENSE)


## Support

[goanother.com](https://goanother.com/) &nbsp; [Producthunt](https://www.producthunt.com/posts/another-redis-desktop-manager) &nbsp; [Weibo@shiboooo](https://weibo.com/shiboooo?is_hot=1) &nbsp; [Download Analysis](https://qii404.me/github-release-statistics/?repo=/qishibo/AnotherRedisDesktopManager/)


