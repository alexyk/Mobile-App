#!/bin/bash

adb reverse tcp:9090 tcp:9090
adb reverse --list
