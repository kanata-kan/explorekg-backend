import { createApp } from "./app";
import { connectDB } from "./config/db";
import { ENV } from "./config/env";
import { logger } from "./utils/logger";

const app = createApp();

async function start() {
  try {
    await connectDB(ENV.MONGO_URI);
    app.listen(ENV.PORT, () => {
      logger.info(`🚀 Server running on http://localhost:${ENV.PORT}`);
    });
  } catch (err: unknown) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error({ error }, "❌ Failed to start server");
    process.exit(1);
  }
}

start();
