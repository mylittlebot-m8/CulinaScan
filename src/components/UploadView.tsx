import React from 'react';
import { Camera, Image as ImageIcon, Loader2 } from 'lucide-react';

interface UploadViewProps {
  onImageSelected: (base64: string, mimeType: string) => void;
  isLoading: boolean;
  activeFilters: string[];
  onFilterChange: (filters: string[]) => void;
}

export function UploadView({ onImageSelected, isLoading, activeFilters, onFilterChange }: UploadViewProps) {
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      // dataUrl format: data:image/png;base64,.....
      const [header, base64] = dataUrl.split(',');
      const match = header.match(/:(.*?);/);
      const mimeType = match ? match[1] : 'image/jpeg';
      onImageSelected(base64, mimeType);
    };
    reader.readAsDataURL(file);
  };

  const dietOptions = ["Vegetarian", "Vegan", "Keto", "Paleo", "Gluten-Free", "Dairy-Free"];

  const toggleFilter = (f: string) => {
    if (activeFilters.includes(f)) {
      onFilterChange(activeFilters.filter((x) => x !== f));
    } else {
      onFilterChange([...activeFilters, f]);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[70vh] p-4 text-center max-w-2xl mx-auto">
      <h1 className="text-4xl md:text-5xl font-serif font-bold tracking-tight text-skin-text mb-6">
        What's in your fridge?
      </h1>
      <p className="text-lg text-skin-muted mb-8 max-w-lg">
        Snap a photo or upload an image of your open fridge, and our AI will suggest creative recipes you can make right now.
      </p>

      {/* Camera/Upload Area */}
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className={`relative group w-full max-w-md aspect-video border-2 border-dashed rounded-[20px] flex flex-col items-center justify-center transition-all duration-200 
          ${isLoading ? 'border-skin-border bg-skin-surface cursor-not-allowed opacity-70' : 'border-skin-brand bg-white hover:bg-skin-surface cursor-pointer shadow-[0_4px_15px_rgba(0,0,0,0.05)]'}`}
      >
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          // capture="environment"
          onChange={handleFileChange}
          className="hidden"
        />
        
        {isLoading ? (
          <>
            <Loader2 className="w-12 h-12 text-skin-brand animate-spin mb-4" />
            <span className="text-skin-brand font-medium">Analyzing fridge contents...</span>
          </>
        ) : (
          <>
            <div className="w-16 h-16 bg-skin-surface border border-skin-border text-skin-brand rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-sm">
              <Camera className="w-8 h-8" />
            </div>
            <span className="text-skin-text font-medium text-lg mb-1">Tap to snap a photo</span>
            <span className="text-skin-muted text-sm flex items-center gap-1">
              <ImageIcon className="w-4 h-4" /> or upload an image
            </span>
          </>
        )}
      </button>

      {/* Pre-Filters */}
      {!isLoading && (
        <div className="mt-12 w-full max-w-lg">
          <h3 className="text-xs font-bold text-skin-muted uppercase tracking-[1px] mb-4">
            Pre-Recipe Dietary Preferences
          </h3>
          <div className="flex flex-wrap gap-2 justify-center">
            {dietOptions.map((diet) => {
              const isActive = activeFilters.includes(diet);
              return (
                <button
                  key={diet}
                  onClick={() => toggleFilter(diet)}
                  className={`px-[14px] py-[6px] rounded-[20px] text-[13px] transition-colors border ${
                    isActive
                      ? "bg-skin-brand border-skin-brand text-skin-bg font-medium"
                      : "bg-skin-bg border-skin-border text-skin-brand hover:bg-skin-surface font-normal"
                  }`}
                >
                  {diet}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
