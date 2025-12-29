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
import rehypeRaw from 'rehype-raw';


// remark-footnotes removed in favor of IEEE-style numbering via rehype-citation


const bibMap = {
    'quick-notes-on-finetuning-deep-learning-models': '../bibliography/finetuning.bib',
    'multilayer-perceptrons': '../bibliography/multilayer-perceptrons.bib',
    'the-tale-of-reusing-a-desktop-for-cuda-development': '../bibliography/Desktop.bib',
};

// Function to fetch markdown based on slug
async function fetchMarkdownBySlug(slug) {
  // Map slug to markdown file path
  const postMap = {
    'optimizing-sql-queries-for-speed': '/posts/advanced-sql-and-query-optimization.md',
    'teaching-the-advanced-programming-course': '/posts/programming.md',
    'quick-notes-on-finetuning-deep-learning-models': '/posts/finetuning-deep-learning-models.md',
    'multilayer-perceptrons': '/posts/multilayer-perceptrons.md',
    "bessels-correction": "/posts/bessels-correction.md",
    "the-tale-of-reusing-a-desktop-for-cuda-development": "/posts/the-tale-of-reusing-a-desktop-for-cuda-development.md"
  };

  // debug the postMap and file structure
  console.log('PostMap:', postMap);
  console.log('Slug:', slug);

  // log current public URL and path
  console.log('Public URL:', process.env.PUBLIC_URL);
  console.log('Post Path:', postMap[slug]);


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
    return u('text', '\\[' + node.value + '\\]'); // Output MathJax display delimiter
  }
};

const PostPage = () => {
  const { slug } = useParams();
  const [postMetadata, setPostMetadata] = useState(null);
  const [processedContent, setProcessedContent] = useState(null);
  const [bibliography, setBibliography] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  console.log('PostPage slug:', slug);
  useEffect(() => {
    const loadAndProcessPost = async () => {
      setLoading(true);
      setError(null);
      setPostMetadata(null);
      setProcessedContent(null);
      setBibliography(null);

      const markdownContent = await fetchMarkdownBySlug(slug);

      if (markdownContent) {
        try {
          const { data: metadata, content: rawMarkdown } = matter(markdownContent);
          setPostMetadata(metadata);

          // --- Fetch and Parse Bibliography ---
          let bibJsonData = null;
          const bibFile = bibMap[slug];
          if (bibFile) {
            const bibContent = await fetchBibliography(bibFile.split('/').pop());
            if (bibContent) {
              try {
                const citeObj = new Cite(bibContent);
                bibJsonData = citeObj.get(); // CSL-JSON array
                setBibliography(bibJsonData); // <-- Set bibliography state
              } catch (_) {
                console.warn('Failed to parse BibTeX for citations.');
              }
            }
          }
          // --- End Fetch and Parse Bibliography ---

          // Replace [@key] with a placeholder element for hydration
          let mdToRender = rawMarkdown;
          const citationKeys = Array.from(new Set(Array.from(mdToRender.matchAll(/\[@([^\]]+)\]/g), m => m[1])));
          
          citationKeys.forEach((key, i) => {
            // Replace with a placeholder span that we can target later
            mdToRender = mdToRender.replace(new RegExp(`\\[@${key}\\]`, 'g'), `<span class="citation-placeholder" data-citation-key="${key}" data-citation-number="${i + 1}"></span>`);
          });

          // --- Process Markdown using unified ---
          const processor = unified()
            .use(remarkParse)
            .use(remarkMath)
            .use(remarkGfm)
            .use(remarkRehype, { 
              handlers: remarkRehypeHandlers, 
              allowDangerousHtml: true
            })
            .use(rehypeRaw)
            .use(rehypeStringify);

          const file = await processor.process(mdToRender);
          let finalHtml = file.toString();

          // Append generated References if bibliography data exists
          if (bibJsonData && citationKeys.length) {
            const ordered = citationKeys
              .map(key => bibJsonData.find(e => e.id === key))
              .filter(Boolean);
            
            const bibHtmlRaw = new Cite(ordered).format('bibliography', { 
              format: 'html', 
              template: 'vancouver',
            });
            
            let entryIndex = 0;
            const bibHtmlWithIds = bibHtmlRaw.replace(/<div class="csl-entry">/g, match => {
              if (entryIndex < ordered.length) {
                const id = ordered[entryIndex].id;
                entryIndex++;
                return `<div class="csl-entry" id="ref-${id}">`;
              }
              return match;
            });

            // Add styles to prevent newlines in bibliography
            const bibStyles = `
              <style>
                .csl-entry {
                  display: flex;
                  align-items: baseline;
                  margin-bottom: 0.5em;
                }
                .csl-left-margin {
                  flex-shrink: 0;
                  padding-right: 0.5em;
                }
                .csl-right-inline {
                  flex-grow: 1;
                }
              </style>
            `;
            
            finalHtml += `<section><h2>References</h2>${bibStyles}${bibHtmlWithIds}</section>`;
          }
          setProcessedContent(finalHtml);

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
    return <div>Loading and processing post...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  if (!processedContent) {
    return <div>Post not found or failed to process.</div>;
  }

  return (
    <div className="post-page">
      {postMetadata && (
        <div className="bg-blue-950 text-gray-300 w-full py-12 absolute top-0 left-0 right-0">
          <div className="container mx-auto px-4">
            <h1 className="text-4xl font-bold mb-2">{postMetadata.title}</h1>
            <p className="text-lg mb-1">By Otto Vintola</p>
            {postMetadata.date && <p className="text-sm text-gray-400">Published on {new Date(postMetadata.date).toLocaleDateString()}</p>}
          </div>
        </div>
      )}
      <div className="container mx-auto px-4 py-8 mt-48">
        <PostContent content={processedContent} bibData={bibliography} />
      </div>
    </div>
  );
};

export default PostPage;
