# Another Redis DeskTop Manager

> A faster, better and more stable redis desktop manager, compatible with Linux, windows, mac. What's more, it won't crash when loading a large number of keys.


## Windows

Download latest `exe` package from [release](https://github.com/qishibo/AnotherRedisDesktopManager/releases) page, double click to install.

## Linux

Download latest `AppImage` package from [release](https://github.com/qishibo/AnotherRedisDesktopManager/releases) page, double click to run. Or `chmod +x xxx.AppImage`, then `./xxx.AppImage`.

## Mac

Download latest `dmg` package from [release](https://github.com/qishibo/AnotherRedisDesktopManager/releases) page, double click to install.

## Dev Build Setup

``` bash
# clone code
git clone https://github.com/qishibo/AnotherRedisDesktopManager.git

# install dependencies
cd AnotherRedisDesktopManager
npm install

# serve with hot reload at localhost:9988
npm start

# after the last step is completed, open another tab, build up a desktop client

# Linux or Mac
npm run electron

# Windows
# you need to download electron.exe first
path_to_electron.exe .
```

Enjoy!

![redis status](https://ws1.sinaimg.cn/large/71405cably1g129wwutkij20vn0mbae6.jpg)

![redis key detail](https://ws1.sinaimg.cn/large/71405cably1g129wwu51vj20vi0ma77n.jpg)

![redis console](https://ws1.sinaimg.cn/large/71405cably1g129wwtdfjj20vn0mbq6d.jpg)

## License

[MIT](LICENSE)

