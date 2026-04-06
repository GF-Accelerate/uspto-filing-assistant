# Playwright MCP Setup Guide — USPTO Filing Assistant

## Overview

Playwright MCP enables Claude Code to control your browser for filling USPTO Patent Center forms. It connects to your existing authenticated browser session via a Chrome Extension — no credential sharing needed.

## Prerequisites

- Claude Code installed and working
- Google Chrome or Microsoft Edge
- Node.js 20+ and npm 10+

## Setup Steps

### 1. Install the Playwright MCP Bridge Chrome Extension

Install from the Chrome Web Store:
https://chromewebstore.google.com/detail/playwright-mcp-bridge

After installing, you'll see the Playwright MCP icon in your browser toolbar.

### 2. Register the MCP Server

From the project directory, run:

```bash
claude mcp add --scope project playwright -- npx @playwright/mcp@latest --extension
```

This registers Playwright MCP as a project-scoped MCP server that uses the Chrome Extension for browser connection.

### 3. Verify the Connection

Start a new Claude Code session in the project:

```bash
cd C:\Users\mover\uspto-filing-assistant
claude
```

Ask Claude: "List my browser tabs using browser_tab_list"

If successful, you'll see a list of your open browser tabs. If it fails, check:
- The Chrome Extension is installed and enabled
- Chrome is running with at least one tab open
- The MCP server was registered correctly (`claude mcp list`)

## Usage Workflow

### Step 1: Complete the Filing Wizard
Run through the 6-step wizard for your patent (e.g., PA-5). Ensure all 14 checklist items are checked.

### Step 2: Export Filing Data
```bash
npm run filing:export -- PA-5
```
This creates `filing-data/PA-5-filing-data.json` with all structured patent data.

### Step 3: Download Filing Documents
From the Filing Package page, download:
- Specification DOCX
- Cover Sheet DOCX
- Drawing PDFs (from the Drawings page)

Save them to a known location.

### Step 4: Log Into Patent Center
Open Chrome and navigate to https://patentcenter.uspto.gov
Complete ID.me + MFA authentication manually.

### Step 5: Let Claude Fill the Forms
In Claude Code, say:

> "Fill Patent Center forms for PA-5 using the playbook at scripts/patent-center-filing.md"

Claude will:
1. Read the filing data JSON
2. Connect to your Patent Center tab
3. Navigate to New Submission > Provisional
4. Fill all Web ADS fields (title, inventors, assignee, entity status)
5. Upload documents with correct document types
6. Calculate fees and verify $320
7. **STOP** and ask you to review everything

### Step 6: Review and Submit
Review all filled fields and uploaded documents carefully. When satisfied, click Submit manually. Save the Application Number and Filing Receipt.

## Troubleshooting

### "No browser tabs found"
- Ensure Chrome is running
- Check the Playwright MCP Bridge extension is enabled (click the extension icon)
- Try restarting Claude Code

### "MCP server not found"
- Run `claude mcp list` to verify registration
- Re-register: `claude mcp add --scope project playwright -- npx @playwright/mcp@latest --extension`

### Path issues on Windows
- Use forward slashes in file paths when configuring MCP
- Ensure `npx` is available in your PATH

### Session timeout
Patent Center sessions may expire after 15-30 minutes of inactivity. If Claude reports a login screen, re-authenticate in Chrome and tell Claude to continue.

## Security Notes

- The Chrome Extension only allows Claude to interact with tabs you explicitly authorize
- No credentials are stored or transmitted through MCP
- Claude Code never sees your password or MFA codes
- The playbook explicitly prohibits clicking the Submit button
- All actions are visible in your browser in real-time
