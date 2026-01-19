import { useState } from "react";

type FlightDurationType = "short" | "medium" | "long";

interface GuideData {
  items: string[];
}

const flightGuides: Record<FlightDurationType, GuideData> = {
  short: {
    items: ["체력 소모 ⬇️", "창가 자리 추천", "이어폰"],
  },
  medium: {
    items: ["1회 수면 필수", "통로 자리 추천", "수면안대", "귀마개"],
  },
  long: {
    items: ["비행기에서 하루 보내기", "통로 적극 추천", "가습 마스크"],
  },
};

const TravelFlightGuide = () => {
  const [selectedFlight, setSelectedFlight] = useState<FlightDurationType | null>(null);

  const flightDurations: { value: FlightDurationType; label: string }[] = [
    { value: "short", label: "4시간 이하" },
    { value: "medium", label: "5~8시간" },
    { value: "long", label: "9시간 이상" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="p-4 bg-card rounded-xl border border-border shadow-sm">
        {/* 상단: 타이틀과 칩 버튼 (한 줄) */}
        <div className="flex flex-row items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-foreground whitespace-nowrap">
            ✈️ 얼마나 걸리나요?
          </span>
          <div className="flex flex-row gap-2 flex-wrap">
            {flightDurations.map((flight) => (
              <button
                key={flight.value}
                onClick={() => setSelectedFlight(flight.value)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium transition-all duration-200
                  ${
                    selectedFlight === flight.value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                {flight.label}
              </button>
            ))}
          </div>
        </div>

        {/* 하단: 가이드 텍스트 (선택 시에만 표시) */}
        {selectedFlight && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <div className="flex flex-wrap gap-x-3 gap-y-1">
              {flightGuides[selectedFlight].items.map((item, index) => (
                <span key={index} className="text-sm text-gray-600">
                  • {item}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelFlightGuide;
