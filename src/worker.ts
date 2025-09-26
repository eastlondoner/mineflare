import { Container, getContainer, getRandom } from "@cloudflare/containers";
import { Hono } from "hono";
import type { worker } from "../alchemy.run";
export class MinecraftContainer extends Container<typeof worker.Env> {
  // Port the container listens on (default: 8080)
  defaultPort = 8080;
  // Time before container sleeps due to inactivity (default: 30s)
  sleepAfter = "20m";
  // Environment variables passed to the container
  envVars = {
    TS_EXTRA_ARGS: "--advertise-exit-node",
    TS_ENABLE_HEALTH_CHECK: "true",
    TS_LOCAL_ADDR_PORT: "0.0.0.0:8080",
    TS_AUTHKEY: this.env.TS_AUTHKEY,
    // Minecraft server configuration
    EULA: "TRUE",
    SERVER_HOST: "0.0.0.0",
    ONLINE_MODE: "false",
    ENABLE_RCON: "true",
    // Hardcoded password is safe since we're running on a private tailnet
    RCON_PASSWORD: "minecraft",
    RCON_PORT: "25575",
    INIT_MEMORY: "1G",
    MAX_MEMORY: "4G",
  };

  enableInternet = true;
  

  // Optional lifecycle hooks
  override onStart() {
    console.log("Container successfully started");
  }

  override onStop() {
    console.log("Container successfully shut down");
  }

  override onError(error: unknown) {
    console.log("Container error:", error);
  }
}

// Create Hono app with proper typing for Cloudflare Workers
const app = new Hono<{
  Bindings: { MINECRAFT_CONTAINER: DurableObjectNamespace<MinecraftContainer> };
}>();

// Home route with available endpoints
app.get("/", (c) => {
  return c.text(
    "Available endpoints:\n" +
      "GET /container/<ID> - Start a container for each ID with a 2m timeout\n" +
      "GET /lb - Load balance requests over multiple containers\n" +
      "GET /error - Start a container that errors (demonstrates error handling)\n" +
      "GET /singleton - Get a single specific container instance",
  );
});

// Route requests to a specific container using the container ID
app.get("/container/:id", async (c) => {
  const id = c.req.param("id");
  const containerId = c.env.MINECRAFT_CONTAINER.idFromName(`/container/${id}`);
  const container = c.env.MINECRAFT_CONTAINER.get(containerId);
  return await container.fetch('http://localhost:8080/healthz');
});

// Demonstrate error handling - this route forces a panic in the container
app.get("/error", async (c) => {
  const container = getContainer(c.env.MINECRAFT_CONTAINER, "error-test");
  return await container.fetch(c.req.raw);
});

// Load balance requests across multiple containers
app.get("/lb", async (c) => {
  const container = await getRandom(c.env.MINECRAFT_CONTAINER, 3);
  return await container.fetch(c.req.raw);
});

// Get a single container instance (singleton pattern)
app.get("/singleton", async (c) => {
  const container = getContainer(c.env.MINECRAFT_CONTAINER);
  return await container.fetch(c.req.raw);
});

export default app;
