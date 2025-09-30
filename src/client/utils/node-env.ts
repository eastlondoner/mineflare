
export function getNodeEnv() {
    // Miniflare is FUCKED UP and process.env.NODE_ENV is undefined but this is not
    return Object.entries(process.env).find(([key, value]) => key === "NODE_ENV")?.[1] ?? 'production';
}
