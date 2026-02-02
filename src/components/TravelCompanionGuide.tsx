import { useState } from "react";

type CompanionType = "solo" | "couple" | "group" | "tour";

interface GuideData {
  tips: string[];
}

const companionGuides: Record<CompanionType, GuideData> = {
  solo: {
    tips: [
      "🏠 숙소에서 아끼세요! 도미토리, 게스트 하우스 등 1인 숙소를 이용하세요.",
      "🚌 이동에서 아끼세요! 대중교통을 적극 활용하세요.",
    ],
  },
  couple: {
    tips: [
      "🏠 숙소에서 아끼세요! 더블룸, 비즈니스 호텔 등 2인실을 이용하세요.",
      "🍝 식비에서 아끼세요! 세트 메뉴, 쉐어 메뉴 등을 활용하세요.",
    ],
  },
  group: {
    tips: [
      "🚕 이동에서 아끼세요! 오히려 대중교통보다 1인당 택시 요금이 더 저렴할 수 있어요.",
    ],
  },
  tour: {
    tips: [
      "🚩 패키지가 효율적인 방법일 수 있어요.",
    ],
  },
};

const TravelCompanionGuide = () => {
  const [selectedCompanion, setSelectedCompanion] = useState<CompanionType | null>(null);

  const companions: { value: CompanionType; label: string }[] = [
    { value: "solo", label: "혼자서" },
    { value: "couple", label: "둘이서" },
    { value: "group", label: "여럿이서" },
    { value: "tour", label: "단체로" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="p-4 bg-card rounded-xl border border-border shadow-sm">
        {/* 상단: 타이틀과 칩 버튼 (한 줄) */}
        <div className="flex flex-row items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-foreground whitespace-nowrap">
            누구와 떠나나요?
          </span>
          <div className="flex flex-row gap-2 flex-wrap">
            {companions.map((companion) => (
              <button
                key={companion.value}
                onClick={() => setSelectedCompanion(companion.value)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium transition-all duration-200
                  ${
                    selectedCompanion === companion.value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                <span className="pointer-events-none">{companion.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 하단: 가이드 텍스트 (선택 시에만 표시) */}
        {selectedCompanion && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="space-y-1.5">
              {companionGuides[selectedCompanion].tips.map((tip, index) => (
                <p key={index} className="text-sm text-gray-600 leading-relaxed">
                  {tip}
                </p>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelCompanionGuide;
