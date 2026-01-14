import { Download, Image, Link } from "lucide-react";
import html2canvas from "html2canvas";
import { jsPDF } from "jspdf";
import { toast } from "@/hooks/use-toast";

interface ActionButtonsProps {
  checklistRef: React.RefObject<HTMLDivElement>;
}

const ActionButtons = ({ checklistRef }: ActionButtonsProps) => {
  const captureChecklist = async (): Promise<HTMLCanvasElement | null> => {
    if (!checklistRef.current) {
      console.error("checklistRef.current is null");
      return null;
    }

    const element = checklistRef.current;
    
    // 요소가 실제로 DOM에 있는지 확인
    if (!element.isConnected) {
      console.error("Element is not connected to DOM");
      return null;
    }

    // 요소의 크기 확인
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) {
      console.error("Element has zero dimensions", rect);
      return null;
    }
    
    // Wait for fonts to load
    await document.fonts.ready;
    
    // Wait for all images to load (including those outside the element)
    const allImages = document.querySelectorAll("img");
    const imagePromises = Array.from(allImages).map((img) => {
      if (img.complete && img.naturalWidth > 0) return Promise.resolve();
      return new Promise((resolve) => {
        const timeout = setTimeout(resolve, 3000); // Max 3 seconds wait
        img.onload = () => {
          clearTimeout(timeout);
          resolve(null);
        };
        img.onerror = () => {
          clearTimeout(timeout);
          resolve(null);
        };
      });
    });
    await Promise.all(imagePromises);
    
    // 렌더링 사이클 보장 - requestAnimationFrame 사용
    await new Promise(resolve => requestAnimationFrame(resolve));
    await new Promise(resolve => requestAnimationFrame(resolve));
    
    // 추가 대기 시간으로 상태 반영 보장
    await new Promise(resolve => setTimeout(resolve, 300));

    // 상태가 DOM에 반영되었는지 검증
    const checkedItems = element.querySelectorAll('[data-checked="true"]');
    const progressBars = element.querySelectorAll('[data-progress-width]');
    const progressValues = element.querySelectorAll('[data-progress-value]');
    
    console.log('Export 상태 검증:', {
      checkedItemsCount: checkedItems.length,
      progressBarsCount: progressBars.length,
      progressValuesCount: progressValues.length,
    });

    // 실제 화면의 배경색 계산 (원본 DOM은 절대 건드리지 않음)
    const computedBg = window.getComputedStyle(element);
    const actualBgColor = computedBg.backgroundColor || 'hsl(210, 20%, 98%)';
    
    // Export 전 원본 DOM의 체크된 텍스트 스타일 상세 검증 로그
    const originalCheckedTexts = element.querySelectorAll('.strikethrough-line');
    const originalStyleMap = new Map<HTMLElement, CSSStyleDeclaration>();
    
    originalCheckedTexts.forEach((textEl) => {
      const el = textEl as HTMLElement;
      const computed = window.getComputedStyle(el);
      originalStyleMap.set(el, computed);
      
      console.log('Export 전 원본 스타일 (상세):', {
        element: el.textContent?.substring(0, 30),
        color: computed.color,
        opacity: computed.opacity,
        fontFamily: computed.fontFamily,
        fontSize: computed.fontSize,
        fontWeight: computed.fontWeight,
        lineHeight: computed.lineHeight,
        letterSpacing: computed.letterSpacing,
        textDecoration: computed.textDecoration,
        textDecorationLine: computed.textDecorationLine,
        textDecorationColor: computed.textDecorationColor,
        textDecorationThickness: computed.textDecorationThickness,
        textDecorationSkipInk: computed.textDecorationSkipInk,
        transform: computed.transform,
        display: computed.display,
      });
    });

    try {
      // 원본 DOM은 전혀 건드리지 않고, clone에만 스타일 적용
      const canvas = await html2canvas(element, {
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff", // 배경이 투명하게 변하는 것 방지
        scale: 2, // 고해상도 유지
        logging: false,
        foreignObjectRendering: false,
        removeContainer: false,
        imageTimeout: 15000,
        width: element.scrollWidth,
        height: element.scrollHeight,
        onclone: (clonedDoc, clonedElement) => {
          const element = clonedElement as HTMLElement;
          
          // Clone에만 Export 전용 클래스 추가 (원본은 건드리지 않음)
          element.classList.add('export-stable', 'is-exporting');
          
          // 실제 배경색 적용
          element.style.backgroundColor = actualBgColor;
          
          // 원본 DOM에서 스타일을 가져와서 clone에 적용 (원본은 절대 건드리지 않음)
          const allElements = element.querySelectorAll('*');
          const originalElement = checklistRef.current;
          
          allElements.forEach((clonedEl) => {
            const htmlEl = clonedEl as HTMLElement;
            
            // 취소선이 있는 텍스트는 별도 처리하므로 건너뛰기
            if (htmlEl.classList.contains('strikethrough-line')) {
              return;
            }
            
            // Clone된 요소와 매칭되는 원본 요소 찾기
            let originalEl: HTMLElement | null = null;
            
            if (htmlEl.hasAttribute('data-item-id')) {
              originalEl = originalElement?.querySelector(`[data-item-id="${htmlEl.getAttribute('data-item-id')}"]`) as HTMLElement;
            } else if (htmlEl.textContent && htmlEl.textContent.trim()) {
              // textContent로 매칭
              const allOriginals = originalElement?.querySelectorAll('*');
              originalEl = Array.from(allOriginals || []).find(orig => {
                return orig.textContent === htmlEl.textContent && 
                       orig.tagName === htmlEl.tagName &&
                       !orig.classList.contains('strikethrough-line');
              }) as HTMLElement || null;
            }
            
            // 원본을 찾지 못하면 clone의 computed style 사용
            const computed = originalEl 
              ? window.getComputedStyle(originalEl)
              : window.getComputedStyle(htmlEl);
            
            // 필터/animation 제거 (선명도 보장)
            htmlEl.style.filter = 'none';
            htmlEl.style.backdropFilter = 'none';
            htmlEl.style.transition = 'none';
            htmlEl.style.animation = 'none';
            
            // opacity는 실제 값 보존 (0.6 등 체크된 텍스트의 opacity 유지)
            htmlEl.style.opacity = computed.opacity;
            
            // 배경색 보존 (실제 화면과 동일)
            if (computed.backgroundColor && 
                computed.backgroundColor !== 'rgba(0, 0, 0, 0)' && 
                computed.backgroundColor !== 'transparent') {
              htmlEl.style.backgroundColor = computed.backgroundColor;
            }
            
            // 텍스트 색상 보존 (원본의 실제 색상)
            htmlEl.style.color = computed.color;
            
            // 그림자 보존
            if (computed.boxShadow && computed.boxShadow !== 'none') {
              htmlEl.style.boxShadow = computed.boxShadow;
            }
            
            // 테두리 보존
            if (computed.borderWidth && computed.borderWidth !== '0px') {
              htmlEl.style.borderColor = computed.borderColor;
              htmlEl.style.borderWidth = computed.borderWidth;
              htmlEl.style.borderStyle = computed.borderStyle;
              htmlEl.style.borderRadius = computed.borderRadius;
            }
            
            // 폰트 스타일 보존
            htmlEl.style.fontFamily = computed.fontFamily;
            htmlEl.style.fontSize = computed.fontSize;
            htmlEl.style.fontWeight = computed.fontWeight;
            htmlEl.style.lineHeight = computed.lineHeight;
            htmlEl.style.letterSpacing = computed.letterSpacing;
            
            // 텍스트 정렬 보존
            htmlEl.style.textAlign = computed.textAlign;
            
            // 패딩/마진 보존
            htmlEl.style.padding = computed.padding;
            htmlEl.style.margin = computed.margin;
          });
          
          // 체크된 항목의 취소선 처리 - 가상 요소(::after)가 정상적으로 렌더링되도록 보장
          const checkedTexts = element.querySelectorAll('.strikethrough-line');
          checkedTexts.forEach((textEl) => {
            const el = textEl as HTMLElement;
            
            // 원본 DOM에서 동일한 요소 찾기 (textContent로 매칭)
            const originalText = Array.from(originalCheckedTexts).find(orig => {
              return orig.textContent === el.textContent;
            }) as HTMLElement;
            
            if (originalText && originalStyleMap.has(originalText)) {
              // 원본의 computed style을 그대로 사용
              const originalComputed = originalStyleMap.get(originalText)!;
              
              // 원본 스타일 그대로 적용 (절대 변경하지 않음)
              el.style.position = 'relative';
              el.style.display = 'inline-block';
              el.style.color = originalComputed.color;
              el.style.opacity = originalComputed.opacity;
              
              // 폰트 스타일 정확히 보존 (취소선 위치에 중요)
              el.style.fontFamily = originalComputed.fontFamily;
              el.style.fontSize = originalComputed.fontSize;
              el.style.fontWeight = originalComputed.fontWeight;
              
              // line-height를 font-size 기반으로 고정 (취소선 위치 안정화)
              const fontSize = parseFloat(originalComputed.fontSize);
              if (!isNaN(fontSize)) {
                // 원본 line-height가 상대값이면 계산, 아니면 그대로 사용
                const lineHeightValue = originalComputed.lineHeight;
                if (lineHeightValue.includes('px')) {
                  el.style.lineHeight = lineHeightValue;
                } else if (lineHeightValue.includes('em') || lineHeightValue.includes('%') || !isNaN(parseFloat(lineHeightValue))) {
                  // 상대값이면 font-size 기반으로 계산
                  const multiplier = parseFloat(lineHeightValue) || 1.5;
                  el.style.lineHeight = `${fontSize * multiplier}px`;
                } else {
                  el.style.lineHeight = originalComputed.lineHeight;
                }
              } else {
                el.style.lineHeight = originalComputed.lineHeight;
              }
              
              el.style.letterSpacing = originalComputed.letterSpacing;
              
              // 가상 요소(::after)가 정상적으로 렌더링되도록 보장
              // ::after는 자동으로 복제되므로 별도 처리는 필요 없지만, 스타일이 적용되도록 확인
              
              // transition/animation 제거
              el.style.transition = 'none';
              el.style.animation = 'none';
              
              console.log('Clone에 적용된 취소선 스타일 (가상 요소 방식):', {
                element: el.textContent?.substring(0, 30),
                color: { original: originalComputed.color, clone: el.style.color },
                opacity: { original: originalComputed.opacity, clone: el.style.opacity },
                lineHeight: { original: originalComputed.lineHeight, clone: el.style.lineHeight },
                fontSize: { original: originalComputed.fontSize, clone: el.style.fontSize },
                hasAfterPseudo: el.querySelector('::after') !== null, // 참고용 (실제로는 체크 불가)
              });
            }
          });
          
          // 체크되지 않은 텍스트는 실제 화면과 동일하게
          const allTextSpans = element.querySelectorAll('h4 span, p span');
          allTextSpans.forEach((span) => {
            const el = span as HTMLElement;
            if (!el.classList.contains('strikethrough-line')) {
              const computed = window.getComputedStyle(el);
              el.style.textDecoration = computed.textDecoration || 'none';
              el.style.opacity = computed.opacity || '1';
            }
          });
          
          // 체크박스 상태 강제 반영 - data-checked 속성 기반
          const checkedBoxes = element.querySelectorAll('[data-checked="true"]');
          checkedBoxes.forEach((checkbox) => {
            const checkboxEl = checkbox as HTMLElement;
            // 체크박스 배경색 강제
            checkboxEl.style.backgroundColor = '#0ea5e9';
            checkboxEl.style.borderColor = '#0ea5e9';
            checkboxEl.style.borderWidth = '2px';
            checkboxEl.style.borderStyle = 'solid';
            checkboxEl.style.opacity = '1';
            checkboxEl.style.filter = 'none';
            
            // 체크 아이콘(SVG) 강제 표시
            let svgIcon = checkboxEl.querySelector('svg[data-check-icon="true"]');
            if (!svgIcon) {
              // SVG가 없으면 생성
              svgIcon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
              svgIcon.setAttribute('data-check-icon', 'true');
              svgIcon.setAttribute('class', 'w-4 h-4 text-accent-foreground');
              svgIcon.setAttribute('viewBox', '0 0 24 24');
              svgIcon.setAttribute('fill', 'none');
              svgIcon.setAttribute('stroke', 'currentColor');
              svgIcon.setAttribute('stroke-width', '3');
              const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
              path.setAttribute('d', 'M20 6L9 17l-5-5');
              svgIcon.appendChild(path);
              checkboxEl.appendChild(svgIcon);
            }
            (svgIcon as SVGElement).style.display = 'block';
            (svgIcon as SVGElement).style.visibility = 'visible';
            (svgIcon as SVGElement).style.opacity = '1';
            (svgIcon as SVGElement).style.color = '#ffffff';
            (svgIcon as SVGElement).style.fill = 'none';
            (svgIcon as SVGElement).style.stroke = '#ffffff';
            (svgIcon as SVGElement).style.strokeWidth = '3';
          });
          
          // 체크되지 않은 체크박스도 명시적으로 처리
          const uncheckedBoxes = element.querySelectorAll('[data-checked="false"]');
          uncheckedBoxes.forEach((checkbox) => {
            const checkboxEl = checkbox as HTMLElement;
            checkboxEl.style.backgroundColor = 'transparent';
            checkboxEl.style.borderColor = '#d1d5db';
            checkboxEl.style.borderWidth = '2px';
            checkboxEl.style.borderStyle = 'solid';
            // 체크 아이콘 제거
            const svgIcon = checkboxEl.querySelector('svg[data-check-icon="true"]');
            if (svgIcon) {
              svgIcon.remove();
            }
          });
          
          // 진행률 바 강제 반영 - transition 제거하고 width 명시
          const progressBars = element.querySelectorAll('[data-progress-width]');
          progressBars.forEach((bar) => {
            const barEl = bar as HTMLElement;
            const progressValue = barEl.getAttribute('data-progress-width');
            if (progressValue) {
              const progress = Math.max(parseFloat(progressValue), 3);
              barEl.style.width = `${progress}%`;
              barEl.style.transition = 'none';
              barEl.style.opacity = '1';
              barEl.style.filter = 'none';
            }
          });
          
          // 진행률 수치 강제 반영
          const progressValues = element.querySelectorAll('[data-progress-value]');
          progressValues.forEach((valueEl) => {
            const el = valueEl as HTMLElement;
            el.style.opacity = '1';
            el.style.filter = 'none';
            el.style.color = '#007BFF';
          });
          
          // 완료 카운트 강제 반영
          const completedCounts = element.querySelectorAll('[data-completed-count]');
          completedCounts.forEach((countEl) => {
            const el = countEl as HTMLElement;
            el.style.opacity = '1';
            el.style.filter = 'none';
          });
          
          // 최종 검증 로그
          const finalCheckedCount = element.querySelectorAll('[data-checked="true"]').length;
          const finalStrikethroughLines = element.querySelectorAll('.strikethrough-line').length;
          const finalCheckedTexts = element.querySelectorAll('.is-checked-text').length;
          console.log('Export 최종 상태 (체크리스트만):', {
            checkedBoxes: finalCheckedCount,
            strikethroughLines: finalStrikethroughLines,
            checkedTexts: finalCheckedTexts,
            elementId: element.id,
            elementClasses: element.className,
          });
          
          // 구분선(border) 명확화
          const borders = element.querySelectorAll('[class*="border"]');
          borders.forEach((borderEl) => {
            const el = borderEl as HTMLElement;
            const computed = window.getComputedStyle(el);
            if (computed.borderWidth && computed.borderWidth !== '0px') {
              el.style.borderColor = computed.borderColor || '#e5e7eb';
              el.style.borderWidth = computed.borderWidth;
              el.style.borderStyle = computed.borderStyle || 'solid';
            }
          });
          
          // 이미지 로딩 확인 및 스타일 보장
          const images = element.querySelectorAll('img');
          images.forEach((img) => {
            const imgEl = img as HTMLImageElement;
            imgEl.style.display = 'block';
            imgEl.style.visibility = 'visible';
            imgEl.style.opacity = '1';
            if (!imgEl.complete || imgEl.naturalWidth === 0) {
              console.warn('Image not loaded:', imgEl.src);
            }
          });
        },
      });
      
      // 캔버스가 비어있는지 확인
      if (!canvas || canvas.width === 0 || canvas.height === 0) {
        console.error("Canvas is empty or invalid");
        return null;
      }
      
      // Export 후 원본 DOM의 체크된 텍스트 스타일 검증 로그 (변경 없어야 함)
      if (originalCheckedTexts.length > 0) {
        const firstChecked = originalCheckedTexts[0] as HTMLElement;
        const afterComputed = window.getComputedStyle(firstChecked);
        const beforeComputed = originalStyleMap.get(firstChecked);
        
        if (beforeComputed) {
          const isUnchanged = 
            beforeComputed.color === afterComputed.color &&
            beforeComputed.opacity === afterComputed.opacity &&
            beforeComputed.textDecoration === afterComputed.textDecoration;
          
          console.log('Export 후 원본 스타일 검증:', {
            unchanged: isUnchanged,
            color: { before: beforeComputed.color, after: afterComputed.color },
            opacity: { before: beforeComputed.opacity, after: afterComputed.opacity },
            textDecoration: { before: beforeComputed.textDecoration, after: afterComputed.textDecoration },
          });
        }
      }
      
      return canvas;
    } catch (error) {
      console.error("Canvas capture error:", error);
      return null;
    }
    // 원본 DOM은 절대 건드리지 않으므로 finally에서 클래스 제거 불필요
  };

  const downloadAsPDF = async () => {
    if (!checklistRef.current) return;
    
    try {
      toast({ title: "PDF 생성 중...", description: "잠시만 기다려주세요.", duration: 3000 });
      
      const canvas = await captureChecklist();
      if (!canvas) throw new Error("Capture failed");
      
      // 고품질 PNG 데이터 변환 (데이터 유실 방지)
      const imgData = canvas.toDataURL("image/png", 1.0);
      
      // 이미지 데이터 유효성 확인
      if (!imgData || imgData === 'data:,') {
        throw new Error("Invalid image data");
      }
      
      // Create PDF with A4 proportions
      const imgWidth = canvas.width;
      const imgHeight = canvas.height;
      const A4_WIDTH = 210; // A4 width in mm
      const A4_HEIGHT = 297; // A4 height in mm
      const MARGIN = 10;
      
      const availableWidth = A4_WIDTH - (MARGIN * 2);
      const availableHeight = A4_HEIGHT - (MARGIN * 2);
      
      // Calculate dimensions to fit A4 (비율 유지)
      const imgRatio = imgWidth / imgHeight;
      const availableRatio = availableWidth / availableHeight;
      
      let pdfWidth: number;
      let pdfHeight: number;
      
      if (imgRatio > availableRatio) {
        // 이미지가 더 넓은 경우 - 너비에 맞춤
        pdfWidth = availableWidth;
        pdfHeight = availableWidth / imgRatio;
      } else {
        // 이미지가 더 높은 경우 - 높이에 맞춤
        pdfHeight = availableHeight;
        pdfWidth = availableHeight * imgRatio;
      }
      
      // PDF 생성
      const pdf = new jsPDF({
        orientation: pdfHeight > pdfWidth ? "portrait" : "landscape",
        unit: "mm",
        format: "a4",
      });
      
      // 이미지를 중앙에 배치
      const x = (A4_WIDTH - pdfWidth) / 2;
      const y = (A4_HEIGHT - pdfHeight) / 2;
      
      // 고품질로 이미지 추가 (FAST 대신 SLOW 사용하여 품질 향상)
      pdf.addImage(imgData, "PNG", x, y, pdfWidth, pdfHeight, undefined, "SLOW");
      pdf.save("check-real-trip-checklist.pdf");
      
      toast({ title: "다운로드 완료!", description: "PDF가 저장되었습니다.", duration: 2000 });
    } catch (error) {
      console.error("PDF download error:", error);
      toast({ title: "오류 발생", description: "PDF 생성에 실패했습니다.", variant: "destructive", duration: 3000 });
    }
  };

  const downloadAsImage = async () => {
    if (!checklistRef.current) return;
    
    try {
      toast({ title: "이미지 생성 중...", description: "잠시만 기다려주세요.", duration: 2000 });
      
      const canvas = await captureChecklist();
      if (!canvas) throw new Error("Capture failed");
      
      const link = document.createElement("a");
      link.download = "check-real-trip-checklist.png";
      link.href = canvas.toDataURL("image/png", 1.0);
      link.click();
      
      toast({ title: "다운로드 완료!", description: "이미지가 저장되었습니다.", duration: 2000 });
    } catch (error) {
      console.error("Image download error:", error);
      toast({ title: "오류 발생", description: "이미지 생성에 실패했습니다.", variant: "destructive", duration: 3000 });
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
    <div className="fixed bottom-0 left-0 right-0 bg-card border-t border-border p-4 shadow-lg z-50">
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
