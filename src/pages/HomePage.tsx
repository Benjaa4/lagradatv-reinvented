import React from 'react';
import { HeroBanner } from '../features/home/HeroBanner';
import { LiveMatchesSection } from '../features/home/LiveMatchesSection';
import { FeaturedTournaments } from '../features/home/FeaturedTournaments';
import { BracketPreview } from '../features/home/BracketPreview';
import { LatestVideos } from '../features/home/LatestVideos';

export const HomePage: React.FC = () => {
  return (
    <div className="space-y-16 lg:space-y-24">
      <HeroBanner />
      <LiveMatchesSection />
      <FeaturedTournaments />
      <BracketPreview />
      <LatestVideos />
    </div>
  );
};
