import { Container, getContainer, getRandom } from "@cloudflare/containers";
import { Elysia, t } from "elysia";
import { Rcon } from "./lib/rcon";
import type { worker } from "../alchemy.run";
import { CloudflareAdapter } from 'elysia/adapter/cloudflare-worker'
import { MinecraftContainer } from "./container";
import { env as workerEnv } from 'cloudflare:workers'
import cors from "@elysiajs/cors";
import { getNodeEnv } from "./client/utils/node-env";

const env = workerEnv as typeof worker.Env;

function getMinecraftContainer() {
  return getContainer(env.MINECRAFT_CONTAINER as unknown as DurableObjectNamespace<MinecraftContainer>);
}

// Create Elysia app with proper typing for Cloudflare Workers
let elysiaApp = (
  getNodeEnv() === 'development'
  ? new Elysia({
      adapter: CloudflareAdapter,
      // aot: false,
    }).use(cors({
        origin: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization'],
        credentials: true,
        maxAge: 86400,
    }))
  : new Elysia({
      adapter: CloudflareAdapter,
      // aot: false,
    })
  )
  .get("/", () => 'foo')
  
  // API routes for the SPA
  .get("/api/status", async () => {
    try {
      console.log("Getting container");
      const container = getMinecraftContainer();
      console.log("Starting container");
      await container.startAndWaitForPorts();
      const response = await container.fetch(new Request("http://localhost/rcon/status"));
      const status = await response.json();
      return status;
    } catch (error) {
      console.error("Failed to get status", error);
      return { online: false, error: "Failed to get status" };
    }
  })

  .get("/api/players", async () => {
    try {
      const container = getMinecraftContainer();
      const response = await container.fetch(new Request("http://localhost/rcon/players"));
      const data = await response.json();
      return data;
    } catch (error) {
      return { players: [], error: "Failed to get players" };
    }
  })

  .get("/api/container/:id", async ({ params }: any) => {
    try {
      const id = params.id;
      const containerId = env.MINECRAFT_CONTAINER.idFromName(`/container/${id}`);
      const container = env.MINECRAFT_CONTAINER.get(containerId);
      
      // Get both health and RCON status
      const healthResponse = await container.fetch("http://localhost/healthz");
      const statusResponse = await container.fetch("http://localhost/rcon/status");
      const rconStatus = await statusResponse.json<any>();
      
      return {
        id,
        health: healthResponse.ok,
        ...rconStatus
      };
    } catch (error) {
      return { id: params.id, online: false, error: "Failed to get container info" };
    }
  })

  .get("/api/info", async () => {
    try {
      const container = getMinecraftContainer();
      const response = await container.fetch(new Request("http://localhost/rcon/info"));
      const info = await response.json();
      return info;
    } catch (error) {
      return { error: "Failed to get server info" };
    }
  })
  .compile()

export { MinecraftContainer } from "./container";

export default {
  fetch(request: Request, env: typeof worker.Env): Response | Promise<Response> {
    if(request.url.endsWith('/ws')) {
      return this.handleWebSocket(request, env);
    }
    return elysiaApp.fetch(request);
  },

  handleWebSocket(request: Request, env: typeof worker.Env): Response | Promise<Response> {
     // Expect to receive a WebSocket Upgrade request.
      // If there is one, accept the request and return a WebSocket Response.
      const upgradeHeader = request.headers.get("Upgrade");
      if (!upgradeHeader || upgradeHeader !== "websocket") {
        return new Response("Worker expected Upgrade: websocket", {
          status: 426,
        });
      }

      if (request.method !== "GET") {
        return new Response("Worker expected GET method", {
          status: 400,
        });
      }
      
      let stub = getMinecraftContainer();

      return stub.fetch(request);
  }
};