declare module 'rcon' {
  export class Rcon {
    constructor(host: string, port: number, password: string);
    
    on(event: 'auth', callback: () => void): this;
    on(event: 'response', callback: (str: string) => void): this;
    on(event: 'error', callback: (err: any) => void): this;
    
    send(command: string): void;
    connect(): void;
    disconnect(): void;
  }
}