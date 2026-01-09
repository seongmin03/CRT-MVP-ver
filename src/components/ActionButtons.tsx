import { Download, Image, Link } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "@/hooks/use-toast";

interface ActionButtonsProps {
  checklistRef: React.RefObject<HTMLDivElement>;
}

const ActionButtons = ({ checklistRef }: ActionButtonsProps) => {
  const captureChecklist = async (): Promise<HTMLCanvasElement | null> => {
    if (!checklistRef.current) return null;

    const element = checklistRef.current;
    
    // Store original styles
    const originalBg = element.style.backgroundColor;
    const originalPadding = element.style.padding;
    
    // Set temporary styles for capture
    element.style.backgroundColor = "#ffffff";
    element.style.padding = "20px";

    // Wait for fonts and images to load
    await document.fonts.ready;
    await new Promise(resolve => setTimeout(resolve, 100));

    try {
      const canvas = await html2canvas(element, {
        scale: 2,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        allowTaint: true,
        scrollX: 0,
        scrollY: 0,
        windowWidth: element.scrollWidth,
        windowHeight: element.scrollHeight,
      });
      
      return canvas;
    } finally {
      // Restore original styles
      element.style.backgroundColor = originalBg;
      element.style.padding = originalPadding;
    }
  };

  const downloadAsPDF = async () => {
    if (!checklistRef.current) return;
    
    try {
      toast({ title: "PDF 생성 중...", description: "잠시만 기다려주세요." });
      
      const canvas = await captureChecklist();
      if (!canvas) throw new Error("Capture failed");
      
      const imgData = canvas.toDataURL("image/png", 1.0);
      
      // Create PDF with A4-like proportions
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const pdfWidth = 210; // A4 width in mm
      const pdfHeight = (imgHeight * pdfWidth) / imgWidth;
      
      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? "portrait" : "landscape",
        unit: "mm",
        format: [pdfWidth, pdfHeight],
      });
      
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight, undefined, "FAST");
      pdf.save("check-real-trip-checklist.pdf");
      
      toast({ title: "다운로드 완료!", description: "PDF가 저장되었습니다." });
    } catch (error) {
      console.error("PDF download error:", error);
      toast({ title: "오류 발생", description: "PDF 생성에 실패했습니다.", variant: "destructive" });
    }
  };

  const downloadAsImage = async () => {
    if (!checklistRef.current) return;
    
    try {
      toast({ title: "이미지 생성 중...", description: "잠시만 기다려주세요." });
      
      const canvas = await captureChecklist();
      if (!canvas) throw new Error("Capture failed");
      
      const link = document.createElement("a");
      link.download = "check-real-trip-checklist.png";
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
      
      toast({ title: "다운로드 완료!", description: "이미지가 저장되었습니다." });
    } catch (error) {
      console.error("Image download error:", error);
      toast({ title: "오류 발생", description: "이미지 생성에 실패했습니다.", variant: "destructive" });
    }
  };

  const copyLink = async () => {
    const url = window.location.href;
    
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "복사되었습니다", duration: 2000 });
    } catch (error) {
      // Fallback: show URL in prompt
      toast({ 
        title: "복사 권한이 없습니다", 
        description: url,
        duration: 5000 
      });
    }
  };

  const buttons = [
    { icon: Download, label: "PDF 다운로드", onClick: downloadAsPDF },
    { icon: Image, label: "이미지 저장", onClick: downloadAsImage },
    { icon: Link, label: "링크 복사", onClick: copyLink },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg">
      <div className="max-w-2xl mx-auto">
        <div className="grid grid-cols-3 gap-2">
          {buttons.map((button) => (
            <button
              key={button.label}
              onClick={button.onClick}
              className="flex flex-col items-center gap-1.5 py-3 px-2 rounded-xl transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5"
              style={{ backgroundColor: "#34495E", color: "#ffffff" }}
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
