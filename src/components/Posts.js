import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';
import remarkGfm from 'remark-gfm';
import matter from 'gray-matter';

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
    // In a real implementation, this would fetch markdown files from the posts directory
    // For now, we'll use a hardcoded example
    const fetchPosts = async () => {
      try {
        const response = await fetch('/posts/variational-autoencoders.md');
        const text = await response.text();
        const { data, content } = matter(text);
        setPosts([{ ...data, content }]);
      } catch (error) {
        console.error('Error loading posts:', error);
      }
    };

    fetchPosts();
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