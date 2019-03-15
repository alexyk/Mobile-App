#!/bin/bash

# variables
[ $# -gt 0 ] \
    && cfg="$1" \
    || cfg="staging"
[ $# -gt 1 ] \
    && out_dir="$2" \
    || out_dir=""
[ $# -gt 2 ] \
    && zip_name="$3" \
    || zip_name=""
app_name="MobileApp.app"


# select config
./scripts/select_config.rb "$cfg"

# build
xcodebuild \
    -workspace ios/MobileApp.xcworkspace \
    -scheme MobileApp \
    -configuration Release \
    -sdk iphonesimulator \
    -derivedDataPath ios/build \
    -UseModernBuildSystem=NO \
    -quiet

# zip
if [ -n "$zip_name" ]; then
    ls -Rlh ios/build
    cd $out_dir
    zip -qr $zip_name $app_name
    mv $zip_name $TRAVIS_BUILD_DIR/
fi