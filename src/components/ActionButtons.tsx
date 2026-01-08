import { Download, Image, Share2, MessageCircle } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "@/hooks/use-toast";

interface ActionButtonsProps {
  checklistRef: React.RefObject<HTMLDivElement>;
}

const ActionButtons = ({ checklistRef }: ActionButtonsProps) => {
  const downloadAsPDF = async () => {
    if (!checklistRef.current) return;
    
    try {
      toast({ title: "PDF 생성 중...", description: "잠시만 기다려주세요." });
      
      const canvas = await html2canvas(checklistRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f7f9fc",
      });
      
      const imgData = canvas.toDataURL("image/png");
      const pdf = new jsPDF({
        orientation: canvas.width > canvas.height ? "landscape" : "portrait",
        unit: "px",
        format: [canvas.width, canvas.height],
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, canvas.width, canvas.height);
      pdf.save("check-real-trip-checklist.pdf");
      
      toast({ title: "다운로드 완료!", description: "PDF가 저장되었습니다." });
    } catch (error) {
      toast({ title: "오류 발생", description: "PDF 생성에 실패했습니다.", variant: "destructive" });
    }
  };

  const downloadAsImage = async () => {
    if (!checklistRef.current) return;
    
    try {
      toast({ title: "이미지 생성 중...", description: "잠시만 기다려주세요." });
      
      const canvas = await html2canvas(checklistRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#f7f9fc",
      });
      
      const link = document.createElement("a");
      link.download = "check-real-trip-checklist.png";
      link.href = canvas.toDataURL("image/png");
      link.click();
      
      toast({ title: "다운로드 완료!", description: "이미지가 저장되었습니다." });
    } catch (error) {
      toast({ title: "오류 발생", description: "이미지 생성에 실패했습니다.", variant: "destructive" });
    }
  };

  const shareURL = async () => {
    const url = window.location.href;
    
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check Real Trip - 여행 준비 체크리스트",
          text: "해외여행 준비를 위한 체크리스트를 확인해보세요!",
          url: url,
        });
      } catch (error) {
        // User cancelled sharing
      }
    } else {
      await navigator.clipboard.writeText(url);
      toast({ title: "URL 복사 완료!", description: "클립보드에 복사되었습니다." });
    }
  };

  const sendToKakao = () => {
    const url = window.location.href;
    const kakaoUrl = `https://story.kakao.com/share?url=${encodeURIComponent(url)}`;
    window.open(kakaoUrl, "_blank", "width=600,height=400");
  };

  const buttons = [
    { icon: Download, label: "PDF 저장", onClick: downloadAsPDF, primary: true },
    { icon: Image, label: "이미지 저장", onClick: downloadAsImage },
    { icon: Share2, label: "URL 공유", onClick: shareURL },
    { icon: MessageCircle, label: "카카오톡", onClick: sendToKakao },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg">
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-4 gap-2">
          {buttons.map((button) => (
            <button
              key={button.label}
              onClick={button.onClick}
              className={`
                flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all duration-200
                ${button.primary 
                  ? 'bg-primary text-primary-foreground hover:opacity-90' 
                  : 'bg-secondary text-secondary-foreground hover:bg-muted'
                }
              `}
            >
              <button.icon className="w-5 h-5" />
              <span className="text-xs font-medium">{button.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;
