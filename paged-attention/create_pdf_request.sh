#!/bin/bash

# Directory where the PDF is located
PDF_DIR="public"
PDF_FILE="PagedAttentionPaper.pdf"
OUTPUT_FILE="claude_request.json"

# Change to the script's directory
cd "$(dirname "$0")"

# Base64 encode the PDF file
BASE64_CONTENT=$(base64 -i "${PDF_DIR}/${PDF_FILE}")

# Create the JSON request file
cat > "${OUTPUT_FILE}" << EOF
{
    "model": "claude-3-5-sonnet-20241022",
    "max_tokens": 1024,
    "messages": [{
        "role": "user",
        "content": [{
            "type": "document",
            "source": {
                "type": "base64",
                "media_type": "application/pdf",
                "data": "${BASE64_CONTENT}"
            }
        },
        {
            "type": "text",
            "text": "Summarize this document in two sentences."
        }]
    }]
}
EOF

echo "Created ${OUTPUT_FILE} with the PDF content" 