#!/bin/bash

# param 1 - config (prod|staging|dev)
# param 2 - apk new name - for upload by Travis CI

case $1 in 
	"help" | "-h" | "/h" | "--help" | "?" | "/?")
			echo;echo
			echo "Usage with two parameters:"
			echo "    param 1 - config (prod|staging|dev)"
			echo "    param 2 - apk new name - for upload by Travis CI"
			echo;echo
			exit 1
			;;
esac

# variables
cfg="$1"
product="$2"
apk="app-release.apk"


# select config
if [ -n "$cfg" ] && [ "$cfg" != "debug" ]; then
	./scripts/select_config.rb "$cfg"
else
  ./scripts/select_config.rb
fi

# build
echo "Bulding a $cfg version"
cd android
[ "$cfg" == "debug" ] \
	&& ./gradlew assembleDebug \
	|| ./gradlew assembleRelease

# move
[ -n "$product" ] \
	&& mv app/build/outputs/apk/release/$apk $TRAVIS_BUILD_DIR/$product
