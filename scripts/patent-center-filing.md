# USPTO Patent Center AI Filing Assistant — Playwright MCP Playbook

## Prerequisites

Before running this playbook:
- [ ] User has completed the 6-step filing wizard (all 14 checklist items checked)
- [ ] Filing data JSON exists at `filing-data/{PATENT_ID}-filing-data.json`
- [ ] Filing documents are downloaded (DOCX spec, DOCX cover sheet, PDF drawings)
- [ ] User is logged into Patent Center in Chrome (ID.me + MFA completed)
- [ ] Playwright MCP Bridge Chrome Extension is installed and connected

## CRITICAL SAFETY RULES

1. **NEVER** click the Submit button in Patent Center
2. **NEVER** store, access, or log USPTO credentials or session tokens
3. **ALWAYS** stop and alert the user before any irreversible action
4. **ALWAYS** take a screenshot before stopping for human review
5. If any field does not match expected data, **STOP** and report the discrepancy

---

## Step 0: Load Filing Data

```
Read the file: filing-data/{PATENT_ID}-filing-data.json
Parse the JSON to get all field values, inventor data, and document list.
Confirm the patent ID, title, and inventor names before proceeding.
```

## Step 1: Connect to Patent Center Tab

```
Use browser_tab_list to find the Patent Center tab (patentcenter.uspto.gov).
Use browser_snapshot to confirm the user is logged in.
If the user is NOT logged in or Patent Center is not open:
  → STOP and say: "Please log into Patent Center at patentcenter.uspto.gov
    and let me know when you're ready."
```

## Step 2: Navigate to New Submission

```
Use browser_navigate to: https://patentcenter.uspto.gov/#!/newSubmission
Use browser_snapshot to confirm the page loaded.
```

Actions:
1. Select application type: **Provisional (35 U.S.C. 111(b))**
2. Select entity status: **Small Entity** (or as specified in filing data)
3. Click Continue / Next

## Step 3: Fill Application Data Sheet (Web ADS)

### 3a. Title of Invention
```
Fill the "Title of Invention" field with: {data.applicationDataSheet.title}
```

### 3b. Inventors (repeat for each inventor)
```
For each inventor in data.applicationDataSheet.inventors:
  Click "Add Inventor" (if not the first inventor)
  Fill "Given Name": {inventor.firstName}
  Fill "Family Name": {inventor.lastName}
  Fill "Street Address": {inventor.street}
  Fill "City": {inventor.city}
  Fill "State/Province": {inventor.state}
  Fill "Postal Code": {inventor.zip}
  Select "Country of Residence": {inventor.country}
  Select "Country of Citizenship": {inventor.citizenship}
```

### 3c. Assignee
```
Fill "Assignee Name": {data.applicationDataSheet.assignee.name}
Select "Assignee Type": Corporation
Fill "State of Incorporation": {data.applicationDataSheet.assignee.stateOfIncorporation}
Fill address fields from assignee data
```

### 3d. Correspondence Address
```
Fill correspondence fields from data.applicationDataSheet.correspondence
```

### 3e. Government Interest
```
If present, fill: {data.applicationDataSheet.governmentInterest}
(Usually "None" for Visionary AI Systems patents)
```

## Step 4: Upload Documents

```
For each document in data.documents:
  1. Click the document upload area
  2. Use browser_file_upload with the document file path
  3. Select document type from dropdown: {document.type}
     - "Specification" for the spec DOCX
     - "Provisional Cover Sheet (SB16)" for the cover sheet DOCX
     - "Drawings" for each drawing PDF
  4. Use browser_snapshot to verify upload completed successfully
  5. If DOCX: Click "Validate" and review the preview
```

## Step 5: Calculate Fees

```
Click "Calculate Fees" button
Use browser_snapshot to capture the fee summary
Verify the fee amount matches: $320.00 (Small Entity)
If fee does not match, STOP and report to user.
```

## Step 6: STOP — Human Review Gate

```
Take a final browser_snapshot (screenshot).

Report to the user:

"I have completed filling the Patent Center forms for {PATENT_ID}:

  Title: {title}
  Inventors: {inventor names}
  Assignee: Visionary AI Systems, Inc. (Delaware Corporation)
  Entity Status: Small Entity
  Filing Fee: $320.00
  Documents uploaded: {count} files

  PLEASE REVIEW CAREFULLY:
  - All inventor names and addresses are correct
  - Patent title matches your specification
  - Assignee information is accurate
  - All documents uploaded with correct document types
  - Fee amount is $320.00

  When you are satisfied, click SUBMIT manually.
  I will NOT click Submit — this requires your explicit action.

  After submitting, save the Application Number (format: 63/XXX,XXX or 64/XXX,XXX)
  and the Filing Receipt for your records."
```

---

## Troubleshooting

### Patent Center session expired
If you get a login screen mid-workflow, STOP and tell the user to re-authenticate.

### Document upload fails
Try uploading one document at a time. Verify file format (DOCX/PDF) and size limits.

### Fee calculation shows wrong amount
Verify entity status selection. Small Entity = $320, Micro Entity = $160, Large Entity = $1,600.

### Form field not found
Patent Center may have updated their UI. Use browser_snapshot to see the current page state
and adapt field names accordingly. Report any mapping issues.
