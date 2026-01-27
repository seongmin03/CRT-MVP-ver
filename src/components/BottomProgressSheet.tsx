interface BottomProgressSheetProps {
  progress: number;
  completedItems: number;
  totalItems: number;
  isInline?: boolean;
}

const progressMessages: { threshold: number; message: string }[] = [
  { threshold: 15, message: "여권 한번 더 확인하기!" },
  { threshold: 30, message: "필요한 짐은 다 챙기셨나요?" },
  { threshold: 45, message: "마이리얼트립과 진짜 여행을!" },
  { threshold: 50, message: "Travel Everyday, Myrealtrip!" },
  { threshold: 65, message: "공항을 나서는 순간, 새로운 세상으로" },
  { threshold: 80, message: "체크리스트가 곧 완성됩니다." },
  { threshold: 90, message: "이제 여행을 떠나볼까요?" },
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

const BottomProgressSheet = ({ progress, completedItems, totalItems, isInline = false }: BottomProgressSheetProps) => {
  const message = getProgressMessage(progress);

  return (
    <div className={isInline ? "w-full max-w-2xl mx-auto px-4 sm:px-6 mb-10 animate-fade-in" : "fixed bottom-0 left-0 right-0 z-50 max-w-2xl mx-auto px-4 sm:px-6 transition-all duration-300"}>
      <div className={`bg-white/90 backdrop-blur-sm ${isInline ? 'rounded-2xl shadow-lg' : 'rounded-t-2xl shadow-[0_-8px_10px_-5px_rgba(0,0,0,0.08)]'} border-t border-gray-100/50 transition-all duration-300`}>
        <div className="px-4 py-1.5">
          {/* 상단: 텍스트 레이어 (한 줄 정렬) */}
          <div className="relative flex flex-row items-center justify-between mb-1">
            {/* 좌측: 준비 현황 */}
            <span className="text-sm font-bold text-foreground">준비 현황</span>
            
            {/* 중앙: 단계별 메시지 (absolute positioning) */}
            <p className="absolute left-1/2 -translate-x-1/2 text-[11px] text-gray-500 leading-none whitespace-nowrap">
              {message}
            </p>
            
            {/* 우측: 완료 수/전체 수 퍼센트 */}
            <div className="flex items-baseline space-x-1.5 whitespace-nowrap">
              <span className="text-xs text-gray-400">
                {completedItems}/{totalItems}
              </span>
              <span className="text-lg font-bold text-blue-600">
                {progress}%
              </span>
            </div>
          </div>
          
          {/* 하단: 프로그레스 바 */}
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-300 ease-out"
              style={{
                width: `${Math.max(progress, 3)}%`,
                background: "linear-gradient(90deg, #ADD8E6 0%, #007BFF 100%)",
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default BottomProgressSheet;
