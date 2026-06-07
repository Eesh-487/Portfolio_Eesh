import { list, put } from '@vercel/blob';

export const RESUME_BLOB_PATHNAME = 'resume/current.pdf';
export const FALLBACK_RESUME_URL = '/resume.pdf';

function getBlobAuthOptions() {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (token) {
    return { token };
  }

  const storeId = process.env.BLOB_STORE_ID;
  const oidcToken = process.env.VERCEL_OIDC_TOKEN;
  if (storeId && oidcToken) {
    return { storeId, oidcToken };
  }

  return null;
}

function firstBlobUrlFromList(blobs) {
  return blobs.length > 0 ? blobs[0].url : null;
}

export async function getCurrentResumeUrl() {
  const blobAuthOptions = getBlobAuthOptions();
  if (!blobAuthOptions) {
    return FALLBACK_RESUME_URL;
  }

  const { blobs } = await list({
    prefix: RESUME_BLOB_PATHNAME,
    limit: 1,
    ...blobAuthOptions,
  });
  return firstBlobUrlFromList(blobs) || FALLBACK_RESUME_URL;
}

export async function saveResumePdf(buffer) {
  const blobAuthOptions = getBlobAuthOptions();
  if (!blobAuthOptions) {
    throw new Error('Missing Vercel Blob credentials. Set BLOB_READ_WRITE_TOKEN in your deployment.');
  }

  return put(RESUME_BLOB_PATHNAME, buffer, {
    access: 'public',
    allowOverwrite: true,
    contentType: 'application/pdf',
    ...blobAuthOptions,
  });
}
