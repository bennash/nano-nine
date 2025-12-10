import React, { useState, useCallback } from 'react';
import { Uploader } from './components/Uploader';
import { Button } from './components/Button';
import { EditModal } from './components/EditModal';
import { generateImageVariation } from './services/geminiService';
import { ANGLES, GeneratedImage } from './types';

export default function App() {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [variations, setVariations] = useState<GeneratedImage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedImageForEdit, setSelectedImageForEdit] = useState<GeneratedImage | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Handle uploading the initial image
  const handleImageSelect = (base64: string) => {
    setOriginalImage(base64);
    setVariations([]);
    setError(null);
  };

  // Trigger the 9-angle generation process
  const startGeneration = useCallback(async () => {
    if (!originalImage) return;

    setIsGenerating(true);
    setError(null);

    // Initialize placeholders
    const newVariations: GeneratedImage[] = ANGLES.map((angleConfig, index) => ({
      id: `var-${Date.now()}-${index}`,
      url: '',
      prompt: angleConfig.angle,
      status: 'loading',
      timestamp: Date.now()
    }));
    setVariations(newVariations);

    // Fire requests in parallel
    // Note: We use Promise.allSettled to allow some to fail without crashing the whole set
    const promises = ANGLES.map(async (angleConfig, index) => {
        try {
            const resultUrl = await generateImageVariation(originalImage, angleConfig.description);
            
            setVariations(prev => prev.map((item, i) => 
                i === index ? { ...item, url: resultUrl, status: 'success' } : item
            ));
        } catch (e) {
            console.error(`Failed to generate ${angleConfig.angle}`, e);
            setVariations(prev => prev.map((item, i) => 
                i === index ? { ...item, status: 'error' } : item
            ));
        }
    });

    await Promise.allSettled(promises);
    setIsGenerating(false);
  }, [originalImage]);

  // Handle updating an image after editing
  const handleEditSave = (newUrl: string) => {
    if (selectedImageForEdit) {
        // If we edited a variation, update it
        setVariations(prev => prev.map(v => 
            v.id === selectedImageForEdit.id ? { ...v, url: newUrl } : v
        ));
        
        // If we edited the original (technically we could support this, but for now lets stick to variations grid logic)
        // For this app flow, let's say editing opens a fresh copy in the modal, 
        // and saving it effectively updates that slot or adds a new one?
        // The prompt implies editing logic. Let's update the grid item.
    }
    setSelectedImageForEdit(null);
  };

  const handleRetry = (index: number) => {
      if (!originalImage) return;
      const angleConfig = ANGLES[index];
      
      setVariations(prev => prev.map((item, i) => 
          i === index ? { ...item, status: 'loading' } : item
      ));

      generateImageVariation(originalImage, angleConfig.description)
        .then(url => {
            setVariations(prev => prev.map((item, i) => 
                i === index ? { ...item, url, status: 'success' } : item
            ));
        })
        .catch(() => {
             setVariations(prev => prev.map((item, i) => 
                i === index ? { ...item, status: 'error' } : item
            ));
        });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-200 selection:bg-yellow-500/30">
      
      {/* Header */}
      <header className="border-b border-zinc-900 bg-zinc-950/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-yellow-500 rounded-lg flex items-center justify-center">
                    <span className="text-zinc-950 font-bold text-lg">N</span>
                </div>
                <h1 className="text-xl font-bold tracking-tight text-white">Nano Banana Studio</h1>
            </div>
            <div className="text-sm text-zinc-500">Gemini 2.5 Flash Image</div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        
        {/* Upload Section */}
        <section className={`transition-all duration-500 ${originalImage ? 'flex flex-col md:flex-row gap-8 items-start' : ''}`}>
            {originalImage ? (
                <div className="w-full md:w-1/3 space-y-4 sticky top-24">
                    <div className="relative group rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl">
                        <img src={originalImage} alt="Original" className="w-full h-auto object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-4">
                            <span className="text-white font-medium">Original Scene</span>
                        </div>
                    </div>
                    <div className="flex gap-2">
                         <Button 
                            onClick={startGeneration} 
                            disabled={isGenerating} 
                            isLoading={isGenerating}
                            className="flex-1"
                        >
                            {variations.length > 0 ? 'Regenerate Angles' : 'Generate 9 Angles'}
                        </Button>
                        <Button 
                            variant="secondary" 
                            onClick={() => setOriginalImage(null)}
                            disabled={isGenerating}
                        >
                            Reset
                        </Button>
                    </div>
                    {error && (
                        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                            {error}
                        </div>
                    )}
                    <div className="text-xs text-zinc-500 leading-relaxed">
                        Tip: Click on any generated variation to open the <span className="text-yellow-500">Magic Editor</span> where you can use text prompts to modify the details.
                    </div>
                </div>
            ) : (
                <div className="py-20 animate-in fade-in slide-in-from-bottom-4 duration-700">
                    <div className="text-center mb-12">
                        <h2 className="text-4xl sm:text-5xl font-extrabold text-white mb-6 tracking-tight">
                            Reimagine your reality <br/>
                            <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-yellow-600">
                                from every angle.
                            </span>
                        </h2>
                        <p className="text-lg text-zinc-400 max-w-2xl mx-auto">
                            Upload a single image and let our Nano Banana AI generate 9 unique perspectives instantly.
                            Then, use natural language to edit them to perfection.
                        </p>
                    </div>
                    <Uploader onImageSelect={handleImageSelect} />
                </div>
            )}

            {/* Grid Section */}
            {originalImage && (
                <div className="w-full md:w-2/3">
                    {variations.length === 0 ? (
                        <div className="h-96 flex flex-col items-center justify-center border-2 border-dashed border-zinc-800 rounded-2xl bg-zinc-900/20 text-zinc-500">
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor" className="w-12 h-12 mb-4 opacity-50">
                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375.375 0 11-.75 0 .375.375 0 01.75 0z" />
                            </svg>
                            <p>Ready to generate variations</p>
                            <Button onClick={startGeneration} className="mt-4">
                                Start Magic Generation
                            </Button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                            {variations.map((item, index) => (
                                <div 
                                    key={item.id} 
                                    className="relative aspect-square bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800 group"
                                >
                                    {/* Status: Loading */}
                                    {item.status === 'loading' && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3">
                                            <div className="w-8 h-8 border-4 border-yellow-500/30 border-t-yellow-500 rounded-full animate-spin"></div>
                                            <span className="text-xs text-zinc-500 font-medium uppercase tracking-wider">
                                                {item.prompt}
                                            </span>
                                        </div>
                                    )}

                                    {/* Status: Success */}
                                    {item.status === 'success' && (
                                        <>
                                            <img 
                                                src={item.url} 
                                                alt={item.prompt} 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                                            />
                                            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center gap-2 p-4 text-center backdrop-blur-sm cursor-pointer"
                                                 onClick={() => setSelectedImageForEdit(item)}
                                            >
                                                <span className="text-white font-semibold">{item.prompt}</span>
                                                <span className="text-xs text-yellow-400 font-medium bg-yellow-400/10 px-2 py-1 rounded border border-yellow-400/20">
                                                    Click to Edit
                                                </span>
                                            </div>
                                        </>
                                    )}

                                    {/* Status: Error */}
                                    {item.status === 'error' && (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-red-400 p-4 text-center">
                                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-8 h-8 opacity-50">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m9-.75a9 9 0 11-18 0 9 9 0 0118 0zm-9 3.75h.008v.008h-.008v-.008z" />
                                            </svg>
                                            <span className="text-sm">Generation failed</span>
                                            <button 
                                                onClick={() => handleRetry(index)}
                                                className="text-xs underline hover:text-red-300"
                                            >
                                                Try Again
                                            </button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            )}
        </section>
      </main>

      {selectedImageForEdit && (
        <EditModal 
            imageUrl={selectedImageForEdit.url} 
            onClose={() => setSelectedImageForEdit(null)}
            onSave={handleEditSave}
        />
      )}
    </div>
  );
}