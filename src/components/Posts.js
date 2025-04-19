import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import ReactMarkdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeMathjax from 'rehype-mathjax';
import remarkGfm from 'remark-gfm';
import matter from 'gray-matter';
import remarkCite from '@benrbray/remark-cite'; // Import remarkCite
// Remove the path import
// import path from 'path'; 

// Import images
import vaeImage from '../assets/vae.png';

// Helper function to create a slug from a title (basic example)
const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w-]+/g, ''); // Remove non-word characters except hyphens
};

export const PostCard = ({ title, excerpt, image, date, onClick }) => (
  <div 
    onClick={onClick}
    className="cursor-pointer bg-white rounded-xl shadow-lg overflow-hidden transform transition hover:scale-105 hover:shadow-xl"
  >
    <div className="h-48 overflow-hidden">
      <img src={image} alt={title} className="w-full h-full object-contain" />
    </div>
    <div className="p-6">
      <h3 className="text-xl font-bold mb-2">{title}</h3>
      <p className="text-gray-600 text-sm mb-2">{new Date(date).toLocaleDateString()}</p>
      <p className="text-gray-700">{excerpt}</p>
    </div>
  </div>
);

// Update PostContent to handle HTML content
export const PostContent = ({ content }) => {
  return (
    <div 
      className="prose lg:prose-xl mx-auto"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export const Posts = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const loadPosts = async () => {
      const postPath = '/posts/variational-autoencoders.md';
      try {
        console.log('Fetching markdown from public path:', postPath);
        const response = await fetch(`${process.env.PUBLIC_URL}${postPath}`);
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status} fetching ${postPath}`);
        }
        const markdownContent = await response.text();
        console.log('Fetched markdown content successfully.');

        const { data, content } = matter(markdownContent);
        // Add a slug to the post object
        const slug = createSlug(data.title || 'untitled'); 
        const post = {
          ...data,
          content, // Keep content for potential future use, but not needed for card display
          image: vaeImage,
          slug: slug, // Add the generated slug
        };
        console.log('Created post object:', post);
        setPosts([post]);
      } catch (error) {
        console.error('Error loading or processing markdown:', error);
      }
    };

    loadPosts();
  }, []);

  // Handle navigation in the onClick handler
  const handlePostClick = (slug) => {
    navigate(`/post/${slug}`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
      {posts.map((post, index) => (
        <PostCard
          key={index}
          {...post} // Pass all post data including slug (though PostCard doesn't use it)
          // Update onClick to navigate using the post's slug
          onClick={() => handlePostClick(post.slug)} 
        />
      ))}
    </div>
  );
};