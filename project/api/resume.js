import { FALLBACK_RESUME_URL, getCurrentResumeUrl, saveResumePdf } from '../lib/resumeStorage.js';

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
  response.statusCode = statusCode;
  response.setHeader('Content-Type', 'application/json; charset=utf-8');
  response.end(JSON.stringify(payload, null, 2));
}

export default async function handler(request, response) {
  if (request.method === 'GET') {
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

  if (request.method === 'POST') {
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

  sendJson(response, 405, { error: 'Method not allowed' });
}
