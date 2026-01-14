import { Plane } from "lucide-react";

interface ProgressBarWithPlaneProps {
  progress: number;
}

const progressMessages: { threshold: number; message: string }[] = [
  { threshold: 6, message: "문을 나서기 전, 여권은 다시 한번 확인하기!" },
  { threshold: 13, message: "탑승구 위치는 확인하셨나요?" },
  { threshold: 20, message: "곧 있으면 이륙할거에요~ 안전벨트 꼭 하기!" },
  { threshold: 35, message: "하늘을 나는 기분, 정말 좋죠?" },
  { threshold: 50, message: "구름 위를 산책하는 중... 거의 다 왔어요!" },
  { threshold: 70, message: "착륙 준비 중! 체크리스트가 곧 완성됩니다." },
  { threshold: 90, message: "도착 완료! 이제 여행을 떠나볼까요?" },
  { threshold: 100, message: "준비 끝! 즐거운 여행 되세요! ✈️" },
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
