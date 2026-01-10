import { Check } from "lucide-react";
import type { ChecklistItem as ChecklistItemType } from "@/data/checklistData";

interface ChecklistItemProps {
  item: ChecklistItemType;
  isChecked: boolean;
  onToggle: (itemId: string) => void;
}

const ChecklistItem = ({ item, isChecked, onToggle }: ChecklistItemProps) => {
  return (
    <div 
      className="flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 hover:bg-muted/50 group"
      onClick={() => onToggle(item.item_id)}
    >
      <div 
        className={`
          flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200
          ${isChecked 
            ? 'bg-accent border-accent animate-check-bounce' 
            : 'border-muted-foreground/30 group-hover:border-accent/50'
          }
        `}
      >
        {isChecked && (
          <Check className="w-4 h-4 text-accent-foreground" strokeWidth={3} />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 
          className={`
            font-medium text-base transition-all duration-300
            ${isChecked ? 'text-muted-foreground item-text-checked' : 'text-foreground'}
          `}
        >
          {item.title}
        </h4>
        <p 
          className={`
            mt-1 text-sm leading-relaxed transition-all duration-300
            ${isChecked ? 'text-muted-foreground/60' : 'text-muted-foreground'}
          `}
        >
          {item.description}
        </p>
      </div>
    </div>
  );
};

export default ChecklistItem;
