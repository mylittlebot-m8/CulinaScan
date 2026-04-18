import React from 'react';
import { Recipe } from '../lib/gemini';
import { Clock, Flame, ChefHat, Filter } from 'lucide-react';

interface RecipeFeedViewProps {
  recipes: Recipe[];
  onSelectRecipe: (recipe: Recipe) => void;
  onReset: () => void;
}

export function RecipeFeedView({ recipes, onSelectRecipe, onReset }: RecipeFeedViewProps) {
  const [localFilters, setLocalFilters] = React.useState<string[]>([]);

  // Collect all unique tags for filtering
  const allDietaryTags = Array.from(new Set(recipes.flatMap(r => r.dietaryLabels)));

  const toggleFilter = (f: string) => {
    if (localFilters.includes(f)) {
      setLocalFilters(localFilters.filter((x) => x !== f));
    } else {
      setLocalFilters([...localFilters, f]);
    }
  };

  const filteredRecipes = recipes.filter(r => {
    if (localFilters.length === 0) return true;
    return localFilters.some(filter => r.dietaryLabels.includes(filter));
  });

  return (
    <div className="flex flex-col md:flex-row gap-8 max-w-7xl mx-auto p-4 md:p-8">
      {/* Sidebar Filters */}
      <div className="w-full md:w-64 shrink-0">
        <div className="sticky top-8 bg-white border border-skin-border rounded-2xl p-6 shadow-[0_2px_5px_rgba(0,0,0,0.05)]">
          <div className="flex items-center gap-2 mb-6">
            <Filter className="w-5 h-5 text-skin-muted" />
            <h2 className="text-lg font-semibold text-skin-text">Filter Recipes</h2>
          </div>
          
          <div className="flex flex-col gap-2 mb-8">
            {allDietaryTags.length === 0 && <p className="text-skin-muted text-sm">No dietary tags found.</p>}
            {allDietaryTags.map(tag => (
              <label key={tag} className="flex items-center gap-3 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={localFilters.includes(tag)}
                  onChange={() => toggleFilter(tag)}
                  className="w-4 h-4 rounded border-skin-border text-skin-brand focus:ring-skin-brand cursor-pointer accent-skin-brand"
                />
                <span className="text-skin-text group-hover:opacity-80 text-sm font-medium">{tag}</span>
              </label>
            ))}
          </div>

          <button
            onClick={onReset}
            className="w-full py-2.5 px-4 bg-skin-surface text-skin-brand font-medium rounded-[12px] hover:opacity-90 transition-colors"
          >
            Scan Another Fridge
          </button>
        </div>
      </div>

      {/* Feed */}
      <div className="flex-1">
        <h2 className="text-3xl font-serif font-bold text-skin-text mb-6">
          We found {filteredRecipes.length} recipes for you
        </h2>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
          {filteredRecipes.map((recipe) => {
            const hasCount = recipe.ingredients.filter(i => i.have).length;
            const totalCount = recipe.ingredients.length;
            const missingCount = totalCount - hasCount;

            return (
              <div
                key={recipe.id}
                onClick={() => onSelectRecipe(recipe)}
                className="bg-white rounded-[20px] border-[2px] border-transparent p-6 shadow-[0_4px_15px_rgba(0,0,0,0.05)] hover:border-skin-brand transition-all cursor-pointer flex flex-col group relative overflow-hidden"
              >
                
                <h3 className="text-[18px] font-bold text-skin-text mb-1.5 relative z-10">
                  {recipe.title}
                </h3>
                <p className="text-skin-muted text-[13px] mb-4 line-clamp-2 relative z-10">
                  {recipe.description}
                </p>
                
                <div className="flex flex-wrap items-center gap-4 text-[12px] font-medium text-skin-muted mb-6 relative z-10">
                  <div className="flex items-center gap-1.5 align-middle">
                    <ChefHat className="w-[14px] h-[14px] text-skin-muted -mt-0.5" />
                    <span>{recipe.difficulty}</span>
                  </div>
                  <div className="flex items-center gap-1.5 align-middle">
                    <Clock className="w-[14px] h-[14px] text-skin-muted -mt-0.5" />
                    <span>{recipe.prepTime}m</span>
                  </div>
                  <div className="flex items-center gap-1.5 align-middle">
                    <Flame className="w-[14px] h-[14px] text-skin-muted -mt-0.5" />
                    <span>{recipe.calories} kcal</span>
                  </div>
                </div>

                <div className="mt-auto pt-4 border-t border-skin-border relative z-10">
                  <div className="flex items-center justify-between mb-4">
                    <span className="text-[12px] font-bold uppercase tracking-[1px] text-skin-muted">Match Overview</span>
                    <span className={`text-[12px]`}>
                      {missingCount === 0 ? <span className="text-skin-brand">All ingredients present</span> : <span className="text-skin-alert">Missing {missingCount} ingredient{missingCount > 1 ? 's' : ''}</span>}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recipe.ingredients.slice(0, 8).map(ing => (
                      <span key={ing.name} className={`px-[14px] py-[6px] text-[13px] font-medium rounded-[20px] border ${ing.have ? 'border-skin-border bg-skin-bg text-skin-brand' : 'border-transparent bg-skin-alert/10 text-skin-alert'}`}>
                        {ing.name}
                      </span>
                    ))}
                    {totalCount > 8 && (
                      <span className="px-[14px] py-[6px] text-[13px] font-medium rounded-[20px] border border-skin-border bg-[#FFF] text-skin-muted">
                        +{totalCount - 8} more
                      </span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
