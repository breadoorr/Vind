
const API_KEY = import.meta.env.VITE_YOUTUBE_API_KEY;
const API_BASE = 'https://www.googleapis.com/youtube/v3';

export async function searchVideos(query = 'popular', pageToken = '') {
    console.log(API_KEY);
  if (!API_KEY) {
    throw new Error('Add YOUTUBE_API_KEY to your .env file.');
  }

  const params = new URLSearchParams({
    key: API_KEY,
    part: 'snippet',
    type: 'video',
    maxResults: '24',
    q: query || 'popular',
    order: 'relevance',
    pageToken
  });

  const response = await fetch(`${API_BASE}/search?${params}`);
  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error?.message || 'YouTube search failed.');
  }

  const ids = data.items.map(item => item.id.videoId).join(',');

  if (!ids) {
    return { videos: [], nextPageToken: data.nextPageToken };
  }

  const statsParams = new URLSearchParams({
    key: API_KEY,
    part: 'snippet,statistics,contentDetails',
    id: ids
  });

  const statsResponse = await fetch(`${API_BASE}/videos?${statsParams}`);
  const statsData = await statsResponse.json();

  if (!statsResponse.ok) {
    throw new Error(statsData.error?.message || 'Could not load video details.');
  }

  const videos = statsData.items.map(video => ({
    id: video.id,
    title: video.snippet.title,
    creator: video.snippet.channelTitle,
    description: video.snippet.description || '',
    thumbnail:
      video.snippet.thumbnails.maxres?.url ||
      video.snippet.thumbnails.high?.url ||
      video.snippet.thumbnails.medium?.url,
    url: `https://www.youtube.com/watch?v=${video.id}`,
    platform: 'YouTube',
    publishedAt: video.snippet.publishedAt,
    views: Number(video.statistics?.viewCount || 0),
    likes: video.statistics?.likeCount == null
      ? null
      : Number(video.statistics.likeCount),
    duration: video.contentDetails?.duration || ''
  }));

  return {
    videos,
    nextPageToken: data.nextPageToken || ''
  };
}
