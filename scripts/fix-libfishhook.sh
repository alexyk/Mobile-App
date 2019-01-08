#!/bin/bash

echo;
echo "==============================================================="
echo "Patching React/Libraries/WebSocket for 'libfishhook.a' issue"
echo "==============================================================="
echo;

cd node_modules/react-native/Libraries/WebSocket
patch-apply.sh  ../../../../scripts/patches/libfishhook.patch

echo; 
echo "========================================================================="
echo "Done. (Patching React/Libraries/WebSocket for 'libfishhook.a' issue)"; 
echo "========================================================================="
echo