import { Container, getContainer, getRandom } from "@cloudflare/containers";
import { Elysia } from "elysia";
import { Rcon } from "rcon";
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
  
  // RCON connection instance
  private rcon: Rcon | null = null;

  // Optional lifecycle hooks
  override onStart() {
    console.log("Container successfully started");
    this.initRcon();
  }

  override onStop() {
    console.log("Container successfully shut down");
    this.disconnectRcon();
  }

  override onError(error: unknown) {
    console.log("Container error:", error);
  }

  // Handle HTTP requests to this container
  override async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle RCON API requests
    if (url.pathname === "/rcon/status") {
      const status = await this.getRconStatus();
      return new Response(JSON.stringify(status), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    if (url.pathname === "/rcon/players") {
      const players = await this.getRconPlayers();
      return new Response(JSON.stringify({ players }), {
        headers: { "Content-Type": "application/json" }
      });
    }
    
    if (url.pathname === "/rcon/info") {
      const info = await this.getRconInfo();
      return new Response(JSON.stringify(info), {
        headers: { "Content-Type": "application/json" }
      });
    }

    // Default health check
    if (url.pathname === "/healthz") {
      return new Response("OK");
    }

    return new Response("Not Found", { status: 404 });
  }

  // Initialize RCON connection
  private initRcon() {
    try {
      this.rcon = new Rcon("localhost", 25575, "minecraft");
      this.rcon.on("auth", () => {
        console.log("RCON authenticated successfully");
      }).on("error", (err: any) => {
        console.error("RCON error:", err);
        this.rcon = null;
      });
    } catch (error) {
      console.error("Failed to initialize RCON:", error);
    }
  }

  // Disconnect RCON
  private disconnectRcon() {
    if (this.rcon) {
      this.rcon.disconnect();
      this.rcon = null;
    }
  }

  // Get server status via RCON
  private async getRconStatus(): Promise<{ online: boolean; playerCount?: number; maxPlayers?: number }> {
    return new Promise((resolve) => {
      if (!this.rcon) {
        this.initRcon();
        if (!this.rcon) {
          resolve({ online: false });
          return;
        }
      }

      this.rcon.on("response", (str: string) => {
        // Parse response like "There are 3 of a max of 20 players online"
        const match = str.match(/There are (\d+) of a max of (\d+) players online/);
        if (match) {
          resolve({
            online: true,
            playerCount: parseInt(match[1]),
            maxPlayers: parseInt(match[2])
          });
        } else {
          resolve({ online: true });
        }
      });

      this.rcon.send("list");
    });
  }

  // Get player list via RCON
  private async getRconPlayers(): Promise<string[]> {
    return new Promise((resolve) => {
      if (!this.rcon) {
        this.initRcon();
        if (!this.rcon) {
          resolve([]);
          return;
        }
      }

      this.rcon.on("response", (str: string) => {
        // Parse player list from response
        const playerMatch = str.match(/online: (.+)$/);
        if (playerMatch && playerMatch[1].trim() !== "") {
          const players = playerMatch[1].split(", ").map(p => p.trim());
          resolve(players);
        } else {
          resolve([]);
        }
      });

      this.rcon.send("list");
    });
  }

  // Get server info via RCON
  private async getRconInfo(): Promise<{ version?: string; motd?: string }> {
    return new Promise((resolve) => {
      if (!this.rcon) {
        this.initRcon();
        if (!this.rcon) {
          resolve({});
          return;
        }
      }

      // This is a simple implementation - in practice you might want to use multiple commands
      resolve({ version: "Unknown", motd: "Minecraft Server" });
    });
  }
}

// Create Elysia app with proper typing for Cloudflare Workers
const app = new Elysia()
  .get("/", () => "Minecraft Server Status API")
  
  // API routes for the SPA
  .get("/api/status", async ({ env }: any) => {
    try {
      const container = getContainer(env.MINECRAFT_CONTAINER);
      const response = await container.fetch(new Request("http://localhost/rcon/status"));
      const status = await response.json();
      return status;
    } catch (error) {
      return { online: false, error: "Failed to get status" };
    }
  })

  .get("/api/players", async ({ env }: any) => {
    try {
      const container = getContainer(env.MINECRAFT_CONTAINER);
      const response = await container.fetch(new Request("http://localhost/rcon/players"));
      const data = await response.json();
      return data;
    } catch (error) {
      return { players: [], error: "Failed to get players" };
    }
  })

  .get("/api/container/:id", async ({ params, env }: any) => {
    try {
      const id = params.id;
      const containerId = env.MINECRAFT_CONTAINER.idFromName(`/container/${id}`);
      const container = env.MINECRAFT_CONTAINER.get(containerId);
      
      // Get both health and RCON status
      const healthResponse = await container.fetch(new Request("http://localhost/healthz"));
      const statusResponse = await container.fetch(new Request("http://localhost/rcon/status"));
      const rconStatus = await statusResponse.json();
      
      return {
        id,
        health: healthResponse.ok,
        ...rconStatus
      };
    } catch (error) {
      return { id: params.id, online: false, error: "Failed to get container info" };
    }
  })

  .get("/api/info", async ({ env }: any) => {
    try {
      const container = getContainer(env.MINECRAFT_CONTAINER);
      const response = await container.fetch(new Request("http://localhost/rcon/info"));
      const info = await response.json();
      return info;
    } catch (error) {
      return { error: "Failed to get server info" };
    }
  })

  // Legacy container routes
  .get("/container/:id", async ({ params, env }: any) => {
    const id = params.id;
    const containerId = env.MINECRAFT_CONTAINER.idFromName(`/container/${id}`);
    const container = env.MINECRAFT_CONTAINER.get(containerId);
    return await container.fetch(new Request("http://localhost/healthz"));
  })

  .get("/error", async ({ request, env }: any) => {
    const container = getContainer(env.MINECRAFT_CONTAINER, "error-test");
    return await container.fetch(request);
  })

  .get("/lb", async ({ request, env }: any) => {
    const container = await getRandom(env.MINECRAFT_CONTAINER, 3);
    return await container.fetch(request);
  })

  .get("/singleton", async ({ request, env }: any) => {
    const container = getContainer(env.MINECRAFT_CONTAINER);
    return await container.fetch(request);
  })
  .compile();

export default app;
