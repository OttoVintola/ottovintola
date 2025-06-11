import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// import ScatteredImages from './components/ScatteredImages';
import { Posts } from './components/Posts';
import PostPage from './pages/PostPage'; // Import the new PostPage component


const Layout = ({ children }) => (
  <div className="min-h-screen bg-white text-black font-serif p-6 md:p-16">
    <header className="flex justify-between items-center text-sm md:text-base">
      <h1 className="font-bold">
        <Link to="/" className="hover:underline">Otto Vintola</Link>
      </h1>
      <nav className="space-x-4">
        <Link to="/blog" className="hover:underline">Blog</Link>
        <Link to="/reading" className="hover:underline">Reading</Link>
        <Link to="/pictures" className="hover:underline">Pictures</Link>
      </nav>
    </header>
    <main className="mt-16 md:mt-32">{children}</main>
  </div>
);

const Home = () => (
  <div className="relative">

    {/* Background Images 
    <div className="z-0">
      <ScatteredImages />
    </div> */}

    {/* Text in front */}
    <div className="z-10 relative text-4xl md:text-6xl leading-snug">
      <p>Hello.</p>
      <p className="mt-2 relative z-10">I am fascinated by creating machine intelligence through{" "}
        <span className="relative inline-block px-2 z-10">
          <span className="relative z-10 italic text-blue-500">statistics,</span>
          <span className="absolute top-1/2 left-1/2 w-20 h-20 bg-blue-200 rounded-full -translate-x-1/2 -translate-y-1/2 z-0 mix-blend-multiply"></span>
        </span>{""}
      
        <span className="relative inline-block px-2">
          <span className="relative z-10 italic text-green-500">deep</span>
          <span 
            className="absolute top-1/2 left-1/2 w-20 h-20 bg-green-200 
            -translate-x-1/2 -translate-y-1/2 z-0 mix-blend-multiply"
            style={{
              clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
            }}
          ></span>
        </span>{" "}
        learning, and {" "}
        <span className="relative inline-block px-2">
          <span className="relative z-10 italic text-red-500">parallelization.</span>
          <span className="absolute top-1/2 left-1/2 w-20 h-20 bg-red-200 rounded-full -translate-x-1/2 -translate-y-1/2 z-0 mix-blend-multiply"></span>
        </span>

      </p>

      {/* Description and Links */}
      <p className="mt-6 text-base md:text-lg text-gray-600 max-w-2xl z-20">
        I can be contacted on{" "}
        <a href="https://www.linkedin.com/in/otto-vintola-45091b214" className="underline">LinkedIn</a>
        , or{ " "}
        <a href="https://www.youtube.com/@ottovintola" className="underline">YouTube</a>.
      </p>

      {/* Tilted Rectangle */}
      <div className="absolute bottom-10 right-10 w-64 h-40 bg-blue-100 rotate-[6deg] z-0 rounded-lg shadow-md"></div>
    </div>

    {/* Featured Posts Section */}
    <div className="mt-32 relative z-10">
      <h2 className="text-3xl font-bold mb-12">My Thoughts</h2>
      <Posts />
    </div>
  </div>
);

const Blog = () => (
  <div>
    <h1 className="text-4xl font-bold mb-12">Blog</h1>
    <Posts />
  </div>
);

const Reading = () => <div className="text-2xl">Reading recommendations coming soon...</div>;
const Pictures = () => <div className="text-2xl">Picture gallery coming soon...</div>;

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/reading" element={<Reading />} />
          <Route path="/pictures" element={<Pictures />} />
          {/* Add the route for individual posts */}
          <Route path="/post/:slug" element={<PostPage />} /> 
        </Routes>
      </Layout>
    </Router>
  );
}
