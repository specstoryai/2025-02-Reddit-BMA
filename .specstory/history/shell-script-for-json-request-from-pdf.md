## SpecStory

## Shell Script for JSON Request from PDF (2/13/2025, 8:00:54 AM)

_**User**_

Based on @https://docs.anthropic.com/en/docs/build-with-claude/pdf-support help me write a simple shell script for creating a JSON request file out of the file public/PagedAttentionPaper.pdf 

---

_**Assistant**_

I'll help you create a shell script that prepares a JSON request file for the Claude API using the PDF file. First, let me check the PDF file's existence and then create the script.

---

_**Assistant**_



---

_**Assistant**_



Great, I can see the PDF file exists. I'll create a shell script that will:
1. Base64 encode the PDF file
2. Create a JSON request file with the proper structure for Claude's API

Let me create a new script file:

---

_**Assistant**_

```
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
  "messages": [
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Please analyze this research paper on Paged Attention and summarize its key findings."
        },
        {
          "type": "file",
          "file_name": "${PDF_FILE}",
          "media_type": "application/pdf",
          "data": "${BASE64_CONTENT}"
        }
      ]
    }
  ],
  "model": "claude-3-opus-20240229",
  "max_tokens": 4096
}
EOF

echo "Created ${OUTPUT_FILE} with the PDF content"
```

---

_**Assistant**_



Now let's make the script executable:

---

_**Assistant**_

```
chmod +x paged-attention/create_pdf_request.sh
```

---

_**Assistant**_



I've created a shell script that will help you generate a JSON request file for Claude's API. Here's what the script does:

1. It defines the location of your PDF file in the `public` directory
2. Uses the `base64` command to encode the PDF file
3. Creates a JSON request file (`claude_request.json`) with:
   - The base64-encoded PDF content
   - Proper media type and file name
   - A sample prompt asking for paper analysis
   - Configuration for Claude-3 Opus model with a 4096 token limit

To use the script:

1. Navigate to the `paged-attention` directory
2. Run `./create_pdf_request.sh`

The script will generate a `claude_request.json` file that you can use to make requests to Claude's API. You can modify the prompt text in the script by editing the `"text"` field if you want to ask different questions about the PDF.

Note that this generates a request file that you can use with Claude's API, but you'll need to:
1. Add your API key in the actual API request headers
2. Use an HTTP client (like curl or your preferred programming language) to send the request to Claude's API endpoint

Would you like me to modify the script in any way or would you like me to add functionality to actually send the request to the API?

---

_**User**_

Fix the script. The resulting JSON should look much more like this:

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
                "data": $PDF_BASE64
            }
        },
        {
            "type": "text",
            "text": "Which model has the highest human preference win rates across each use-case?"
        }]
    }]
}

---

_**Assistant**_

I'll modify the script to match the correct JSON structure for Claude's API.

---

_**Assistant**_

```
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
            "text": "Which model has the highest human preference win rates across each use-case?"
        }]
    }]
}
EOF

echo "Created ${OUTPUT_FILE} with the PDF content"
```

---

_**Assistant**_



I've updated the script to generate the correct JSON structure that matches Claude's API requirements. The key changes include:

1. Changed the content structure to use `"type": "document"` with a nested `source` object
2. Removed the `file_name` field as it's not needed in this format
3. Updated the model to `claude-3-5-sonnet-20241022`
4. Changed the `max_tokens` to 1024
5. Adjusted the question to match your example
6. Fixed the overall JSON structure to match the required format

You can now run the script and it will generate a properly formatted JSON request file that's compatible with Claude's API. Would you like me to make any additional adjustments to the script?

---

_**User**_

what does max_tokens control? Input output or both?

---

_**Assistant**_

According to the Claude API documentation, `max_tokens` controls only the maximum number of tokens in Claude's response (output). It does not limit the input size. 

The input size for PDFs is instead governed by other limits mentioned in the documentation:
- Maximum request size: 32MB
- Maximum pages per request: 100 pages
- The PDF must be standard format (no passwords/encryption)

So in our script, setting `max_tokens: 1024` means Claude's response will be capped at 1,024 tokens, but the PDF input can be as large as the request size limits allow. If you need longer responses, you can increase this value up to the model's maximum context window size.

Would you like me to modify the `max_tokens` value in the script to allow for longer responses?

---



---

