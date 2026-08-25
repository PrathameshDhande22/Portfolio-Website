'use strict';

module.exports = {
  admin: {
    type: 'admin',
    routes: [
      {
        method: 'POST',
        path: '/sync',
        handler: 'portfolio.sync',
        config: { policies: ['admin::isAuthenticatedAdmin'] },
      },
      {
        method: 'GET',
        path: '/sync/status',
        handler: 'portfolio.status',
        config: { policies: ['admin::isAuthenticatedAdmin'] },
      },
      {
        method: 'POST',
        path: '/revalidate',
        handler: 'portfolio.revalidate',
        config: { policies: ['admin::isAuthenticatedAdmin'] },
      },
    ],
  },
};
