import React, { useEffect, useState } from 'react';

// A simple card similar in layout to PostCard
const VideoCard = ({ id, title, publishedAt }) => {
  const videoUrl = `https://www.youtube.com/watch?v=${id}`;
  // Try highest quality 16:9 first, then gracefully fall back
  const candidates = [
    `https://i.ytimg.com/vi/${id}/maxresdefault.jpg`,
    `https://i.ytimg.com/vi/${id}/sddefault.jpg`,
    `https://i.ytimg.com/vi/${id}/hqdefault.jpg`, // 4:3 but may be better than mq for some videos
    `https://i.ytimg.com/vi/${id}/mqdefault.jpg`,
    `https://i.ytimg.com/vi/${id}/default.jpg`,
  ];
  const [idx, setIdx] = useState(0);
  const thumb = candidates[Math.min(idx, candidates.length - 1)];

  return (
    <div className="overflow-hidden">
      <div className="flex">
        {/* Left: thumbnail as link */}
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="shrink-0 w-36 sm:w-44 aspect-video bg-transparent overflow-hidden block"
        >
          {thumb ? (
            <img
              src={thumb}
              alt={title}
              className="w-full h-full object-cover"
              onError={(e) => {
                // Advance to next candidate on error
                setIdx((prev) => (prev + 1 < candidates.length ? prev + 1 : prev));
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
              No image
            </div>
          )}
        </a>
        {/* Right: text content */}
        <div className="p-4 sm:p-6 flex-1">
          <h3 className="text-xl font-bold mb-2">
            <a href={videoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline focus:underline">
              {title}
            </a>
          </h3>
          {publishedAt && (
            <p className="text-gray-600 text-sm mb-2">
              {new Date(publishedAt).toLocaleDateString()}
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export const Videos = () => {
  const [videos, setVideos] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadVideos = async () => {
      try {
        const res = await fetch(`${process.env.PUBLIC_URL}/videos/videos.json`);
        if (!res.ok) {
          throw new Error(`Failed to fetch videos.json (status: ${res.status})`);
        }
        const data = await res.json();
        let items = Array.isArray(data) ? data : data.videos || [];

        // Normalize and sort
        const normalized = items
          .map((v) => ({
            id: v.id,
            title: v.title || 'Untitled',
            thumbnail: v.thumbnail,
            publishedAt: v.publishedAt || v.published_at || v.date,
          }))
          .filter((v) => v.id && v.title);

        normalized.sort((a, b) => new Date(b.publishedAt || 0) - new Date(a.publishedAt || 0));
        setVideos(normalized);
      } catch (e) {
        console.error('Error loading videos:', e);
        setError('Unable to load videos at the moment.');
      }
    };

    loadVideos();
  }, []);

  if (error) {
    return <div className="text-sm text-red-600">{error}</div>;
  }

  if (!videos.length) {
    return <div className="text-sm text-gray-600">No videos yet.</div>;
  }

  return (
    <div className="grid grid-cols-1 gap-6">
      {videos.map((video) => (
        <VideoCard key={video.id} {...video} />
      ))}
    </div>
  );
};
