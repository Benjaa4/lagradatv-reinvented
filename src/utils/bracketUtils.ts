import { Match } from '../types';

export type BracketPhaseName = 'Octavos de Final' | 'Cuartos de Final' | 'Semifinales' | 'Final';

export interface BracketPhase {
  name: BracketPhaseName;
  codePrefix: string;
  matches: Match[];
}

export function processBracketMatches(matches: Match[]): BracketPhase[] {
  const bracketMatches = matches.filter(m => !!m.bracket_code);
  
  const groups: Record<string, Match[]> = {
    'O': [], // O1-O8
    'C': [], // C1-C4
    'S': [], // S1-S2
    'F': []  // F1
  };

  bracketMatches.forEach(match => {
    const code = match.bracket_code!.trim().toUpperCase();
    const prefix = code.charAt(0);
    if (groups[prefix]) {
      groups[prefix].push(match);
    }
  });

  // Sort matches within each group by their bracket code number
  Object.keys(groups).forEach(key => {
    groups[key].sort((a, b) => {
      const numA = parseInt(a.bracket_code!.replace(/\D/g, '')) || 0;
      const numB = parseInt(b.bracket_code!.replace(/\D/g, '')) || 0;
      return numA - numB;
    });
  });

  const phases: BracketPhase[] = [
    { name: 'Octavos de Final', codePrefix: 'O', matches: groups['O'] },
    { name: 'Cuartos de Final', codePrefix: 'C', matches: groups['C'] },
    { name: 'Semifinales', codePrefix: 'S', matches: groups['S'] },
    { name: 'Final', codePrefix: 'F', matches: groups['F'] }
  ];

  // Return only phases that have matches
  return phases.filter(phase => phase.matches.length > 0);
}
