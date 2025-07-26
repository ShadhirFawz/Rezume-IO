// File: Resume_Matcher/Frontend/src/components/InsightsPanel.jsx

import React from "react";
import { Card, CardContent } from "./ui/card";
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from 'chart.js';

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const InsightsPanel = ({ insights, filename }) => {
  if (!insights) return null;

  const {
    matched_skills: skills = [],
    readability = {},
    keyword_density: keywordDensity = [],
  } = insights;

  const barData = {
    labels: keywordDensity.map(k => k.keyword),
    datasets: [
      {
        label: 'Keyword %',
        data: keywordDensity.map(k => k.percentage),
        backgroundColor: '#4f46e5',
      },
    ],
  };

  const barOptions = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
    },
  };

  return (
    <Card className="grid p-4 mt-4 bg-blue-50 rounded-xl shadow-lg">
      <CardContent>
        <h2 className="text-lg font-semibold text-indigo-700 mb-2">
          Resume: <span className="font-mono">{filename}</span>
        </h2>

        {/* Skills */}
        <div className="mb-4">
          <h3 className="text-lg font-medium">Extracted Skills</h3>
          <div className="flex flex-wrap gap-2 mt-2">
            {skills.length > 0 ? (
              skills.map((skill, idx) => (
                <span
                  key={idx}
                  className="bg-indigo-100 text-indigo-800 px-2 py-1 rounded-xl text-sm"
                >
                  {skill}
                </span>
              ))
            ) : (
              <p className="text-gray-500 text-sm">No skills detected.</p>
            )}
          </div>
        </div>

        {/* Readability */}
        <div className="mb-4">
          <h3 className="text-lg font-medium">Readability Score</h3>
          <p className="text-sm mt-1">
            Flesch Score: <span className="font-semibold">{readability.flesch_score}</span>
          </p>
          <p className="text-sm">
            Grade Level: <span className="font-semibold">{readability.grade_level}</span>
          </p>
        </div>

        {/* Keyword Density */}
        <div>
          <h3 className="text-lg font-medium mb-2">Top Keywords</h3>
          {keywordDensity.length > 0 ? (
            <Bar data={barData} options={barOptions} height={200} />
          ) : (
            <p className="text-gray-500 text-sm">No keywords found.</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default InsightsPanel;
