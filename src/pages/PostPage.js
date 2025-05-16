import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import matter from 'gray-matter';
import { PostContent } from '../components/Posts';

// Import unified and plugins
import { unified } from 'unified';
import remarkParse from 'remark-parse';
import remarkMath from 'remark-math';
import remarkGfm from 'remark-gfm';
import remarkRehype from 'remark-rehype';
import rehypeStringify from 'rehype-stringify';
import { Cite } from '@citation-js/core'; // Import citation-js
import '@citation-js/plugin-bibtex'; // Import the bibtex plugin
import '@citation-js/plugin-csl';  // Import CSL plugin for numeric bibliography
import { u } from 'unist-builder'; // Import unist-builder's u


// remark-footnotes removed in favor of IEEE-style numbering via rehype-citation


const bibMap = {
    'understanding-variational-autoencoders': '/bibliography/VAE.bib',
    'quick-notes-on-finetuning-deep-learning-models': '/bibliography/finetuning.bib',
    };

// Function to fetch markdown based on slug
async function fetchMarkdownBySlug(slug) {
  // Map slug to markdown file path
  const postMap = {
    'understanding-variational-autoencoders': '/posts/variational-autoencoders.md',
    'advanced-sql-and-query-optimization': '/posts/advanced-sql-and-query-optimization.md',
    'teaching-the-advanced-programming-course': '/posts/programming.md',
    'quick-notes-on-finetuning-deep-learning-models': '/posts/finetuning-deep-learning-models.md',

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

// Custom handlers for converting remark-math nodes to HAST
// This will output TeX wrapped in \\(...\\) and \\\[...\\\] for client-side MathJax
const remarkRehypeHandlers = {
  inlineMath: (h, node) => {
    return u('text', '\\(' + node.value + '\\)'); // Output MathJax inline delimiter
  },
  math: (h, node) => {
    return u('text', '\\\\[' + node.value + '\\\\]'); // Output MathJax display delimiter
  }
};

const PostPage = () => {
  const { slug } = useParams();
  const [postMetadata, setPostMetadata] = useState(null);
  const [processedContent, setProcessedContent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log('PostPage slug:', slug);
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
          setPostMetadata(metadata);

          // --- Fetch and Parse Bibliography ---
          // Load BibTeX and convert to CSL-JSON if available
          let bibJsonData = null;
          let bibContent = null;
          const bibFile = bibMap[slug];
          if (bibFile) {
            bibContent = await fetchBibliography(bibFile.split('/').pop());
            if (bibContent) {
              try {
                const citeObj = new Cite(bibContent);
                bibJsonData = citeObj.get(); // CSL-JSON array
              } catch (_) {
                console.warn('Failed to parse BibTeX for citations.');
              }
            }
          }
          // --- End Fetch and Parse Bibliography ---

          // Manual citation numbering in markdown: replace [@key] with [n]
          let mdToRender = rawMarkdown;
          const citationKeys = Array.from(mdToRender.matchAll(/\[@([^\]]+)\]/g), m => m[1]);
          const uniqueKeys = Array.from(new Set(citationKeys));
          uniqueKeys.forEach((key, i) => {
            mdToRender = mdToRender.replace(new RegExp(`\\[@${key}\\]`, 'g'), `[${i + 1}]`);
          });

          // --- Process Markdown using unified ---
          console.log('Setting up processor...');
          const processor = unified()
            .use(remarkParse)
            .use(remarkMath) // Identifies math syntax
            .use(remarkGfm)
            .use(remarkRehype, { 
              handlers: remarkRehypeHandlers, 
              allowDangerousHtml: true // Important if handlers were to produce raw HTML, though here we produce text nodes
            }) // Convert to HTML, using custom handlers for math
            .use(rehypeStringify);

          // Process markdown to get HTML
          console.log('Processing markdown to HTML...');
          const file = await processor.process(mdToRender);
          console.log('Processing complete.');

          let finalHtml = file.toString();
          // Append generated References if bibliography data exists
          if (bibJsonData && uniqueKeys.length) {
            // Order entries by appearance
            const ordered = uniqueKeys
              .map(key => bibJsonData.find(e => e.id === key))
              .filter(Boolean);
            // Use numeric Vancouver style for bibliography (matches [n] citations)
            const bibHtmlRaw = new Cite(ordered).format('bibliography', { format: 'html', template: 'vancouver' });
            // Post-process to remove unwanted line breaks after citation numbers
            const pattern = new RegExp("(\\\\d+\\\\.)\\\\s*<br\\\\s*/?\\s*>", "gi");
            const bibHtml = bibHtmlRaw.replace(pattern, '$1 ');
            finalHtml += `<section><h2>References</h2>${bibHtml}</section>`;
          }
          setProcessedContent(finalHtml);
          // --- End Process Markdown ---

          // REMOVED MathJax call from here, PostContent will handle it.
          // if (window.MathJax && window.MathJax.typesetPromise) {
          //   window.MathJax.typesetPromise();
          // } else {
          //   console.warn('MathJax or typesetPromise not available to re-render math.');
          // }

        } catch (processError) {
          console.error('Error in loadAndProcessPost catch block:', processError);
          setError('Failed to process post content: ' + processError.message);
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

  // Pass the HTML string content to PostContent
  return (
    <div className="container mx-auto px-4 py-8">
      {/* Optional: Display title from metadata
      {postMetadata?.title && <h1 className="text-3xl font-bold mb-4 text-center">{postMetadata.title}</h1>} */}
      <PostContent content={processedContent} />
    </div>
  );
};

export default PostPage;
