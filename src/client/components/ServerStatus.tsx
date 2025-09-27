import type { ServerStatus, ServerInfo } from '../types/api';

interface Props {
  status: ServerStatus | null;
  info: ServerInfo | null;
}

export function ServerStatus({ status, info }: Props) {
  if (!status) {
    return <div>Loading server status...</div>;
  }

  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
      <h2>Server Status</h2>
      
      <div style={{ marginBottom: '10px' }}>
        <strong>Status: </strong>
        <span style={{ 
          color: status.online ? 'green' : 'red',
          fontWeight: 'bold'
        }}>
          {status.online ? 'Online' : 'Offline'}
        </span>
      </div>

      {status.online && (
        <>
          {status.playerCount !== undefined && (
            <div style={{ marginBottom: '10px' }}>
              <strong>Players: </strong>
              {status.playerCount} / {status.maxPlayers || 'Unknown'}
            </div>
          )}

          {info && (
            <>
              {info.version && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>Version: </strong>
                  {info.version}
                </div>
              )}
              
              {info.motd && (
                <div style={{ marginBottom: '10px' }}>
                  <strong>MOTD: </strong>
                  {info.motd}
                </div>
              )}
            </>
          )}
        </>
      )}

      {status.error && (
        <div style={{ color: 'red', marginTop: '10px' }}>
          Error: {status.error}
        </div>
      )}
    </div>
  );
}