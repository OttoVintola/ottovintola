import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css'; // For default styling
import 'tippy.js/themes/light.css'; // or any other theme

const Citation = ({ number, bibData }) => {
  if (!bibData) {
    return <span>[{number}]</span>;
  }

  const handleCitationClick = (e) => {
    e.preventDefault();
    const href = e.currentTarget.getAttribute('href');
    const element = document.getElementById(href.substring(1));
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      // Optional: Add a highlight effect
      element.style.transition = 'background-color 0.5s ease';
      element.style.backgroundColor = 'rgba(255, 255, 0, 0.3)';
      setTimeout(() => {
        element.style.backgroundColor = '';
      }, 2000);
    }
  };

  // Create a simple representation of the bibliography entry for the tooltip.
  // This can be customized to format the CSL-JSON data as needed.
  const formatBibData = (data) => {
    const authors = data.author ? data.author.map(a => {
      // Handle corporate authors (literal) vs personal authors (given/family)
      if (a.literal) return a.literal;
      const given = a.given || '';
      const family = a.family || '';
      return `${given} ${family}`.trim();
    }).filter(Boolean).join(', ') : '';
    const title = data.title || 'No title';
    const year = data.issued ? data.issued['date-parts'][0][0] : '';
    const container = data['container-title'] || '';
    const publisher = data.publisher || '';
    const url = data.URL || '';

    let formatted = '';
    if (authors) formatted += `${authors} `;
    if (year) formatted += `(${year}). `;
    formatted += `<em>${title}</em>. `;
    if (container) formatted += `${container}. `;
    if (publisher) formatted += `${publisher}. `;
    if (url) {
      const truncatedUrl = url.length > 50 ? url.substring(0, 50) + '...' : url;
      formatted += `<a href="${url}" target="_blank" rel="noopener noreferrer" style="word-break: break-all;">${truncatedUrl}</a>`;
    }
    
    return formatted.trim();
  };

  const tooltipContent = (
    <div className="text-left p-2" dangerouslySetInnerHTML={{ __html: formatBibData(bibData) }} />
  );

  return (
    <Tippy content={tooltipContent} theme="light" interactive={true} allowHTML={true} placement="top">
      <a href={`#ref-${bibData.id}`} onClick={handleCitationClick} className="text-gray-600 !no-underline">
        [{number}]
      </a>
    </Tippy>
  );
};

export default Citation;
