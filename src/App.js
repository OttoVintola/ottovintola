import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";

const Layout = ({ children }) => (
  <div className="min-h-screen bg-white text-black font-serif p-6 md:p-16">
    <header className="flex justify-between items-center text-sm md:text-base">
      <h1 className="font-bold">Otto Vintola</h1>
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
  <div className="relative text-4xl md:text-6xl leading-snug">
    <p>Hello! My name is Otto Vintola.</p>
    <p>I am a dreamer, concerned with making machines learn through 
      <span className="text-blue-500 italic relative px-3">
          patterns
        <span className="absolute -z-10 top-1/2 left-1/2 w-16 h-16 bg-blue-200 rounded-full -translate-x-1/2 -translate-y-1/2"></span>
      </span>
      and 
      <span className="text-green-500 italic relative px-2">
          abstraction
        <span className="absolute -z-10 top-1/2 left-1/2 w-16 h-16 bg-blue-200 rounded-full -translate-x-1/2 -translate-y-1/2"></span>
      </span>
      by weaving chaos with the resonance of observations.
    </p>
    <p className="mt-4 text-base md:text-lg text-gray-600">
      Learn <a href="#about" className="underline">about</a> me, contact me on
      <a href="mailto:otto@example.com" className="underline mx-1">email</a>,
      <a href="https://instagram.com" className="underline mx-1">Instagram</a>,
      <a href="https://linkedin.com" className="underline mx-1">LinkedIn</a>,
      or check out my featured work below ↓
    </p>
    <div className="absolute bottom-0 right-0 w-64 h-32 bg-blue-100 rotate-3 -z-10"></div>
  </div>
);

const Blog = () => <div className="text-2xl">Blog coming soon...</div>;
const Reading = () => <div className="text-2xl">Book recommendations coming soon...</div>;
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
        </Routes>
      </Layout>
    </Router>
  );
}
