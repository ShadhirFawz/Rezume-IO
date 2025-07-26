import { useState } from 'react';
import { motion } from 'framer-motion';
import UploadForm from "../components/UploadForm";
import MatchResults from "../components/MatchResults";
import InsightsPanel from '../components/InsightsPanel';

export default function ResumeMatcherPage() {
  const [results, setResults] = useState([]);
  const [insights, setInsights] = useState(null);

  return (
    <div className="fixed inset-0 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          background: `radial-gradient(circle,rgba(199, 192, 157, 1) 60%, rgba(194, 194, 128, 1) 60%, rgba(161, 175, 179, 1) 100%)`,
          backdropFilter: 'blur(1px)'
        }}
      />

      {/* Main container with grid layout */}
      <div className="relative h-full w-full overflow-y-auto p-8">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: "easeOut" }}
          className="mb-8"
        >
          <h1 
            className="text-4xl sm:text-5xl font-bold text-shadow-gray-500 text-center"
            style={{ fontFamily: "'Times New Roman', Times, serif" }}
          >
            Resume Matcher AI
          </h1>
        </motion.div>

        {/* Dynamic grid container */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 auto-rows-[minmax(200px,auto)]">
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