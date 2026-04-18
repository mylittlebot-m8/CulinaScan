import React from 'react';
import { ShoppingCart, CheckCircle2, Circle, Trash2 } from 'lucide-react';

interface ShoppingListViewProps {
  items: string[];
  onRemoveItem: (item: string) => void;
  onClear: () => void;
}

export function ShoppingListView({ items, onRemoveItem, onClear }: ShoppingListViewProps) {
  const [checkedItems, setCheckedItems] = React.useState<Set<string>>(new Set());

  const toggleCheck = (item: string) => {
    const newSet = new Set(checkedItems);
    if (newSet.has(item)) {
      newSet.delete(item);
    } else {
      newSet.add(item);
    }
    setCheckedItems(newSet);
  };

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-8">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-4xl font-serif font-bold text-skin-text tracking-tight flex items-center gap-4">
          <ShoppingCart className="w-10 h-10 text-skin-brand" />
          Shopping List
        </h1>
        {items.length > 0 && (
          <button
            onClick={onClear}
            className="flex items-center gap-2 px-4 py-2 text-skin-alert hover:bg-skin-alert/10 rounded-xl font-medium transition-colors"
          >
            <Trash2 className="w-4 h-4" /> Clear All
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="bg-skin-surface border border-skin-border rounded-3xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-20 h-20 bg-skin-bg rounded-full flex items-center justify-center mb-6 shadow-sm">
            <ShoppingCart className="w-10 h-10 text-skin-muted" />
          </div>
          <h3 className="text-xl font-bold text-skin-text mb-2">Your list is empty</h3>
          <p className="text-skin-muted max-w-sm">
            Add missing ingredients from recipes directly to your shopping list, and we'll keep track of them here.
          </p>
        </div>
      ) : (
        <div className="bg-white rounded-[20px] border border-skin-border shadow-[0_2px_5px_rgba(0,0,0,0.05)] overflow-hidden">
          <ul className="divide-y divide-skin-border">
            {items.map((item) => {
              const isChecked = checkedItems.has(item);
              return (
                <li key={item} className={`flex items-center justify-between p-[5px] px-[15px] hover:bg-skin-bg transition-colors ${isChecked ? 'bg-skin-bg opacity-50' : ''}`}>
                  <button 
                    onClick={() => toggleCheck(item)}
                    className="flex-1 flex items-center gap-4 text-left py-2"
                  >
                    {isChecked ? (
                      <CheckCircle2 className="w-6 h-6 text-skin-brand shrink-0" />
                    ) : (
                      <Circle className="w-6 h-6 text-skin-border shrink-0" />
                    )}
                    <span className={`text-[15px] font-medium transition-all ${isChecked ? 'text-skin-muted line-through' : 'text-skin-text'}`}>
                      {item}
                    </span>
                  </button>
                  <button
                    onClick={() => onRemoveItem(item)}
                    className="p-2 text-skin-muted hover:text-skin-alert hover:bg-skin-alert/10 rounded-lg transition-colors ml-4"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      )}
    </div>
  );
}
