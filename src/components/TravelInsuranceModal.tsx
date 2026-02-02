import { useState, useEffect } from "react";
import { X } from "lucide-react";

interface TravelInsuranceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

// 고유 사용자 ID 가져오기
const getUserId = (): string => {
  try {
    const userId = localStorage.getItem('gtm_user_id');
    if (userId) {
      return userId;
    }
    // 없으면 fallback ID 생성
    return `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  } catch (error) {
    console.error('Failed to get user ID:', error);
    return `fallback_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
  }
};

const TravelInsuranceModal = ({ isOpen, onClose }: TravelInsuranceModalProps) => {
  const [isClosing, setIsClosing] = useState(false);
  const [shouldRender, setShouldRender] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setShouldRender(true);
      setIsClosing(false);
    } else {
      setIsClosing(true);
      const timer = setTimeout(() => {
        setShouldRender(false);
        setIsClosing(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  if (!shouldRender) return null;

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      handleClose();
    }
  };

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      onClose();
    }, 300);
  };

  const handleInsuranceButtonClick = () => {
    // GTM dataLayer 이벤트 전송
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      const userId = getUserId();
      (window as any).dataLayer.push({
        event: 'insurance_link_click',
        user_id: userId
      });
    }
  };

  return (
    <div
      className={`fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/50 transition-opacity duration-300 ${
        isClosing ? 'opacity-0 ease-in' : 'opacity-100 ease-out'
      }`}
      onClick={handleBackdropClick}
    >
      <div className={`relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl shadow-2xl max-h-[90vh] overflow-y-auto transition-all duration-300 ${
        isClosing 
          ? 'opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95 ease-in' 
          : 'opacity-100 translate-y-0 scale-100 ease-out'
      }`}>
        {/* 닫기 버튼 */}
        <button
          onClick={handleClose}
          className="absolute top-4 right-4 w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors duration-200 z-10"
          aria-label="닫기"
        >
          <X className="w-5 h-5 text-gray-600" />
        </button>

        {/* 모달 내용 */}
        <div className="p-6 sm:p-8">
          {/* 제목 */}
          <h2 className="text-xl sm:text-2xl font-bold text-foreground mb-6 pr-8">
            여행자 보험, 꼭 들어야 할까요? ✈️
          </h2>

          {/* 질문과 답변 */}
          <div className="space-y-6 mb-8">
            {/* 질문 1 */}
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-semibold text-primary flex items-center gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                  1
                </span>
                여행자 보험이 뭔가요?
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pl-8">
                여행 중 사고/질병 치료비, 휴대품 도난/파손, 비행기 지연 등을 보상해주는 안전장치예요.
              </p>
            </div>

            {/* 질문 2 */}
            <div className="space-y-2">
              <h3 className="text-base sm:text-lg font-semibold text-primary flex items-center gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-100 flex items-center justify-center text-sm font-bold text-blue-600">
                  2
                </span>
                의무 가입인가요?
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pl-8">
                대한민국은 2000년 이후로 의무가 아니에요.<br /> 즉, <b>선택 사항</b>입니다!
              </p>
            </div>

            {/* 결론 */}
            <div className="space-y-2 bg-blue-50/50 rounded-xl p-4">
              <h3 className="text-base sm:text-lg font-semibold text-primary flex items-center gap-2">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-blue-600 flex items-center justify-center text-sm font-bold text-white">
                  ✓
                </span>
                그래도 가입을 추천하는 이유!
              </h3>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed pl-8">
                해외의 비싼 병원비와 예기치 못한 도난 사고를 대비할 수 있는 안전한 방법이기 때문이에요.
              </p>
            </div>
          </div>

          {/* 하단 액션 버튼 */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <a
              href="https://www.myrealtrip.com/event/flight_insurance"
              target="_blank"
              rel="noopener noreferrer"
              onClick={handleInsuranceButtonClick}
              id="gtm-insurance-btn-click"
              data-gtm-category="conversion"
              data-gtm-label="insurance_popup_button"
              className="block w-full bg-[#51ABF3] hover:bg-[#3A9AE5] text-white font-bold text-center py-4 px-6 rounded-xl transition-colors duration-200"
            >
              <span className="pointer-events-none">여행자 보험 확인하기</span>
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TravelInsuranceModal;
