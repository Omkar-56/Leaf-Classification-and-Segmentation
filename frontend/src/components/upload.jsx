import React from "react";
import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import axios from "axios";

const Upload = () => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [result, setResult] = useState(null);
  const [imgSrc, setImgSrc] = useState(null);

  const onDrop = useCallback((acceptedFiles) => {
    const uploadedFile = acceptedFiles[0];
    setFile(uploadedFile);
    setPreview(URL.createObjectURL(uploadedFile));
    console.log(`File uploaded: ${uploadedFile.name}`);
    
  }, []);

  const { getRootProps, getInputProps, isDragActive} = useDropzone({
    onDrop,
    accept: {
      'image/*': []
    },
    multiple: false
  });

  const apiUrl = import.meta.env.VITE_API_URL || "http://localhost:8000";

  const handleSubmit = async () => {
    if (!file) return alert("Please upload an image");
    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post(`${apiUrl}/predict`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        }
      });
      setResult(response.data);
      const base64Image = response.data.segmentation;
      setImgSrc(`data:image/png;base64,${base64Image}`);
      console.log("Image source set", imgSrc);
      console.log("Upload successful", response.data);

      
    } catch (error) {
      console.error("Upload failed", error);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-100 px-4 py-12"> 
      <div className="w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden grid grid-cols-1 md:grid-cols-2">
        <div className="bg-white p-10 flex flex-col justify-center space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-green-700">Upload an Image</h2>
            <p className="text-gray-600 text-md mt-2">Drag and drop the Potato leaf image below, or click to select files</p>
          </div>
          <div {...getRootProps()} className={`${isDragActive ? 'bg-blue-100' : 'bg-white'} w-auto h-auto p-6 border-dashed border-2 border-gray-300 rounded-lg cursor-pointer flex flex-col items-center justify-center space-y-4`}>
            <input {...getInputProps()} />
              {isDragActive ? (
                <p className="text-gray-500">Drop the file here...</p>
              ) : (
                <p className="text-gray-500">Drop the file here...</p>
              )}
          </div>

          {preview && (
              <img src={preview} alt="Preview" className="w-[256px] h-[256px] rounded-lg item"/>
          )}

          {file && <button onClick={handleSubmit} type="submit" className="w-half bg-green-600 hover:bg-green-700 text-white rounded-sm px-4 py-2 text-sm font-medium cursor-pointer">Submit</button>}

        </div>
        <div className="bg-gradient-to-br from-green-500 to-emerald-600 text-white p-10 flex flex-col items-start justify-center space-y-6">
          <h2 className="text-3xl font-bold">Results</h2>

          {result ? (
            <div className="space-y-4 flex flex-col justify-start items-start text-left"> 
              <h3 className="text-center text-xl font-bold">Classification result: {result.classification[0]}</h3>
              <p className="text-center text-md text-left">Description: {result.classification[2]}</p>
              <p className="text-center text-md">Confidence: {result.classification[1]}</p>
              <h3 className="text-center text-xl font-bold">Segmentation result: </h3>
              {result.classification[0] === "Healthy" ? 
                (<p className="text-center text-md">As the leaf is healthy, no segmentation is performed.</p>) : 
                (<img src={imgSrc} alt="Result" className="w-[256px] h-[256px] rounded-lg mt-4"/>)
              }
              
            </div>
          ) : (
            <p className="text-left text-md">The results will be displayed here after submitting the image.</p>
          )}

        </div>
      </div>
    </div>
  );
}

export default Upload;