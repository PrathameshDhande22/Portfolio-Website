import { errors } from "@strapi/utils";
import type { Core } from "@strapi/strapi";

const WINDOW_MS = 24 * 60 * 60 * 1000;
const MAX_PER_IP = 5;

interface ContactResult {
  documentId?: string;
  Name?: string;
  Email?: string;
  Subject?: string;
  Message?: string;
  Source?: string;
}

function getStrapi() {
  return (global as unknown as { strapi: Core.Strapi }).strapi;
}

export default {
  async beforeCreate(event: { params: { data: { IPAddress?: string } } }) {
    const strapi = getStrapi();
    const { IPAddress } = event.params.data;

    if (!IPAddress) return;

    const since = new Date(Date.now() - WINDOW_MS);
    const recent = await strapi.documents("api::contact.contact").count({
      filters: { IPAddress, createdAt: { $gte: since } },
    });

    if (recent >= MAX_PER_IP) {
      strapi.log.warn(`contact.beforeCreate: rejected ${IPAddress}, ${recent} submissions in the last 24 hours`);
      throw new errors.ApplicationError("Too many messages from this network today. Please try again tomorrow.");
    }
  },

  async afterCreate(event: { result: ContactResult }) {
    const strapi = getStrapi();
    const { documentId, Name, Email, Subject, Message } = event.result;

    const settings = await strapi.documents("api::site-setting.site-setting").findFirst();
    const to = settings?.Email;

    if (!to || !Email) {
      strapi.log.warn("contact.afterCreate: no recipient or sender address, skipping notification");
      return;
    }

    const since = new Date(Date.now() - WINDOW_MS);
    const notified = await strapi.documents("api::contact.contact").count({
      filters: { Email, NotifiedAt: { $gte: since } },
    });

    if (notified > 0) {
      strapi.log.info(`contact.afterCreate: ${Email} was already notified in the last 24 hours, saving without sending`);
      return;
    }

    try {
      await strapi.plugin("email").service("email").send({
        to,
        replyTo: Email,
        subject: Subject ? `Portfolio contact: ${Subject}` : `Portfolio contact from ${Name}`,
        text: Message,
      });
    } catch (error) {
      strapi.log.error(`contact.afterCreate: failed to send notification - ${error}`);
      return;
    }

    if (documentId) {
      await strapi.documents("api::contact.contact").update({
        documentId,
        data: { NotifiedAt: new Date() },
      });
    }
  },
};
