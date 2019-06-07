# Another Redis DeskTop Manager

> A faster, better and more stable redis desktop manager, compatible with Linux, windows, mac. What's more, it won't crash when loading a large number of keys.

 [![MIT](https://img.shields.io/badge/license-MIT-000000.svg)](LICENSE)
[![Release Page](https://img.shields.io/badge/Download-Release-blue.svg)](https://github.com/qishibo/AnotherRedisDesktopManager/releases)
[![Version](https://img.shields.io/github/release/qishibo/AnotherRedisDeskTopManager.svg?label=Release)](https://github.com/qishibo/AnotherRedisDesktopManager/releases)
[![shiboooo](https://img.shields.io/badge/Weibo-@%E9%BD%90%E5%A3%AB%E5%8D%9A-D64943.svg)](https://weibo.com/shiboooo?is_hot=1)
[![Backers on Open Collective](https://opencollective.com/AnotherRedisDesktopManager/backers/badge.svg)](#backers) 
[![Sponsors on Open Collective](https://opencollective.com/AnotherRedisDesktopManager/sponsors/badge.svg)](#sponsors)


## Windows

Download latest `exe` package from [release](https://github.com/qishibo/AnotherRedisDesktopManager/releases) [or [gitee](https://gitee.com/qishibo/AnotherRedisDesktopManager/releases) in China], double click to install.

## Linux

Download latest `AppImage` package from [release](https://github.com/qishibo/AnotherRedisDesktopManager/releases) [or [gitee](https://gitee.com/qishibo/AnotherRedisDesktopManager/releases) in China], double click to run. Or `./xxx.AppImage`.

## Mac

Download latest `dmg` package from [release](https://github.com/qishibo/AnotherRedisDesktopManager/releases) [or [gitee](https://gitee.com/qishibo/AnotherRedisDesktopManager/releases) in China], double click to install.

> If **Mac** warning `Another Desktop Manager can't be opened because it is from an unidentified developer`. Open `Settings->Security` and click **`Open Anyway`**

![can't be opened because it is from an unidentified developer](https://sinaimg.qii404.me/large/71405cably1g1o8ln36ksj20bp065jrv.jpg)

![Settings->Security Open Anyway](https://sinaimg.qii404.me/large/71405cably1g1o8lmzh4zj20ii0f1wfx.jpg)

## Enjoy!

![redis status](https://sinaimg.qii404.me/large/71405cably1g3j24mfcorj20uy0lmq5v.jpg)

![redis key hash](https://sinaimg.qii404.me/large/71405cably1g3j24mfao9j20uw0lntbd.jpg)

![redis console](https://sinaimg.qii404.me/large/71405cably1g3j24mf3qjj20ux0lmdha.jpg)


## Feature Log

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

## Contributors

This project exists thanks to all the people who contribute. 
<a href="https://github.com/qishibo/AnotherRedisDesktopManager/graphs/contributors"><img src="https://opencollective.com/AnotherRedisDesktopManager/contributors.svg?width=890&button=false" /></a>


## Backers

Thank you to all our backers! 🙏 [[Become a backer](https://opencollective.com/AnotherRedisDesktopManager#backer)]

<a href="https://opencollective.com/AnotherRedisDesktopManager#backers" target="_blank"><img src="https://opencollective.com/AnotherRedisDesktopManager/backers.svg?width=890"></a>


## Sponsors

Support this project by becoming a sponsor. Your logo will show up here with a link to your website. [[Become a sponsor](https://opencollective.com/AnotherRedisDesktopManager#sponsor)]

<a href="https://opencollective.com/AnotherRedisDesktopManager/sponsor/0/website" target="_blank"><img src="https://opencollective.com/AnotherRedisDesktopManager/sponsor/0/avatar.svg"></a>
<a href="https://opencollective.com/AnotherRedisDesktopManager/sponsor/1/website" target="_blank"><img src="https://opencollective.com/AnotherRedisDesktopManager/sponsor/1/avatar.svg"></a>
<a href="https://opencollective.com/AnotherRedisDesktopManager/sponsor/2/website" target="_blank"><img src="https://opencollective.com/AnotherRedisDesktopManager/sponsor/2/avatar.svg"></a>
<a href="https://opencollective.com/AnotherRedisDesktopManager/sponsor/3/website" target="_blank"><img src="https://opencollective.com/AnotherRedisDesktopManager/sponsor/3/avatar.svg"></a>
<a href="https://opencollective.com/AnotherRedisDesktopManager/sponsor/4/website" target="_blank"><img src="https://opencollective.com/AnotherRedisDesktopManager/sponsor/4/avatar.svg"></a>
<a href="https://opencollective.com/AnotherRedisDesktopManager/sponsor/5/website" target="_blank"><img src="https://opencollective.com/AnotherRedisDesktopManager/sponsor/5/avatar.svg"></a>
<a href="https://opencollective.com/AnotherRedisDesktopManager/sponsor/6/website" target="_blank"><img src="https://opencollective.com/AnotherRedisDesktopManager/sponsor/6/avatar.svg"></a>
<a href="https://opencollective.com/AnotherRedisDesktopManager/sponsor/7/website" target="_blank"><img src="https://opencollective.com/AnotherRedisDesktopManager/sponsor/7/avatar.svg"></a>
<a href="https://opencollective.com/AnotherRedisDesktopManager/sponsor/8/website" target="_blank"><img src="https://opencollective.com/AnotherRedisDesktopManager/sponsor/8/avatar.svg"></a>
<a href="https://opencollective.com/AnotherRedisDesktopManager/sponsor/9/website" target="_blank"><img src="https://opencollective.com/AnotherRedisDesktopManager/sponsor/9/avatar.svg"></a>



## License

[MIT](LICENSE)


## Support

[qii404.me](https://qii404.me/)  [@shiboooo](https://weibo.com/shiboooo?is_hot=1)

