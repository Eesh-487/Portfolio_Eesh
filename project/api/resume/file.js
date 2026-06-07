import { FALLBACK_RESUME_URL, getCurrentResumeUrl } from '../../lib/resumeStorage.js';

export default async function handler(request, response) {
  if (request.method !== 'GET') {
    response.statusCode = 405;
    response.setHeader('Content-Type', 'application/json; charset=utf-8');
    response.end(JSON.stringify({ error: 'Method not allowed' }, null, 2));
    return;
  }

  try {
    const resumeUrl = await getCurrentResumeUrl();
    response.writeHead(302, { Location: resumeUrl || FALLBACK_RESUME_URL });
    response.end();
  } catch (error) {
    response.writeHead(302, { Location: FALLBACK_RESUME_URL });
    response.end();
  }
}
