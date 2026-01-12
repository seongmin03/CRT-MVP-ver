import { Check } from "lucide-react";
import type { ChecklistItem as ChecklistItemType } from "@/data/checklistData";

interface ChecklistItemProps {
  item: ChecklistItemType;
  isChecked: boolean;
  onToggle: (itemId: string) => void;
}

const ChecklistItem = ({ item, isChecked, onToggle }: ChecklistItemProps) => {
  const handleItemClick = (e: React.MouseEvent) => {
    // 이미지나 링크 클릭 시에는 체크박스 토글이 아닌 링크로 이동
    if ((e.target as HTMLElement).closest('a, img')) {
      return;
    }
    onToggle(item.item_id);
  };

  return (
    <div 
      className="flex items-start gap-4 p-4 rounded-xl cursor-pointer transition-all duration-200 hover:bg-muted/50 group"
      onClick={handleItemClick}
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

      {/* 이미지 및 링크 */}
      {item.image_url && item.link_url && (
        <a
          href={item.link_url}
          target="_blank"
          rel="noopener noreferrer"
          onClick={(e) => e.stopPropagation()}
          className="flex-shrink-0 w-10 h-10 rounded-lg overflow-hidden transition-all duration-200 hover:brightness-110 hover:shadow-md"
        >
          <img
            src={item.image_url}
            alt={item.title}
            className="w-full h-full object-cover"
          />
        </a>
      )}
    </div>
  );
};

export default ChecklistItem;
