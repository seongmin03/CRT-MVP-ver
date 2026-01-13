import { 
  CreditCard, 
  Plane, 
  Wifi, 
  FileText, 
  Shield 
} from "lucide-react";

const essentialItems = [
  { id: "passport", label: "여권", icon: FileText },
  { id: "sim", label: "이심/유심/포켓 와이파이", icon: Wifi },
  { id: "payment", label: "현금/트래블 카드", icon: CreditCard },
  { id: "ticket", label: "항공권 및 예약 확인서", icon: Plane },
  { id: "insurance", label: "여행자 보험", icon: Shield },
];

const EssentialItems = () => {
  const handleItemClick = (itemId: string) => {
    if (itemId === "insurance") {
      // 여행자 보험 버튼 클릭 시 삼성화재 링크로 이동
      window.open("https://direct.samsungfire.com/vd/overture_index.jsp?OTK=F2511AF0516", "_blank");
    }
  };

  return (
    <div 
      className="rounded-2xl p-5 mb-6 animate-fade-in shadow-sm"
      style={{ 
        backgroundColor: "#FFF0F5",
        border: "1px solid rgba(0, 0, 0, 0.05)"
      }}
    >
      <h3 className="text-primary font-semibold text-base mb-4">
        이건 꼭 챙기셔야 해요!
      </h3>
      
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {essentialItems.map((item) => (
          <div
            key={item.id}
            onClick={() => handleItemClick(item.id)}
            className={`flex flex-col items-center gap-2 p-3 bg-white/70 rounded-xl transition-all duration-300 hover:bg-white hover:shadow-md hover:-translate-y-0.5 active:translate-y-0 ${
              item.id === "insurance" ? "cursor-pointer" : ""
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-white flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110">
              <item.icon className="w-5 h-5 text-primary" />
            </div>
            <span className="text-xs font-medium text-foreground text-center leading-tight">
              {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default EssentialItems;
