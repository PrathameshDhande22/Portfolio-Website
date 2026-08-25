'use strict';

module.exports = ({ strapi }) => ({
  async sync(ctx) {
    ctx.body = await strapi.plugin('portfolio').service('assistant').call('POST', '/sync');
  },

  async status(ctx) {
    ctx.body = await strapi.plugin('portfolio').service('assistant').call('GET', '/sync/status');
  },

  async revalidate(ctx) {
    ctx.body = await strapi.plugin('portfolio').service('website').revalidate();
  },
});
