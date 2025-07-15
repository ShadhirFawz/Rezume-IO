import { useState, useCallback } from "react";
import axios from "axios";
import { motion } from "framer-motion";
import { useDropzone } from "react-dropzone";
import { FaFilePdf, FaFileWord, FaTrash, FaEllipsisV, FaExternalLinkAlt } from "react-icons/fa";
import { Dialog } from '@headlessui/react';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_RESUME_TYPES = ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];
const ALLOWED_JD_TYPES = ["text/plain", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"];

export default function UploadForm({ onResults }) {
  const [jobDesc, setJobDesc] = useState(null);
  const [resumes, setResumes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedResumes, setSelectedResumes] = useState([]);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    const validFiles = acceptedFiles.filter(file =>
      ALLOWED_RESUME_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE
    );
    const rejected = acceptedFiles.length - validFiles.length;
    if (rejected > 0) {
      alert(`${rejected} file(s) skipped (only PDF/DOCX < 10MB allowed)`);
    }
    setResumes(prev => [...prev, ...validFiles]);
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document": [".docx"]
    },
    maxSize: MAX_FILE_SIZE,
    multiple: true
  });

  const handleJobDescChange = (e) => {
    const file = e.target.files[0];
    if (file && ALLOWED_JD_TYPES.includes(file.type) && file.size <= MAX_FILE_SIZE) {
      setJobDesc(file);
    } else {
      alert("Invalid Job Description file. Only .txt or .docx under 10MB allowed.");
    }
  };

  const handleSelectResume = (filename) => {
    setSelectedResumes(prev => 
      prev.includes(filename) 
        ? prev.filter(name => name !== filename) 
        : [...prev, filename]
    );
  };

  const handleBulkDelete = () => {
    setIsDeleteModalOpen(true);
  };

  const confirmBulkDelete = () => {
    setResumes(prev => prev.filter(file => !selectedResumes.includes(file.name)));
    setSelectedResumes([]);
    setIsDeleteModalOpen(false);
  };

  const clearAll = () => {
    setResumes([]);
    setSelectedResumes([]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!jobDesc || resumes.length === 0) {
      alert("Upload a job description and at least one resume.");
      return;
    }

    const formData = new FormData();
    formData.append("job_description", jobDesc);
    resumes.forEach(file => formData.append("resumes", file));

    setLoading(true);
    try {
      const response = await axios.post("http://127.0.0.1:5000/match", formData);
      onResults(response.data.matches);
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="bg-blue-50 p-6 rounded-xl shadow-lg">
      {/* Delete Confirmation Modal */}
      <Dialog open={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} className="relative z-50">
        <div className="fixed inset-0 bg-black/30" aria-hidden="true" />
        <div className="fixed inset-0 flex items-center justify-center p-4">
          <Dialog.Panel className="bg-white rounded-lg p-6 max-w-md w-full">
            <Dialog.Title className="text-lg font-bold mb-4">Confirm Deletion</Dialog.Title>
            <Dialog.Description className="mb-4">
              Are you sure you want to delete {selectedResumes.length} selected resume(s)?
            </Dialog.Description>
            <div className="flex justify-end space-x-3">
              <button 
                onClick={() => setIsDeleteModalOpen(false)}
                className="px-4 py-2 text-gray-700 hover:bg-gray-100 rounded"
              >
                Cancel
              </button>
              <button 
                onClick={confirmBulkDelete}
                className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded"
              >
                Delete
              </button>
            </div>
          </Dialog.Panel>
        </div>
      </Dialog>

      <h2 className="text-2xl font-bold mb-6 text-gray-800" style={{ fontFamily: "'Montserrat', sans-serif", opacity: 0.9 }}>
        Upload Documents
      </h2>
      
      {/* JD Upload */}
      <div className="mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Poppins', sans-serif" }}>
          Job Description
        </label>
        <input 
          type="file" 
          disabled={loading} 
          accept=".txt,.docx" 
          onChange={handleJobDescChange} 
          className="block w-full text-sm text-gray-500
            file:mr-4 file:py-2 file:px-4
            file:rounded-md file:border-0
            file:text-sm file:font-normal
            file:bg-blue-200 file:text-blue-600
            hover:file:bg-blue-100"
          style={{ fontFamily: "'Arial', sans-serif" }}
        />
        {jobDesc && (
          <p className="mt-2 text-sm text-gray-600 font-extralight" style={{fontFamily: "'Georgia', serif"}}>
            Selected: {jobDesc.name}
          </p>
        )}
      </div>

      {/* Resume Upload */}
      <div className="mb-6">
        <label className="flex text-sm font-medium text-gray-700 mb-2" style={{ fontFamily: "'Verdana', sans-serif" }}>
          Resume Upload
        </label>
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
            isDragActive ? "border-blue-500 bg-blue-50" : "border-gray-300"
          }`}
        >
          <input {...getInputProps()} />
          <p className="text-gray-600">
            {isDragActive ? "Drop files here..." : "Drag & drop resumes here, or click to select"}
          </p>
          <p className="text-xs text-gray-500 mt-2">PDF or DOCX files only (max 10MB each)</p>
        </div>

        {/* File Previews - Tabular Layout */}
        {resumes.length > 0 && (
          <div className="mt-6">
            {/* Action Bar (visible only when selections exist) */}
            {selectedResumes.length > 0 && (
              <div className="flex justify-between items-center mb-3 bg-gray-100 p-1 rounded-lg">
                <span className="pl-3 text-sm text-gray-700">
                  {selectedResumes.length} selected
                </span>
                <div className="flex -space-x-5">
                  <motion.button
                    type="button"
                    onClick={handleBulkDelete}
                    className="p-1 text-red-600 hover:text-red-800 rounded-md"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                    style={{
                      background: 'transparent',
                      transform: 'translateZ(0)', // Forces GPU acceleration
                      border: 'none',
                      outline: 'none'
                    }}
                  >
                    <FaTrash className="text-xs" />
                  </motion.button>
                  <motion.button
                    type="button"
                    className="p-1 text-gray-600 border-0"
                    style={{
                      background: 'transparent',
                      border: 'none',
                      outline: 'none'
                    }}
                  >
                    <FaEllipsisV className="text-sm" />
                  </motion.button>
                </div>
              </div>
            )}

            {/* Table-like structure without borders */}
            <div className="space-y-2">
              {resumes.map(file => {
                const isPDF = file.type === "application/pdf";
                const FileIcon = isPDF ? FaFilePdf : FaFileWord;
                const iconColor = isPDF ? "text-red-500" : "text-blue-500";
                const isSelected = selectedResumes.includes(file.name);

                return (
                  <div 
                    key={file.name} 
                    className={`flex items-center p-3 rounded-lg ${isSelected ? 'bg-gray-50' : 'bg-gray-200 hover:bg-gray-300'}`}
                  >
                    <div className="flex items-center w-full">
                      {/* Radio Button */}
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => handleSelectResume(file.name)}
                        className="mr-3 h-[14px] w-[14px] rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      
                      {/* File Icon */}
                      <FileIcon className={`text-xl ${iconColor} mr-3`} />
                      
                      {/* File Info */}
                      <div className="flex-grow">
                        <p className="flex items-start text-sm font-medium text-gray-800" style={{fontFamily: "'Verdana', sans-serif"}}>
                          {file.name}
                        </p>
                        <p className="flex items-start text-xs text-gray-500">{(file.size / (1024 * 1024)).toFixed(2)} MB</p>
                      </div>
                      <button 
                        type="button"
                        onClick={() => window.open(URL.createObjectURL(file), '_blank')}
                        className="ml-2 p-1 text-gray-500 hover:text-blue-600"
                        title="Open in new tab"
                        style={{
                          background: 'transparent',
                          border: 'none',
                          outline: 'none'
                        }}
                      >
                        <FaExternalLinkAlt className="text-xs" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Clear All Button */}
            <motion.button
              type="button"
              onClick={clearAll}
              className="flex mt-3 place-items-baseline gap-1 text-blue-600 hover:text-blue-800"
              style={{
                background: 'transparent',
                transform: 'translateZ(0)', // Forces GPU acceleration
                fontFamily: "'Gill Sans', sans-serif",
                fontSize: 12,
                transition: 'color 0.5s ease-out'
              }}
              whileHover={{
                color: '#1e40af', // darker blue-800
                transition: { duration: 0.5 }
              }}
              whileTap={{ scale: 0.95 }}
            >
              <FaTrash className="text-xs" />
              <span>Clear All</span>
            </motion.button>
          </div>
        )}
      </div>

      {/* Submit Button */}
      <button
        type="submit"
        disabled={loading}
        className="w-auto flex items-center py-1 px-2 hover:bg-fuchsia-950 text-blue-950 font-medium rounded-md hover:text-black"
        style={{
          background: 'linear-gradient(152deg,rgba(238, 174, 202, 1) 14%, rgba(148, 187, 233, 1) 88%)',
          fontFamily: "'Gill Sans', sans-serif",
          transition: 'color 0.5s ease-out'
        }}
      >
        {loading ? "Processing..." : "Match Resumes"}
      </button>
    </form>
  );
}