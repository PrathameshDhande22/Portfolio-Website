'use strict';

const crypto = require('node:crypto');

function signRequest(secret, method, path, body) {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const nonce = crypto.randomUUID();
  const bodyHash = crypto.createHash('sha256').update(body).digest('hex');

  const canonical = [method.toUpperCase(), path, timestamp, nonce, bodyHash].join('\n');
  const digest = crypto.createHmac('sha256', secret).update(canonical).digest('hex');

  return {
    'X-Timestamp': timestamp,
    'X-Nonce': nonce,
    'X-Signature': `sha256=${digest}`,
  };
}

module.exports = ({ strapi }) => ({
  async call(method, path) {
    const baseUrl = process.env.ASSISTANT_URL;
    const secret = process.env.ASSISTANT_SECRET;

    if (!baseUrl || !secret) {
      strapi.log.error('portfolio: ASSISTANT_URL and ASSISTANT_SECRET must be set');
      return { status: 500, payload: { message: 'The assistant is not configured' } };
    }

    const headers = signRequest(secret, method, path, '');
    strapi.log.info(`portfolio: calling ${method} ${path}`);

    try {
      const response = await fetch(`${baseUrl}${path}`, { method, headers });
      const payload = await response.json();
      strapi.log.info(`portfolio: ${method} ${path} responded ${response.status}`);
      return { status: response.status, payload };
    } catch (error) {
      strapi.log.error(`portfolio: ${method} ${path} failed - ${error.message}`);
      return { status: 502, payload: { message: 'Could not reach the assistant' } };
    }
  },
});

module.exports.signRequest = signRequest;
