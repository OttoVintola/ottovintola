import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import matter from 'gray-matter';
import { PostContent } from '../components/Posts';
import * as runtime from 'react/jsx-runtime';

// Import unified and plugins
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import rehypeMathjax from 'rehype-mathjax';
import rehypeCitation from 'rehype-citation';
import rehypeReact from 'rehype-react';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';

// Function to fetch markdown based on slug
async function fetchMarkdownBySlug(slug) {
  // Map slug to markdown file path
  const postMap = {
    'understanding-variational-autoencoders': '/posts/variational-autoencoders.md'
    // Add other posts here
  };
  const postPath = postMap[slug];
  if (!postPath) return null;

  try {
    const response = await fetch(`${process.env.PUBLIC_URL}${postPath}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.text();
  } catch (error) {
    console.error(`Error fetching markdown ${postPath}:`, error);
    return null;
  }
}

// Function to fetch bibliography content
async function fetchBibliography(bibFileName) {
  const bibPath = `/bibliography/${bibFileName}`;
  try {
    const response = await fetch(`${process.env.PUBLIC_URL}${bibPath}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    return await response.text();
  } catch (error) {
    console.error(`Error fetching bibliography ${bibPath}:`, error);
    return null; // Return null if fetching fails
  }
}

const PostPage = () => {
  const { slug } = useParams(); // Get the slug from the URL
  const [postMetadata, setPostMetadata] = useState(null); // For frontmatter
  const [processedContent, setProcessedContent] = useState(null); // Store processed content
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Parse BibTeX entries manually
  function parseBibTeX(bibContent) {
    const entries = {};
    const entryRegex = /@(\w+){([^,]+),([^@]+)}/g;
    let match;

    while ((match = entryRegex.exec(bibContent))) {
      const [_, type, key, content] = match;
      const fields = {};
      
      // Parse individual fields
      const fieldContent = content.trim();
      const fieldRegex = /(\w+)\s*=\s*{([^}]+)}/g;
      let fieldMatch;
      
      while ((fieldMatch = fieldRegex.exec(fieldContent))) {
        const [__, fieldName, fieldValue] = fieldMatch;
        fields[fieldName] = fieldValue;
      }

      entries[key] = {
        type,
        ...fields,
        id: key // Important: id must match the citation key
      };
    }
    
    return entries;
  }

  useEffect(() => {
    const loadAndProcessPost = async () => {
      setLoading(true);
      setError(null);
      setPostMetadata(null);
      setProcessedContent(null);

      const markdownContent = await fetchMarkdownBySlug(slug);

      if (markdownContent) {
        try {
          const { data: metadata, content: rawMarkdown } = matter(markdownContent);
          setPostMetadata(metadata); // Store frontmatter

          // --- Fetch and Parse Bibliography ---
          let bibliography = null;
          if (slug === 'understanding-variational-autoencoders') { 
            const bibContent = await fetchBibliography('VAE.bib');
            if (bibContent) {
              try {
                console.log('Parsing BibTeX content...');
                bibliography = parseBibTeX(bibContent);
                console.log('Bibliography parsed:', bibliography);
              } catch (parseError) {
                console.error('Error parsing bibliography:', parseError);
              }
            }
          }

          // --- Process Markdown using unified ---
          console.log('Setting up processor...');
          const processor = unified()
            .use(remarkParse)
            .use(remarkMath)
            .use(remarkGfm)
            .use(remarkRehype)
            .use(rehypeMathjax);

          // Add rehype-citation if bibliography exists
          if (bibliography) {
            console.log('Adding rehype-citation with parsed bibliography');
            processor.use(rehypeCitation, {
              bibliography,
              suppressBibliography: false // Set to false to generate a bibliography section
            });
          }

          processor.use(rehypeStringify); // Add stringify to compile to HTML

          // Process markdown to get HTML
          console.log('Processing markdown to HTML...');
          const result = await processor.process(rawMarkdown);
          console.log('Processing complete.');
          
          // Set the HTML string as content
          setProcessedContent(result.toString());
          // --- End Process Markdown ---

        } catch (processError) {
          // Log the specific error before setting state
          console.error('Error in loadAndProcessPost catch block:', processError);
          setError('Failed to process post content.');
        }
      } else {
        setError('Post not found.');
      }
      setLoading(false);
    };

    loadAndProcessPost();
  }, [slug]);

  if (loading) {
    return <div>Loading and processing post...</div>; // Updated loading message
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!processedContent) { // Check for processed content instead of post
    return <div>Post not found or failed to process.</div>; 
  }

  // Pass the processed React content to PostContent
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Optional: Display title from metadata 
      {postMetadata?.title && <h1 className="text-3xl font-bold mb-4">{postMetadata.title}</h1>} */}
      <PostContent content={processedContent} /> 
    </div>
  );
};

export default PostPage;
