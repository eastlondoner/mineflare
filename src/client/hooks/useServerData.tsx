import { useState, useEffect } from 'preact/hooks';
import type { ServerStatus, PlayerResponse, ServerInfo } from '../types/api';
import { fetchApi } from '../utils/api';

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
      const statusResponse = await fetchApi(`/api/status`);
      const statusData: ServerStatus = await statusResponse.json();
      setStatus(statusData);

      // Fetch players
      const playersResponse = await fetchApi(`/api/players`);
      const playersData: PlayerResponse = await playersResponse.json();
      setPlayers(playersData.players || []);

      // Fetch server info
      const infoResponse = await fetchApi(`/api/info`);
      const infoData: ServerInfo = await infoResponse.json();
      setInfo(infoData);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Initial fetch
    fetchData();

    // Set up polling every 10 seconds
    const intervalId = setInterval(() => {
      fetchData();
    }, 10000);

    // Cleanup interval on unmount
    return () => clearInterval(intervalId);
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