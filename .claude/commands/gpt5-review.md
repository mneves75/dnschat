# GPT-5 Implementation Review

Get detailed feedback from GPT-5 on code implementations, highlighting issues, improvements, and edge cases.

## Usage

```
/gpt5-review [file_path] [additional_context]
```

## Examples

```
/gpt5-review src/components/LiquidGlassWrapper.tsx
/gpt5-review ios/LiquidGlassNative/LiquidGlassView.swift "Focus on memory management"
/gpt5-review app-starter-template.md "Review for production readiness"
```

## Implementation

Read the specified file (or current context if no file specified) and send it to GPT-5 for comprehensive review with high reasoning effort.

```bash
#!/bin/bash

# Get file path from first argument or use current context
FILE_PATH="$1"
ADDITIONAL_CONTEXT="$2"

if [ -z "$FILE_PATH" ]; then
    echo "❌ Error: Please specify a file path to review"
    echo "Usage: /gpt5-review <file_path> [additional_context]"
    exit 1
fi

if [ ! -f "$FILE_PATH" ]; then
    echo "❌ Error: File not found: $FILE_PATH"
    exit 1
fi

echo "🔍 Sending $FILE_PATH to GPT-5 for detailed review..."
echo ""

# Read file content
FILE_CONTENT=$(cat "$FILE_PATH")

# Construct the prompt
PROMPT="Please provide detailed feedback on the following implementation, highlighting any issues, improvements, or potential edge cases I should consider.

File: $FILE_PATH

Additional Context: $ADDITIONAL_CONTEXT

Implementation:
\`\`\`
$FILE_CONTENT
\`\`\`

Focus on:
1. Code quality and best practices
2. Security vulnerabilities
3. Performance optimizations
4. Edge cases and error handling
5. Architecture and design patterns
6. Platform-specific considerations
7. Potential bugs or issues
8. Maintainability and scalability

Please be thorough and provide specific, actionable recommendations."

# Execute GPT-5 review with high reasoning effort
echo "🤖 GPT-5 Analysis Results:"
echo "=========================="
echo ""

codex --dangerously-bypass-approvals-and-sandbox -m gpt-5 -c model_reasoning_effort="high" "$PROMPT"

echo ""
echo "✅ GPT-5 review completed for $FILE_PATH"
```