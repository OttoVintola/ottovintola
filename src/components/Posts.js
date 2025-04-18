import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';
import remarkGfm from 'remark-gfm';
import matter from 'gray-matter';

// Import images
import vaeImage from '../assets/vae.png';

// Import markdown content as raw text
import vaePostContent from '../posts/variational-autoencoders.md';

export const PostCard = ({ title, excerpt, image, date, onClick }) => (
  <div 
    onClick={onClick}
    className="cursor-pointer bg-white rounded-xl shadow-lg overflow-hidden transform transition hover:scale-105 hover:shadow-xl"
  >
    <div className="h-48 overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-cover" />
    </div>
    <div className="p-6">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-2">{new Date(date).toLocaleDateString()}</p>
      <p className="text-gray-700">{excerpt}</p>
    </div>
  </div>
);

export const PostContent = ({ markdown }) => (
  <div className="prose lg:prose-xl mx-auto">
    <ReactMarkdown 
      remarkPlugins={[remarkMath, remarkGfm]}
      rehypePlugins={[rehypeMathjax]}
    >
      {markdown}
    </ReactMarkdown>
  </div>
);

export const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [selectedPost, setSelectedPost] = useState(null);

  useEffect(() => {
    const loadPosts = () => {
      try {
        const { data, content } = matter(vaePostContent);
        const post = {
          ...data,
          content,
          image: vaeImage // Use imported image directly
        };
        setPosts([post]);
      } catch (error) {
        console.error('Error loading posts:', error);
      }
    };

    loadPosts();
  }, []);

  if (selectedPost) {
    return (
      <div>
        <button 
          onClick={() => setSelectedPost(null)}
          className="mb-8 text-blue-500 hover:text-blue-700"
        >
          ← Back to all posts
        </button>
        <PostContent markdown={selectedPost.content} />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post, index) => (
        <PostCard
          key={index}
          {...post}
          onClick={() => setSelectedPost(post)}
        />
      ))}
    </div>
  );
};