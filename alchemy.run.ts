/// <reference types="@types/node" />

import alchemy from "alchemy";
import { Container, Worker } from "alchemy/cloudflare";
import { SQLiteStateStore } from "alchemy/state";
import type { MinecraftContainer } from "./src/worker.ts";

const app = await alchemy("cloudflare-container", {
  stateStore: (scope) => new SQLiteStateStore(scope),
});

const container = await Container<MinecraftContainer>("container3", {
  name: `${app.name}-container-${app.stage}`,
  className: "MinecraftContainer",
  adopt: true,
  build: {
    context: import.meta.dirname,
    dockerfile: "container_src/Dockerfile",
  },
  instanceType: "standard"
});

export const worker = await Worker("test-worker", {
  name: `${app.name}-worker-${app.stage}`,
  entrypoint: "src/worker.ts",
  adopt: true,
  bindings: {
    MINECRAFT_CONTAINER: container,
    TS_AUTHKEY: alchemy.secret(process.env.TS_AUTHKEY),
  },
});

console.log("Worker URL:", worker.url);

await app.finalize();
