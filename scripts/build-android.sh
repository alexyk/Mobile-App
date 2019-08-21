#!/bin/bash

case $1 in 
	"help" | "-h" | "/h" | "--help" | "?" | "/?")
			echo;echo
			echo "Usage with two parameters:"
			echo "    param 1 - config (prod|staging|dev)"
			echo "    param 2 - apk new name - for upload by Travis CI"
			echo "			or"
			echo "    param 2 - version to use with 'npm version' command"
			echo "    param 3 - optional - if equal to \"no-tag\" then 'npm version' is used without git taggging and committing"
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
git add src/version.js
git add src/config.js

# version
if [ $2 != "" ]; then
	ver=$2
	extra_params="-f"
	[ $3 == "no-tag" ] && extra_params="-f --no-git-tag-version"
	echo "Setting version to $ver"
	npm version $ver $extra_params
	[ $? -ne 0 ] && exit 2
fi

# build
echo "Buldinging a $cfg version"
cd android
[ "$cfg" == "debug" ] \
	&& ./gradlew assembleDebug \
	|| ./gradlew assembleRelease

# move
[ -n "$product" ] \
	&& mv app/build/outputs/apk/release/$apk $TRAVIS_BUILD_DIR/$product
