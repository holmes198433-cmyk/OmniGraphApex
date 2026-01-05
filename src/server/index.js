//_----------------------
 // OMNIGRAPH APEX™ // CORE ENGINE v1.5
 // src/server/index.js
// v1.5 - AUDIT COMPLIANT CORE
// --------------------------------------------------------

import { shopifyApp } from "@shopify/shopify-app-remix/server";
import { PrismaSessionStorage } from "@shopify/shopify-app-session-storage-prisma";
import { restResources } from "@shopify/shopify-api/rest/admin/2024-01";
import prisma from "./db.server";

// 1. Initialize the App "Brain" with Audit-Compliant Settings
const shopify = shopifyApp({
  apiKey: process.env.SHOPIFY_API_KEY,
  apiSecretKey: process.env.SHOPIFY_API_SECRET,
  scopes: process.env.SCOPES?.split(",") || ["write_products", "read_themes"],
  appUrl: process.env.HOST,
  authPathPrefix: "/auth",
  sessionStorage: new PrismaSessionStorage(prisma),
  restResources,
  
  // 2. Mandatory Webhook Registration (CRITICAL FOR AUDIT)
  // This ensures we listen for uninstalls and GDPR requests.
  webhooks: {
    APP_UNINSTALLED: {
      deliveryMethod: "http",
      callbackUrl: "/webhooks",
    },
  },
  
  // 3. Security Hooks
  hooks: {
    afterAuth: async ({ session }) => {
      // This runs immediately after the merchant installs the app.
      // We log it to ensure the handshake worked.
      console.log("--> OAUTH SUCCESS: Merchant installed app:", session.shop);
      
      // Register webhooks immediately after auth
      await shopify.registerWebhooks({ session });
    },
  },
  future: {
    v3_webhookAdminContext: true,
    v3_authenticatePublic: true,
  },
});

// Export the auth function for use in your routes (routes/*.jsx)
export const authenticate = shopify.authenticate;

// Export the unauthenticated login for the landing page
export const unauthenticated = shopify.unauthenticated;

// Export the login handler
export const login = shopify.login;

// Export the webhook handler
export const addDocumentResponseHeaders = shopify.addDocumentResponseHeaders;
export const registerWebhooks = shopify.registerWebhooks;

// Export the App boundary
export default shopify;
