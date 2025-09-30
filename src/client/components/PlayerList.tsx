interface Props {
  players: string[];
}

export function PlayerList({ players }: Props) {
  return (
    <div style={{
      background: 'rgba(26, 46, 30, 0.4)',
      backdropFilter: 'blur(10px)',
      border: '1px solid rgba(87, 166, 78, 0.2)',
      borderRadius: '16px',
      padding: '32px',
      boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      transition: 'all 0.3s ease',
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.borderColor = 'rgba(87, 166, 78, 0.4)';
      e.currentTarget.style.transform = 'translateY(-4px)';
      e.currentTarget.style.boxShadow = '0 12px 40px rgba(0, 0, 0, 0.4)';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.borderColor = 'rgba(87, 166, 78, 0.2)';
      e.currentTarget.style.transform = 'translateY(0)';
      e.currentTarget.style.boxShadow = '0 8px 32px rgba(0, 0, 0, 0.3)';
    }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        marginBottom: '24px',
      }}>
        <div style={{
          width: '48px',
          height: '48px',
          borderRadius: '12px',
          background: 'linear-gradient(135deg, #FFB600 0%, #D4AF37 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          marginRight: '16px',
          boxShadow: '0 4px 12px rgba(255, 182, 0, 0.3)',
        }}>
          👥
        </div>
        <div>
          <h2 style={{
            margin: '0 0 4px 0',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#fff',
          }}>
            Players Online
          </h2>
          <div style={{
            color: '#888',
            fontSize: '0.875rem',
            fontWeight: '500',
          }}>
            {players.length} {players.length === 1 ? 'player' : 'players'} connected
          </div>
        </div>
      </div>
      
      {players.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: '#666',
        }}>
          <div style={{
            fontSize: '3rem',
            marginBottom: '16px',
            opacity: 0.5,
          }}>
            🏜️
          </div>
          <div style={{
            fontSize: '1rem',
            fontWeight: '500',
            color: '#888',
          }}>
            No players online
          </div>
          <div style={{
            fontSize: '0.875rem',
            color: '#666',
            marginTop: '8px',
          }}>
            Waiting for adventurers to join...
          </div>
        </div>
      ) : (
        <>
          <div style={{
            background: 'rgba(255, 182, 0, 0.1)',
            border: '1px solid rgba(255, 182, 0, 0.2)',
            borderRadius: '12px',
            padding: '12px 16px',
            marginBottom: '20px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <span style={{
              fontSize: '0.75rem',
              color: '#888',
              textTransform: 'uppercase',
              letterSpacing: '0.08em',
              fontWeight: '600',
            }}>
              Total Count
            </span>
            <span style={{
              fontSize: '1.25rem',
              fontWeight: '700',
              color: '#FFB600',
            }}>
              {players.length}
            </span>
          </div>
          
          <div style={{
            maxHeight: '300px',
            overflowY: 'auto',
          }}>
            <ul style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
            }}>
              {players.map((player, index) => (
                <li key={index} style={{
                  padding: '12px 16px',
                  borderBottom: index < players.length - 1 ? '1px solid rgba(255, 255, 255, 0.05)' : 'none',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  transition: 'all 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = 'rgba(87, 166, 78, 0.1)';
                  e.currentTarget.style.paddingLeft = '20px';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = 'transparent';
                  e.currentTarget.style.paddingLeft = '16px';
                }}
                >
                  <div style={{
                    width: '32px',
                    height: '32px',
                    borderRadius: '8px',
                    background: 'linear-gradient(135deg, #57A64E 0%, #6BB854 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.875rem',
                    fontWeight: '600',
                    color: '#fff',
                    flexShrink: 0,
                  }}>
                    {player.charAt(0).toUpperCase()}
                  </div>
                  <span style={{
                    color: '#e0e0e0',
                    fontSize: '0.9375rem',
                    fontWeight: '500',
                  }}>
                    {player}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </>
      )}
    </div>
  );
}