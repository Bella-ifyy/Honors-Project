#!/bin/zsh
# Load nvm and run the provided command
export NVM_DIR="$HOME/.nvm"
[ -s "$NVM_DIR/nvm.sh" ] && \. "$NVM_DIR/nvm.sh"

# Use the node version specified in _node-version if it exists
if [ -f "_node-version" ]; then
  NODE_VERSION=$(cat _node-version | tr -d '\n')
  nvm use "$NODE_VERSION" > /dev/null 2>&1 || nvm use default > /dev/null 2>&1
fi

# Execute the provided command
exec "$@"

