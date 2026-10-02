export const getFormationCoordinates = (
  formation: string, 
  index: number, // 0 is always GK
  isAway: boolean, 
  viewMode: 'home' | 'away' | 'both'
): { top: string; left: string } => {
  // Normalize view
  // If viewing a single team, they always defend the bottom.
  // If viewing both, home defends bottom, away defends top.
  const defendingTop = viewMode === 'both' && isAway;
  
  if (index === 0) {
    return {
      top: defendingTop ? '8%' : '92%',
      left: '50%'
    };
  }

  // Parse formation (e.g. "4-3-3" -> [4, 3, 3], or "1-2-1" -> [1, 2, 1])
  const lines = formation.split('-').map(Number);
  
  // Find which line this player belongs to
  let currentLine = 0;
  let lineIndex = index - 1;
  
  while (currentLine < lines.length && lineIndex >= lines[currentLine]) {
    lineIndex -= lines[currentLine];
    currentLine++;
  }
  
  if (currentLine >= lines.length) {
    // Fallback for extra players (e.g. bad data)
    return { top: '50%', left: '50%' };
  }

  const playersInLine = lines[currentLine];
  
  // Calculate Y (Vertical)
  // Divide the pitch length by the number of lines + 1
  let yPercent = 92 - ((currentLine + 1) * (80 / (lines.length + 1)));
  
  if (viewMode === 'both') {
    // Scale to half pitch if both are shown
    if (defendingTop) {
      yPercent = 8 + ((currentLine + 1) * (38 / (lines.length + 1))); // Attacks downwards to center
    } else {
      yPercent = 92 - ((currentLine + 1) * (38 / (lines.length + 1))); // Attacks upwards to center
    }
  } else {
    // Single team view attacks the entire pitch
    if (defendingTop) {
      yPercent = 100 - yPercent;
    }
  }

  // Calculate X (Horizontal)
  // Center them horizontally based on the number of players in the line
  const startX = 50 - ((playersInLine - 1) * 15); // 30% spacing between players
  const xPercent = startX + (lineIndex * 30);

  return {
    top: `${Math.max(5, Math.min(95, yPercent))}%`,
    left: `${Math.max(10, Math.min(90, xPercent))}%`
  };
};
