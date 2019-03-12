#!/bin/bash

# param 1 - config (prod|staging|dev)
# param 2 - apk new name - for upload by Travis CI

# variables
cfg="$1"
product="$2"
apk="app-release.apk"


# select config
if [ -n "$cfg" ] && [ "$cfg" != "debug" ]; then
	./scripts/select_config.rb "$cfg"
fi

# build
cd android
[ "$cfg" == "debug" ] \
	&& ./gradlew assembleDebug \
	|| ./gradlew assembleRelease

# move
[ -n "$product" ] \
	&& mv android/app/build/outputs/apk/release/$apk $TRAVIS_BUILD_DIR/$product