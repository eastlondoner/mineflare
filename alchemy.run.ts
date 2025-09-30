/// <reference types="@types/node" />

import alchemy from "alchemy";
import { Container, Website, BunSPA } from "alchemy/cloudflare";
import { SQLiteStateStore } from "alchemy/state";
import { MinecraftContainer } from "./src/container.ts";

const app = await alchemy("cloudflare-container", {
  stateStore: (scope) => new SQLiteStateStore(scope),
});

export const container = await Container<MinecraftContainer>("container3", {
  name: `${app.name}-container-${app.stage}`,
  className: "MinecraftContainer",
  adopt: true,
  build: {
    context: import.meta.dirname,
    dockerfile: "container_src/Dockerfile",
  },
  instanceType: "standard"
});

// export const worker2 = await Worker("minecraft-api", {
//   name: "minecraft-api",
//   entrypoint: "src/worker.ts",
//   adopt: true,
//   // compatibility: "node",
//   compatibilityFlags: ["enable_ctx_exports"],
//   compatibilityDate: "2025-09-17",
// });

export const worker = await BunSPA("minecraft-site", {
  name: "minecraft-site",
  entrypoint: "src/worker.ts",
  frontend: "index.html",
  adopt: true,
  compatibility: "node",
  compatibilityFlags: ["enable_ctx_exports"],
  compatibilityDate: "2025-09-27",
  bindings: {
    MINECRAFT_CONTAINER: container,
    TS_AUTHKEY: alchemy.secret(process.env.TS_AUTHKEY),
    NODE_ENV: process.env.NODE_ENV ?? 'development',
  },
});


console.log("Worker URL:", worker.url);

await app.finalize();
