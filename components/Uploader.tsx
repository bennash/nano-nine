import React, { useRef } from 'react';

interface UploaderProps {
  onImageSelect: (base64: string) => void;
}

export const Uploader: React.FC<UploaderProps> = ({ onImageSelect }) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (typeof event.target?.result === 'string') {
        onImageSelect(event.target.result);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const file = e.dataTransfer.files?.[0];
    if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (event) => {
            if (typeof event.target?.result === 'string') {
                onImageSelect(event.target.result);
            }
        };
        reader.readAsDataURL(file);
    }
  };

  return (
    <div 
      className="w-full max-w-xl mx-auto border-2 border-dashed border-zinc-700 hover:border-yellow-500/50 bg-zinc-900/50 rounded-2xl p-12 text-center transition-colors cursor-pointer group"
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
      onDrop={handleDrop}
    >
      <input 
        type="file" 
        accept="image/*" 
        className="hidden" 
        ref={inputRef}
        onChange={handleFileChange}
      />
      <div className="mb-4">
        <div className="w-16 h-16 bg-zinc-800 rounded-full flex items-center justify-center mx-auto group-hover:bg-zinc-700 transition-colors">
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 text-yellow-500">
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
      </div>
      <h3 className="text-xl font-semibold text-zinc-100 mb-2">Upload your scene</h3>
      <p className="text-zinc-400">Drag and drop or click to browse</p>
      <p className="text-zinc-500 text-sm mt-4">Supports JPG, PNG, WEBP</p>
    </div>
  );
};