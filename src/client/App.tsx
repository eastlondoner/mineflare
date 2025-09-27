import { useEffect, useState } from 'preact/hooks';
import { ServerStatus } from './components/ServerStatus';
import { PlayerList } from './components/PlayerList';
import { useServerData } from './hooks/useServerData';

export function App() {
  const { status, players, info, loading, error, refresh } = useServerData();

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial, sans-serif' }}>
      <h1>Minecraft Server Status</h1>
      
      <button onClick={refresh} disabled={loading}>
        {loading ? 'Loading...' : 'Refresh'}
      </button>
      
      {error && (
        <div style={{ color: 'red', margin: '10px 0' }}>
          Error: {error}
        </div>
      )}

      <div style={{ display: 'grid', gap: '20px', marginTop: '20px' }}>
        <ServerStatus status={status} info={info} />
        <PlayerList players={players} />
      </div>
    </div>
  );
}