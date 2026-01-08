import { Plane } from "lucide-react";

const Header = () => {
  return (
    <header className="text-center py-8 animate-fade-in">
      <div className="flex items-center justify-center gap-3 mb-3">
        <div className="w-12 h-12 bg-accent rounded-2xl flex items-center justify-center shadow-lg">
          <Plane className="w-6 h-6 text-accent-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-primary">Check Real Trip</h1>
      </div>
      <p className="text-muted-foreground text-sm max-w-md mx-auto">
        해외여행 준비, 빠짐없이 체크하세요.<br />
        완료한 항목은 체크하고, 저장하거나 공유할 수 있어요.
      </p>
    </header>
  );
};

export default Header;
