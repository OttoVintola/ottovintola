import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
// import ScatteredImages from './components/ScatteredImages';
import { Posts } from './components/Posts';
import PostPage from './pages/PostPage'; // Import the new PostPage component


const Layout = ({ children, showHeader = true }) => (
  <div className="min-h-screen bg-white text-black font-serif">
    {showHeader && (
      <header className="flex justify-between items-center text-sm md:text-base p-6 md:p-16">
        <h1 className="font-bold">
          <Link to="/" className="hover:underline">Otto Vintola</Link>
        </h1>
        <nav className="space-x-4">
          <Link to="/blog" className="hover:underline">Blog</Link>
          <Link to="/reading" className="hover:underline">Reading</Link>
          <Link to="/pictures" className="hover:underline">Pictures</Link>
        </nav>
      </header>
    )}
    <main className={!showHeader ? "" : "p-6 md:p-16 pt-4 md:pt-8"}>{children}</main>
  </div>
);

const PostLayout = ({ children }) => (
  <div className="min-h-screen bg-white text-black font-serif">
    <main>{children}</main>
  </div>
);

const Home = () => (
  <div className="relative">

    {/* Background Images 
    <div className="z-0">
      <ScatteredImages />
    </div> 
    */}

    <div className="z-10 relative text-4xl md:text-6xl leading-snug">
      <p className="mt-2 relative z-10">Wondering about artificial intelligence, computers, statistics, and photography.
        {/*
        <span className="relative inline-block px-2 z-10">
          <span className="relative z-10 italic text-blue-500">intelligence,</span>
          <span className="absolute top-1/2 left-1/2 w-20 h-20 bg-blue-200 rounded-full -translate-x-1/2 -translate-y-1/2 z-0 mix-blend-multiply"></span>
        </span>{""}
        <span className="relative inline-block px-2">
          <span className="relative z-10 italic text-green-500">computers</span>
          <span 
            className="absolute top-1/2 left-1/2 w-20 h-20 bg-green-200 
            -translate-x-1/2 -translate-y-1/2 z-0 mix-blend-multiply"
            style={{
              clipPath: "polygon(25% 0%, 75% 0%, 100% 50%, 75% 100%, 25% 100%, 0% 50%)"
            }}
          ></span>
        </span>{" "}
        and, {" "}
        <span className="relative inline-block px-2">
          <span className="relative z-10 italic text-red-500">statistics</span>
          <span className="absolute top-1/2 left-1/2 w-20 h-20 bg-red-200 rounded-full -translate-x-1/2 -translate-y-1/2 z-0 mix-blend-multiply"></span>
        </span>
        */}
      </p>
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
      <Routes>
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/blog" element={<Blog />} />
              <Route path="/reading" element={<Reading />} />
              <Route path="/pictures" element={<Pictures />} />
            </Routes>
          </Layout>
        } />
        <Route path="/post/:slug" element={<PostLayout><PostPage /></PostLayout>} />
      </Routes>
    </Router>
  );
}
