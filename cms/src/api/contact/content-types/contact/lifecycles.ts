import type { Core } from "@strapi/strapi";

interface ContactResult {
  Name?: string;
  Email?: string;
  Subject?: string;
  Message?: string;
  Source?: string;
}

export default {
  async afterCreate(event: { result: ContactResult }) {
    const strapi = (global as unknown as { strapi: Core.Strapi }).strapi;
    const { Name, Email, Subject, Message, Source } = event.result;

    const settings = await strapi.documents("api::site-setting.site-setting").findFirst();
    const to = settings?.Email;

    if (!to) {
      strapi.log.warn("contact.afterCreate: no SiteSettings.Email configured, skipping notification");
      return;
    }

    try {
      await strapi.plugin("email").service("email").send({
        to,
        replyTo: Email,
        subject: Subject ? `Portfolio contact: ${Subject}` : `Portfolio contact from ${Name}`,
        text: [`Name: ${Name}`, `Email: ${Email}`, `Source: ${Source ?? "-"}`, "", Message].join("\n"),
      });
    } catch (error) {
      strapi.log.error(`contact.afterCreate: failed to send notification — ${error}`);
    }
  },
};
