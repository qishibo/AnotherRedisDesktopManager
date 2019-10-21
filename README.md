<img align="right" width="110" src="https://ftp.bmp.ovh/imgs/2019/09/6be6ffd8b70fbb50.png">

# Another Redis DeskTop Manager

<hr/>

> 🚀🚀🚀 A faster, better and more stable redis desktop manager, compatible with Linux, windows, mac. What's more, it won't crash when loading a large number of keys.

[![MIT](https://img.shields.io/badge/license-MIT-000000.svg)](LICENSE)
[![Download](https://img.shields.io/github/release/qishibo/AnotherRedisDeskTopManager.svg?label=Download)](https://github.com/qishibo/AnotherRedisDesktopManager/releases)
[![Download Analysis](https://img.shields.io/badge/Download-Analysis-blue.svg)](http://qii404.me/github-release-statistics/?repo=/qishibo/AnotherRedisDesktopManager/)
[![shiboooo](https://img.shields.io/badge/Weibo-@shiboooo-D64943.svg)](https://weibo.com/shiboooo?is_hot=1)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fqishibo%2FAnotherRedisDesktopManager.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fqishibo%2FAnotherRedisDesktopManager?ref=badge_shield)


## Windows

Download latest `exe` package from [release](https://github.com/qishibo/AnotherRedisDesktopManager/releases) [or [gitee](https://gitee.com/qishibo/AnotherRedisDesktopManager/releases) in China], double click to install.

## Linux

Download latest `AppImage` package from [release](https://github.com/qishibo/AnotherRedisDesktopManager/releases) [or [gitee](https://gitee.com/qishibo/AnotherRedisDesktopManager/releases) in China], double click to run. Or `./xxx.AppImage`.

## Mac

Download latest `dmg` package from [release](https://github.com/qishibo/AnotherRedisDesktopManager/releases) [or [gitee](https://gitee.com/qishibo/AnotherRedisDesktopManager/releases) in China], double click to install.
<br/>Or by **brew**: `brew cask install another-redis-desktop-manager`

> If **Mac** warning `Another Desktop Manager can't be opened because it is from an unidentified developer`. Open `Settings->Security` and click **`Open Anyway`**

![can't be opened because it is from an unidentified developer](https://ftp.bmp.ovh/imgs/2019/09/ff0cc9593a6cdb53.png)

![Settings->Security Open Anyway](https://ftp.bmp.ovh/imgs/2019/09/9d3a71a834cb67db.jpg)

## Enjoy!

![redis status](https://ftp.bmp.ovh/imgs/2019/09/dd3687029aaaa7f3.jpg)

![redis key hash](https://ftp.bmp.ovh/imgs/2019/09/a2fbaa8d4e16ed58.jpg)

![redis console](https://ftp.bmp.ovh/imgs/2019/09/4aa26ec4b0df9ec2.jpg)


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

[qii404.me](http://qii404.me/)  [@shiboooo](https://weibo.com/shiboooo?is_hot=1)  [Download Analysis](http://qii404.me/github-release-statistics/?repo=/qishibo/AnotherRedisDesktopManager/)

