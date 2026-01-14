import type { ChecklistSection as ChecklistSectionType } from "@/data/checklistData";
import ChecklistItem from "./ChecklistItem";

interface ChecklistSectionProps {
  section: ChecklistSectionType;
  checkedItems: Set<string>;
  onToggle: (itemId: string) => void;
}

const sectionIcons: Record<string, string> = {
  essentials: "📄",
  finance: "💳",
  electronics: "🔌",
  health: "💊",
  packing: "👕",
};

const ChecklistSection = ({ section, checkedItems, onToggle }: ChecklistSectionProps) => {
  const completedCount = section.items.filter(item => checkedItems.has(item.item_id)).length;
  const totalCount = section.items.length;
  const progress = (completedCount / totalCount) * 100;

  return (
    <div className="card-toss animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{sectionIcons[section.section_id] || "📋"}</span>
          <h3 className="section-title mb-0">{section.section_title}</h3>
        </div>
        <span className="text-sm font-medium text-accent">
          {completedCount}/{totalCount}
        </span>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
        <div 
          className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-1">
        {section.items.map((item) => (
          <ChecklistItem
            key={item.item_id}
            item={item}
            isChecked={checkedItems.has(item.item_id)}
            onToggle={onToggle}
          />
        ))}
      </div>
    </div>
  );
};

export default ChecklistSection;
