import { useState } from "react";
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

interface EssentialItemsProps {
  checkedItems: Set<string>;
}

const essentialItems = [
  { 
    id: "passport", 
    label: "여권", 
    icon: FileText,
    checkItems: ["passport"] // passport 체크 시 완료
  },
  { 
    id: "sim", 
    label: "이심/유심/로밍", 
    icon: Wifi,
    checkItems: ["connectivity"] // connectivity 체크 시 완료
  },
  { 
    id: "payment", 
    label: "현금/트래블 카드", 
    icon: CreditCard,
    checkItems: ["payment_card", "cash"] // 둘 다 체크 시 완료
  },
  { 
    id: "ticket", 
    label: "항공권 및 예약 확인서", 
    icon: Plane,
    checkItems: ["flight_ticket", "accommodation"] // 둘 다 체크 시 완료
  },
  { 
    id: "insurance", 
    label: "여행자 보험", 
    icon: Shield,
    checkItems: [] // 별도 체크 항목 없음 (항상 미완료)
  },
];

const EssentialItems = ({ checkedItems }: EssentialItemsProps) => {
  const [isModalOpen, setIsModalOpen] = useState(false);

  // 항목이 완료되었는지 확인
  const isCompleted = (checkItems: string[]) => {
    if (checkItems.length === 0) return false;
    return checkItems.every(itemId => checkedItems.has(itemId));
  };

  // 항목 클릭 시 해당 체크박스로 스크롤 및 강조
  const handleItemClick = (itemId: string, checkItems: string[]) => {
    // 여행자 보험 클릭 시 모달 열기
    if (itemId === 'insurance') {
      setIsModalOpen(true);
      return;
    }
    
    if (checkItems.length === 0) return;
    
    // 모든 연결된 항목 찾기
    const targetElements = checkItems
      .map(itemId => document.querySelector(`[data-item-id="${itemId}"]`))
      .filter(el => el !== null);
    
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
      <h3 className="text-primary font-semibold text-base mb-4 text-center">
        📢 이건 꼭 챙기셔야 해요
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {essentialItems.map((item) => {
          const completed = isCompleted(item.checkItems);
          const isInsurance = item.id === 'insurance';
          
          return (
            <div
              key={item.id}
              onClick={() => handleItemClick(item.id, item.checkItems)}
              className={`
                flex flex-col items-center gap-2 p-3 bg-white/70 rounded-xl transition-all duration-300
                ${completed ? 'opacity-50' : 'hover:bg-white hover:shadow-sm'}
                ${item.checkItems.length > 0 || isInsurance ? 'cursor-pointer' : ''}
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
