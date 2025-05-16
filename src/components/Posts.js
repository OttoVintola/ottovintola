import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import { useNavigate } from 'react-router-dom'; // Import useNavigate
import matter from 'gray-matter';


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

// Update PostContent to handle HTML content and trigger MathJax
export const PostContent = ({ content }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.startup.promise.then(() => {
          console.log('MathJax ready in PostContent, typesetting element:', contentRef.current);
          window.MathJax.typesetPromise([contentRef.current])
            .catch(err => console.error('MathJax.typesetPromise error in PostContent:', err));
        }).catch(err => console.error('MathJax.startup.promise error in PostContent:', err));
      } else {
        console.warn('MathJax not available in PostContent when content updated.');
      }
    }
  }, [content]); // Re-run when content changes

  return (
    <div
      ref={contentRef}
      className="prose lg:prose-xl mx-auto text-black"
      dangerouslySetInnerHTML={{ __html: content }}
    />
  );
};

export const Posts = () => {
  const [posts, setPosts] = useState([]);
  const navigate = useNavigate(); // Hook for navigation

  useEffect(() => {
    const loadPosts = async () => {
      try {
        // Fetch the list of post filenames first
        const response = await fetch(`${process.env.PUBLIC_URL}/posts/posts.json`);
        if (!response.ok) {
          throw new Error('Failed to fetch posts.json');
        }
        const { posts: postFiles } = await response.json();

        // Fetch the image mappings
        const imagesResponse = await fetch(`${process.env.PUBLIC_URL}/posts/images.json`);
        if (!imagesResponse.ok) {
          throw new Error('Failed to fetch images.json');
        }
        const { images: imageMap } = await imagesResponse.json();

        // Then load all posts
        const postsData = await Promise.all(
          postFiles.map(async (filename) => {
            const postPath = `/posts/${filename}`;
            const response = await fetch(`${process.env.PUBLIC_URL}${postPath}`);
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status} fetching ${postPath}`);
            }
            const markdownContent = await response.text();
            const { data, content } = matter(markdownContent);
            const slug = createSlug(data.title || 'untitled');
            
            // Get the image for this post from the imageMap
            const postImages = imageMap[filename] || [];
            const firstImage = postImages[0]; // Use the first image if available
            
            let image;
            if (firstImage) {
              const imageName = firstImage.split('/').pop(); // Get just the filename
              try {
                image = require(`../assets/${imageName}`);
              } catch (e) {
                console.warn(`Could not load image for ${filename}:`, e);
                image = vaeImage; // Fallback to default image
              }
            } else {
              image = vaeImage; // Fallback to default image
            }
            return {
              ...data,
              content,
              image,
              slug,
            };
          })
        );
        setPosts(postsData);
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