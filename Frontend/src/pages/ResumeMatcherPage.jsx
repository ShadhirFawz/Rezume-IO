import { useState } from 'react';
import { motion } from 'framer-motion';
import UploadForm from "../components/UploadForm";
import MatchResults from "../components/MatchResults";

export default function ResumeMatcherPage() {
  const [results, setResults] = useState([]);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `linear-gradient(28deg,rgba(185, 190, 192, 1) 100%, rgba(158, 163, 165, 1) 100%)`,
          backdropFilter: 'blur(1px)'
        }}
      />

      {/* Main container with fixed size and scrollable content */}
      <div className="relative h-full w-full overflow-y-auto overflow-x-hidden">
        {/* Header */}
        <div className="pt-8 pb-4 px-8">
          <motion.div
            initial={{ opacity: 0, y: -50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
          >
            <h1 
              className="text-4xl sm:text-5xl font-bold text-shadow-gray-500 text-center"
              style={{ fontFamily: "'Times New Roman', Times, serif" }}
            >
              Resume Matcher AI
            </h1>
          </motion.div>
        </div>

        {/* Main content area */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 gap-8 px-30 mb-8">
          {/* Left column - Upload forms */}
          <div className="h-full overflow-y-visible pr-6">
            <UploadForm onResults={setResults} />
          </div>
              
          {/* Right column - Results */}
          <div className="h-full overflow-y-visible pl-4">
            <MatchResults results={results} />
          </div>
        </div>
      </div>
    </div>
  );
}