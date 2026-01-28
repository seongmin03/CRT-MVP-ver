import type { ChecklistSection as ChecklistSectionType } from "@/data/checklistData";
import ChecklistItem from "./ChecklistItem";
import { type DurationType } from "./TravelDurationGuide";
import { parseTextWithLinks } from "@/lib/linkUtils";

interface ChecklistSectionProps {
  section: ChecklistSectionType;
  checkedItems: Set<string>;
  onToggle: (itemId: string) => void;
  selectedDuration?: DurationType | null;
  onDurationChange?: (duration: DurationType | null) => void;
  onMedicalCardClick?: () => void;
  selectedCountry?: string | null;
  hideCompletedItems?: boolean;
}

const sectionIcons: Record<string, string> = {
  essentials: "📄",
  finance: "💳",
  electronics: "🔌",
  health: "💊",
  packing: "👕",
  travel_tips: "💡",
};

const ChecklistSection = ({ section, checkedItems, onToggle, selectedDuration, onDurationChange, onMedicalCardClick, selectedCountry, hideCompletedItems = false }: ChecklistSectionProps) => {
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

  // 원본 항목 (진행률 계산용)
  const originalValidItems = section.items.filter(item => item && item.item_id);
  
  // 표시할 항목 (필터링 적용)
  let validItems = originalValidItems;
  
  // 완료 항목 숨기기가 켜져있으면 체크되지 않은 항목만 표시
  if (hideCompletedItems) {
    validItems = validItems.filter(item => !checkedItems.has(item.item_id));
  }
  
  const isTravelTips = section.section_id === "travel_tips";
  
  // 여행팁 섹션이 아닌 경우에만 진행률 계산 (원본 항목 기준)
  const completedCount = isTravelTips ? 0 : originalValidItems.filter(item => checkedItems.has(item.item_id)).length;
  const totalCount = isTravelTips ? 0 : originalValidItems.length;
  const progress = !isTravelTips && totalCount > 0 ? (completedCount / totalCount) * 100 : 0;

  // 안내 문구가 필요한 섹션 ID 목록
  const sectionsWithGuide = ["electronics", "health", "packing"];

  return (
    <div className="card-toss animate-fade-in min-h-[200px]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">{sectionIcons[section.section_id] || "📋"}</span>
          <h3 className="section-title mb-0 text-slate-900 dark:text-white">{section.section_title}</h3>
        </div>
        {!isTravelTips && (
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
        )}
      </div>

      {/* Progress bar - 여행팁 섹션은 제외 */}
      {!isTravelTips && (
        <div className="h-1.5 bg-muted rounded-full mb-4 overflow-hidden">
          <div 
            className="h-full bg-accent rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}

      {/* packing 섹션일 때 기간 선택 UI를 최상단에 표시 */}
      {section.section_id === "packing" && onDurationChange && (
        <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-200">
          <div className="flex flex-row items-center gap-3 flex-wrap">
            <span className="text-sm font-semibold text-foreground whitespace-nowrap">
              며칠 동안 떠나나요?
            </span>
            <div className="flex flex-row gap-2 flex-wrap">
              {[
                { value: "2-3" as DurationType, label: "2~3일" },
                { value: "4-5" as DurationType, label: "4~5일" },
                { value: "6-7" as DurationType, label: "6~7일" },
                { value: "7+" as DurationType, label: "일주일 이상" },
              ].map((duration) => (
                <button
                  key={duration.value}
                  onClick={() => onDurationChange(duration.value)}
                  className={`
                    px-3 py-1 rounded-full text-xs font-medium transition-all duration-200
                    ${
                      selectedDuration === duration.value
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                    }
                  `}
                >
                  {duration.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-1">
        {/* health 섹션일 때 응급 의료 카드 섹션을 최상단에 추가 */}
        {section.section_id === "health" && onMedicalCardClick && (
          <div className="mb-3 p-4 bg-red-300 rounded-xl border border-red-200 flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚨</span>
                <span className="font-semibold text-sm sm:text-base text-white">
                  응급 의료 카드 만들기
                </span>
              </div>
              <p className="text-[11px] text-white mt-1.5 ml-8">
                해외 병원에서 이 카드를 제시하면 입력하신 정보를 통해 상황 전달을 도울 수 있어요.
              </p>
            </div>
            <button
              onClick={onMedicalCardClick}
              className="px-4 py-2 bg-red-400 hover:bg-red-500 rounded-lg text-sm font-medium text-white transition-all duration-200 shadow-sm ml-3 flex-shrink-0"
            >
              정보입력
            </button>
          </div>
        )}

        {validItems && validItems.length > 0 ? (
          // 여행팁 섹션은 체크박스 없이 정보성 텍스트로만 표시
          section.section_id === "travel_tips" ? (
            validItems.map((item, index) => {
              if (!item || !item.item_id) return null;
              return (
                <div
                  key={item.item_id}
                  className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all duration-200"
                >
                  <div className="flex-1 min-w-0">
                    <h4 
                      className="font-semibold text-sm sm:text-base text-slate-900 dark:text-white mb-1"
                      style={{ lineHeight: '1.5' }}
                      data-item-title={item.title}
                    >
                      {item.link_url && item.cta_type === "link" ? (
                        <a
                          href={item.link_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline decoration-2 underline-offset-2 transition-colors"
                        >
                          {item.title}
                        </a>
                      ) : (
                        parseTextWithLinks(item.title, selectedCountry, true)
                      )}
                    </h4>
                    {item.description && (
                      <p 
                        className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-gray-300 mt-1"
                        style={{ lineHeight: '1.5' }}
                      >
                        {parseTextWithLinks(item.description, selectedCountry)}
                      </p>
                    )}
                  </div>
                </div>
              );
            })
          ) : (
            validItems.map((item, index) => {
              if (!item || !item.item_id) return null;
              return (
                <ChecklistItem
                  key={item.item_id}
                  item={item}
                  isChecked={checkedItems.has(item.item_id)}
                  onToggle={onToggle}
                  selectedCountry={selectedCountry}
                />
              );
            })
          )
        ) : (
          <div className="flex items-center justify-center py-8 px-4">
            <p className="text-sm text-muted-foreground text-center text-slate-900 dark:text-white">
              {hideCompletedItems && 
               originalValidItems.length > 0 && 
               !isTravelTips &&
               originalValidItems.every(item => checkedItems.has(item.item_id))
                ? "모든 준비를 마쳤어요! 🎉"
                : "선택하신 국가의 맞춤 여행팁이 준비 중입니다."}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ChecklistSection;
