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
cfg="release"
apk="app-release.apk"
if [ "$1" == "debug" ] || [ "$1" == "release" ]; then
	cfg="$1"
	shift
fi

# check if a product name from travis or options to select_config.rb
s1=$2
s2=${s1%apk}
len1=${#s1}
len2=${#s2}
if [ $len1 -ne $len2 ]; then
	product="$2"
	shift
fi

# select config
./scripts/select_config.rb "$1"

# build
echo "Buldinging a $cfg version"
cd android
[ "$cfg" == "debug" ] \
	&& ./gradlew assembleDebug \
	|| ./gradlew assembleRelease

# move
[ -n "$product" ] \
	&& mv app/build/outputs/apk/release/$apk $TRAVIS_BUILD_DIR/$product
