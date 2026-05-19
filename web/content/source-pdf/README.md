# Source PDF (gitignored)

Place **The Comprehensive Clinician's Guide to Cognitive Behavioral Therapy** (Sokol & Fox) here as:

**`sokol-fox-2019.pdf`**

(Do not leave a copy at the repo root — this folder is the only canonical path.)

Then, with `DATABASE_URL`, embedding credentials (`VOYAGE_API_KEY` or `vercel env pull` for Gateway OIDC), and migrations applied:

```bash
npm run ingest
```

This truncates and repopulates `document_chunks` for `source_id = sokol-fox-2019`. Set `BLOB_READ_WRITE_TOKEN` to also upload the file to Vercel Blob (URL stored in chunk `section` metadata for traceability).

Full RAG ops and reuse guide: [`docs/developer/agent-chatbot-playbook.md`](../docs/developer/agent-chatbot-playbook.md).
