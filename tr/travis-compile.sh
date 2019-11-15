#!/bin/bash

# working with
travis_run_setup
npm i -g react-native-cli
npm i


#ios
# edit RCTWebSocketExecutor.m - see "travis commands.txt"
# get rn-fix-build-xcode10.sh (see maybe with wget from github)
cd ios
pod install
cd ..
react-native run-ios
sleep 30
screencapture scrn0.png
zip -r app-ios.zip ios/build/Build/Products/Debug-iphonesimulator/MobileApp.app

#android
#brew install ninja #or 
wget https://github.com/ninja-build/ninja/releases/download/v1.8.2/ninja-mac.zip
unzip ninja-mac.zip
mv ninja /usr/local/bin
wget https://dl.google.com/android/repository/sdk-tools-darwin-4333796.zip
unzip sdk-tools-darwin-4333796.zip
mkdir ~/android
cd mv tools ~/android/
export ANDROID_HOME=~/android/
export PATH=$PATH:$ANDROID_HOME/tools/bin
yes | sdkmanager --licenses
sdkmanager "ndk-bundle"
sdkmanager "platforms;android-28"
npm install -g react-native-cli
npim i
react-native run-android
cp android/app/build/outputs/apk/debug/app-debug.apk .


# a collection
travis_run_setup
travis_run_configure
travis_run_before_install
travis_run_install
travis_run_script


