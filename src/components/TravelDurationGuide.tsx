import { useState, useEffect } from "react";

export type DurationType = "2-3" | "4-5" | "6-7" | "7+";

interface GuideData {
  items: string;
  note: string;
}

interface TravelDurationGuideProps {
  onDurationChange?: (duration: DurationType | null) => void;
}

const durationGuides: Record<DurationType, GuideData> = {
  "2-3": {
    items: "상의: 3~4벌, 하의: 1~2벌, 속옷: 3~4벌, 양말: 3~4켤레",
    note: "최대로 빨래 안 하고 버틸 수 있는 날 수 + 하루 여유 분",
  },
  "4-5": {
    items: "상의: 5~6벌, 하의: 2~3벌, 속옷: 5~6벌, 양말: 5~6켤레",
    note: "최대로 빨래 안 하고 버틸 수 있는 날 수 + 하루 여유 분",
  },
  "6-7": {
    items: "상의: 6~7벌, 하의: 3벌, 속옷: 7~8벌, 양말: 7~8켤레",
    note: "최대로 빨래 안 하고 버틸 수 있는 날 수 + 하루 여유 분",
  },
  "7+": {
    items: "일주일 이상 부터는 중간 세탁을 고려하세요!",
    note: "최대로 빨래 안 하고 버틸 수 있는 날 수 + 하루 여유 분",
  },
};

const TravelDurationGuide = ({ onDurationChange }: TravelDurationGuideProps) => {
  const [selectedDuration, setSelectedDuration] = useState<DurationType | null>(null);

  // 선택된 기간이 변경될 때 부모에게 알림
  useEffect(() => {
    if (onDurationChange) {
      onDurationChange(selectedDuration);
    }
  }, [selectedDuration, onDurationChange]);

  const durations: { value: DurationType; label: string }[] = [
    { value: "2-3", label: "2~3일" },
    { value: "4-5", label: "4~5일" },
    { value: "6-7", label: "6~7일" },
    { value: "7+", label: "일주일 이상" },
  ];

  return (
    <div className="animate-fade-in">
      <div className="p-4 bg-card rounded-xl border border-border shadow-sm">
        {/* 상단: 타이틀과 칩 버튼 (한 줄) */}
        <div className="flex flex-row items-center gap-3 flex-wrap">
          <span className="text-sm font-semibold text-foreground whitespace-nowrap">
            며칠 동안 떠나나요?
          </span>
          <div className="flex flex-row gap-2 flex-wrap">
            {durations.map((duration) => (
              <button
                key={duration.value}
                onClick={() => setSelectedDuration(duration.value)}
                className={`
                  px-3 py-1 rounded-full text-xs font-medium transition-all duration-200
                  ${
                    selectedDuration === duration.value
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                  }
                `}
              >
                <span className="pointer-events-none">{duration.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 하단: 가이드 텍스트 (선택 시에만 표시) */}
        {selectedDuration && (
          <div className="mt-3 pt-3 border-t border-gray-100">
            <p className="text-sm text-gray-700 leading-relaxed">
              {durationGuides[selectedDuration].items}
            </p>
            <p className="text-xs text-gray-500 mt-1.5 leading-relaxed">
              {durationGuides[selectedDuration].note}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TravelDurationGuide;
