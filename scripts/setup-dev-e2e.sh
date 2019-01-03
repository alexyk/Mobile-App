#!/bin/bash

dev_dir=$1
current_case=$(basename $2)

echo
echo "Creating temporary links to current e2e"

rm -rf e3e
mkdir -p e3e
cd e3e


echo "Linking init.js in '$dev_dir'"
ln ../e2e/init.js .

echo "Linking test case in '$dev_dir' as '$current_case'"
ln ../e2e/$current_case

echo
echo "Done."
echo
