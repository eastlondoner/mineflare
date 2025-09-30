import { z, ZodType } from "zod";

const MinecraftListSchema = z.object({
    type: z.literal("list"),
    message: z.string(),
}).transform((data) => {
    // Parse response like "There are 3 of a max of 20 players online"
    const match = data.message.match(/There are (\d+) of a max of (\d+) players online/);
    if (match) {
        return {
            online: true,
            playerCount: parseInt(match[1]),
            maxPlayers: parseInt(match[2])
        };
    }
    throw new Error("Invalid list response " + data.message);
});


// Just export the schema directly since we only have one message type
export const ServerToClientMessages = MinecraftListSchema;



export type ServerToClientMessageInput = z.input<typeof ServerToClientMessages>;
export type ServerToClientMessage = z.output<typeof ServerToClientMessages>;

export const RconCommandSchema = z.literal("list");

// Helper function to ensure a zod schema for a given type
function SchemaFor<T>(schema: ZodType<T>) {
    return schema;
}
