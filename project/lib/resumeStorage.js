import { list, put } from '@vercel/blob';

export const RESUME_BLOB_PATHNAME = 'resume/current.pdf';
export const FALLBACK_RESUME_URL = '/resume.pdf';

function firstBlobUrlFromList(blobs) {
  return blobs.length > 0 ? blobs[0].url : null;
}

export async function getCurrentResumeUrl() {
  const { blobs } = await list({ prefix: RESUME_BLOB_PATHNAME, limit: 1 });
  return firstBlobUrlFromList(blobs) || FALLBACK_RESUME_URL;
}

export async function saveResumePdf(buffer) {
  return put(RESUME_BLOB_PATHNAME, buffer, {
    access: 'public',
    allowOverwrite: true,
    contentType: 'application/pdf',
  });
}
