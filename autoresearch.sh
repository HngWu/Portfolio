#!/bin/bash
# Exit on error
set -e

# Run next build to produce static assets
npm run build

# Calculate the total bundle size of all compiled JS chunks
BUNDLE_SIZE=$(python -c "import pathlib; print(sum(p.stat().st_size for p in pathlib.Path('.next/static/chunks').glob('**/*.js')))")

# Output primary metric
echo "METRIC bundle_size=$BUNDLE_SIZE"
