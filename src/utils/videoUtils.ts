export function getEmbedUrl(url: string, parentHostname: string = 'localhost'): string | null {
  if (!url) return null;

  try {
    const parsedUrl = new URL(url);
    
    // YouTube
    if (parsedUrl.hostname.includes('youtube.com') || parsedUrl.hostname.includes('youtu.be')) {
      let videoId = '';
      if (parsedUrl.hostname.includes('youtu.be')) {
        videoId = parsedUrl.pathname.slice(1);
      } else if (parsedUrl.pathname.includes('/shorts/')) {
        videoId = parsedUrl.pathname.split('/shorts/')[1];
      } else if (parsedUrl.pathname.includes('/live/')) {
        videoId = parsedUrl.pathname.split('/live/')[1];
      } else {
        videoId = parsedUrl.searchParams.get('v') || '';
      }
      return videoId ? `https://www.youtube.com/embed/${videoId}?autoplay=1` : null;
    }

    // Twitch
    if (parsedUrl.hostname.includes('twitch.tv')) {
      const parts = parsedUrl.pathname.split('/').filter(Boolean);
      if (parts[0] === 'videos' && parts[1]) {
        return `https://player.twitch.tv/?video=${parts[1]}&parent=${parentHostname}&autoplay=true`;
      } else if (parts[0]) {
        return `https://player.twitch.tv/?channel=${parts[0]}&parent=${parentHostname}&autoplay=true`;
      }
    }
  } catch (error) {
    console.error("Invalid URL format:", url);
    return null;
  }
  return url;
}
