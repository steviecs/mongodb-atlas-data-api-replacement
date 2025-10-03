import Fastify, { FastifyRequest, FastifyReply } from "fastify";
import { dbManager } from "./database.js";
import { DataApiHandlers } from "./handlers.js";
import { ActionType } from "./types.js";

// Initialize Fastify
const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === "production" ? "warn" : "info",
  },
});

// Environment variables
const MONGODB_URI = process.env.MONGODB_URI || "";
const PORT = parseInt(process.env.PORT || "8080");
const HOST = process.env.HOST || "0.0.0.0";

// Initialize handlers
const handlers = new DataApiHandlers();

// Validation function
function validateRequest(body: any): string | null {
  const { dataSource, database, collection } = body;

  if (!dataSource) return "Missing required field: dataSource";
  if (!database) return "Missing required field: database";
  if (!collection) return "Missing required field: collection";

  return null;
}

// Route handler for different actions
async function handleAction(
  action: ActionType,
  requestBody: any
): Promise<any> {
  switch (action) {
    case "findOne":
      return await handlers.findOne(requestBody);
    case "find":
      return await handlers.find(requestBody);
    case "insertOne":
      return await handlers.insertOne(requestBody);
    case "insertMany":
      return await handlers.insertMany(requestBody);
    case "updateOne":
      return await handlers.updateOne(requestBody);
    case "updateMany":
      return await handlers.updateMany(requestBody);
    case "deleteOne":
      return await handlers.deleteOne(requestBody);
    case "deleteMany":
      return await handlers.deleteMany(requestBody);
    case "aggregate":
      return await handlers.aggregate(requestBody);
    default:
      return {
        error: `Unknown action: ${action}`,
        error_code: "INVALID_ACTION",
      };
  }
}

// Setup function to register plugins and routes
async function setupServer() {
  // Register CORS plugin
  await fastify.register(import("@fastify/cors"), {
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type"],
  });

  // Define request/response schemas
  const actionRequestSchema = {
    type: "object",
    required: ["dataSource", "database", "collection"],
    properties: {
      dataSource: { type: "string" },
      database: { type: "string" },
      collection: { type: "string" },
    },
    additionalProperties: true,
  };

  const actionParamsSchema = {
    type: "object",
    required: ["actionName"],
    properties: {
      actionName: { type: "string" },
    },
  };

  // Main route handler for data operations
  fastify.post<{
    Params: { actionName: string };
    Body: any;
  }>("/action/:actionName", {
    schema: {
      params: actionParamsSchema,
      body: actionRequestSchema,
    },
    handler: async (
      request: FastifyRequest<{
        Params: { actionName: string };
        Body: any;
      }>,
      reply: FastifyReply
    ) => {
      try {
        // Validate required fields
        const validationError = validateRequest(request.body);
        if (validationError) {
          return reply.status(400).send({
            error: validationError,
            error_code: "INVALID_REQUEST",
          });
        }

        // Connect to MongoDB if not already connected
        if (!dbManager.isConnected()) {
          if (!MONGODB_URI) {
            return reply.status(500).send({
              error: "MongoDB URI not configured",
              error_code: "MONGODB_URI_MISSING",
            });
          }
          await dbManager.connect(MONGODB_URI);
        }

        // Extract action from URL path
        const action = request.params.actionName as ActionType;

        if (!action) {
          return reply.status(400).send({
            error: "Action not specified in URL path.",
            error_code: "MISSING_ACTION",
          });
        }

        // Execute the action
        const result = await handleAction(action, request.body);

        // Check if result is an error
        if ("error" in result) {
          return reply.status(400).send(result);
        } else {
          return reply.status(200).send(result);
        }
      } catch (error) {
        fastify.log.error({ error }, "Unhandled error");
        return reply.status(500).send({
          error: "Internal server error",
          error_code: "INTERNAL_ERROR",
        });
      }
    },
  });

  // Health check endpoint
  fastify.get("/health", {
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.status(200).send({
        status: "healthy",
        timestamp: new Date().toISOString(),
        mongoConnected: dbManager.isConnected(),
      });
    },
  });

  // Root endpoint
  fastify.get("/", {
    handler: async (request: FastifyRequest, reply: FastifyReply) => {
      return reply.status(200).send({
        message: "MongoDB Data API Replacement",
        version: "1.0.0",
        framework: "Fastify",
        endpoints: {
          health: "/health",
          dataOperations: "/action/{actionName}",
          supportedActions: [
            "findOne",
            "find",
            "insertOne",
            "insertMany",
            "updateOne",
            "updateMany",
            "deleteOne",
            "deleteMany",
            "aggregate",
          ],
        },
      });
    },
  });
}

// Graceful shutdown
const gracefulShutdown = async (signal: string) => {
  fastify.log.info(`Received ${signal}, shutting down gracefully...`);
  await dbManager.close();
  await fastify.close();
  process.exit(0);
};

process.on("SIGINT", () => gracefulShutdown("SIGINT"));
process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));

// Start the server
const start = async () => {
  try {
    await setupServer();
    await fastify.listen({ port: PORT, host: HOST });
    fastify.log.info(`Server running on http://${HOST}:${PORT}`);
    fastify.log.info(`Health check: http://${HOST}:${PORT}/health`);
    fastify.log.info(
      `API endpoint: http://${HOST}:${PORT}/action/{actionName}`
    );
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();

// Export for testing
export { handlers };
