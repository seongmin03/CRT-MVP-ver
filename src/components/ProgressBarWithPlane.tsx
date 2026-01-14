import { Plane } from "lucide-react";

interface ProgressBarWithPlaneProps {
  progress: number;
}

const progressMessages: { threshold: number; message: string }[] = [
  { threshold: 6, message: "여권 한번 더 확인하기!" },
  { threshold: 13, message: "필요한 짐은 다 챙기셨나요?" },
  { threshold: 20, message: "마이리얼트립이 진정한 여행을 도와줄게요" },
  { threshold: 35, message: "Travel Everyday, Myrealtrip!" },
  { threshold: 45, message: "공항을 나서는 순간, 새로운 세상으로" },
  { threshold: 60, message: "착륙 준비 중! 체크리스트가 곧 완성됩니다." },
  { threshold: 75, message: "도착 완료! 이제 여행을 떠나볼까요?" },
  { threshold: 90, message: "준비 끝! 즐거운 여행 되세요! ✈️" },
];

const getProgressMessage = (progress: number): string => {
  for (const { threshold, message } of progressMessages) {
    if (progress <= threshold) {
      return message;
    }
  }
  return progressMessages[progressMessages.length - 1].message;
};

const ProgressBarWithPlane = ({ progress }: ProgressBarWithPlaneProps) => {
  const message = getProgressMessage(progress);

  return (
    <div className="relative mb-3">
      {/* Progress bar track */}
      <div className="h-3 bg-muted rounded-full overflow-visible relative">
        {/* Progress bar fill - Light sky blue to bright blue gradient */}
        <div
          className="h-full rounded-full transition-all duration-500 ease-out relative"
          style={{
            width: `${Math.max(progress, 3)}%`,
            background: "linear-gradient(90deg, #ADD8E6 0%, #007BFF 100%)",
          }}
          data-progress-width={progress}
        >
          {/* Airplane icon at the end of progress bar - white fill with black outline */}
          <div
            className="absolute -right-4 top-1/2 -translate-y-1/2 transition-all duration-500"
            style={{ filter: "drop-shadow(0 2px 4px rgba(0, 0, 0, 0.2))" }}
          >
            <Plane 
              className="w-7 h-7" 
              fill="white" 
              stroke="black" 
              strokeWidth={1.5}
            />
          </div>
        </div>
      </div>

      {/* Progress message */}
      <p className="text-xs text-muted-foreground mt-2 text-center animate-fade-in">
        {message}
      </p>
    </div>
  );
};

export default ProgressBarWithPlane;
