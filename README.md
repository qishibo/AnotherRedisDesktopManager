<img align="right" width="110" src="https://imgup.qii404.me/ardm_icon.png">

# Another Redis DeskTop Manager

<hr/>

> 🚀🚀🚀 A faster, better and more stable redis desktop manager, compatible with Linux, windows, mac. What's more, it won't crash when loading a large number of keys.

[![MIT](https://img.shields.io/badge/license-MIT-000000.svg)](LICENSE)
[![Release Page](https://img.shields.io/badge/Download-Release-blue.svg)](https://github.com/qishibo/AnotherRedisDesktopManager/releases)
[![Version](https://img.shields.io/github/release/qishibo/AnotherRedisDeskTopManager.svg?label=Release)](https://github.com/qishibo/AnotherRedisDesktopManager/releases)
[![shiboooo](https://img.shields.io/badge/Weibo-@%E9%BD%90%E5%A3%AB%E5%8D%9A-D64943.svg)](https://weibo.com/shiboooo?is_hot=1)


## Windows

Download latest `exe` package from [release](https://github.com/qishibo/AnotherRedisDesktopManager/releases) [or [gitee](https://gitee.com/qishibo/AnotherRedisDesktopManager/releases) in China], double click to install.

## Linux

Download latest `AppImage` package from [release](https://github.com/qishibo/AnotherRedisDesktopManager/releases) [or [gitee](https://gitee.com/qishibo/AnotherRedisDesktopManager/releases) in China], double click to run. Or `./xxx.AppImage`.

## Mac

Download latest `dmg` package from [release](https://github.com/qishibo/AnotherRedisDesktopManager/releases) [or [gitee](https://gitee.com/qishibo/AnotherRedisDesktopManager/releases) in China], double click to install.

> If **Mac** warning `Another Desktop Manager can't be opened because it is from an unidentified developer`. Open `Settings->Security` and click **`Open Anyway`**

![can't be opened because it is from an unidentified developer](https://imgup.qii404.me/blog/5d11c4fdf236b.jpg)

![Settings->Security Open Anyway](https://imgup.qii404.me/blog/5d11c4feeaf6f.jpg)

## Enjoy!

![redis status](https://imgup.qii404.me/blog/5d11c50031d9c.jpg)

![redis key hash](https://imgup.qii404.me/blog/5d11c501bdb52.jpg)

![redis console](https://imgup.qii404.me/blog/5d11c503cf26b.jpg)


## Feature Log

- 2019-06-14: Custom Font-Family Support
- 2019-05-28: Key List Resizable
- 2019-05-09: Search Support In Hash List Set Zset
- 2019-04-26: Auto Updater
- 2019-04-09: SSH Tunnel Connection Support
- 2019-04-01: Extract Search Support
- 2019-02-22: Single Connection Support
- 2019-01-08: Project Start


## Dev Build Setup

### Linux Or Mac

```bash
# clone code
git clone https://github.com/qishibo/AnotherRedisDesktopManager.git
cd AnotherRedisDesktopManager

# install dependencies
npm install

# if download electron failed during installing, use this command
# ELECTRON_MIRROR="https://npm.taobao.org/mirrors/electron/" npm install

# serve with hot reload at localhost:9988
npm start


# after the previous step is completed, open another tab, build up a desktop client
npm run electron
```


### Windows

``` bash
# install build tools for the first time, just execute once
npm install -g windows-build-tools

# clone code
git clone https://github.com/qishibo/AnotherRedisDesktopManager.git
cd AnotherRedisDesktopManager

# install dependencies, 32-bit or 64-bit all use win32
npm install --platform=win32

# if download electron failed during installing, use this command
# npm config set ELECTRON_MIRROR http://npm.taobao.org/mirrors/electron/
# npm install --platform=win32

# serve with hot reload at localhost:9988
npm start


# after the previous step is completed, open another tab, build up a desktop client
npm run electron
```

## License

[MIT](LICENSE)


## Support

[qii404.me](https://qii404.me/)  [@shiboooo](https://weibo.com/shiboooo?is_hot=1)

