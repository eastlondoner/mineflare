import type { ServerStatus, ServerInfo } from '../types/api';

interface Props {
  status: ServerStatus | null;
  info: ServerInfo | null;
}

export function ServerStatus({ status, info }: Props) {
  if (!status) {
    return (
      <div style={{
        background: 'rgba(26, 46, 30, 0.4)',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(87, 166, 78, 0.2)',
        borderRadius: '16px',
        padding: '32px',
        boxShadow: '0 8px 32px rgba(0, 0, 0, 0.3)',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#888',
          fontSize: '1rem',
        }}>
          <span style={{ marginRight: '10px', fontSize: '1.5rem' }}>⏳</span>
          Loading server status...
        </div>
      </div>
    );
  }

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
          background: status.online 
            ? 'linear-gradient(135deg, #57A64E 0%, #6BB854 100%)' 
            : 'linear-gradient(135deg, #ff6b6b 0%, #ee5a52 100%)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '1.5rem',
          marginRight: '16px',
          boxShadow: status.online 
            ? '0 4px 12px rgba(87, 166, 78, 0.3)' 
            : '0 4px 12px rgba(255, 107, 107, 0.3)',
        }}>
          {status.online ? '✓' : '✗'}
        </div>
        <div>
          <h2 style={{
            margin: '0 0 4px 0',
            fontSize: '1.5rem',
            fontWeight: '700',
            color: '#fff',
          }}>
            Server Status
          </h2>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}>
            <div style={{
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: status.online ? '#55FF55' : '#ff6b6b',
              boxShadow: status.online 
                ? '0 0 8px #55FF55' 
                : '0 0 8px #ff6b6b',
            }} />
            <span style={{
              color: status.online ? '#55FF55' : '#ff6b6b',
              fontWeight: '600',
              fontSize: '0.875rem',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              {status.online ? 'Online' : 'Offline'}
            </span>
          </div>
        </div>
      </div>

      {status.online && (
        <>
          {status.playerCount !== undefined && (
            <div style={{
              background: 'rgba(255, 182, 0, 0.1)',
              border: '1px solid rgba(255, 182, 0, 0.2)',
              borderRadius: '12px',
              padding: '16px',
              marginBottom: '16px',
            }}>
              <div style={{
                fontSize: '0.75rem',
                color: '#888',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                marginBottom: '8px',
                fontWeight: '600',
              }}>
                👥 Players Online
              </div>
              <div style={{
                fontSize: '1.75rem',
                fontWeight: '700',
                color: '#FFB600',
              }}>
                {status.playerCount} <span style={{
                  fontSize: '1rem',
                  color: '#888',
                  fontWeight: '400',
                }}>/ {status.maxPlayers || '—'}</span>
              </div>
            </div>
          )}

          {info && (
            <>
              {info.version && (
                <div style={{
                  background: 'rgba(87, 166, 78, 0.1)',
                  border: '1px solid rgba(87, 166, 78, 0.2)',
                  borderRadius: '12px',
                  padding: '16px',
                  marginBottom: '16px',
                }}>
                  <div style={{
                    fontSize: '0.75rem',
                    color: '#888',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '12px',
                    fontWeight: '600',
                  }}>
                    🎮 Server Version Info
                  </div>
                  
                  <div style={{
                    display: 'grid',
                    gap: '8px',
                  }}>
                    {info.version && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 0',
                      }}>
                        <span style={{ color: '#888', fontSize: '0.8125rem' }}>Version</span>
                        <span style={{ color: '#57A64E', fontSize: '0.8125rem', fontWeight: '600' }}>
                          {info.version}
                        </span>
                      </div>
                    )}
                    
                    {info.protocol && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 0',
                      }}>
                        <span style={{ color: '#888', fontSize: '0.8125rem' }}>Protocol</span>
                        <span style={{ color: '#e0e0e0', fontSize: '0.8125rem', fontFamily: 'monospace' }}>
                          {info.protocol}
                        </span>
                      </div>
                    )}
                    
                    {info.data && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 0',
                      }}>
                        <span style={{ color: '#888', fontSize: '0.8125rem' }}>Data Version</span>
                        <span style={{ color: '#e0e0e0', fontSize: '0.8125rem', fontFamily: 'monospace' }}>
                          {info.data}
                        </span>
                      </div>
                    )}
                    
                    {info.series && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 0',
                      }}>
                        <span style={{ color: '#888', fontSize: '0.8125rem' }}>Series</span>
                        <span style={{ color: '#e0e0e0', fontSize: '0.8125rem', textTransform: 'capitalize' }}>
                          {info.series}
                        </span>
                      </div>
                    )}
                    
                    {info.packResource && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 0',
                      }}>
                        <span style={{ color: '#888', fontSize: '0.8125rem' }}>Resource Pack</span>
                        <span style={{ color: '#e0e0e0', fontSize: '0.8125rem', fontFamily: 'monospace' }}>
                          {info.packResource}
                        </span>
                      </div>
                    )}
                    
                    {info.packData && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 0',
                      }}>
                        <span style={{ color: '#888', fontSize: '0.8125rem' }}>Data Pack</span>
                        <span style={{ color: '#e0e0e0', fontSize: '0.8125rem', fontFamily: 'monospace' }}>
                          {info.packData}
                        </span>
                      </div>
                    )}
                    
                    {info.stable && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 0',
                      }}>
                        <span style={{ color: '#888', fontSize: '0.8125rem' }}>Stability</span>
                        <span style={{ 
                          color: info.stable.toLowerCase() === 'yes' ? '#55FF55' : '#FFB600', 
                          fontSize: '0.8125rem',
                          fontWeight: '600',
                          textTransform: 'capitalize',
                        }}>
                          {info.stable.toLowerCase() === 'yes' ? 'Stable' : 'Unstable'}
                        </span>
                      </div>
                    )}
                    
                    {info.buildTime && (
                      <div style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '6px 0',
                        borderTop: '1px solid rgba(255, 255, 255, 0.05)',
                        marginTop: '4px',
                        paddingTop: '10px',
                      }}>
                        <span style={{ color: '#888', fontSize: '0.8125rem' }}>Built</span>
                        <span style={{ color: '#b0b0b0', fontSize: '0.75rem', fontStyle: 'italic' }}>
                          {info.buildTime}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
              
              {info.motd && (
                <div style={{
                  padding: '0',
                }}>
                  <div style={{
                    color: '#888',
                    fontSize: '0.75rem',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: '8px',
                    fontWeight: '600',
                  }}>
                    💬 Message of the Day
                  </div>
                  <div style={{
                    color: '#b0b0b0',
                    fontSize: '0.875rem',
                    lineHeight: '1.6',
                    fontStyle: 'italic',
                    background: 'rgba(255, 255, 255, 0.03)',
                    padding: '12px',
                    borderRadius: '8px',
                    borderLeft: '3px solid #57A64E',
                  }}>
                    {info.motd}
                  </div>
                </div>
              )}
            </>
          )}
        </>
      )}

      {status.error && (
        <div style={{
          marginTop: '16px',
          padding: '12px 16px',
          background: 'rgba(255, 107, 107, 0.1)',
          border: '1px solid rgba(255, 107, 107, 0.3)',
          borderRadius: '8px',
          color: '#ff6b6b',
          fontSize: '0.875rem',
          fontWeight: '500',
        }}>
          ⚠️ {status.error}
        </div>
      )}
    </div>
  );
}