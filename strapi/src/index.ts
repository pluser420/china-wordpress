import type { Strapi } from "@strapi/strapi";

/**
 * Collection types that the public role should be able to READ.
 */
const PUBLIC_READ_CONTENT_TYPES = [
  "api::product.product",
  "api::category.category",
  "api::industry-page.industry-page",
  "api::news-item.news-item",
  "api::catalog.catalog",
];

/**
 * Actions granted to the public role for each content type.
 * These correspond to Strapi's users-permissions plugin action identifiers.
 */
const PUBLIC_READ_ACTIONS = ["find", "findOne"];

/**
 * Webhook configuration for triggering Next.js ISR revalidation.
 */
const REVALIDATE_WEBHOOK_NAME = "NextJS Revalidate";
const REVALIDATE_WEBHOOK_URL = "http://next:3000/api/revalidate";
const REVALIDATE_WEBHOOK_EVENTS = [
  "entry.publish",
  "entry.unpublish",
  "entry.update",
  "entry.delete",
];

export default {
  /**
   * Register phase: extend or override Strapi internals before application start.
   */
  register(/*{ strapi }*/) {},

  /**
   * Bootstrap phase: runs once after the application has started.
   * - Sets public role READ permissions on all five collection types.
   * - Registers the Next.js revalidation webhook (idempotent — skips if already present).
   */
  async bootstrap({ strapi }: { strapi: Strapi }) {
    await setPublicPermissions(strapi);
    await ensureRevalidationWebhook(strapi);
  },
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/**
 * Grants the public role read-only (find + findOne) access to the specified
 * content types using the users-permissions plugin.
 */
async function setPublicPermissions(strapi: Strapi) {
  const publicRole = await strapi
    .query("plugin::users-permissions.role")
    .findOne({ where: { type: "public" }, populate: ["permissions"] });

  if (!publicRole) {
    strapi.log.warn(
      "[bootstrap] Public role not found — skipping permission setup."
    );
    return;
  }

  for (const contentType of PUBLIC_READ_CONTENT_TYPES) {
    for (const action of PUBLIC_READ_ACTIONS) {
      const actionUid = `${contentType}.${action}`;

      const existingPermission = await strapi
        .query("plugin::users-permissions.permission")
        .findOne({ where: { action: actionUid, role: publicRole.id } });

      if (!existingPermission) {
        await strapi.query("plugin::users-permissions.permission").create({
          data: {
            action: actionUid,
            role: publicRole.id,
          },
        });
        strapi.log.info(
          `[bootstrap] Granted public role: ${actionUid}`
        );
      }
    }
  }
}

/**
 * Creates the Next.js revalidation webhook in Strapi if it does not already
 * exist (identified by name). This is idempotent across restarts.
 */
async function ensureRevalidationWebhook(strapi: Strapi) {
  const revalidateSecret = process.env.REVALIDATE_SECRET;

  if (!revalidateSecret) {
    strapi.log.warn(
      "[bootstrap] REVALIDATE_SECRET env var not set — webhook header will be empty."
    );
  }

  const existingWebhooks = await strapi.webhookStore?.findWebhooks() ?? [];
  const alreadyExists = existingWebhooks.some(
    (wh: { name: string }) => wh.name === REVALIDATE_WEBHOOK_NAME
  );

  if (alreadyExists) {
    strapi.log.info(
      `[bootstrap] Webhook "${REVALIDATE_WEBHOOK_NAME}" already registered — skipping.`
    );
    return;
  }

  await strapi.webhookStore?.createWebhook({
    name: REVALIDATE_WEBHOOK_NAME,
    url: REVALIDATE_WEBHOOK_URL,
    headers: {
      "x-revalidate-secret": revalidateSecret ?? "",
      "Content-Type": "application/json",
    },
    events: REVALIDATE_WEBHOOK_EVENTS,
    enabled: true,
  });

  strapi.log.info(
    `[bootstrap] Registered webhook "${REVALIDATE_WEBHOOK_NAME}" → ${REVALIDATE_WEBHOOK_URL}`
  );
}
