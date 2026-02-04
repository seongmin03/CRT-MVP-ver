import { Check } from "lucide-react";
import type { ChecklistItem as ChecklistItemType } from "@/data/checklistData";
import { parseTextWithLinks } from "@/lib/linkUtils";

interface ChecklistItemProps {
  item: ChecklistItemType;
  isChecked: boolean;
  onToggle: (itemId: string) => void;
  selectedCountry?: string | null;
  smokingStatus?: "yes" | "no" | null;
  onSmokingSelect?: (value: "yes" | "no") => void;
}

const ChecklistItem = ({ item, isChecked, onToggle, selectedCountry, smokingStatus, onSmokingSelect }: ChecklistItemProps) => {
  const isSmokingItem = item.item_id === "smoking" || item.item_id.includes("smoking") || item.item_id.includes("흡연");
  
  // 전체 영역 클릭 핸들러 - 링크나 이미지 클릭 시에는 토글하지 않음
  const handleItemClick = (e: React.MouseEvent) => {
    // 흡연 항목은 클릭 핸들러 사용 안 함 (버튼으로 처리)
    if (isSmokingItem) {
      return;
    }
    // 링크나 이미지 클릭 시에는 체크박스 토글이 아닌 링크로 이동
    if ((e.target as HTMLElement).closest('a, img, button')) {
      return;
    }
    onToggle(item.item_id);
  };

  const handleSmokingSelect = (value: "yes" | "no", e: React.MouseEvent) => {
    // GTM이 버튼을 직접 감지할 수 있도록 명시적으로 클릭 이벤트 전송
    // React 합성 이벤트로 인해 GTM이 부모 요소를 감지하는 문제 해결
    const buttonElement = e.currentTarget as HTMLElement;
    const buttonId = buttonElement.id; // id를 1순위로 사용
    const gtmValue = buttonElement.getAttribute('data-gtm');
    
    if (typeof window !== 'undefined' && (window as any).dataLayer) {
      // GTM이 버튼 요소를 직접 감지할 수 있도록 명시적 이벤트 전송
      // id를 1순위로 설정 (id가 있으면 id 사용, 없으면 data-gtm 사용)
      (window as any).dataLayer.push({
        event: 'gtm.click',
        'gtm.element': buttonElement,
        'gtm.elementId': buttonId || gtmValue || '',
        'gtm.elementClasses': buttonElement.className,
      });
    }
    
    // 부모 div의 클릭 핸들러가 실행되지 않도록 stopPropagation
    e.stopPropagation();
    
    if (onSmokingSelect) {
      onSmokingSelect(value);
    }
  };

  return (
    <div 
      className={`flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all duration-200 group ${
        isSmokingItem ? '' : 'hover:bg-muted/50 cursor-pointer'
      }`}
      onClick={isSmokingItem ? undefined : handleItemClick}
      {...(isSmokingItem ? {} : { 'data-gtm': 'checklist_checkbox' })}
      data-item-id={item.item_id}
    >
      {!isSmokingItem && (
        <div 
          className={`
            flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 mt-0.5 gtm-engaged-check pointer-events-none
            ${isChecked 
              ? 'bg-accent border-accent animate-check-bounce shadow-sm' 
              : 'border-muted-foreground/30 group-hover:border-accent/50'
            }
          `}
          data-checked={isChecked}
          data-item-id={item.item_id}
          data-gtm-label="checkbox-interaction"
        >
          {isChecked && (
            <Check className="w-4 h-4 text-accent-foreground pointer-events-none" strokeWidth={3} data-check-icon="true" />
          )}
        </div>
      )}
      
      <div className="flex-1 min-w-0">
        <h4 
          className={`
            font-semibold text-sm sm:text-base transition-all duration-300 pointer-events-none
            ${isChecked ? 'text-gray-400' : 'text-slate-900 dark:text-white'}
          `}
          style={{ 
            lineHeight: '1.5',
            opacity: isChecked ? 0.7 : 1,
          }}
          data-item-title={item.title}
        >
          {item.link_url && item.cta_type === "link" ? (
            <a
              href={item.link_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className={`
                ${isChecked ? 'strikethrough-line' : ''}
                text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 underline decoration-2 underline-offset-2 transition-colors
              `}
              style={{
                position: 'relative',
                display: 'inline-block',
                pointerEvents: 'auto'
              }}
              {...(item.link_url.includes('coupang.com') || item.link_url.includes('link.coupang.com') ? { 'data-gtm': 'outbound_coupang' } : {})}
              {...(item.link_url.includes('Japan_donki_coupon') ? { 
                'data-gtm': 'outbound_link', 
                'data-gtm-label': 'japan_donki_coupon' 
              } : {})}
            >
              <span className="pointer-events-none">{item.title}</span>
            </a>
          ) : (
            <span 
              className={isChecked ? 'strikethrough-line' : ''}
              style={{
                position: 'relative',
                display: 'inline-block',
                pointerEvents: 'none'
              }}
            >
              {parseTextWithLinks(item.title, selectedCountry, true)}
            </span>
          )}
        </h4>
        <p 
          className={`
            mt-1 text-xs sm:text-sm leading-relaxed transition-all duration-300 pointer-events-none
            ${isChecked ? 'text-gray-400' : 'text-slate-700 dark:text-gray-300'}
          `}
          style={{ 
            lineHeight: '1.5',
            opacity: isChecked ? 0.7 : 1,
          }}
        >
          {parseTextWithLinks(item.description || '', selectedCountry)}
        </p>
      </div>

      {/* 흡연 항목인 경우 예/아니오 버튼 표시 */}
      {isSmokingItem ? (
        <div className="flex-shrink-0 flex items-center gap-2">
          <button
            id={`smoking-status-yes-${item.item_id}`}
            onClick={(e) => handleSmokingSelect("yes", e)}
            onMouseDown={(e) => {
              // GTM이 버튼을 먼저 감지할 수 있도록 마우스 다운에서만 stopPropagation
              // onClick에서는 이벤트가 버블링되어 GTM이 감지 가능
            }}
            data-gtm="smoking_status_yes"
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${smokingStatus === "yes"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
              }
            `}
          >
            예
          </button>
          <button
            id={`smoking-status-no-${item.item_id}`}
            onClick={(e) => handleSmokingSelect("no", e)}
            onMouseDown={(e) => {
              // GTM이 버튼을 먼저 감지할 수 있도록 마우스 다운에서만 stopPropagation
              // onClick에서는 이벤트가 버블링되어 GTM이 감지 가능
            }}
            data-gtm="smoking_status_no"
            className={`
              px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
              ${smokingStatus === "no"
                ? "bg-blue-600 text-white shadow-sm"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
              }
            `}
          >
            아니오
          </button>
        </div>
      ) : (
        /* 이미지 및 링크 - 텍스트 우측에 배치 */
        item.image_url && (
          item.link_url ? (
            <a
              href={item.link_url}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-shrink-0 transition-all duration-300 hover:brightness-110 hover:shadow-lg hover:scale-110 active:scale-95 cursor-pointer"
              style={{ width: "40px", height: "40px" }}
              {...(item.link_url.includes('coupang.com') || item.link_url.includes('link.coupang.com') ? { 'data-gtm': 'outbound_coupang' } : {})}
              {...(item.link_url.includes('Japan_donki_coupon') ? { 
                'data-gtm': 'outbound_link', 
                'data-gtm-label': 'japan_donki_coupon' 
              } : {})}
            >
              <img
                src={item.image_url}
                alt={`해외여행 준비물 - ${item.title}`}
                className="w-full h-full object-cover rounded-lg shadow-md pointer-events-none"
                style={{ width: "40px", height: "40px" }}
              />
            </a>
          ) : (
            <div
              className="flex-shrink-0 pointer-events-none"
              style={{ width: "40px", height: "40px" }}
            >
              <img
                src={item.image_url}
                alt={`해외여행 준비물 - ${item.title}`}
                className="w-full h-full object-cover rounded-lg shadow-md pointer-events-none"
                style={{ width: "40px", height: "40px" }}
              />
            </div>
          )
        )
      )}
    </div>
  );
};

export default ChecklistItem;
