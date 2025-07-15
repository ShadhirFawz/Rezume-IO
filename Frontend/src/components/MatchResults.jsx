export default function MatchResults({ results }) {
  if (results.length === 0) {
    return (
      <div className="h-full flex items-center justify-center">
        <div className="text-center p-8 bg-white/90 rounded-lg shadow-lg">
          <p className="text-xl font-semibold text-gray-700"
              style={{ fontFamily: "'Segoe UI', system-ui", opacity: 0.9 }}
          >
            Upload resumes and job description to see matching results
          </p>
          <p className="text-gray-500 mt-2"
              style={{ fontFamily: "-apple-system, BlinkMacSystemFont, sans-serif", opacity: 0.8 }}
          >
            Results will appear here once processed
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-cyan-100 w-3/4 rounded-lg shadow-lg p-8 h-auto overflow-visible z-0">
      <h2 className="text-2xl font-bold mb-6 text-gray-800"
          style={{ fontFamily: "'Montserrat', sans-serif" }}  
      >
        Match Results
      </h2>
      <ul className="space-y-4">
        {[...results]
          .sort((a, b) => b.score - a.score)
          .map(({ filename, score }) => (
            <li 
              key={filename} 
              className="p-4 rounded-lg shadow-md border border-gray-100 hover:shadow-lg transition-shadow"
            >
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-800"
                      style={{ fontFamily: "'Trebuchet MS', sans-serif" }}
                >
                  {filename}
                </span>
                <span className="text-blue-600 font-bold text-lg"
                    style={{fontFamily: "'Trebuchet MS', sans-serif"}}
                >
                  {score.toFixed(2)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-blue-500 h-2 rounded-full" 
                  style={{ width: `${score}%`,
                    fontFamily: "'Courier New', monospace"
                  }}
                ></div>
              </div>
            </li>
          ))}
      </ul>
    </div>
  );
}