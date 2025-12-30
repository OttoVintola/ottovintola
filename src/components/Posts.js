import React, { useState, useEffect, useRef } from 'react'; // Added useRef
import { useNavigate, Link } from 'react-router-dom'; // Import useNavigate and Link
import matter from 'gray-matter';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { duotoneLight } from 'react-syntax-highlighter/dist/esm/styles/prism';
import * as ReactDOMClient from 'react-dom/client';
import Citation from './Citation'; // Import the Citation component



// Helper function to create a slug from a title (basic example)
const createSlug = (title) => {
  return title
    .toLowerCase()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^\w-]+/g, ''); // Remove non-word characters except hyphens
};

export const PostCard = ({ title, excerpt, image, date, slug }) => (
  <div className="overflow-hidden">
    <div className="flex">
      {/* Left: image thumbnail as link */}
  <Link to={`/post/${slug}`} className="shrink-0 w-36 h-36 sm:w-44 sm:h-44 bg-transparent overflow-hidden block">
        {image ? (
          <img src={image} alt={title} className="w-full h-full object-contain" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-400 text-sm">
            No image
          </div>
        )}
      </Link>
      {/* Right: text content */}
      <div className="p-4 sm:p-6 flex-1">
        <h3 className="text-xl font-bold mb-2">
          <Link to={`/post/${slug}`} className="hover:underline focus:underline">
            {title}
          </Link>
        </h3>
        {date && (
          <p className="text-gray-600 text-sm mb-2">
            {new Date(date).toLocaleDateString()}
          </p>
        )}
        {excerpt && <p className="text-gray-700">{excerpt}</p>}
      </div>
    </div>
  </div>
);

// Update PostContent to handle HTML content and trigger MathJax
export const PostContent = ({ content, bibData }) => {
  const contentRef = useRef(null);

  useEffect(() => {
    if (contentRef.current) {
      if (window.MathJax && window.MathJax.typesetPromise) {
        window.MathJax.startup.promise.then(() => {
          window.MathJax.typesetPromise([contentRef.current])
            .catch(err => console.error('MathJax.typesetPromise error in PostContent:', err));
        }).catch(err => console.error('MathJax.startup.promise error in PostContent:', err));
      } else {
        console.warn('MathJax not available in PostContent when content updated.');
      }
    }
  }, [content]);

  // Helper to render code blocks with SyntaxHighlighter
  const renderContent = () => {
    // Use a DOMParser to parse the HTML and replace <pre><code> blocks
    const parser = new window.DOMParser();
    const doc = parser.parseFromString(`<div>${content}</div>`, 'text/html');
    const codeBlocks = doc.querySelectorAll('pre > code');
    codeBlocks.forEach(codeNode => {
      const code = codeNode.textContent;
      const className = codeNode.className || '';
      const match = className.match(/language-(\w+)/);
      const language = match ? match[1] : '';
      // Create a wrapper div for React to mount the SyntaxHighlighter
      const wrapper = doc.createElement('div');
      wrapper.setAttribute('data-syntax-highlighter', 'true');
      // Store code and language as attributes for later hydration
      wrapper.setAttribute('data-code', encodeURIComponent(code));
      wrapper.setAttribute('data-language', language);
      codeNode.parentNode.replaceWith(wrapper);
    });
    return doc.body.innerHTML;
  };

  // Hydrate code blocks after rendering
  useEffect(() => {
    if (contentRef.current) {
      const wrappers = contentRef.current.querySelectorAll('[data-syntax-highlighter]');
      wrappers.forEach(wrapper => {
        const code = decodeURIComponent(wrapper.getAttribute('data-code'));
        const language = wrapper.getAttribute('data-language');
        if (!wrapper._root) {
          wrapper._root = ReactDOMClient.createRoot(wrapper);
        }
        // Render the copy button as part of the React tree
        wrapper._root.render(
          <div style={{ position: 'relative' }}>
            <button
              className="copy-btn"
              aria-label="Copy code to clipboard"
              style={{
                position: 'absolute',
                top: '-10px', // completely flush to top
                right: '-10px', // completely flush to right
                background: 'transparent',
                border: 'none',
                borderRadius: '0.25em',
                padding: 0,
                fontSize: '1.5em',
                cursor: 'pointer',
                zIndex: 10,
                opacity: 0.4,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '2.5em',
                height: '2.5em',
                transition: 'opacity 0.2s, background 0.2s, transform 0.15s cubic-bezier(.4,2,.6,1)',
                WebkitTapHighlightColor: 'transparent',
              }}
              onClick={e => {
                e.stopPropagation();
                navigator.clipboard.writeText(code);
                // Add click animation
                const btn = e.currentTarget;
                btn.classList.add('copy-btn-clicked');
                setTimeout(() => btn.classList.remove('copy-btn-clicked'), 150);
              }}
            >
              {/* SVG copy icon, larger */}
              <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect x="7" y="10" width="13" height="13" rx="2.5" fill="#e6f2ff" stroke="#222" strokeWidth="1.5"/>
                <rect x="11" y="5" width="13" height="13" rx="2.5" fill="#fff" stroke="#222" strokeWidth="1.5"/>
              </svg>
            </button>
            <SyntaxHighlighter
              language={language}
              style={duotoneLight}
              customStyle={{ 
                background: '#e8f0ff', 
                color: '#212121', 
                fontSize: '0.7em', 
                position: 'relative',
                margin: 0,
                padding: '1em'
              }}
              codeTagProps={{ 
                style: { 
                  background: '#e8f0ff', 
                  color: '#212121', 
                  fontSize: '1.1em',
                  display: 'block'
                } 
              }}
            >
              {code}
            </SyntaxHighlighter>
          </div>
        );
      });
    }
  }, [content]);

  // Hydrate citations
  useEffect(() => {
    if (contentRef.current && bibData) {
      const citationPlaceholders = contentRef.current.querySelectorAll('.citation-placeholder');
      citationPlaceholders.forEach(placeholder => {
        const key = placeholder.getAttribute('data-citation-key');
        const number = placeholder.getAttribute('data-citation-number');
        const entry = bibData.find(e => e.id === key);

        if (entry) {
          if (!placeholder._root) {
            placeholder._root = ReactDOMClient.createRoot(placeholder);
          }
          placeholder._root.render(<Citation number={number} bibData={entry} />);
        }
      });
    }
  }, [content, bibData]);

  // Add a little CSS for the copy button (optional, for hover effect)
  useEffect(() => {
    const styleId = 'copy-btn-style';
    if (!document.getElementById(styleId)) {
      const style = document.createElement('style');
      style.id = styleId;
      style.innerHTML = `
        .copy-btn {
          transition: transform 0.15s cubic-bezier(.4,2,.6,1);
        }
        .copy-btn:hover { background: #e6f2ff; border-color: #222; opacity: 1; }
        .copy-btn-clicked {
          transform: scale(0.95);
        }
      `;
      document.head.appendChild(style);
    }
  }, []);

  return (
    <div
      ref={contentRef}
      className="prose prose-neutral lg:prose prose-p:text-black prose-headings:text-black prose-strong:text-black mx-auto"
      dangerouslySetInnerHTML={{ __html: renderContent() }}
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
        let imageMap = {}; // Initialize with an empty object

        if (imagesResponse.ok) {
          try {
            const imageData = await imagesResponse.json();
            // Ensure imageData and imageData.images are valid before assignment
            if (imageData && typeof imageData.images === 'object' && imageData.images !== null) {
              imageMap = imageData.images;
            } else {
              console.warn('images.json was fetched but is not in the expected format (e.g., missing "images" object or "images" is not an object). Proceeding without post-specific images.');
            }
          } catch (e) {
            console.warn('Failed to parse images.json. Proceeding without post-specific images.', e);
          }
        } else {
          console.warn(`Failed to fetch images.json (status: ${imagesResponse.status}). Proceeding without post-specific images.`);
        }

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
              if (imageName) {
                image = `${process.env.PUBLIC_URL}/assets/${imageName}`; // Changed: Load from public/assets
              } else {
                console.warn(`Could not derive image name for ${filename} from ${firstImage}. Falling back.`);
                image = null; // Fallback to default image (now a string path from public/assets)
              }
            } else {
              image = null; // Fallback to default image (now a string path from public/assets)
            }
            return {
              ...data,
              content,
              image,
              slug,
            };
          })
        );
        // Sort posts by date in descending order
        postsData.sort((a, b) => new Date(b.date) - new Date(a.date));
        setPosts(postsData);
      } catch (error) {
        console.error('Error loading or processing markdown:', error);
      }
    };
     
    loadPosts();
  }, []);

  return (
    <div className="grid grid-cols-1 gap-6">
      {posts.map((post, index) => (
        <PostCard key={index} {...post} />
      ))}
    </div>
  );
};