/*!
 * node-rcon
 * Copyright(c) 2012 Justin Li <j-li.net>
 * MIT Licensed
 */

import EventEmitter from "events";

type CloudflareTcpPort = {
    connect(address: SocketAddress | string, options?: SocketOptions): Socket;
}

interface CloudflareTCPSocket {
    get readable(): ReadableStream;
    get writable(): WritableStream;
    get closed(): Promise<void>;
    get opened(): Promise<SocketInfo>;
    get upgraded(): boolean;
    get secureTransport(): "on" | "off" | "starttls";
    close(): Promise<void>;
    startTls(options?: TlsOptions): Socket;
}

interface RconOptions {
  tcp?: boolean;
  id?: number;
  timeout?: number;
}

const PacketType = {
  COMMAND: 0x02,
  AUTH: 0x03,
  RESPONSE_VALUE: 0x00,
  RESPONSE_AUTH: 0x02
} as const;

interface PendingRequest {
  id: number;
  resolve: (response: string) => void;
  reject: (error: Error) => void;
  timeout?: NodeJS.Timeout;
}

/**
 * Promise-based RCON client for Cloudflare Workers
 * Each send() call returns a Promise that resolves with the response
 */
class Rcon {
  private tcpPort: CloudflareTcpPort;
  private password: string;
  private hasAuthed: boolean;
  private outstandingData: Buffer | null;
  private socket?: CloudflareTCPSocket;
  private writer?: WritableStreamDefaultWriter;
  private reader?: ReadableStreamDefaultReader;
  private pendingRequests: Map<number, PendingRequest>;
  private requestIdCounter: number;
  private defaultTimeout: number;
  private _isConnected: boolean;

  constructor(tcpPort: CloudflareTcpPort, password: string, options?: RconOptions) {
    options = options || {};

    this.tcpPort = tcpPort;
    this.password = password;
    this.hasAuthed = false;
    this.outstandingData = null;
    this.pendingRequests = new Map();
    this.requestIdCounter = 1;
    this.defaultTimeout = options.timeout || 10000;
    this._isConnected = false;
  }

  async connect(): Promise<void> {
    if (this._isConnected) {
      console.log("RCON already connected");
      return;
    }

    const maxAttempts = 3;
    let lastError: Error | undefined;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      console.log(`RCON connection attempt ${attempt} of ${maxAttempts}`);
      
      try {
        this.socket = this.tcpPort.connect("localhost:25575");
        
        // Wait for socket to open
        await this.socket.opened;
        console.log("RCON socket opened");
        
        // Get writer and reader
        this.writer = this.socket.writable.getWriter();
        this.reader = this.socket.readable.getReader();
        
        this._isConnected = true;
        
        // Authenticate
        console.log("Authenticating RCON");
        await this.authenticate();
        console.log("RCON authenticated");
        
        // Success! Exit the retry loop
        return;
        
      } catch (err) {
        lastError = err instanceof Error ? err : new Error(String(err));
        console.log(`RCON connection attempt ${attempt} failed:`, lastError.message);
        
        this._isConnected = false;
        
        // Clean up failed socket
        if (this.socket) {
          try {
            await this.socket.close();
          } catch (e) {
            // Ignore cleanup errors
          }
          this.socket = undefined;
        }
        this.writer = undefined;
        this.reader = undefined;
        
        // If not the last attempt, wait before retrying
        if (attempt < maxAttempts) {
          const delayMs = 1000 * attempt; // Exponential backoff: 1s, 2s
          console.log(`Waiting ${delayMs}ms before retry...`);
          await new Promise(resolve => setTimeout(resolve, delayMs));
        }
      }
    }

    // All attempts failed
    throw new Error(`Failed to connect to RCON after ${maxAttempts} attempts: ${lastError?.message}`);
  }

  private async authenticate(): Promise<void> {
    const authResponse = await this.sendPacket(this.password, PacketType.AUTH, 30000);
    console.log("RCON authentication response", authResponse);
    if (!authResponse) {
      throw new Error("Authentication failed");
    }
    this.hasAuthed = true;
  }

  async send(command: string, timeout?: number): Promise<string> {
    if (!this._isConnected || !this.hasAuthed) {
      throw new Error("Not connected or authenticated");
    }

    return this.sendPacket(command, PacketType.COMMAND, timeout);
  }

  private async sendPacket(data: string, cmd: number, timeout?: number): Promise<string> {
    const requestId = this.requestIdCounter++;
    const timeoutMs = timeout || this.defaultTimeout;
    console.log("sending packet", data, requestId);

    // Create the packet
    const length = Buffer.byteLength(data);
    const sendBuf = Buffer.alloc(length + 14);
    sendBuf.writeInt32LE(length + 10, 0);
    sendBuf.writeInt32LE(requestId, 4);
    sendBuf.writeInt32LE(cmd, 8);
    sendBuf.write(data, 12);
    sendBuf.writeInt16LE(0, length + 12);

    // Create promise for response
    const responsePromise = new Promise<string>(async (resolve, reject) => {
      console.log("creating response promise", data, requestId);
      const timeoutHandle = setTimeout(() => {
        console.log("RCON request timeout after", timeoutMs, "ms");
        this.pendingRequests.delete(requestId);
        reject(new Error(`RCON request timeout after ${timeoutMs}ms`));
      }, timeoutMs);

      while(this.pendingRequests.size > 0){
        console.log("waiting for pending request", this.pendingRequests.size);
        await new Promise(resolve => setTimeout(resolve, 10));
      }
      console.log('proceeding', requestId )
      try{
        this.pendingRequests.set(requestId, {
          id: requestId,
          resolve,
          reject,
          timeout: timeoutHandle,
        });
        
        // Send the packet
        console.log("writing to socket");
        const writePromise = this.writeToSocket(sendBuf);
        console.log("sent packet", data);

        // Start reading if not already reading
        const readPromise = this.startReading();
        await Promise.all([readPromise, writePromise]);
        console.log('all done');
      } catch (err) {
        console.log("error writing to socket", err);
        reject(err);
      }
    });

    return responsePromise;
  }

  private writeToSocket(buf: Buffer): Promise<void> {
    if (!this.writer) {
      console.log("Socket writer not available");
      throw new Error("Socket writer not available");
    }

    const uint8Array = new Uint8Array(buf);
    console.log('writing to writer');
    return this.writer.write(uint8Array);
  }

  isReading = false;
  private startReading(): Promise<void> {
    // Only start one reading loop
    if (this.reader && this.pendingRequests.size > 0 && !this.isReading) {
      this.isReading = true;
      console.log("starting reading loop", !!this.reader, this.pendingRequests.size, this.isReading);
      return this.readLoop().finally(() => {
        this.isReading = false;
        console.log("Reading loop finished", this.pendingRequests.size, this.isReading);
      });
    }
    console.log("skipping reading loop", !!this.reader, this.pendingRequests.size, this.isReading);
    return Promise.resolve();
  }

  private async readLoop(): Promise<void> {
    if (!this.reader) return;

    try {
      const { done, value } = await this.reader.read();
      
      if (done) {
        console.log("Reading loop done");
        this.handleDisconnect();
        return;
      }

      // Convert Uint8Array to Buffer and process
      const buffer = Buffer.from(value);
      this.processData(buffer);

      // Continue reading if there are pending requests
      if (this.pendingRequests.size > 0) {
        return this.readLoop();
      }

    } catch (err) {
      this.handleError(new Error(`Read error: ${err}`));
    }
  }

  private processData(data: Buffer): void {
    if (this.outstandingData != null) {
      data = Buffer.concat([this.outstandingData, data], this.outstandingData.length + data.length);
      this.outstandingData = null;
    }

    while (data.length >= 12) {
      const len = data.readInt32LE(0);
      if (!len) return;

      const packetLen = len + 4;
      if (data.length < packetLen) break;

      const bodyLen = len - 10;
      if (bodyLen < 0) {
        data = data.slice(packetLen);
        break;
      }

      const id = data.readInt32LE(4);
      const type = data.readInt32LE(8);

      // Handle authentication response
      if (type == PacketType.RESPONSE_AUTH) {
        if (id === -1) {
          console.log("RCON authentication failed");
          this.handleError(new Error("Authentication failed"));
          return;
        }
        
        const pending = this.pendingRequests.get(id);
        console.log("RCON auth succeeded", !!pending);
        if (pending) {
          if (pending.timeout) clearTimeout(pending.timeout);
          this.pendingRequests.delete(id);
          pending.resolve("SUCCESS"); // Auth success
        }
      }
      // Handle command response
      else if (type == PacketType.RESPONSE_VALUE) {
        let str = data.toString('utf8', 12, 12 + bodyLen);

        if (str.charAt(str.length - 1) === '\n') {
          str = str.substring(0, str.length - 1);
        }

        str = str.split('/').join('\n/').trim();

        console.log("processing data", str);

        const pending = this.pendingRequests.get(id);
        if (pending) {
          if (pending.timeout) clearTimeout(pending.timeout);
          this.pendingRequests.delete(id);
          pending.resolve(str);
        }
      }
      else {
        console.log("unhandled type", type);
        let str = data.toString('utf8', 12, 12 + bodyLen);
        console.log("unhandled data", str);
      }

      data = data.slice(packetLen);
    }

    this.outstandingData = data;
  }

  private handleError(error: Error): void {
    // Reject all pending requests
    for (const [id, pending] of this.pendingRequests) {
      if (pending.timeout) clearTimeout(pending.timeout);
      pending.reject(error);
    }
    this.pendingRequests.clear();
    this._isConnected = false;
    this.hasAuthed = false;
  }

  private handleDisconnect(): void {
    this.handleError(new Error("Connection closed"));
  }

  async disconnect(): Promise<void> {
    try {
      // Clear all pending requests
      for (const [id, pending] of this.pendingRequests) {
        if (pending.timeout) clearTimeout(pending.timeout);
        pending.reject(new Error("Connection closed"));
      }
      this.pendingRequests.clear();

      // Release reader and writer
      if (this.reader) {
        await this.reader.cancel();
        this.reader.releaseLock();
        this.reader = undefined;
      }
      
      if (this.writer) {
        await this.writer.close();
        this.writer = undefined;
      }
      
      // Close the socket
      if (this.socket) {
        await this.socket.close();
        this.socket = undefined;
      }

      this._isConnected = false;
      this.hasAuthed = false;
      
    } catch (err) {
      // Ignore cleanup errors
    }
  }

  // _readLoop(ctx: { waitUntil: (promise: Promise<unknown>) => void }): void {
  //   const reader = this.reader;
  //   if (!reader) return;
  //   ctx.waitUntil(new Promise<void>(async (resolve, reject) => {
  //     try {
  //       while (true) {
  //         const { done, value } = await reader.read();
  //         if (done) {
  //           this.handleDisconnect();
  //           resolve();
  //           return;
  //         }

  //         const buffer = Buffer.from(value);
  //         this.emit("data", buffer);
  //       }
  //     } catch (err) {
  //       this.emit("error", err);
  //       this.handleDisconnect();
  //       reject(err);
  //     }
  //   }));
  // }

  /**
   * Actively checks if the RCON connection is working by sending a test command
   * @returns Promise<boolean> - true if connection is working, false otherwise
   */
  async isConnected(): Promise<boolean> {
    // Quick check of connection state
    if (!this._isConnected || !this.hasAuthed || !this.socket || !this.writer || !this.reader) {
      return false;
    }

    try {
      // Test the connection by sending a list command with 10s timeout
      console.log("testing connection");
      await this.send("list", 10000);
      return true;
    } catch (error) {
      // If the command fails, mark as disconnected and return false
      this._isConnected = false;
      this.hasAuthed = false;
      return false;
    }
  }
}

export { Rcon };
export default Rcon;