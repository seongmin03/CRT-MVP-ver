import { Check } from "lucide-react";
import type { ChecklistItem as ChecklistItemType } from "@/data/checklistData";
import { parseTextWithLinks } from "@/lib/linkUtils";

interface ChecklistItemProps {
  item: ChecklistItemType;
  isChecked: boolean;
  onToggle: (itemId: string) => void;
  selectedCountry?: string | null;
}

const ChecklistItem = ({ item, isChecked, onToggle, selectedCountry }: ChecklistItemProps) => {
  const handleItemClick = (e: React.MouseEvent) => {
    // 이미지나 링크 클릭 시에는 체크박스 토글이 아닌 링크로 이동
    if ((e.target as HTMLElement).closest('a, img')) {
      return;
    }
    onToggle(item.item_id);
  };

  return (
    <div 
      className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl cursor-pointer transition-all duration-200 hover:bg-muted/50 group"
      onClick={handleItemClick}
    >
      <div 
        className={`
          flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 mt-0.5
          ${isChecked 
            ? 'bg-accent border-accent animate-check-bounce shadow-sm' 
            : 'border-muted-foreground/30 group-hover:border-accent/50'
          }
        `}
        data-checked={isChecked}
        data-item-id={item.item_id}
      >
        {isChecked && (
          <Check className="w-4 h-4 text-accent-foreground" strokeWidth={3} data-check-icon="true" />
        )}
      </div>
      
      <div className="flex-1 min-w-0">
        <h4 
          className={`
            font-semibold text-sm sm:text-base transition-all duration-300
            ${isChecked ? 'text-gray-400' : 'text-slate-900 dark:text-white'}
          `}
          style={{ 
            lineHeight: '1.5',
            opacity: isChecked ? 0.7 : 1
          }}
          data-item-title={item.title}
        >
          {item.link_url && item.cta_type === "link" ? (
            <a
              href={item.link_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`
                ${isChecked ? 'strikethrough-line' : ''}
                text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline decoration-2 underline-offset-2 transition-colors
              `}
              style={{
                position: 'relative',
                display: 'inline-block',
              }}
            >
              {item.title}
            </a>
          ) : (
            <span 
              className={isChecked ? 'strikethrough-line' : ''}
              style={{
                position: 'relative',
                display: 'inline-block',
              }}
            >
              {parseTextWithLinks(item.title, selectedCountry, true)}
            </span>
          )}
        </h4>
        <p 
          className={`
            mt-1 text-xs sm:text-sm leading-relaxed transition-all duration-300
            ${isChecked ? 'text-gray-400' : 'text-slate-700 dark:text-gray-300'}
          `}
          style={{ 
            lineHeight: '1.5',
            opacity: isChecked ? 0.7 : 1
          }}
        >
          {parseTextWithLinks(item.description || '', selectedCountry)}
        </p>
      </div>

      {/* 이미지 및 링크 - 텍스트 우측에 배치 */}
      {item.image_url && (
        item.link_url ? (
          <a
            href={item.link_url}
            target="_blank"
            rel="noopener noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-shrink-0 transition-all duration-300 hover:brightness-110 hover:shadow-lg hover:scale-110 active:scale-95 cursor-pointer"
            style={{ width: "40px", height: "40px" }}
          >
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover rounded-lg shadow-md"
              style={{ width: "40px", height: "40px" }}
            />
          </a>
        ) : (
          <div
            className="flex-shrink-0"
            style={{ width: "40px", height: "40px" }}
          >
            <img
              src={item.image_url}
              alt={item.title}
              className="w-full h-full object-cover rounded-lg shadow-md"
              style={{ width: "40px", height: "40px" }}
            />
          </div>
        )
      )}
    </div>
  );
};

export default ChecklistItem;
