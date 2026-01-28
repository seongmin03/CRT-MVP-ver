import { useState, useMemo } from "react";
import { 
  CreditCard, 
  Plane, 
  Wifi, 
  FileText, 
  Shield,
  Check,
  AlertCircle
} from "lucide-react";
import TravelInsuranceModal from "./TravelInsuranceModal";
import type { ChecklistItem } from "@/data/checklistData";

interface EssentialItemsProps {
  checkedItems: Set<string>;
  selectedCountry?: string | null;
  allSections?: Array<{
    section_id: string;
    section_title: string;
    items: ChecklistItem[];
  }>;
}

// 카테고리별 매칭할 title 패턴
const categoryTitlePatterns = {
  passport: ["여권 준비"],
  connectivity: ["유심 / eSIM / 로밍 준비", "유심", "eSIM", "로밍"],
  payment_card: ["해외 결제 가능 카드 준비"],
  cash: ["소액 현금 준비"],
  flight_ticket: ["항공권 예약 정보 확인", "항공권"],
  accommodation: ["숙소 예약 정보 정리", "숙소"],
};

const essentialItems = [
  { 
    id: "passport", 
    label: "여권", 
    icon: FileText,
    categoryPatterns: categoryTitlePatterns.passport
  },
  { 
    id: "sim", 
    label: "이심/유심/로밍", 
    icon: Wifi,
    categoryPatterns: categoryTitlePatterns.connectivity
  },
  { 
    id: "payment", 
    label: "현금/트래블 카드", 
    icon: CreditCard,
    categoryPatterns: [...categoryTitlePatterns.payment_card, ...categoryTitlePatterns.cash]
  },
  { 
    id: "ticket", 
    label: "항공권 및 예약 확인서", 
    icon: Plane,
    categoryPatterns: [...categoryTitlePatterns.flight_ticket, ...categoryTitlePatterns.accommodation]
  },
  { 
    id: "insurance", 
    label: "여행자 보험", 
    icon: Shield,
    categoryPatterns: [] // 별도 체크 항목 없음 (항상 미완료)
  },
];

const EssentialItems = ({ checkedItems, selectedCountry, allSections = [] }: EssentialItemsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 카테고리에 해당하는 모든 항목 찾기 (공통 + 국가별 추가 항목 포함)
  const getCategoryItems = (categoryPatterns: string[]): ChecklistItem[] => {
    if (categoryPatterns.length === 0) return [];
    
    const foundItems: ChecklistItem[] = [];
    
    // 모든 섹션을 순회하며 title이 매칭되는 항목 찾기
    allSections.forEach(section => {
      if (!section || !section.items) return;
      
      section.items.forEach(item => {
        if (!item || !item.title) return;
        
        // title이 패턴 중 하나와 일치하는지 확인
        const matches = categoryPatterns.some(pattern => {
          // 정확히 일치하거나 title이 pattern을 포함하는지 확인
          return item.title === pattern || item.title.includes(pattern);
        });
        
        if (matches) {
          foundItems.push(item);
        }
      });
    });
    
    return foundItems;
  };

  // 항목이 완료되었는지 확인 (카테고리의 모든 항목이 체크되었는지)
  const isCompleted = (categoryPatterns: string[]) => {
    if (categoryPatterns.length === 0) return false;
    
    const categoryItems = getCategoryItems(categoryPatterns);
    if (categoryItems.length === 0) return false;
    
    // 카테고리의 모든 항목이 체크되었는지 확인
    return categoryItems.every(item => checkedItems.has(item.item_id));
  };

  // 항목 클릭 시 해당 체크박스로 스크롤 및 강조 (동적 매칭 - 국가별 추가 항목 포함)
  const handleItemClick = (itemId: string, categoryPatterns: string[]) => {
    // 여행자 보험 클릭 시 모달 열기
    if (itemId === 'insurance') {
      setIsModalOpen(true);
      return;
    }
    
    if (categoryPatterns.length === 0) return;
    
    // 카테고리에 해당하는 모든 항목 찾기 (공통 + 국가별 추가 항목 포함)
    const categoryItems = getCategoryItems(categoryPatterns);
    
    if (categoryItems.length === 0) return;
    
    // 모든 항목의 title로 DOM 요소 찾기
    const targetElements = categoryItems
      .map(item => {
        // data-item-title 속성으로 찾기
        const element = document.querySelector(`[data-item-title="${item.title}"]`);
        if (element) return element;
        // 없으면 텍스트 내용으로 찾기
        const allItems = document.querySelectorAll('[data-item-title]');
        return Array.from(allItems).find(el => {
          const text = el.textContent?.trim();
          return text === item.title || text?.includes(item.title);
        }) || null;
      })
      .filter(el => el !== null) as HTMLElement[];
    
    if (targetElements.length === 0) return;
    
    // 첫 번째 항목으로 스크롤
    targetElements[0].scrollIntoView({ behavior: 'smooth', block: 'center' });
    
    // 모든 연결된 항목에 강조 효과 적용
    targetElements.forEach(targetElement => {
      const parentElement = targetElement.closest('.p-3, .p-4, .sm\\:p-4');
      if (parentElement) {
        // 노란색 배경으로 강조
        parentElement.classList.add('bg-yellow-50', 'transition-colors', 'duration-1000');
        
        // 2초 후 강조 해제
        setTimeout(() => {
          parentElement.classList.remove('bg-yellow-50');
          // 추가로 0.5초 후 transition 클래스도 제거
          setTimeout(() => {
            parentElement.classList.remove('transition-colors', 'duration-1000');
          }, 1000);
        }, 2000);
      }
    });
  };

  return (
    <div 
      className="rounded-2xl p-5 animate-fade-in bg-rose-50"
    >
      <div className="mb-4 text-center">
        <h3 className="text-primary font-semibold text-base inline">
          📢 이건 꼭 챙기셔야 해요
        </h3>
        <span className="text-xs text-gray-600 ml-2">
          <nav></nav>아이콘을 클릭해서 정보를 확인하세요
        </span>
      </div>
      
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {essentialItems.map((item) => {
          const completed = isCompleted(item.categoryPatterns);
          const isInsurance = item.id === 'insurance';
          
          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item.id, item.categoryPatterns)}
              className={`
                flex flex-col items-center gap-2 p-3 bg-white/70 rounded-xl transition-all duration-300
                ${completed ? 'opacity-50' : 'hover:bg-white hover:shadow-sm'}
                ${item.categoryPatterns.length > 0 || isInsurance ? 'cursor-pointer' : ''}
              `}
            >
              <div className="relative">
                <div className={`
                  w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm transition-all duration-300
                  ${completed ? 'grayscale' : ''}
                `}>
                  <item.icon className={`
                    w-5 h-5 transition-all duration-300
                    ${completed ? 'text-gray-400' : 'text-primary'}
                  `} />
                </div>
                
                {/* 배지: 보험은 'i', 완료 시 회색 체크, 미완료 시 빨간 느낌표 */}
                {isInsurance ? (
                  <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-slate-400 flex items-center justify-center">
                    <span className="text-white text-xs font-bold italic">i</span>
                  </div>
                ) : (
                  <div className={`
                    absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center transition-all duration-300
                    ${completed ? 'bg-gray-400' : 'bg-red-500'}
                  `}>
                    {completed ? (
                      <Check className="w-3 h-3 text-white" strokeWidth={3} />
                    ) : (
                      <span className="text-white text-xs font-bold">!</span>
                    )}
                  </div>
                )}
              </div>
              
              <span className={`
                text-xs font-medium text-center leading-tight transition-all duration-300
                ${completed ? 'text-gray-400' : 'text-foreground'}
              `}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* 여행자 보험 상세 안내 모달 */}
      <TravelInsuranceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
      />
    </div>
  );
};

export default EssentialItems;
