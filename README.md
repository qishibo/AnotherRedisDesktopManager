# Another Redis DeskTop Manager

> A faster, better and more stable redis desktop manager, compatible with Linux, windows, mac. What's more, it won't crash when loading a large number of keys.

[![MIT](https://img.shields.io/badge/license-MIT-000000.svg)](LICENSE)
[![Release Page](https://img.shields.io/badge/Download-Release-blue.svg)](https://github.com/qishibo/AnotherRedisDesktopManager/releases)
[![Version](https://img.shields.io/github/release/qishibo/AnotherRedisDeskTopManager.svg?label=Release)](https://github.com/qishibo/AnotherRedisDesktopManager/releases)
[![shiboooo](https://img.shields.io/badge/Weibo-@%E9%BD%90%E5%A3%AB%E5%8D%9A-D64943.svg)](https://weibo.com/shiboooo/)

## Windows

Download latest `exe` package from [release](https://github.com/qishibo/AnotherRedisDesktopManager/releases) page, double click to install.

## Linux

Download latest `AppImage` package from [release](https://github.com/qishibo/AnotherRedisDesktopManager/releases) page, double click to run. Or `chmod +x xxx.AppImage`, then `./xxx.AppImage`.

## Mac

Download latest `dmg` package from [release](https://github.com/qishibo/AnotherRedisDesktopManager/releases) page, double click to install.

> If mac warning `Another Desktop Manager can't be opened because it is from an unidentified developer`, open `Settings->Security` and click `Open Anyway`

![can't be opened because it is from an unidentified developer](https://ws1.sinaimg.cn/large/71405cably1g1o8ln36ksj20bp065jrv.jpg)

![Settings->Security Open Anyway](https://ws1.sinaimg.cn/large/71405cably1g1o8lmzh4zj20ii0f1wfx.jpg)

## Enjoy!

![redis status](https://ws1.sinaimg.cn/large/71405cably1g1pgxyaurdj20ux0lrwgy.jpg)

![redis key detail](https://ws1.sinaimg.cn/large/71405cably1g1pgxya0t3j20uy0lpdhp.jpg)

![redis console](https://ws1.sinaimg.cn/large/71405cably1g1pgxyc3otj20uv0lowg4.jpg)


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

