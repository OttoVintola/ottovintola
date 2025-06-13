import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';
import reportWebVitals from './reportWebVitals';

const { search, hash } = window.location;

// Handle SPA redirect logic for GitHub Pages
// Checks if the current URL's search string was modified by the 404.html redirect script
if (search.startsWith('?/')) {
  // Extract the actual path and any original query parameters from the search string
  let newPathAndQuery = search.substring(2); // Remove the leading '?/'
  let newPath = '';
  let newSearch = '';

  const querySeparatorIndex = newPathAndQuery.indexOf('&');

  if (querySeparatorIndex !== -1) {
    newPath = '/' + newPathAndQuery.substring(0, querySeparatorIndex); // Prepend '/' to make it a valid path
    newSearch = '?' + newPathAndQuery.substring(querySeparatorIndex + 1);
  } else {
    newPath = '/' + newPathAndQuery; // Prepend '/'
    // newSearch remains empty if there were no original query params
  }

  if (newPath) {
    // Use history.replaceState to update the URL path without a page reload.
    // BrowserRouter will then pick up this corrected path.
    window.history.replaceState(null, '', newPath + newSearch + hash);
  }
}

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();
