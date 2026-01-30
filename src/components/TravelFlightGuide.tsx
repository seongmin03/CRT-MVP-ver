import { useState } from "react";

type FlightDurationType = "short" | "medium" | "long";

interface GuideItem {
  text: string;
  link?: string;
}

interface GuideData {
  items: GuideItem[];
}

const flightGuides: Record<FlightDurationType, GuideData> = {
  short: {
    items: [
      { text: "체력 소모 ⬇️" },
      { text: "창가 자리 추천" },
      { text: "이어폰" },
    ],
  },
  medium: {
    items: [
      { text: "1회 수면 필수" },
      { text: "통로 자리 추천" },
      { text: "수면안대", link: "https://link.coupang.com/a/dvoJfF" },
      { text: "귀마개", link: "https://link.coupang.com/a/dvoOzX" },
    ],
  },
  long: {
    items: [
      { text: "비행기에서 하루 보내기" },
      { text: "통로 적극 추천" },
      { text: "가습 마스크", link: "https://link.coupang.com/a/dvoQlz" },
    ],
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
            <div className="flex flex-wrap gap-x-3 gap-y-1.5">
              {flightGuides[selectedFlight].items.map((item, index) => (
                <span key={index} className="text-sm text-gray-600">
                  • {item.link ? (
                    <a
                      href={item.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="underline text-blue-600 hover:text-blue-800 transition-colors duration-200"
                      {...(item.link.includes('coupang.com') || item.link.includes('link.coupang.com') ? { 'data-gtm': 'outbound_coupang' } : {})}
                    >
                      {item.text}
                    </a>
                  ) : (
                    item.text
                  )}
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
