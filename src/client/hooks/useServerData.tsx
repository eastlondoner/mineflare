import { useState, useEffect } from 'preact/hooks';
import type { ServerStatus, PlayerResponse, ServerInfo } from '../types/api';

// In production, this should be an environment variable
const API_BASE_URL = 'https://cloudflare-container-worker-dev.sam-goodwin-34b.workers.dev';

export function useServerData() {
  const [status, setStatus] = useState<ServerStatus | null>(null);
  const [players, setPlayers] = useState<string[]>([]);
  const [info, setInfo] = useState<ServerInfo | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch server status
      const statusResponse = await fetch(`${API_BASE_URL}/api/status`);
      const statusData: ServerStatus = await statusResponse.json();
      setStatus(statusData);

      // Fetch players
      const playersResponse = await fetch(`${API_BASE_URL}/api/players`);
      const playersData: PlayerResponse = await playersResponse.json();
      setPlayers(playersData.players || []);

      // Fetch server info
      const infoResponse = await fetch(`${API_BASE_URL}/api/info`);
      const infoData: ServerInfo = await infoResponse.json();
      setInfo(infoData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  return {
    status,
    players,
    info,
    loading,
    error,
    refresh: fetchData
  };
}