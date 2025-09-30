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
  versionName?: string;
  versionId?: string;
  data?: string;
  series?: string;
  protocol?: string;
  buildTime?: string;
  packResource?: string;
  packData?: string;
  stable?: string;
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