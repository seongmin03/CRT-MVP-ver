import { Plane } from "lucide-react";

interface ProgressBarWithPlaneProps {
  progress: number;
}

const progressMessages: { threshold: number; message: string }[] = [
  { threshold: 10, message: "여권 한번 더 확인하기!" },
  { threshold: 25, message: "필요한 짐은 다 챙기셨나요?" },
  { threshold: 40, message: "마이리얼트립이 진정한 여행을 도와줄게요" },
  { threshold: 55, message: "곧 이륙할거에요! 안전벨트 잊지 마세요~" },
  { threshold: 70, message: "Travel Everyday, Myrealtrip!" },
  { threshold: 85, message: "어느새 도착했어요!" },
  { threshold: 95, message: "공항을 나서는 순간, 새로운 세상으로" },
  { threshold: 100, message: "이제 준비 끝! ✈️" },
];

const getProgressMessage = (progress: number): string => {
  // 역순으로 확인하여 가장 가까운 threshold 찾기
  for (let i = progressMessages.length - 1; i >= 0; i--) {
    if (progress >= progressMessages[i].threshold) {
      return progressMessages[i].message;
    }
  }
  return progressMessages[0].message;
};

const ProgressBarWithPlane = ({ progress }: ProgressBarWithPlaneProps) => {
  const message = getProgressMessage(progress);

  return (
    <div className="relative mb-3">
      {/* Progress bar track */}
      <div className="h-3 sm:h-3.5 bg-muted rounded-full overflow-visible relative shadow-inner">
        {/* Progress bar fill - Light sky blue to bright blue gradient */}
        <div
          className="h-full rounded-full transition-all duration-700 ease-out relative shadow-sm"
          style={{
            width: `${Math.max(progress, 3)}%`,
            background: "linear-gradient(90deg, #ADD8E6 0%, #4A90E2 50%, #007BFF 100%)",
          }}
        >
          {/* Airplane icon at the end of progress bar - white fill with black outline */}
          <div
            className="absolute -right-4 top-1/2 -translate-y-1/2 transition-all duration-700 ease-out"
            style={{ filter: "drop-shadow(0 2px 6px rgba(0, 0, 0, 0.25))" }}
          >
            <Plane 
              className="w-6 h-6 sm:w-7 sm:h-7 transition-transform duration-300 hover:scale-110" 
              fill="white" 
              stroke="black" 
              strokeWidth={1.5}
            />
          </div>
        </div>
      </div>

      {/* Progress message - 비행기 근처에 표시 */}
      <p className="text-xs sm:text-sm text-muted-foreground mt-2 text-center animate-fade-in font-medium">
        {message}
      </p>
    </div>
  );
};

export default ProgressBarWithPlane;
