import React, { useState } from 'react';
import { Camera, List, ShoppingCart, Utensils } from 'lucide-react';
import { analyzeFridge, Recipe } from './lib/gemini';
import { UploadView } from './components/UploadView';
import { RecipeFeedView } from './components/RecipeFeedView';
import { CookingModeView } from './components/CookingModeView';
import { ShoppingListView } from './components/ShoppingListView';

export default function App() {
  const [activeTab, setActiveTab] = useState<'upload' | 'feed' | 'shopping' | 'cooking'>('upload');
  
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  
  const [shoppingList, setShoppingList] = useState<string[]>([]);
  
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [dietaryFilters, setDietaryFilters] = useState<string[]>([]);
  
  const handleImageSelected = async (base64: string, mimeType: string) => {
    setIsAnalyzing(true);
    try {
      const generatedRecipes = await analyzeFridge(base64, mimeType, dietaryFilters);
      setRecipes(generatedRecipes);
      // Give each recipe an ID if not generated
      generatedRecipes.forEach((r, i) => { if(!r.id) r.id = `req-${i}`; });
      
      setActiveTab('feed');
    } catch (e) {
      alert("Failed to analyze fridge. Please try again.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleSelectRecipe = (recipe: Recipe) => {
    setSelectedRecipe(recipe);
    setActiveTab('cooking');
  };

  const handleAddToShoppingList = (item: string) => {
    if (!shoppingList.includes(item)) {
      setShoppingList([...shoppingList, item]);
    }
  };

  const currentTab = (targetTab: string) => {
    if (targetTab === 'upload' || (!recipes.length && targetTab === 'feed')) return 'upload';
    if (targetTab === 'feed' && activeTab === 'cooking') return 'feed';
    return activeTab;
  };

  return (
    <div className="min-h-screen bg-skin-bg flex flex-col font-sans text-skin-text">
      {/* Top Navigation Bar */}
      <header className="bg-skin-surface border-b border-skin-border px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2 text-skin-brand text-[22px] mb-0">
            <span className="text-[28px]">🥗</span>
            <span className="font-serif font-bold tracking-tight hidden sm:block">CulinaScan</span>
          </div>

          <nav className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={() => setActiveTab('upload')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-medium transition-colors
                ${(activeTab === 'upload') ? 'bg-skin-brand text-white shadow-sm' : 'text-skin-brand hover:bg-[#D9D2C5]/50'}`}
            >
              <Camera className="w-4 h-4" />
              <span className="hidden sm:inline">Scan Fridge</span>
            </button>
            <button
              onClick={() => setActiveTab('feed')}
              disabled={recipes.length === 0}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-medium transition-colors
                ${(activeTab === 'feed' || activeTab === 'cooking') ? 'bg-skin-brand text-white shadow-sm' : 'text-skin-brand hover:bg-[#D9D2C5]/50'}
                ${recipes.length === 0 ? 'opacity-50 cursor-not-allowed hidden sm:flex' : ''}`}
            >
              <List className="w-4 h-4" />
              <span className="hidden sm:inline">Recipes</span>
            </button>
            <button
              onClick={() => setActiveTab('shopping')}
              className={`flex items-center gap-2 px-3 sm:px-4 py-2 sm:py-2.5 rounded-xl text-sm font-medium transition-colors relative
                ${activeTab === 'shopping' ? 'bg-skin-brand text-white shadow-sm' : 'text-skin-brand hover:bg-[#D9D2C5]/50'}`}
            >
              <ShoppingCart className="w-4 h-4" />
              <span className="hidden sm:inline">Shopping List</span>
              {shoppingList.length > 0 && (
                <span className={`absolute -top-1 -right-1 w-5 h-5 flex items-center justify-center rounded-full text-[10px] font-bold shadow-sm
                  ${activeTab === 'shopping' ? 'bg-white text-skin-brand' : 'bg-skin-brand text-white'}`}>
                  {shoppingList.length}
                </span>
              )}
            </button>
          </nav>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full bg-skin-bg overflow-x-hidden">
        {activeTab === 'upload' && (
          <UploadView 
            onImageSelected={handleImageSelected} 
            isLoading={isAnalyzing} 
            activeFilters={dietaryFilters}
            onFilterChange={setDietaryFilters}
          />
        )}
        
        {activeTab === 'feed' && (
          <RecipeFeedView 
            recipes={recipes} 
            onSelectRecipe={handleSelectRecipe} 
            onReset={() => {
              setRecipes([]);
              setActiveTab('upload');
            }}
          />
        )}
        
        {activeTab === 'cooking' && selectedRecipe && (
          <CookingModeView 
            recipe={selectedRecipe} 
            onBack={() => setActiveTab('feed')} 
            shoppingList={shoppingList}
            onAddToShoppingList={handleAddToShoppingList}
          />
        )}

        {activeTab === 'shopping' && (
          <ShoppingListView 
            items={shoppingList} 
            onRemoveItem={(item) => setShoppingList(shoppingList.filter(i => i !== item))}
            onClear={() => setShoppingList([])}
          />
        )}
      </main>
    </div>
  );
}
