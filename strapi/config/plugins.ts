export default ({ env }) => ({
  i18n: {
    enabled: true,
    config: {
      // Default locale (must match STRAPI_PLUGIN_I18N_INIT_LOCALE_CODE env var)
      defaultLocale: "en",
      locales: ["en", "es"],
    },
  },
});
