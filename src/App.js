import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import { Posts } from './components/Posts';
import { Videos } from './components/Videos';
import PostPage from './pages/PostPage'; // Import the new PostPage component


const Layout = ({ children, showHeader = true }) => (
  <div className="min-h-screen bg-white text-black">
    {showHeader && (
      <header className="py-6 md:py-8">
        <div className="max-w-4xl lg:max-w-5xl mx-auto px-3 sm:px-4 lg:px-8 flex justify-between items-center text-sm md:text-base">
          <h1 className="font-bold">
            <Link to="/" className="hover:underline">Otto Vintola</Link>
          </h1>
          <nav className="space-x-4">
            <Link to="/blog" className="hover:underline">Blog</Link>
          </nav>
        </div>
      </header>
    )}
    <main className={!showHeader ? "" : "py-6 md:py-8 pt-4 md:pt-8"}>
      <div className="max-w-4xl lg:max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {children}
      </div>
    </main>
  </div>
);

const PostLayout = ({ children }) => (
  <div className="min-h-screen bg-white text-black">
    <main>{children}</main>
  </div>
);

const Home = () => (
  <div className="relative">

    <div className="flex flex-col md:flex-row-reverse items-start md:items-center gap-6">
      <div className="relative w-60 md:w-[52rem] group">
        <img
          src="/assets/bw-c.jpeg"
          alt="Otto Vintola"
          className="w-full h-auto transition-opacity duration-300 group-hover:opacity-0"
          loading="eager"
          decoding="async"
        />
        <img
          src="/assets/ocean.jpeg"
          alt="Ocean"
          className="absolute top-0 left-0 w-full h-auto opacity-0 transition-opacity duration-300 group-hover:opacity-100"
          loading="eager"
          decoding="async"
        />
      </div>
      <div className="z-10 relative text-xl md:text-1xl leading-snug">
        <p className="mt-2 relative z-10">Hello! I am a graduate student (MSc) at <a href="https://www.aalto.fi/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline"> Aalto University </a>
        in <a href="https://www.aalto.fi/en/study-options/machine-learning-data-science-and-artificial-intelligence-master-of-science-technology" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Machine Learning, Data Science and Artificial Intelligence</a>.
        Previously, I completed my BSc in Data Science, also at Aalto. 
        <br /><br />
        I have had the great fortune to work on cloud software at <a href="https://www.nokia.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Nokia </a> 
        and machine learning for health at <a href="https://www.terveystalo.com/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">Terveystalo</a>. Currently, 
        founding the engineering for charging solutions at <a href="https://www.evmobile.uk/" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">EV Mobile</a>.

        <br /><br />

        Outside of academia and industry, I enjoy swimming and photography. 
        <br /><br />

        You can find me on <a href="https://www.youtube.com/@ottovintola" target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">YouTube</a>.

        </p>
      </div>
    </div>

    <figure className="mt-10 mx-auto max-w-3xl">
      <blockquote className="relative border-l-4 border-gray-200 pl-6 sm:pl-8 italic text-gray-700 text-lg sm:text-xl leading-relaxed mb-0">
        <p className="relative">
          What I cannot build, I do not understand.
        </p>
      </blockquote>
      <figcaption className="mt-0 pl-6 sm:pl-8 text-sm text-gray-500">
        — <cite className="not-italic">Richard Feynman</cite>
      </figcaption>
    </figure>

    {/* Featured Posts Section */}
    <div className="mt-32 relative z-10">
      <h2 className="text-3xl font-bold mb-12">Posts</h2>
      <Posts />
    </div>

    {/* Videos Section */}
    <div className="mt-24 relative z-10">
      <h2 className="text-3xl font-bold mb-12">Videos</h2>
      <Videos />
    </div>
  </div>
);

const Blog = () => (
  <div>
    <h1 className="text-4xl font-bold mb-12">Blog</h1>
    <Posts />
  </div>
);

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/*" element={
          <Layout>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/blog" element={<Blog />} />
            </Routes>
          </Layout>
        } />
        <Route path="/post/:slug" element={<PostLayout><PostPage /></PostLayout>} />
      </Routes>
    </Router>
  );
}
