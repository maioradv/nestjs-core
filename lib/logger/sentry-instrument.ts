import * as Sentry from "@sentry/nestjs"
import { nodeProfilingIntegration } from "@sentry/profiling-node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  serverName: process.env.SENTRY_SERVER_NAME,
  sendDefaultPii: true,
  integrations: [
    nodeProfilingIntegration(),
  ],
  tracesSampleRate: 1.0,
  profilesSampleRate: 1.0,
});