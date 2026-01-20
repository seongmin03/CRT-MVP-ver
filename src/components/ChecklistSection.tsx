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
  travel_tips: "💡",
};

const ChecklistSection = ({ section, checkedItems, onToggle }: ChecklistSectionProps) => {
  // 안전성 체크: section과 items가 유효한지 확인
  if (!section || !section.items || !Array.isArray(section.items)) {
    return (
      <div className="card-toss animate-fade-in min-h-[200px]">
        <div className="flex items-center justify-center py-8 px-4">
          <p className="text-sm text-muted-foreground text-center text-slate-900 dark:text-white">
            데이터를 불러오는 중...
          </p>
        </div>
      </div>
    );
  }

  const validItems = section.items.filter(item => item && item.item_id);
  const completedCount = validItems.filter(item => checkedItems.has(item.item_id)).length;
  const totalCount = validItems.length;
  const progress = totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // 안내 문구가 필요한 섹션 ID 목록
  const sectionsWithGuide = ["electronics", "health", "packing"];

  return (
    <div className="card-toss animate-fade-in min-h-[200px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{sectionIcons[section.section_id] || "📋"}</span>
          <h3 className="section-title mb-0 text-slate-900 dark:text-white">{section.section_title}</h3>
        </div>
        <div className="flex items-center gap-2">
          {sectionsWithGuide.includes(section.section_id) && (
            <span className="text-xs text-gray-700 dark:text-gray-300 font-light whitespace-nowrap">
              상품 이미지 클릭하여<br />여행 필수템 찾기
            </span>
          )}
          <span className="text-sm font-medium text-accent">
            {completedCount}/{totalCount}
          </span>
        </div>
      </div>

      {/* Progress bar */}
      <div className="h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
        <div 
          className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className="space-y-1">
        {validItems && validItems.length > 0 ? (
          validItems.map((item, index) => {
            if (!item || !item.item_id) return null;
            return (
              <ChecklistItem
                key={item.item_id}
                item={item}
                isChecked={checkedItems.has(item.item_id)}
                onToggle={onToggle}
              />
            );
          })
        ) : (
          <div className="flex items-center justify-center py-8 px-4">
            <p className="text-sm text-muted-foreground text-center text-slate-900 dark:text-white">
              선택하신 국가의 맞춤 여행팁이 준비 중입니다.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChecklistSection;
