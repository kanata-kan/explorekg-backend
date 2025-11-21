import { createApp } from "./app";
import { connectDB } from "./config/db";
import { ENV } from "./config/env";
import { logger } from "./utils/logger";

const app = createApp();

/**
 * Handle unhandled promise rejections to prevent server crashes
 * This catches errors like VALIDATION_TIMEOUT that might not be caught properly
 */
process.on('unhandledRejection', (reason: unknown, promise: Promise<any>) => {
  const error = reason instanceof Error ? reason : new Error(String(reason));
  
  // Log error for monitoring
  logger.error(
    {
      error: error.message,
      stack: error.stack,
      promise: promise.toString(),
    },
    '⚠️ Unhandled Promise Rejection (prevented crash)'
  );

  // Don't exit - just log and continue
  // The error will be handled by the error handler middleware if it reaches a request
});

/**
 * Handle uncaught exceptions to prevent server crashes
 */
process.on('uncaughtException', (error: Error) => {
  logger.error(
    {
      error: error.message,
      stack: error.stack,
    },
    '🔴 Uncaught Exception (prevented crash)'
  );

  // For uncaught exceptions, we should exit gracefully
  // But wait a bit to allow logging to complete
  setTimeout(() => {
    process.exit(1);
  }, 1000);
});

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
