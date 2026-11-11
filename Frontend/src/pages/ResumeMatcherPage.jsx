import { useState } from 'react';
import { motion } from 'framer-motion';
import UploadForm from "../components/UploadForm";
import MatchResults from "../components/MatchResults";
import InsightsPanel from '../components/InsightsPanel';
import UserProfileMenu from '../components/auth/UserProfileMenu';

export default function ResumeMatcherPage() {
  const [results, setResults] = useState([]);
  const [insights, setInsights] = useState(null);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div
        className="absolute inset-0 bg-gradient-to-br from-gray-700 via-gray-200 to-gray-700"
        style={{
          backdropFilter: 'blur(1px)'
        }}
      />

      {/* Main container with grid layout */}
      <div className="relative w-full">
        <nav className="relative top-0 left-0 right-0 w-full flex justify-between items-center bg-opacity-5 text-gray-800 backdrop-blur-xs dark:text-gray-200 z-150">
          <div className="relative flex items-center">
            <div className="relative overflow-hidden">
              <motion.h1
                initial={{ opacity: 0, y: -50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
                className="p-1 mb-3 flex items-baseline justify-start relative"
                style={{ fontSize: 25, fontFamily: "'Times New Roman', serif" }}
              >
                RezumeIO
                <span className="relative top-0 right-0 transform translate-x-1 -translate-y-3.5 w-2 h-2 bg-red-500 rounded-full"></span>
              </motion.h1>
            </div>
          </div>

          <UserProfileMenu />
        </nav>


        {/* Dynamic grid container */}
        <div className="grid grid-cols-1 p-20 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
          {/* UploadForm (fixed at top-left) */}
          <div className="md:col-span-1 lg:row-span-1">
            <UploadForm onResults={setResults} onInsights={setInsights} />
          </div>

          {/* MatchResults (flexible height) */}
          <div className="md:col-span-1 lg:col-span-1">
            <MatchResults results={results} />
          </div>

          {/* InsightsPanels (dynamic, fills gaps) */}
          {Array.isArray(insights)
            ? insights.map((ins) => (
              <div key={ins.filename} className="md:col-span-1 lg:col-span-1">
                <InsightsPanel insights={ins} filename={ins.filename} />
              </div>
            ))
            : insights && (
              <div className="md:col-span-1 lg:col-span-1">
                <InsightsPanel insights={insights} filename={insights.filename} />
              </div>
            )}
        </div>
      </div>
    </div>
  );
}