interface Props {
  players: string[];
}

export function PlayerList({ players }: Props) {
  return (
    <div style={{ border: '1px solid #ccc', padding: '15px', borderRadius: '5px' }}>
      <h2>Players Online</h2>
      
      {players.length === 0 ? (
        <p>No players online</p>
      ) : (
        <>
          <p><strong>Count:</strong> {players.length}</p>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {players.map((player, index) => (
              <li key={index} style={{ 
                padding: '5px 0', 
                borderBottom: '1px solid #eee' 
              }}>
                {player}
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}