# n8n + Willow (GUI only)

Willow’s automation-friendly endpoint is **`POST /api/chat/complete`** (JSON in, JSON out). Wire it up with the **HTTP Request** node — no **Code** node required.

## 1. Environment file for n8n

1. Open [`n8n.env.example`](./n8n.env.example) and copy the variables you need.
2. Paste them into the `.env` file that n8n actually loads:
   - If you run **`cd …/n8n && pnpm start`** (this repo’s monorepo), create:
     - **`n8n/packages/cli/bin/.env`**
   - If you run **`npx n8n`** from a folder, create **`.env` in that same folder**.
3. Required for the sample workflow URL:
   - **`WILLOW_BASE_URL`** — e.g. `http://127.0.0.1:3000` (no trailing slash).

Restart n8n after changing `.env`.

## 2. Run Willow and n8n

- Willow: from `web/`, `npm run dev` (port 3000 by default), with `.env.local` / AI Gateway configured as in [`../../../README.md`](../../../README.md).
- n8n: start your instance and open the editor (default **http://localhost:5678**).

## 3. Import the sample workflow (fastest)

1. In n8n: **Workflows** → **⋯** → **Import from File**.
2. Choose **`willow-chat-complete.json`** from this folder.
3. Open the **Willow /api/chat/complete** node and confirm the **URL** shows an expression using **`WILLOW_BASE_URL`**.
4. **Execute workflow** and inspect the JSON (`text`, `metadata`).

## 4. Build the same thing from scratch in the GUI (no Code node)

1. **Add node** → **Manual Trigger** (or any trigger you prefer).
2. **Add node** → **HTTP Request**.
3. Connect the trigger → HTTP Request.
4. In **HTTP Request**:
   - **Method**: `POST`
   - **URL**: click the **gear / expression** control on the field and set:
     - `{{ $env.WILLOW_BASE_URL }}/api/chat/complete`  
     (n8n will store this as an expression; your `.env` must define `WILLOW_BASE_URL`.)
     - Or, for a quick test only, use a fixed URL: `http://127.0.0.1:3000/api/chat/complete`
   - **Send body**: on  
   - **Body content type**: **JSON**
   - **JSON**: paste a minimal body (edit the user text as needed):

```json
{
  "messages": [
    {
      "id": "msg-1",
      "role": "user",
      "parts": [{ "type": "text", "text": "I had a hard day." }]
    }
  ]
}
```

5. **Execute step** on the HTTP Request node (or run the whole workflow). The response body is Willow’s JSON: assistant `text` plus `metadata` (model, crisis flags).

Optional **Headers**: if you add `Content-Type`, use `application/json` (many n8n versions set this automatically for a JSON body).

## 5. Chain other GUI nodes later

- **Set** / **Edit Fields**: map form fields, webhooks, or sheet columns into a `messages` array using fixed values and simple expressions — still without a **Code** node.
- **Merge**: combine a user message from one branch with context from another before the HTTP Request.

## 6. Docker / remote Willow

If n8n runs in Docker and Willow on the host, `127.0.0.1` inside the container is not your Mac/Linux host. Set **`WILLOW_BASE_URL`** to a host the container can reach (e.g. `http://host.docker.internal:3000` on Docker Desktop, or your LAN IP).

Documentation for all n8n env vars: [https://docs.n8n.io/hosting/configuration/environment-variables/](https://docs.n8n.io/hosting/configuration/environment-variables/)
