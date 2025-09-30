import { ServerStatus } from './components/ServerStatus';
import { PlayerList } from './components/PlayerList';
import { useServerData } from './hooks/useServerData';
import { Terminal } from './components/Terminal';

export function App() {
  const { status, players, info, loading, error, refresh } = useServerData();

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0a1612 0%, #1a2e1e 50%, #2a1810 100%)',
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      color: '#e0e0e0',
      padding: '0',
      margin: '0',
    }}>
      {/* Hero Section */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '60px 20px 40px',
        textAlign: 'center',
      }}>
        <h1 style={{
          fontSize: 'clamp(2.5rem, 6vw, 4rem)',
          fontWeight: '800',
          margin: '0 0 20px 0',
          background: 'linear-gradient(135deg, #55FF55 0%, #FFB600 50%, #57A64E 100%)',
          WebkitBackgroundClip: 'text',
          WebkitTextFillColor: 'transparent',
          backgroundClip: 'text',
          letterSpacing: '-0.02em',
        }}>
          Minecraft Server
        </h1>
        
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          marginBottom: '30px',
          flexWrap: 'wrap',
        }}>
          <p style={{
            fontSize: 'clamp(1rem, 3vw, 1.25rem)',
            color: '#b0b0b0',
            fontWeight: '400',
            margin: '0',
            textAlign: 'center',
          }}>
            Real-time server monitoring and control
          </p>
          
          <button 
            onClick={refresh} 
            disabled={loading}
            title={loading ? "Refreshing..." : "Refresh now"}
            style={{
              width: '32px',
              height: '32px',
              padding: '0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.125rem',
              background: 'rgba(87, 166, 78, 0.15)',
              color: loading ? '#7cbc73' : '#57A64E',
              border: '1px solid rgba(87, 166, 78, 0.3)',
              borderRadius: '50%',
              cursor: loading ? 'default' : 'pointer',
              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              animation: loading ? 'spin 2s cubic-bezier(0.4, 0, 0.2, 1) infinite' : 'none',
              flexShrink: 0,
            }}
            onMouseEnter={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'rgba(87, 166, 78, 0.25)';
                e.currentTarget.style.borderColor = 'rgba(87, 166, 78, 0.5)';
                e.currentTarget.style.transform = 'scale(1.1)';
              }
            }}
            onMouseLeave={(e) => {
              if (!loading) {
                e.currentTarget.style.background = 'rgba(87, 166, 78, 0.15)';
                e.currentTarget.style.borderColor = 'rgba(87, 166, 78, 0.3)';
                e.currentTarget.style.transform = 'scale(1)';
              }
            }}
          >
            ↻
          </button>
        </div>
        
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
        
        {error && (
          <div style={{
            marginTop: '20px',
            padding: '16px 20px',
            background: 'rgba(255, 71, 71, 0.1)',
            border: '1px solid rgba(255, 71, 71, 0.3)',
            borderRadius: '8px',
            color: '#ff6b6b',
            fontWeight: '500',
          }}>
            ⚠️ Error: {error}
          </div>
        )}

        {/* Stats Bar */}
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '30px',
          marginTop: '40px',
          flexWrap: 'wrap',
        }}>
          <div style={{
            textAlign: 'center',
            padding: '15px 25px',
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: status?.online ? '#55FF55' : '#ff6b6b',
              marginBottom: '5px',
            }}>
              {status?.online ? '●' : '○'}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#888',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {status?.online ? 'Online' : 'Offline'}
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '15px 25px',
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#FFB600',
              marginBottom: '5px',
            }}>
              {status?.playerCount ?? '—'}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#888',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Players
            </div>
          </div>

          <div style={{
            textAlign: 'center',
            padding: '15px 25px',
          }}>
            <div style={{
              fontSize: '2rem',
              fontWeight: '700',
              color: '#57A64E',
              marginBottom: '5px',
            }}>
              {status?.maxPlayers ?? '—'}
            </div>
            <div style={{
              fontSize: '0.875rem',
              color: '#888',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Max Players
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px 60px',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
          gap: '24px',
          marginBottom: '24px',
        }}>
          <ServerStatus status={status} info={info} />
          <PlayerList players={players} />
        </div>

        <Terminal />
      </div>
    </div>
  );
}
