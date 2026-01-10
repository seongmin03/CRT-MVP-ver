import { Download, Image, Link, ExternalLink } from "lucide-react";
import { toPng } from "html-to-image";
import { jsPDF } from "jspdf";
import { toast } from "@/hooks/use-toast";

interface ActionButtonsProps {
  checklistRef: React.RefObject<HTMLDivElement>;
}

const ActionButtons = ({ checklistRef }: ActionButtonsProps) => {
  const captureChecklist = async (): Promise<string | null> => {
    if (!checklistRef.current) return null;

    const element = checklistRef.current;
    
    // 캡처 영역 확인
    if (!element || element.offsetWidth === 0 || element.offsetHeight === 0) {
      console.error("캡처할 요소가 없거나 크기가 0입니다.");
      return null;
    }
    
    // 폰트 로딩 대기 - 모든 폰트가 완전히 로드될 때까지 대기
    try {
      await document.fonts.ready;
      // 추가 안정성을 위한 대기 시간
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // 이미지 로딩 확인
      const images = element.querySelectorAll("img");
      const imagePromises = Array.from(images).map((img) => {
        if (img.complete) return Promise.resolve();
        return new Promise((resolve) => {
          img.onload = resolve;
          img.onerror = resolve; // 에러가 나도 계속 진행
          setTimeout(resolve, 2000); // 최대 2초 대기
        });
      });
      await Promise.all(imagePromises);
      
      // 추가 렌더링 대기
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.warn("폰트/이미지 로딩 대기 중 오류:", error);
    }

    try {
      const dataUrl = await toPng(element, {
        backgroundColor: '#ffffff', // 배경을 무조건 흰색으로 고정
        pixelRatio: 2, // 선명도 향상
        cacheBust: true, // 캐시 문제 해결
        style: {
          color: 'black', // 캡처 시 텍스트 색상 강제 지정
        },
        filter: (node) => {
          // 불필요한 요소 제외 (예: 버튼 등)
          const className = (node as HTMLElement).className || '';
          if (typeof className === 'string' && className.includes('fixed')) {
            return false;
          }
          return true;
        },
      });
      
      return dataUrl;
    } catch (error) {
      console.error("캡처 중 오류:", error);
      return null;
    }
  };

  const downloadAsPDF = async () => {
    if (!checklistRef.current) return;
    
    try {
      toast({ title: "PDF 생성 중...", description: "잠시만 기다려주세요.", duration: 2000 });
      
      // 1단계: html-to-image의 toPng를 사용하여 #checklist-root 영역을 고화질 이미지로 추출
      console.log("PDF 생성 시작: 이미지 추출 단계");
      await document.fonts.ready;
      await new Promise(resolve => setTimeout(resolve, 500));
      
      const dataUrl = await captureChecklist();
      if (!dataUrl) {
        throw new Error("이미지 추출 실패: captureChecklist가 null을 반환했습니다.");
      }
      
      console.log("이미지 추출 완료, 이미지 로딩 대기 중...");
      
      // 2단계: 추출된 이미지 데이터가 완전히 로드될 때까지 대기
      // 'image is not a constructor' 에러 방지를 위해 window.Image() 사용
      const img = new window.Image();
      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          console.log("이미지 로딩 완료, 크기:", img.width, "x", img.height);
          resolve();
        };
        img.onerror = (error) => {
          console.error("이미지 로딩 실패:", error);
          reject(new Error("이미지 로딩 실패: 이미지 데이터를 불러올 수 없습니다."));
        };
        img.src = dataUrl;
      });
      
      const imgWidth = img.width;
      const imgHeight = img.height;
      
      if (!imgWidth || !imgHeight || imgWidth === 0 || imgHeight === 0) {
        throw new Error(`이미지 크기 오류: width=${imgWidth}, height=${imgHeight}`);
      }
      
      console.log("PDF 생성 시작: jsPDF 초기화");
      
      // A4 용지 크기 (mm 단위)
      const A4_WIDTH = 210; // A4 가로
      const A4_HEIGHT = 297; // A4 세로
      const MARGIN = 10; // 여백 (양쪽 합쳐서)
      
      const availableWidth = A4_WIDTH - MARGIN;
      const availableHeight = A4_HEIGHT - MARGIN;
      
      // 이미지 비율 계산
      const imgRatio = imgWidth / imgHeight;
      const availableRatio = availableWidth / availableHeight;
      
      let pdfWidth: number;
      let pdfHeight: number;
      
      if (imgRatio > availableRatio) {
        // 이미지가 더 넓음 - 가로에 맞춤
        pdfWidth = availableWidth;
        pdfHeight = availableWidth / imgRatio;
      } else {
        // 이미지가 더 높음 - 세로에 맞춤
        pdfHeight = availableHeight;
        pdfWidth = availableHeight * imgRatio;
      }
      
      console.log("PDF 크기 계산 완료:", pdfWidth, "x", pdfHeight, "mm");
      
      // PDF 생성 (항상 portrait)
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });
      
      // 중앙 정렬을 위한 위치 계산
      const x = (A4_WIDTH - pdfWidth) / 2;
      const y = (A4_HEIGHT - pdfHeight) / 2;
      
      console.log("PDF에 이미지 추가 중...");
      
      // 이미지 추가 (여백 포함하여 중앙 정렬)
      pdf.addImage(dataUrl, "PNG", x, y, pdfWidth, pdfHeight, undefined, "FAST");
      
      console.log("PDF 저장 중...");
      pdf.save("check-real-trip-checklist.pdf");
      
      console.log("PDF 생성 완료");
      toast({ title: "다운로드 완료!", description: "PDF가 저장되었습니다.", duration: 2000 });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      const errorStack = error instanceof Error ? error.stack : undefined;
      console.error("PDF 다운로드 오류 상세:", {
        message: errorMessage,
        stack: errorStack,
        error: error
      });
      toast({ 
        title: "오류 발생", 
        description: `PDF 생성에 실패했습니다: ${errorMessage}`, 
        variant: "destructive", 
        duration: 2000 
      });
    }
  };

  const downloadAsImage = async () => {
    if (!checklistRef.current) return;
    
    try {
      toast({ title: "이미지 생성 중...", description: "잠시만 기다려주세요.", duration: 2000 });
      
      const dataUrl = await captureChecklist();
      if (!dataUrl) throw new Error("Capture failed");
      
      const link = document.createElement("a");
      link.download = "check-real-trip-checklist.png";
      link.href = dataUrl;
      link.click();
      
      toast({ title: "다운로드 완료!", description: "이미지가 저장되었습니다.", duration: 2000 });
    } catch (error) {
      console.error("Image download error:", error);
      toast({ title: "오류 발생", description: "이미지 생성에 실패했습니다.", variant: "destructive", duration: 2000 });
    }
  };

  const copyLink = async () => {
    const url = window.location.href;
    
    // 모바일 접속 가이드: localhost 체크
    if (url.includes('localhost') || url.includes('127.0.0.1')) {
      const message = "모바일 접속을 위해서는 컴퓨터의 IP 주소를 사용하세요.\n\n현재 주소: " + url;
      console.warn(message);
      toast({ 
        title: "모바일 접속 안내", 
        description: "모바일 접속을 위해서는 컴퓨터의 IP 주소를 사용하세요.",
        duration: 2000 
      });
    }
    
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: "복사되었습니다", duration: 2000 });
    } catch (error) {
      // Fallback: show URL in prompt
      toast({ 
        title: "복사 권한이 없습니다", 
        description: url,
        duration: 2000 
      });
    }
  };

  const openCPSLink = () => {
    // 마이리얼트립 공식 홈페이지
    window.open("https://www.myrealtrip.com/", "_blank");
  };

  const buttons = [
    { icon: Download, label: "PDF 다운로드", onClick: downloadAsPDF },
    { icon: Image, label: "이미지 저장", onClick: downloadAsImage },
    { icon: Link, label: "링크 복사", onClick: copyLink },
    { icon: ExternalLink, label: "마이리얼트립", onClick: openCPSLink },
  ];

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-3 shadow-lg">
      <div className="max-w-2xl mx-auto">
        {/* 4개 버튼 한 줄 배치 */}
        <div className="grid grid-cols-4 gap-2">
          {buttons.map((button) => (
            <button
              key={button.label}
              onClick={button.onClick}
              className="flex flex-col items-center gap-1 py-2 px-1 rounded-lg transition-all duration-200 hover:opacity-90 hover:-translate-y-0.5 whitespace-nowrap"
              style={{ backgroundColor: "#1e293b", color: "#ffffff" }}
            >
              <button.icon className="w-4 h-4 flex-shrink-0" />
              <span className="text-[10px] font-medium leading-tight text-center">{button.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ActionButtons;
