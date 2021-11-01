<img align="right" width="110" src="https://cdn.jsdelivr.net/gh/qishibo/img/202109031653244.png">

# Another Redis Desktop Manager

<hr/>

> 🚀🚀🚀 A faster, better and more stable redis desktop manager, compatible with Linux, windows, mac. What's more, it won't crash when loading massive keys.

[![MIT](https://img.shields.io/badge/license-MIT-000000.svg)](LICENSE)
[![Download](https://img.shields.io/github/release/qishibo/AnotherRedisDesktopManager.svg?label=Download)](https://github.com/qishibo/AnotherRedisDesktopManager/releases)
[![Download Analysis](https://img.shields.io/badge/Download-Analysis-blue.svg)](https://qii404.me/github-release-statistics/?repo=/qishibo/AnotherRedisDesktopManager/)
[![twitter @qii404](https://img.shields.io/badge/Twitter-@qii404-blue.svg)](https://twitter.com/qii404)
[![shiboooo](https://img.shields.io/badge/Weibo-@shiboooo-blue.svg)](https://weibo.com/shiboooo?is_hot=1)
[![FOSSA Status](https://app.fossa.com/api/projects/git%2Bgithub.com%2Fqishibo%2FAnotherRedisDesktopManager.svg?type=shield)](https://app.fossa.com/projects/git%2Bgithub.com%2Fqishibo%2FAnotherRedisDesktopManager?ref=badge_shield)


## Windows

- Download latest [exe](https://github.com/qishibo/AnotherRedisDesktopManager/releases) package from [release](https://github.com/qishibo/AnotherRedisDesktopManager/releases) [or [gitee](https://gitee.com/qishibo/AnotherRedisDesktopManager/releases) in China], double click to install.
- Or by **winget**: `winget install qishibo.AnotherRedisDesktopManager`

## Linux

- Download latest [AppImage](https://github.com/qishibo/AnotherRedisDesktopManager/releases) package from [release](https://github.com/qishibo/AnotherRedisDesktopManager/releases) [or [gitee](https://gitee.com/qishibo/AnotherRedisDesktopManager/releases) in China], `chmod +x`, double click to run.
 - Or by **snap**: `sudo snap install another-redis-desktop-manager`
 **Tips**: If permission denied when selecting private key, run `sudo snap connect another-redis-desktop-manager:ssh-keys` to give access to ~/.ssh folder.
<br/>[![Get it from the Snap Store](https://snapcraft.io/static/images/badges/en/snap-store-black.svg)](https://snapcraft.io/another-redis-desktop-manager)


## Mac

- Download latest [dmg](https://github.com/qishibo/AnotherRedisDesktopManager/releases) package from [release](https://github.com/qishibo/AnotherRedisDesktopManager/releases) [or [gitee](https://gitee.com/qishibo/AnotherRedisDesktopManager/releases) in China], double click to install.
- Or by **brew**: `brew install --cask another-redis-desktop-manager`
- Or **sponsor** by app store, It's not free, and I will be very grateful to you.
<br/>[![app store](https://cdn.jsdelivr.net/gh/qishibo/img/202109031654242.png)](https://apps.apple.com/app/id1516451072)

<!--
> If **Mac** warning `Another Desktop Manager can't be opened because it is from an unidentified developer`. Open `Settings->Security` and click **`Open Anyway`**

![can't be opened because it is from an unidentified developer](https://cdn.jsdelivr.net/gh/qishibo/img/1630655841115-mac-warning.png)

![Settings->Security Open Anyway](https://cdn.jsdelivr.net/gh/qishibo/img/1630655842331-5d11c4feeaf6f.jpg)
-->

## Enjoy!

![redis status dark](https://cdn.jsdelivr.net/gh/qishibo/img/1630655843497-status.png)

![redis key hash dark](https://cdn.jsdelivr.net/gh/qishibo/img/1630655844559-str.png)

![redis console dark](https://cdn.jsdelivr.net/gh/qishibo/img/1630655846107-cli.png)

![redis exec log](https://cdn.jsdelivr.net/gh/qishibo/img/1630655847740-log.png)


## Feature Log

- 2021-08-30: Execution log Support && Add Hot Keys
- 2021-08-16: Custom Formatter View Support!
- 2021-06-30: Sentinel Support!!
- 2021-06-24: ACL Support
- 2021-05-03: Stream Support && Cli Command Tips Support
- 2021-02-28: Connection Color Tag && Search History Support
- 2021-02-03: Multiple Select\Delete && Msgpack Viewer Support
- 2020-12-30: Tree View Support!!!
- 2020-11-03: Binary View Support && SSH Passparse\Timeout Support
- 2020-09-04: SSH Cluster Support && Extension Commands Support
- 2020-06-18: SSL/TLS Support!!!
- 2020-04-28: Page Zoom && Big Key Loads With Scan && Auto Json
- 2020-04-18: Unvisible Key\Value Format Support
- 2020-04-04: Cluster Support!!!
- 2020-03-13: Dark Mode Support!!! && JsonView In Other Place
- 2020-02-16: SSH Private Key Support
- 2020-02-13: Open Cli Console In Tabs
- 2019-06-14: Custom Font-Family Support
- 2019-05-28: Key List Resizable
- 2019-05-09: Search Support In Hash List Set Zset
- 2019-04-26: Auto Updater
- 2019-04-09: SSH Tunnel Connection Support
- 2019-04-01: Extract Search Support
- 2019-02-22: Single Connection Support
- 2019-01-08: Project Start


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

## Sponsor

- Give me a star ⭐!
- Through [OpenCollective](https://opencollective.com/AnotherRedisDesktopManager)
- If you are a Mac user, you can purchase this software from the [app store](https://apps.apple.com/app/id1516451072) to sponsor, and then let the app store automatically update it for you.

  [![app store](https://cdn.jsdelivr.net/gh/qishibo/img/202109031654242.png)](https://apps.apple.com/app/id1516451072)
- Wechat sponsor code

  <img width="150px" src="https://cdn.jsdelivr.net/gh/qishibo/img/202109031655807.jpeg" />


## Contributors

This project exists thanks to all the people who contribute.
[![contributors](https://opencollective.com/AnotherRedisDesktopManager/contributors.svg?width=890&button=false)](https://github.com/qishibo/AnotherRedisDesktopManager/graphs/contributors)
[![backers](https://opencollective.com/AnotherRedisDesktopManager/backers.svg)](https://opencollective.com/AnotherRedisDesktopManager)



## License

[MIT](LICENSE)


## Support

[goanother.com](https://goanother.com/) &nbsp; [tw@qii404](https://twitter.com/qii404) &nbsp; [wb@shiboooo](https://weibo.com/shiboooo?is_hot=1) &nbsp; [Download Analysis](https://qii404.me/github-release-statistics/?repo=/qishibo/AnotherRedisDesktopManager/)

