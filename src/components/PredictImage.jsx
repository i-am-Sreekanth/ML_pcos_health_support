import React, { useState, useRef } from "react";
import axios from "axios";

const PredictImage = () => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [confidence, setConfidence] = useState(null);
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState("");
  
  const fileInputRef = useRef(null);

  const handleFileDrop = (e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    processFile(file);
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    processFile(file);
  };

  const processFile = (file) => {
    if (file && file.type.startsWith("image/")) {
      setSelectedImage(file);
      setPreview(URL.createObjectURL(file));
      setResult(null);
      setConfidence(null);
      setError("");
      setUploadProgress(0);
    } else {
      setError("Please upload a valid image file.");
    }
  };

  const handleDragOver = (e) => e.preventDefault();

  const handlePredict = async () => {
    if (!selectedImage) {
      setError("No image selected for analysis.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedImage);

    try {
      setLoading(true);
      setError("");
      
      const interval = setInterval(() => {
        setUploadProgress((prev) => (prev >= 90 ? 90 : prev + 5));
      }, 100);

      const response = await axios.post("http://localhost:5000/predict-image", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      clearInterval(interval);
      setUploadProgress(100);
      setResult(response.data.prediction);
      setConfidence(response.data.confidence);
    } catch (err) {
      setError("Server connection failed. Please ensure the backend is running.");
      setUploadProgress(0);
    } finally {
      setLoading(false);
    }
  };

  // Logic to determine if the result is safe/normal
  const isSafe = result && result.toLowerCase().includes("no");

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap');
        
        .main-wrapper {
          min-height: 100vh;
          background-color: #f7fbff;
          display: flex;
          justify-content: center;
          align-items: center;
          padding: 40px 15px;
          font-family: 'Plus Jakarta Sans', sans-serif;
        }

        .glass-card {
          width: 100%;
          max-width: 1100px;
          background: white;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          border-radius: 10px;
          overflow: hidden;
          box-shadow: 0 3px 10px rgba(74, 144, 226, 0.2);
        }

        .upload-section {
          padding: 30px 25px;
          background: #ffffff;
          border: 2px solid #4a90e2;
          border-radius: 10px 0 0 10px;
        }

        .results-section {
          padding: 30px 25px;
          background: white;
          border: 2px solid #dce9f9;
          border-radius: 0 10px 10px 0;
          display: flex;
          flex-direction: column;
          overflow-y: auto;
        }

        .dropzone-box {
          margin-top: 20px;
          height: 320px;
          border: 2px dashed #4a90e2;
          border-radius: 10px;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          cursor: pointer;
          transition: background-color 0.3s ease;
          position: relative;
          background-color: #f7fbff;
          overflow: hidden;
        }

        .dropzone-box:hover {
          background-color: #d9e8ff;
        }

        .preview-img {
          width: 100%;
          height: 100%;
          object-fit: contain;
          padding: 10px;
        }

        .analyze-btn {
          width: 100%;
          margin-top: 20px;
          padding: 12px 0;
          background-color: #4a90e2;
          color: white;
          border: none;
          border-radius: 6px;
          font-weight: 700;
          font-size: 16px;
          cursor: pointer;
          transition: background-color 0.25s ease;
        }

        .analyze-btn:hover:not(:disabled) { 
          background-color: #3a73cc;
        }
        
        .analyze-btn:disabled { 
          background-color: #aac4f7;
          cursor: not-allowed; 
        }

        .progress-container { margin-top: 25px; width: 100%; }
        .progress-track { 
          height: 8px; 
          background: #e6f0fc;
          border-radius: 10px; 
          overflow: hidden; 
          border: 1px solid #aac4f7;
        }
        .progress-fill { 
          height: 100%; 
          background: #4a90e2;
          transition: width 0.3s ease; 
        }

        /* --- Updated Report Styling --- */
        .report-card {
          margin-top: 20px;
          padding: 24px;
          border-radius: 8px;
          text-align: center;
          transition: all 0.4s ease;
        }
        
        /* Serious Alert State (Crimson) */
        .report-card.detected {
          background-color: #fff5f5; 
          border: 2px solid #e03131;
          color: #c92a2a;
          box-shadow: 0 4px 15px rgba(224, 49, 49, 0.1);
        }
        
        /* Normal State (Cool Medical Green) */
        .report-card.normal {
          background-color: #f2fbf6;
          border: 2px solid #2f9e44;
          color: #2b8a3e;
          box-shadow: 0 4px 15px rgba(47, 158, 68, 0.1);
        }

        .status-badge {
          display: inline-block;
          padding: 6px 16px;
          border-radius: 4px;
          font-size: 13px;
          font-weight: 800;
          letter-spacing: 1px;
          text-transform: uppercase;
          margin-bottom: 20px;
        }

        .detected .status-badge {
          background: #e03131;
          color: white;
        }

        .normal .status-badge {
          background: #2f9e44;
          color: white;
        }

        @media (max-width: 900px) {
          .glass-card { grid-template-columns: 1fr; }
          .upload-section { border-radius: 10px 10px 0 0; border-right: 2px solid #4a90e2; }
          .results-section { border-radius: 0 0 10px 10px; border-top: none; }
        }
      `}</style>

      <div className="main-wrapper">
        <div className="glass-card">
          <div className="upload-section">
            <h2 style={{ color: "#3a5bbf", fontSize: "28px", fontWeight: "700", margin: "0 0 10px 0" }}>Imaging Diagnostic</h2>
            <p style={{ color: "#8ba6d9", fontSize: "14px", fontStyle: "italic" }}>Upload Ultrasound Scan for AI Classification</p>

            <div 
              className="dropzone-box"
              onDrop={handleFileDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current.click()}
            >
              {preview ? (
                <img src={preview} alt="Ultrasound preview" className="preview-img" />
              ) : (
                <div style={{ textAlign: "center", color: "#4a90e2" }}>
                  <div style={{ fontSize: "48px", marginBottom: "10px" }}>🏥</div>
                  <p style={{ fontWeight: 600 }}>Drop scan here</p>
                  <p style={{ fontSize: "12px" }}>or click to browse files</p>
                </div>
              )}
              <input 
                type="file" 
                ref={fileInputRef} 
                onChange={handleFileSelect} 
                style={{ display: "none" }} 
                accept="image/*"
              />
            </div>

            <button 
              className="analyze-btn" 
              onClick={handlePredict} 
              disabled={loading || !selectedImage}
            >
              {loading ? "Analyzing Core Data..." : "Run Analysis"}
            </button>

            {error && <p style={{ color: "#d53f47", fontSize: "12px", fontWeight: "600", marginTop: "15px", textAlign: "center" }}>{error}</p>}
          </div>

          <div className="results-section">
            <h3 style={{ color: "#2a3d66", fontSize: "13px", fontWeight: 800, textTransform: "uppercase", letterSpacing: "1px" }}>
              Diagnostic Report
            </h3>

            {loading && (
              <div className="progress-container">
                <div className="progress-track">
                  <div className="progress-fill" style={{ width: `${uploadProgress}%` }}></div>
                </div>
                <p style={{ fontSize: "13px", color: "#3a5bbf", marginTop: "10px", fontWeight: 600 }}>
                  Processing Image: {uploadProgress}%
                </p>
              </div>
            )}

            {!loading && result ? (
              <div className={`report-card ${isSafe ? "normal" : "detected"}`}>
                <div className="status-badge">
                  {isSafe ? "FINDING: NORMAL" : "CRITICAL ALERT"}
                </div>
                
                <h1 style={{ fontSize: "28px", margin: "0 0 15px 0", fontWeight: "800", textTransform: "uppercase" }}>
                   {result}
                </h1>

                <div style={{ 
                  padding: "15px", 
                  borderRadius: "8px", 
                  background: isSafe ? "rgba(47, 158, 68, 0.08)" : "rgba(224, 49, 49, 0.08)" 
                }}>
                  <p style={{ fontSize: "12px", margin: "0", fontWeight: "600", textTransform: "uppercase" }}>
                    Confidence Metric
                  </p>
                  <h2 style={{ fontSize: "32px", margin: "5px 0 0 0", fontWeight: "800" }}>
                    {(confidence * 100).toFixed(2)}%
                  </h2>
                </div>

                <p style={{ fontSize: "11px", marginTop: "25px", lineHeight: "1.5", fontWeight: "500" }}>
                  <strong>NOTICE:</strong> {isSafe 
                    ? "The scan appears within normal parameters. Periodic screening is still recommended." 
                    : "This automated assessment indicates a high-probability finding. Immediate clinical correlation by a radiologist is mandatory."}
                </p>
              </div>
            ) : !loading && (
              <div style={{ margin: "auto", textAlign: "center", color: "#8ba6d9" }}>
                <div style={{ fontSize: "40px", marginBottom: "15px" }}>📁</div>
                <p style={{ fontStyle: "italic" }}>Waiting for image data input...</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default PredictImage;