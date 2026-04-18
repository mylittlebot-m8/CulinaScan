import React, { useEffect, useState, useRef } from 'react';
import { Recipe, RecipeIngredient } from '../lib/gemini';
import { ChevronLeft, Play, Pause, Plus, Check, Volume2 } from 'lucide-react';

interface CookingModeViewProps {
  recipe: Recipe;
  onBack: () => void;
  shoppingList: string[];
  onAddToShoppingList: (item: string) => void;
}

export function CookingModeView({ recipe, onBack, shoppingList, onAddToShoppingList }: CookingModeViewProps) {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    synthRef.current = window.speechSynthesis;
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  const missingIngredients = recipe.ingredients.filter(i => !i.have);

  const toggleSpeech = () => {
    if (!synthRef.current) return;
    
    if (isPlaying) {
      synthRef.current.cancel();
      setIsPlaying(false);
    } else {
      const stepText = recipe.steps[currentStepIndex];
      const utterance = new SpeechSynthesisUtterance(stepText);
      utterance.rate = 0.9; // Slightly slower for easy following
      utterance.onend = () => setIsPlaying(false);
      synthRef.current.speak(utterance);
      setIsPlaying(true);
    }
  };

  const jumpToStep = (index: number) => {
    if (isPlaying && synthRef.current) {
      synthRef.current.cancel();
      setIsPlaying(false);
    }
    setCurrentStepIndex(index);
  };

  // Stop talking when unmounting
  useEffect(() => {
    return () => {
      if (synthRef.current) synthRef.current.cancel();
    }
  }, []);

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-8">
      <button 
        onClick={onBack}
        className="flex items-center gap-2 text-skin-muted hover:text-skin-text font-medium mb-8 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" /> Back to Recipes
      </button>

      <div className="mb-12">
        <h1 className="text-[32px] md:text-[40px] font-serif font-bold text-skin-text tracking-tight mb-4">{recipe.title}</h1>
        <p className="text-lg text-skin-muted">{recipe.description}</p>
      </div>

      {missingIngredients.length > 0 && (
        <div className="bg-skin-alert/10 rounded-2xl p-6 border border-skin-alert/20 mb-12">
          <h3 className="text-lg font-bold text-skin-alert mb-4 flex items-center gap-2">
            Notice: Missing Ingredients
          </h3>
          <ul className="space-y-3">
            {missingIngredients.map((ing) => {
              const inList = shoppingList.includes(ing.name);
              return (
                <li key={ing.name} className="flex items-center justify-between bg-white px-4 py-3 rounded-[12px] shadow-[0_2px_5px_rgba(0,0,0,0.05)] border border-transparent">
                  <span className="font-medium text-skin-alert">{ing.name}</span>
                  <button
                    disabled={inList}
                    onClick={() => onAddToShoppingList(ing.name)}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-sm font-semibold transition-colors
                      ${inList ? 'bg-skin-bg text-skin-brand border border-skin-border' : 'bg-skin-surface text-skin-brand hover:opacity-90'}
                    `}
                  >
                    {inList ? <><Check className="w-4 h-4" /> Added</> : <><Plus className="w-4 h-4" /> Add to List</>}
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}

      {/* Step by Step Area */}
      <div className="flex flex-col md:flex-row gap-8">
        <div className="md:w-1/3 shrink-0">
          <div className="sticky top-8">
            <h3 className="text-lg font-bold text-skin-text mb-6">Steps Overview</h3>
            <div className="flex flex-col gap-2">
              {recipe.steps.map((step, index) => (
                <button
                  key={index}
                  onClick={() => jumpToStep(index)}
                  className={`text-left p-4 rounded-[12px] transition-all border
                    ${index === currentStepIndex 
                      ? 'bg-skin-brand text-skin-bg border-skin-brand shadow-md transform scale-[1.02]' 
                      : index < currentStepIndex 
                        ? 'bg-skin-bg border-skin-border text-skin-muted' 
                        : 'bg-[#FFF] border-skin-border text-skin-text hover:border-skin-brand'
                    }`}
                >
                  <span className="text-[10px] font-bold uppercase tracking-[1px] block mb-1 opacity-80">Step {index + 1}</span>
                  <span className="line-clamp-2 text-sm font-medium">{step}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="md:w-2/3">
          <div className="bg-skin-brand text-skin-bg rounded-[20px] p-[40px_30px] border border-skin-brand shadow-[0_4px_15px_rgba(0,0,0,0.05)] min-h-[400px] flex flex-col justify-center relative">
            
            <div className="absolute top-6 right-6">
               <button
                  onClick={toggleSpeech}
                  className={`w-[50px] h-[50px] rounded-[50%] flex items-center justify-center transition-transform hover:scale-105 active:scale-95 border border-[rgba(255,255,255,0.3)]
                    ${isPlaying ? 'bg-[rgba(255,255,255,0.1)] text-white' : 'bg-transparent text-skin-bg'}
                  `}
                >
                  {isPlaying ? <Pause className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
                </button>
            </div>

            <div className="mb-4">
               <span className="inline-block text-[12px] uppercase tracking-[2px] opacity-70">
                 Step {currentStepIndex + 1} of {recipe.steps.length}
               </span>
            </div>
            
            <h2 className="text-[24px] md:text-[28px] font-serif leading-[1.4] mt-2 mb-12 flex-1">
              {recipe.steps[currentStepIndex]}
            </h2>

            <div className="flex items-center justify-between mt-auto pt-8">
              <button
                onClick={() => jumpToStep(Math.max(0, currentStepIndex - 1))}
                disabled={currentStepIndex === 0}
                className="w-[50px] h-[50px] rounded-[50%] flex items-center justify-center border border-[rgba(255,255,255,0.3)] hover:bg-[rgba(255,255,255,0.1)] disabled:opacity-30 disabled:hover:bg-transparent transition-colors"
                aria-label="Previous step"
              >
                ←
              </button>
              
              {isPlaying && (
                <div className="flex items-center gap-2 text-[12px] opacity-80">
                   <div className="w-2 h-2 bg-[#84A59D] rounded-full animate-pulse"></div>
                   Reading Aloud...
                </div>
              )}

              <button
                onClick={() => jumpToStep(Math.min(recipe.steps.length - 1, currentStepIndex + 1))}
                disabled={currentStepIndex === recipe.steps.length - 1}
                className="w-[50px] h-[50px] rounded-[50%] flex items-center justify-center border border-[rgba(255,255,255,0.3)] hover:bg-[rgba(255,255,255,0.1)] disabled:opacity-30 transition-colors"
                aria-label="Next step"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
