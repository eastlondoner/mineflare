export interface ServerStatus {
  online: boolean;
  playerCount?: number;
  maxPlayers?: number;
  error?: string;
}

export interface PlayerResponse {
  players: string[];
  error?: string;
}

export interface ServerInfo {
  version?: string;
  motd?: string;
  error?: string;
}

export interface ContainerInfo {
  id: string;
  health: boolean;
  online: boolean;
  playerCount?: number;
  maxPlayers?: number;
  error?: string;
}