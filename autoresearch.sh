#!/bin/bash
set -e

# Run next build to produce static assets
npm run build

# Find a python or node interpreter to calculate bundle size
if command -v python >/dev/null 2>&1; then
  BUNDLE_SIZE=$(python -c "import pathlib; print(sum(p.stat().st_size for p in pathlib.Path('.next/static/chunks').glob('**/*.js')))")
elif [ -f "/mnt/host/c/Python312/python.exe" ]; then
  BUNDLE_SIZE=$(/mnt/host/c/Python312/python.exe -c "import pathlib; print(sum(p.stat().st_size for p in pathlib.Path('.next/static/chunks').glob('**/*.js')))")
elif [ -f "/mnt/host/c/nvm4w/nodejs/node.exe" ]; then
  BUNDLE_SIZE=$(/mnt/host/c/nvm4w/nodejs/node.exe -e "
const fs = require('fs');
const path = require('path');
function getFilesSize(dir) {
  let total = 0;
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    if (stat.isDirectory()) {
      total += getFilesSize(filePath);
    } else if (file.endsWith('.js')) {
      total += stat.size;
    }
  }
  return total;
}
console.log(getFilesSize('.next/static/chunks'));
")
else
  echo "Error: Neither Python nor Node was found to calculate bundle size." >&2
  exit 1
fi

echo "METRIC bundle_size=$BUNDLE_SIZE"
