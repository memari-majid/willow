# Source PDF (gitignored)

Place **The Comprehensive Clinician's Guide to Cognitive Behavioral Therapy** (Sokol & Fox) here as:

**`sokol-fox-2019.pdf`**

(Do not leave a copy at the repo root — this folder is the only canonical path.)

Then, with `DATABASE_URL`, embedding credentials (`VOYAGE_API_KEY` or `vercel env pull` for Gateway OIDC), and migrations applied:

```bash
npm run ingest
```

This truncates and repopulates `document_chunks` for `source_id = sokol-fox-2019`. Set `BLOB_READ_WRITE_TOKEN` to also upload the file to Vercel Blob (URL stored in chunk `section` metadata for traceability).

**Production note:** The PDF is gitignored and is **not** deployed to Vercel. After ingest, the live app at `/sources` marks **Reference book** as Ready based on `document_chunks` row count for `sokol-fox-2019`, not on whether the file exists on the server filesystem.

Full RAG ops and reuse guide: [`docs/developer/agent-chatbot-playbook.md`](../docs/developer/agent-chatbot-playbook.md).
