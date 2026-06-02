import http from 'node:http';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { getCurrentResumeUrl, saveResumePdf, FALLBACK_RESUME_URL } from '../lib/resumeStorage.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const port = Number(process.env.PORT || 8787);
const maxUploadSize = 25 * 1024 * 1024;

async function readRequestBody(request) {
  const chunks = [];
  let totalSize = 0;

  for await (const chunk of request) {
    totalSize += chunk.length;
    if (totalSize > maxUploadSize) {
      throw new Error('Upload exceeds the 25MB limit.');
    }
    chunks.push(chunk);
  }

  return Buffer.concat(chunks);
}

function sendJson(response, statusCode, payload) {
  response.writeHead(statusCode, {
    'Content-Type': 'application/json; charset=utf-8',
  });
  response.end(JSON.stringify(payload, null, 2));
}

const server = http.createServer(async (request, response) => {
  const requestUrl = new URL(request.url || '/', `http://${request.headers.host || 'localhost'}`);

  if (requestUrl.pathname === '/health') {
    sendJson(response, 200, { ok: true });
    return;
  }

  if (requestUrl.pathname === '/api/resume' && request.method === 'GET') {
    try {
      const resumeUrl = await getCurrentResumeUrl();
      sendJson(response, 200, {
        downloadUrl: '/api/resume/file',
        sourceUrl: resumeUrl,
      });
    } catch (error) {
      sendJson(response, 200, {
        downloadUrl: '/resume.pdf',
        sourceUrl: FALLBACK_RESUME_URL,
      });
    }
    return;
  }

  if (requestUrl.pathname === '/api/resume/file' && request.method === 'GET') {
    try {
      const resumeUrl = await getCurrentResumeUrl();
      response.writeHead(302, { Location: resumeUrl || FALLBACK_RESUME_URL });
      response.end();
    } catch (error) {
      response.writeHead(302, { Location: FALLBACK_RESUME_URL });
      response.end();
    }
    return;
  }

  if (requestUrl.pathname === '/api/resume' && request.method === 'POST') {
    try {
      const contentType = String(request.headers['content-type'] || '');
      if (!contentType.includes('pdf')) {
        sendJson(response, 400, { error: 'Please upload a PDF file.' });
        return;
      }

      const pdfBuffer = await readRequestBody(request);
      if (pdfBuffer.length === 0) {
        sendJson(response, 400, { error: 'Upload body is empty.' });
        return;
      }

      const blob = await saveResumePdf(pdfBuffer);
      sendJson(response, 200, {
        message: 'Resume uploaded successfully.',
        downloadUrl: '/api/resume/file',
        sourceUrl: blob.url,
      });
    } catch (error) {
      sendJson(response, 400, { error: error instanceof Error ? error.message : 'Upload failed.' });
    }
    return;
  }

  sendJson(response, 404, { error: 'Not found' });
});

server.listen(port, () => {
  console.log(`Resume API listening on http://localhost:${port}`);
});