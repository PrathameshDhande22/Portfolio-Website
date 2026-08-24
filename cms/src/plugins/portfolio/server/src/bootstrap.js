'use strict';

module.exports = ({ strapi }) => {
  const missing = ['ASSISTANT_URL', 'ASSISTANT_SECRET', 'CLIENT_URL', 'REVALIDATE_SECRET'].filter(
    (name) => !process.env[name]
  );

  if (missing.length) {
    strapi.log.warn(`portfolio: missing environment variables ${missing.join(', ')}`);
    return;
  }

  strapi.log.info('portfolio: ready to sync the assistant and revalidate the website');
};
