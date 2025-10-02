// src/components/FileUpload.jsx
import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Input } from './ui/input'; // Assuming shadcn Input
import { Label } from './ui/label'; // Assuming shadcn Label
import { FileIcon, X } from 'lucide-react';

const FileUpload = ({ id, label, value, onChange, placeholder, accept, error, multiple = false }) => {
  const [dragActive, setDragActive] = useState(false);

  const onDrop = useCallback((acceptedFiles) => {
    setDragActive(false);
    if (multiple) {
      onChange(acceptedFiles);
    } else {
      onChange(acceptedFiles[0]);
    }
  }, [onChange, multiple]);

  const { getRootProps, getInputProps } = useDropzone({
    onDrop,
    accept,
    multiple,
  });

  const removeFile = (e) => {
    e.stopPropagation(); // Prevent dropzone from activating
    onChange(null); // Clear the file
  };

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div
        {...getRootProps({ className: 'dropzone' })}
        className={`flex flex-col items-center justify-center p-6 border-2 border-dashed rounded-md cursor-pointer transition-colors ${
          dragActive ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'
        }`}
        onDragEnter={() => setDragActive(true)}
        onDragLeave={() => setDragActive(false)}
      >
        <Input {...getInputProps()} id={id} className="hidden" />
        {value && !Array.isArray(value) ? (
          <div className="flex items-center gap-2 p-2 bg-white border border-gray-200 rounded-md">
            <FileIcon className="h-5 w-5 text-indigo-500" />
            <span>{value.name} ({(value.size / 1024).toFixed(2)} KB)</span>
            <X className="h-4 w-4 text-red-500 cursor-pointer" onClick={removeFile} />
          </div>
        ) : Array.isArray(value) && value.length > 0 ? (
          <div className="flex flex-wrap gap-2 p-2 bg-white border border-gray-200 rounded-md">
            {value.map((file, idx) => (
              <div key={idx} className="flex items-center gap-1">
                <FileIcon className="h-4 w-4 text-indigo-500" />
                <span>{file.name}</span>
                <X className="h-3 w-3 text-red-500 cursor-pointer" onClick={(e) => { /* Implement removal for multiple files if needed */ }} />
              </div>
            ))}
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center">
            {placeholder || 'Drag & drop a file here, or click to select'}
            {accept && <span className="block text-xs text-gray-400 mt-1">({accept})</span>}
          </p>
        )}
      </div>
      {error && <p className="text-sm text-red-500">{error}</p>}
    </div>
  );
};

export default FileUpload;