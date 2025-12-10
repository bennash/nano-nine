import React, { useState } from 'react';
import { Button } from './Button';
import { editImageWithPrompt } from '../services/geminiService';

interface EditModalProps {
  imageUrl: string;
  onClose: () => void;
  onSave: (newUrl: string) => void;
}

export const EditModal: React.FC<EditModalProps> = ({ imageUrl, onClose, onSave }) => {
  const [prompt, setPrompt] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentImage, setCurrentImage] = useState(imageUrl);
  const [error, setError] = useState<string | null>(null);

  const handleEdit = async () => {
    if (!prompt.trim()) return;
    setIsProcessing(true);
    setError(null);
    try {
      const newImage = await editImageWithPrompt(currentImage, prompt);
      setCurrentImage(newImage);
      setPrompt(''); // Clear prompt after success
    } catch (err) {
      setError("Failed to edit image. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSaveAndClose = () => {
      onSave(currentImage);
      onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm">
      <div className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-4xl overflow-hidden flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-zinc-100">Editor Studio</h2>
          <button onClick={onClose} className="text-zinc-400 hover:text-white p-2">
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-auto p-6 flex flex-col md:flex-row gap-6">
            {/* Image Preview */}
            <div className="flex-1 flex items-center justify-center bg-zinc-950/50 rounded-xl min-h-[300px] border border-zinc-800 relative">
                <img 
                    src={currentImage} 
                    alt="Editing" 
                    className="max-w-full max-h-[60vh] object-contain rounded-lg"
                />
            </div>

            {/* Controls */}
            <div className="w-full md:w-80 flex flex-col gap-4">
                <div className="bg-zinc-800/50 p-4 rounded-xl border border-zinc-700/50">
                    <label className="block text-sm font-medium text-zinc-300 mb-2">
                        Magic Edit Prompt
                    </label>
                    <textarea
                        value={prompt}
                        onChange={(e) => setPrompt(e.target.value)}
                        placeholder="e.g. 'Add a retro filter', 'Make it snowy', 'Remove the background'"
                        className="w-full bg-zinc-950 border border-zinc-700 rounded-lg p-3 text-sm text-zinc-100 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none resize-none h-32"
                    />
                    {error && <p className="text-red-400 text-xs mt-2">{error}</p>}
                    <Button 
                        onClick={handleEdit} 
                        isLoading={isProcessing} 
                        disabled={!prompt.trim()}
                        className="w-full mt-3"
                    >
                        Apply Edit
                    </Button>
                </div>

                <div className="mt-auto flex flex-col gap-2">
                    <Button onClick={handleSaveAndClose} variant="secondary">
                        Done
                    </Button>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
};