import { Plane } from "lucide-react";

const Header = () => {
  return (
    <header className="text-center py-4 animate-fade-in">
      <div className="flex items-center justify-center gap-3 mb-1">
        <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-lg">
          <Plane className="w-6 h-6 text-accent-foreground" />
        </div>
        <h1 className="text-3xl font-bold text-primary">Check Real Trip</h1>
      </div>
      <div className="text-muted-foreground text-sm max-w-md mx-auto space-y-0.5">
        <p>마이리얼트립이 준비한 체크리스트</p>
        <p>해외여행 준비 빠짐없이 확인하세요!</p>
      </div>
    </header>
  );
};

export default Header;
