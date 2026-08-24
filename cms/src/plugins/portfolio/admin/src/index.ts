import { Initializer } from "./components/Initializer";
import { PluginIcon } from "./components/PluginIcon";
import { PLUGIN_ID } from "./pluginId";

import type { StrapiApp } from "@strapi/admin/strapi-admin";

const pluginName = "Portfolio";

export default {
  register(app: StrapiApp) {
    app.addMenuLink({
      to: `plugins/${PLUGIN_ID}`,
      icon: PluginIcon,
      intlLabel: {
        id: `${PLUGIN_ID}.plugin.name`,
        defaultMessage: pluginName,
      },
      Component: () => import("./pages/App").then((mod) => ({ default: mod.App })),
      permissions: [],
    });

    app.registerPlugin({
      id: PLUGIN_ID,
      initializer: Initializer,
      isReady: false,
      name: pluginName,
    });
  },

  async registerTrads({ locales }: { locales: string[] }) {
    return Promise.all(
      locales.map(async (locale) => {
        try {
          const { default: data } = await import(`./translations/${locale}.json`);
          return {
            data: Object.fromEntries(
              Object.entries(data as Record<string, string>).map(([key, value]) => [
                `${PLUGIN_ID}.${key}`,
                value,
              ]),
            ),
            locale,
          };
        } catch {
          return { data: {}, locale };
        }
      }),
    );
  },

  bootstrap() {},
};
