#!/bin/bash

echo; 
echo "===================================="
echo "Patching glog for 'config.h' issue"
echo "===================================="
echo;
cd ./node_modules/react-native
./scripts/ios-install-third-party.sh 
cd third-party/glog-0.3.4
../../scripts/ios-configure-glog.sh

echo; 
echo "==========================================="
echo "Done. (Patching glog for 'config.h' issue)"; 
echo "==========================================="
echo