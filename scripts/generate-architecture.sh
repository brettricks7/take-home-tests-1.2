#!/bin/bash

# Generate architecture diagram from markdown
# Usage: ./scripts/generate-architecture.sh

set -e

# Extract mermaid diagram from markdown and generate SVG
echo "Extracting mermaid diagram from docs/architecture.md..."
awk '/```mermaid/{flag=1;next}/```/{flag=0}flag' docs/architecture.md > docs/architecture.mmd

echo "Generating SVG from mermaid diagram..."
npx -y @mermaid-js/mermaid-cli -i docs/architecture.mmd -o docs/architecture.svg

echo "Architecture diagram generated: docs/architecture.svg"
echo "To view: open docs/architecture.svg"
