'use strict';

module.exports = ({ strapi }) => ({
  async revalidate() {
    const baseUrl = process.env.CLIENT_URL;
    const secret = process.env.REVALIDATE_SECRET;

    if (!baseUrl || !secret) {
      strapi.log.error('portfolio: CLIENT_URL and REVALIDATE_SECRET must be set');
      return { status: 500, payload: { message: 'The website is not configured' } };
    }

    strapi.log.info('portfolio: revalidating the website cache');

    try {
      const response = await fetch(`${baseUrl}/api/revalidate`, {
        method: 'POST',
        headers: { 'x-revalidate-secret': secret },
      });
      const payload = await response.json();
      strapi.log.info(`portfolio: revalidate responded ${response.status}`);
      return { status: response.status, payload };
    } catch (error) {
      strapi.log.error(`portfolio: revalidate failed - ${error.message}`);
      return { status: 502, payload: { message: 'Could not reach the website' } };
    }
  },
});
