# PDF Merger

A Node.js Express application that allows users to upload multiple PDF files, merge them via a third-party API, and download the merged document. It also provides simulated progress tracking and serves a simple frontend.

## Table of Contents

- [Features](#features)  
- [Project Structure](#project-structure)  
- [Prerequisites](#prerequisites)  
- [Installation](#installation)  
- [Environment Variables](#environment-variables)  
- [Scripts](#scripts)  
- [Running Locally](#running-locally)  
- [Deployment to Vercel](#deployment-to-vercel)  
- [API Endpoints](#api-endpoints)  
- [Usage](#usage)  
- [License](#license)  

## Features

- Upload one or more PDF files (up to 50 MB each).  
- Merge uploaded PDFs via a third-party “CodeKit” merge‐service API.  
- Simulated progress endpoint for frontend polling.  
- Health‐check endpoint (`/api/health`).  
- Serves a static `index.html` (and any other assets) from `public/`.  
- CORS enabled, JSON request bodies up to 50 MB.  

## Project Structure

```

/
├─ api/
│   └─ index.js           # Express app entry point
├─ public/
│   └─ index.html         # Frontend HTML (plus any CSS/JS/assets)
├─ .env                  # Environment variables (not committed)
├─ .gitignore
├─ package.json
├─ package-lock.json
├─ README.md
└─ vercel.json           # Vercel configuration

````

- **`api/index.js`**  
  - Contains all Express routes (`/api/upload`, `/api/merge`, `/api/progress/:jobId`, `/api/health`).  
  - Serves static files from `public/`.  
- **`public/index.html`**  
  - A simple frontend (or placeholder) to interact with the API.  
- **`.env`**  
  - Stores `CODEKIT_API_KEY` (not committed).  
- **`vercel.json`**  
  - Routes `/api/*` requests into the single serverless function.  
  - Serves static assets from `public/`.  

## Prerequisites

- **Node.js** ≥ 14.x (LTS recommended)  
- **npm** (comes bundled with Node.js)  
- A valid **CodeKit API Key** for PDF‐merge (e.g. `CODEKIT_API_KEY`)  

## Installation

1. Clone the repository:  
   ```bash
   git clone https://github.com/<your-username>/pdf-merger.git
   cd pdf-merger
2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root (same level as `package.json`) with the following contents:

   ```env
   CODEKIT_API_KEY=your_actual_codekit_api_key_here
   PORT=3001       # (optional—defaults to 3001 if not set)
   ```

   * Replace `your_actual_codekit_api_key_here` with the API key issued by the CodeKit service.
   * You can set `PORT` if you want a custom port locally; otherwise it defaults to 3001.

## Environment Variables

| Variable          | Description                                       | Example             |
| ----------------- | ------------------------------------------------- | ------------------- |
| `CODEKIT_API_KEY` | Your CodeKit PDF‐merge service API key            | `abcd1234-xyz-5678` |
| `PORT` (optional) | Port number for local development (default: 3001) | `3001`              |

> **Note:** Vercel will pick up environment variables from the Dashboard. Each variable you add in Vercel’s UI (under **Settings → Environment Variables**) will be available in `process.env`.

## Scripts

```json
{
  "scripts": {
    "start": "node api/index.js",
    "dev": "nodemon api/index.js"
  }
}
```

* **`npm run start`**

  * Launches the Express server on `http://localhost:<PORT>`.
* **`npm run dev`**

  * (Optional) If you have `nodemon` installed globally or as a dev dependency, this will restart the server whenever you change code.

## Running Locally

1. Ensure you have set up `.env` as shown above.
2. Start the server:

   ```bash
   npm run start
   ```
3. Open your browser and navigate to:

   ```
   http://localhost:3001
   ```
4. The static `public/index.html` will load. From there, you can test upload/merge flows by pointing AJAX requests (or a simple form) to:

   * **Upload**: `POST http://localhost:3001/api/upload`
   * **Merge**: `POST http://localhost:3001/api/merge`
   * **Progress**: `GET  http://localhost:3001/api/progress/<jobId>`
   * **Health**:   `GET  http://localhost:3001/api/health`

## Deployment to Vercel

1. **Install Vercel CLI** (if you haven't already):

   ```bash
   npm install -g vercel
   ```

2. **Log in** to Vercel from your terminal:

   ```bash
   vercel login
   ```

3. From the project root (where `vercel.json` is), run:

   ```bash
   vercel
   ```

   * Follow the interactive prompts to link or create a new Vercel project.
   * Choose the default “root directory” when asked.

4. In the Vercel Dashboard for your project, navigate to **Settings → Environment Variables** and add:

   ```
   KEY:    CODEKIT_API_KEY  
   VALUE:  your_actual_codekit_api_key_here
   ```

   * You can leave `PORT` unset—Vercel assigns a dynamic port in the serverless environment.

5. Redeploy (either push to the Git branch linked to Vercel, or run `vercel --prod` to publish to production right away).

Once deployment succeeds, you’ll have a public URL (e.g., `https://pdf-merger-your-username.vercel.app`). Your Express endpoints become:

* `https://<your-vercel-domain>/api/upload`
* `https://<your-vercel-domain>/api/merge`
* `https://<your-vercel-domain>/api/progress/:jobId`
* `https://<your-vercel-domain>/api/health`
* And your static frontend still lives at `https://<your-vercel-domain>/`

## API Endpoints

### 1. **Health Check**

**GET** `/api/health`

* **Response**

  ```json
  {
    "status": "OK",
    "timestamp": "2025-06-02T12:34:56.789Z"
  }
  ```

### 2. **Upload PDF(s)**

**POST** `/api/upload`

* **Headers**:

  ```
  Content-Type: multipart/form-data
  ```
* **Form‐Data Field**

  * `pdfs` (array of files, max 10 files, each up to 50 MB, `application/pdf` only)
* **Response**

  ```json
  {
    "files": [
      {
        "id": "file_1621546950123_0",
        "name": "document1.pdf",
        "buffer": "<base64-encoded-pdf>",
        "size": 345678
      },
      {
        "id": "file_1621546950123_1",
        "name": "document2.pdf",
        "buffer": "<base64-encoded-pdf>",
        "size": 456789
      }
    ]
  }
  ```

### 3. **Merge PDFs**

**POST** `/api/merge`

* **Headers**:

  ```json
  {
    "Content-Type": "application/json",
    "Accept": "application/json",
    "auth": "<CODEKIT_API_KEY>"
  }
  ```
* **Body (JSON)**

  ```json
  {
    "files": [
      {
        "buffer": "<base64-encoded-pdf>",
        "name": "document1.pdf"
      },
      {
        "buffer": "<base64-encoded-pdf>",
        "name": "document2.pdf"
      }
    ],
    "fileName": "merged_output.pdf"  // optional; defaults to "merged_<timestamp>.pdf"
  }
  ```
* **Response**

  ```json
  {
    "success": true,
    "url": "https://prod.0codekit.com/output/merged_output.pdf",
    "fileName": "merged_output.pdf"
  }
  ```

### 4. **Progress (Simulated)**

**GET** `/api/progress/:jobId`

* **Response**

  ```json
  {
    "progress": 42  // an integer between 0 and 100
  }
  ```

> ⚠️ *Note*: The `/api/progress/:jobId` endpoint currently returns a random value between 0–100 and is meant only as a demo. In a production‐grade system, you’d tie `jobId` to a real background task or polling mechanism.

## Usage

1. Open your browser to the frontend (e.g. `http://localhost:3001` or your Vercel URL).
2. Use a file‐input form or JavaScript fetch/XHR to send PDFs to `/api/upload`.
3. Once you receive back a JSON array of file objects (each with a base64 buffer), call `/api/merge` with that array.
4. Poll `/api/progress/<jobId>` (if you implement real‐time tracking) or simply wait for the merge response.
5. When you receive the final `{ url: "<downloadable-merged-pdf>", fileName: "..." }`, redirect the user to that URL or trigger a download.

> If you’re building your own frontend, you might do something like:
>
> ```js
> // 1. Upload
> const formData = new FormData();
> formData.append('pdfs', fileInput.files[0]);
> formData.append('pdfs', fileInput.files[1]);
>
> const uploadRes = await fetch('/api/upload', {
>   method: 'POST',
>   body: formData
> });
> const { files } = await uploadRes.json();
>
> // 2. Merge
> const mergeRes = await fetch('/api/merge', {
>   method: 'POST',
>   headers: {
>     'Content-Type': 'application/json',
>     'auth': process.env.CODEKIT_API_KEY
>   },
>   body: JSON.stringify({ files, fileName: 'combined.pdf' })
> });
> const mergeData = await mergeRes.json();
>
> if (mergeData.success) {
>   window.location.href = mergeData.url; // Trigger download
> }
> ```

## License

This project is licensed under the MIT License.
See [LICENSE](./LICENSE) for details.

```
