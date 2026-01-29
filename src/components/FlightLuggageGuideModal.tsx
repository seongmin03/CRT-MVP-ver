import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { X } from "lucide-react";

interface FlightLuggageGuideModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const FlightLuggageGuideModal = ({ isOpen, onClose }: FlightLuggageGuideModalProps) => {
  const guideSections = [
    {
      title: "일상/위생",
      items: [
        { name: "손톱깎이", status: "✅", note: "반입 가능" },
        { name: "면도기", status: "✅", note: "반입 가능" },
        { name: "가위/칼", status: "✅", note: "6cm 이하만 반입 가능" },
        { name: "가위/칼", status: "❌", note: "6cm 초과 시 반입 불가" },
      ],
    },
    {
      title: "전자기기",
      items: [
        { name: "노트북", status: "✅", note: "반입 가능" },
        { name: "태블릿", status: "✅", note: "반입 가능" },
        { name: "전자담배", status: "✅", note: "반입 가능" },
        { name: "리튬배터리", status: "✅", note: "100Wh 이하 반입 가능" },
        { name: "리튬배터리", status: "⚠️", note: "100~160Wh 승인 필요" },
        { name: "리튬배터리", status: "❌", note: "160Wh 초과 반입 불가" },
      ],
    },
    {
      title: "의약품",
      items: [
        { name: "알약", status: "✅", note: "반입 가능" },
        { name: "연고", status: "✅", note: "반입 가능" },
        { name: "액상약", status: "⚠️", note: "100ml 초과 시 처방전 지참 필수" },
      ],
    },
    {
      title: "음식물",
      items: [
        { name: "물/음료", status: "❌", note: "100ml 초과 시 반입 불가" },
        { name: "유아식", status: "✅", note: "필요량만큼 반입 가능" },
        { name: "김치/장류", status: "❌", note: "위탁 수하물만 가능" },
      ],
    },
    {
      title: "스포츠/공구",
      items: [
        { name: "라켓", status: "✅", note: "반입 가능" },
        { name: "보드", status: "✅", note: "반입 가능" },
        { name: "배트", status: "❌", note: "반입 불가" },
        { name: "골프채", status: "❌", note: "반입 불가" },
        { name: "망치", status: "❌", note: "반입 불가" },
      ],
    },
    {
      title: "절대 금지",
      items: [
        { name: "총기", status: "❌", note: "반입 불가" },
        { name: "폭죽", status: "❌", note: "반입 불가" },
        { name: "인화성 가스", status: "❌", note: "반입 불가" },
        { name: "살충제", status: "❌", note: "반입 불가" },
      ],
    },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-0 sm:rounded-lg">
        <DialogHeader className="sticky top-0 bg-white dark:bg-slate-900 z-10 border-b px-4 sm:px-6 py-4 shadow-sm relative">
          <DialogTitle className="text-base sm:text-lg font-semibold text-center text-slate-900 dark:text-white pr-8">
            ✈️ 항공기 기내 반입 물품 가이드
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-opacity"
            aria-label="닫기"
          >
            <X className="h-5 w-5 text-slate-900 dark:text-white" />
          </button>
        </DialogHeader>
        
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4">
          {/* 핵심 주의사항 */}
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg">
            <div className="flex items-start gap-2">
              <span className="text-base">🚨</span>
              <div>
                <p className="text-sm font-semibold text-red-800">
                  보조배터리 규정은 직접 확인하세요!
                </p>
                <p className="text-xs text-black mt-1">
                참고용 안내이며, 해당 항공사에서 규정을 직접 확인하세요.                </p>
              </div>
            </div>
          </div>

          {/* 섹션별 가이드 */}
          <div className="space-y-6">
            {guideSections.map((section, sectionIndex) => (
              <div key={sectionIndex} className="space-y-3">
                <h3 className="font-semibold text-base text-slate-900 border-b border-slate-200 pb-2">
                  {section.title}
                </h3>
                <div className="space-y-2">
                  {section.items.map((item, itemIndex) => (
                    <div
                      key={itemIndex}
                      className="flex items-start gap-3 p-3 bg-slate-50 rounded-lg"
                    >
                      <span className="text-lg flex-shrink-0 mt-0.5">{item.status}</span>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-slate-900">{item.name}</p>
                        <p className="text-xs text-slate-600 mt-1">{item.note}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default FlightLuggageGuideModal;
