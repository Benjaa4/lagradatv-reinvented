import React from 'react';
import { Match } from '../../../types';
import { GlassCard } from '../../../components/ui/GlassCard';

interface BilateralBracketProps {
  matches: Match[];
}

export const BilateralBracket: React.FC<BilateralBracketProps> = ({ matches }) => {
  // Simple structure for demonstration. In a real scenario, this would use a complex tree algorithm.
  const octavosLeft = matches.filter(m => m.bracket_code?.startsWith('O') && parseInt(m.bracket_code.charAt(1)) <= 4);
  const octavosRight = matches.filter(m => m.bracket_code?.startsWith('O') && parseInt(m.bracket_code.charAt(1)) > 4);
  const cuartosLeft = matches.filter(m => m.bracket_code?.startsWith('C') && parseInt(m.bracket_code.charAt(1)) <= 2);
  const cuartosRight = matches.filter(m => m.bracket_code?.startsWith('C') && parseInt(m.bracket_code.charAt(1)) > 2);
  const semiLeft = matches.find(m => m.bracket_code === 'S1');
  const semiRight = matches.find(m => m.bracket_code === 'S2');
  const final = matches.find(m => m.bracket_code === 'F1');

  const MatchNode = ({ match }: { match?: Match }) => {
    if (!match) return <div className="w-32 h-16 bg-white/5 border border-white/5 rounded-xl border-dashed" />;
    const isLive = match.status === 'live';
    return (
      <GlassCard className={`relative w-40 p-2 text-xs flex flex-col justify-center border ${isLive ? 'border-danger shadow-[0_0_15px_rgba(255,51,102,0.4)]' : 'border-white/10'}`}>
        {isLive && <div className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full animate-ping" />}
        <div className="flex justify-between items-center py-1 border-b border-white/5">
          <span className="font-bold text-white truncate">{match.home_team_id}</span>
          <span className="text-primary font-mono bg-black/50 px-1.5 rounded">{match.home_score}</span>
        </div>
        <div className="flex justify-between items-center py-1">
          <span className="font-bold text-white truncate">{match.away_team_id}</span>
          <span className="text-primary font-mono bg-black/50 px-1.5 rounded">{match.away_score}</span>
        </div>
      </GlassCard>
    );
  };

  return (
    <div className="w-full overflow-x-auto custom-scrollbar pb-8">
      <div className="min-w-[1000px] flex justify-between items-center gap-4 relative">
        
        {/* Left Side */}
        <div className="flex gap-8 items-center">
          <div className="flex flex-col gap-4">
             {octavosLeft.map((m, i) => <MatchNode key={i} match={m} />)}
             {octavosLeft.length === 0 && Array.from({length:4}).map((_,i)=><MatchNode key={i} />)}
          </div>
          <div className="flex flex-col gap-16">
             {cuartosLeft.map((m, i) => <MatchNode key={i} match={m} />)}
             {cuartosLeft.length === 0 && Array.from({length:2}).map((_,i)=><MatchNode key={i} />)}
          </div>
          <div className="flex flex-col gap-0">
             <MatchNode match={semiLeft} />
          </div>
        </div>

        {/* Center / Final */}
        <div className="flex flex-col items-center justify-center mx-4">
          <div className="text-primary font-black tracking-widest text-lg mb-4 text-shadow-glow">FINAL STAGE</div>
          <GlassCard className="p-4 border-2 border-primary/50 shadow-[0_0_30px_rgba(0,255,136,0.2)] bg-gradient-to-b from-primary/10 to-transparent w-64 transform scale-110">
            {final ? (
              <div className="flex flex-col gap-4">
                <div className="text-center font-bold text-xl text-white">{final.home_team_id}</div>
                <div className="flex justify-center items-center gap-4">
                  <span className="text-2xl font-black text-primary">{final.home_score}</span>
                  <span className="text-xs bg-danger text-white px-2 py-0.5 rounded-full font-bold">VS</span>
                  <span className="text-2xl font-black text-primary">{final.away_score}</span>
                </div>
                <div className="text-center font-bold text-xl text-white">{final.away_team_id}</div>
              </div>
            ) : (
              <div className="text-center text-gray-400 py-6 font-bold">Final Por Definir</div>
            )}
          </GlassCard>
        </div>

        {/* Right Side */}
        <div className="flex gap-8 items-center flex-row-reverse">
          <div className="flex flex-col gap-4">
             {octavosRight.map((m, i) => <MatchNode key={i} match={m} />)}
             {octavosRight.length === 0 && Array.from({length:4}).map((_,i)=><MatchNode key={i} />)}
          </div>
          <div className="flex flex-col gap-16">
             {cuartosRight.map((m, i) => <MatchNode key={i} match={m} />)}
             {cuartosRight.length === 0 && Array.from({length:2}).map((_,i)=><MatchNode key={i} />)}
          </div>
          <div className="flex flex-col gap-0">
             <MatchNode match={semiRight} />
          </div>
        </div>

      </div>
    </div>
  );
};
