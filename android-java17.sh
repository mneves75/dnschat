#!/bin/bash
# Script to run Android build with Java 17

# Set JAVA_HOME to Java 17
export JAVA_HOME="/opt/homebrew/opt/openjdk@17/libexec/openjdk.jdk/Contents/Home"
export PATH="$JAVA_HOME/bin:$PATH"

echo "Using Java version:"
java -version
echo ""

echo "JAVA_HOME: $JAVA_HOME"
echo ""

# Run the Android build
npm run android