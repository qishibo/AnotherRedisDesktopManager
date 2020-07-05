#!/bin/bash
# see https://github.com/electron/electron/blob/master/docs/tutorial/mac-app-store-submission-guide.md

# Name of your app.
APP="Another Redis Desktop Manager"
# The path of your app to sign.
APP_PATH="../../dist/build-apps/mas/Another Redis Desktop Manager.app"
# The path to the location you want to put the signed package.
RESULT_PATH="../../dist/build-apps/$APP.pkg"
# The name of certificates you requested.
APP_KEY="3rd Party Mac Developer Application: shibo qi (68JN8DV835)"
INSTALLER_KEY="3rd Party Mac Developer Installer: shibo qi (68JN8DV835)"
# The path of your plist files.
CHILD_PLIST="child.plist"
PARENT_PLIST="parent.plist"
LOGINHELPER_PLIST="loginhelper.plist"

FRAMEWORKS_PATH="$APP_PATH/Contents/Frameworks"

# sign font-list binary
codesign --deep --force --verify --verbose=4 --timestamp --options runtime --entitlements "$CHILD_PLIST" -s "$APP_KEY" "$APP_PATH/Contents/Resources/app.asar.unpacked/node_modules/font-list/libs/darwin/fontlist"

codesign -s "$APP_KEY" -f --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/Electron Framework.framework/Versions/A/Electron Framework"
codesign -s "$APP_KEY" -f --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/Electron Framework.framework/Versions/A/Libraries/libffmpeg.dylib"
codesign -s "$APP_KEY" -f --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/Electron Framework.framework/Versions/A/Libraries/libnode.dylib"
codesign -s "$APP_KEY" -f --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/Electron Framework.framework/Versions/A/Libraries/libEGL.dylib"
codesign -s "$APP_KEY" -f --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/Electron Framework.framework/Versions/A/Libraries/libGLESv2.dylib"
codesign -s "$APP_KEY" -f --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/Electron Framework.framework/Versions/A/Libraries/libswiftshader_libEGL.dylib"
codesign -s "$APP_KEY" -f --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/Electron Framework.framework/Versions/A/Libraries/libswiftshader_libGLESv2.dylib"
codesign -s "$APP_KEY" -f --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/Electron Framework.framework/Versions/A/Libraries/libvk_swiftshader.dylib"
codesign -s "$APP_KEY" -f --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/Electron Framework.framework"
codesign -s "$APP_KEY" -f --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/$APP Helper.app/Contents/MacOS/$APP Helper"
codesign -s "$APP_KEY" -f --entitlements "$CHILD_PLIST" "$FRAMEWORKS_PATH/$APP Helper.app/"

codesign -f --entitlements "$CHILD_PLIST" -s "$APP_KEY" "$FRAMEWORKS_PATH/$APP Helper (GPU).app/Contents/MacOS/$APP Helper (GPU)"
# codesign -f --entitlements "$CHILD_PLIST" -s "$APP_KEY" "$FRAMEWORKS_PATH/$APP Helper (GPU).app/"
codesign -f --entitlements "$CHILD_PLIST" -s "$APP_KEY" "$FRAMEWORKS_PATH/$APP Helper (Plugin).app/Contents/MacOS/$APP Helper (Plugin)"
# codesign -f --entitlements "$CHILD_PLIST" -s "$APP_KEY" "$FRAMEWORKS_PATH/$APP Helper (Plugin).app/"
codesign -f --entitlements "$CHILD_PLIST" -s "$APP_KEY" "$FRAMEWORKS_PATH/$APP Helper (Renderer).app/Contents/MacOS/$APP Helper (Renderer)"
# codesign -f --entitlements "$CHILD_PLIST" -s "$APP_KEY" "$FRAMEWORKS_PATH/$APP Helper (Renderer).app/"

codesign -s "$APP_KEY" -f --entitlements "$LOGINHELPER_PLIST" "$APP_PATH/Contents/Library/LoginItems/$APP Login Helper.app/Contents/MacOS/$APP Login Helper"
codesign -s "$APP_KEY" -f --entitlements "$LOGINHELPER_PLIST" "$APP_PATH/Contents/Library/LoginItems/$APP Login Helper.app/"

codesign -s "$APP_KEY" -f --entitlements "$CHILD_PLIST" "$APP_PATH/Contents/MacOS/$APP"
codesign -s "$APP_KEY" -f --entitlements "$PARENT_PLIST" "$APP_PATH"

productbuild --component "$APP_PATH" /Applications --sign "$INSTALLER_KEY" "$RESULT_PATH"
