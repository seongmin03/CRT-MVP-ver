import { useState, useRef } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import html2canvas from "html2canvas";
import { transformDataForCard } from "./MedicalCardRenderer";

interface MedicalCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: MedicalCardData) => void;
}

export interface MedicalCardData {
  englishName: string;
  koreanName: string;
  birthDate: string;
  bloodType: string;
  nationality: string;
  languages: string[];
  phoneNumber: {
    first: string;
    middle: string;
    last: string;
  };
  email: {
    id: string;
    domain: string;
  };
  emergencyContact: {
    phone: {
      first: string;
      middle: string;
      last: string;
    };
    relationship: string;
  };
  hasAllergy: "yes" | "no";
  isSmoker: "yes" | "no";
}

const MedicalCardModal = ({ isOpen, onClose, onSave }: MedicalCardModalProps) => {
  // 생년월일을 분리된 필드로 관리
  const [birthYear, setBirthYear] = useState<string>("");
  const [birthMonth, setBirthMonth] = useState<string>("");
  const [birthDay, setBirthDay] = useState<string>("");
  
  // 로딩 상태
  const [isGenerating, setIsGenerating] = useState(false);
  const rendererRef = useRef<HTMLDivElement>(null);
  
  // 마케팅 동의 팝업 상태
  const [showMarketingPopup, setShowMarketingPopup] = useState(false);

  const [formData, setFormData] = useState<MedicalCardData>({
    englishName: "",
    koreanName: "",
    birthDate: "",
    bloodType: "",
    nationality: "한국",
    languages: ["한국어"],
    phoneNumber: {
      first: "010",
      middle: "",
      last: "",
    },
    email: {
      id: "",
      domain: "",
    },
    emergencyContact: {
      phone: {
        first: "010",
        middle: "",
        last: "",
      },
      relationship: "가족",
    },
    hasAllergy: "no",
    isSmoker: "no",
  });

  const languageOptions = ["한국어", "영어", "일본어", "중국어", "러시아어", "스페인어", "프랑스어", "기타"];
  const relationshipOptions = ["가족", "친구", "지인"];
  const bloodTypeOptions = ["A", "B", "O", "AB"];

  const handleLanguageToggle = (language: string) => {
    setFormData(prev => {
      if (language === "한국어") {
        // 한국어는 항상 포함
        return prev;
      }
      const newLanguages = prev.languages.includes(language)
        ? prev.languages.filter(l => l !== language)
        : [...prev.languages, language];
      return { ...prev, languages: newLanguages };
    });
  };

  const handlePhoneChange = (field: "first" | "middle" | "last", value: string, type: "phone" | "emergency" = "phone") => {
    // 숫자만 허용
    const numericValue = value.replace(/[^0-9]/g, "");
    
    if (type === "phone") {
      setFormData(prev => ({
        ...prev,
        phoneNumber: {
          ...prev.phoneNumber,
          [field]: numericValue,
        },
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        emergencyContact: {
          ...prev.emergencyContact,
          phone: {
            ...prev.emergencyContact.phone,
            [field]: numericValue,
          },
        },
      }));
    }
  };

  // 생년월일을 YYYYMMDD 형식으로 변환
  const formatBirthDate = (year: string, month: string, day: string): string => {
    const formattedMonth = month.length === 1 ? `0${month}` : month;
    const formattedDay = day.length === 1 ? `0${day}` : day;
    return `${year}${formattedMonth}${formattedDay}`;
  };

  // 실제 카드 생성 로직 (팝업에서 호출하거나 직접 호출)
  const proceedWithCardGeneration = async () => {
    // 생년월일을 YYYYMMDD 형식으로 변환하여 저장
    const formattedBirthDate = formatBirthDate(birthYear, birthMonth, birthDay);
    const finalData = {
      ...formData,
      birthDate: formattedBirthDate,
    };
    
    // 데이터 저장
    onSave(finalData);
    
    // 로딩 시작
    setIsGenerating(true);
    
    try {
      // 데이터 변환 (스프레드시트 전송용)
      const spreadsheetTransformedData = transformDataForCard(finalData);
      
      // 언어 변환 (Korean / English 형식)
      const languages = finalData.languages
        .filter(lang => lang !== "한국어")
        .map(lang => {
          const langMap: Record<string, string> = {
            "영어": "English",
            "일본어": "Japanese",
            "중국어": "Chinese",
            "러시아어": "Russian",
            "스페인어": "Spanish",
            "프랑스어": "French",
            "기타": "Other",
          };
          return langMap[lang] || lang;
        });
      const languageString = languages.length > 0 
        ? `Korean / ${languages.join(" / ")}`
        : "Korean";
      
      // 관계 변환
      const relationshipMap: Record<string, string> = {
        "가족": "Family",
        "친구": "Friend",
        "지인": "Acquaintance",
      };
      const relationship = relationshipMap[finalData.emergencyContact.relationship] || "Acquaintance";
      
      // 원천 데이터에서 순수 입력값 추출
      const phoneMiddleDigits = finalData.phoneNumber.middle.padStart(4, "0");
      const phoneLastDigits = finalData.phoneNumber.last.padStart(4, "0");
      const emergencyMiddleDigits = finalData.emergencyContact.phone.middle.padStart(4, "0");
      const emergencyLastDigits = finalData.emergencyContact.phone.last.padStart(4, "0");
      
      // DB 전송용 포맷 조립 (새로운 문자열 생성)
      const numForSpreadsheet = `'010-${phoneMiddleDigits}-${phoneLastDigits}`;
      const emergencyPhoneForSpreadsheet = `'010-${emergencyMiddleDigits}-${emergencyLastDigits}`;
      
      // 스프레드시트 전송용 데이터 구성
      const spreadsheetData = {
        name_en: finalData.englishName || "",
        name_kr: finalData.koreanName || "",
        DOB: spreadsheetTransformedData.birthDate || "",
        nation: "한국",
        language: languageString,
        bloodtype: finalData.bloodType || "",
        num: numForSpreadsheet,
        email: spreadsheetTransformedData.email || "",
        emergency: `${emergencyPhoneForSpreadsheet} (${relationship})`,
        all: finalData.hasAllergy === "yes" ? "Yes" : "No",
        smoking: finalData.isSmoker === "yes" ? "Yes" : "No",
      };
      
      // 구글 스프레드시트로 데이터 전송 (비동기, 에러가 나도 계속 진행)
      const GAS_URL = "https://script.google.com/macros/s/AKfycbwJBQkD1ypEwHCD6kyD3OTyj63XM3ykQFyW8R1QIdS15slBpayYB-Pb6yQp9dyUE-fDkQ/exec";
      fetch(GAS_URL, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(spreadsheetData),
      }).catch((error) => {
        console.error("스프레드시트 전송 실패:", error);
        // 에러가 나도 계속 진행
      });
      
      // 폰트 로딩 완료 대기
      await document.fonts.ready;
      
      // 1.5초 대기 (로딩 애니메이션 + 스프레드시트 전송 시간)
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // 백그라운드에서 렌더링 영역 생성
      const renderContainer = document.createElement("div");
      renderContainer.style.position = "fixed";
      renderContainer.style.left = "-9999px";
      renderContainer.style.top = "0";
      renderContainer.style.width = "1080px";
      renderContainer.style.height = "1920px";
      renderContainer.style.overflow = "hidden";
      renderContainer.style.backgroundColor = "#ffffff";
      document.body.appendChild(renderContainer);
      
      // 배경 이미지 로드
      const bgImage = new Image();
      bgImage.crossOrigin = "anonymous";
      await new Promise((resolve, reject) => {
        bgImage.onload = resolve;
        bgImage.onerror = reject;
        bgImage.src = "/image/info/MedicalCard.png";
      });
      
      // 배경 이미지 추가
      const bgImgElement = document.createElement("img");
      bgImgElement.src = "/image/info/MedicalCard.png";
      bgImgElement.style.position = "absolute";
      bgImgElement.style.top = "0";
      bgImgElement.style.left = "0";
      bgImgElement.style.width = "1080px";
      bgImgElement.style.height = "1920px";
      bgImgElement.style.objectFit = "cover";
      renderContainer.appendChild(bgImgElement);
      
      // 데이터 변환 (카드 렌더링용)
      const cardRenderData = transformDataForCard(finalData);
      
      // 텍스트 오버레이 생성
      const overlay = document.createElement("div");
      overlay.style.position = "absolute";
      overlay.style.width = "1080px";
      overlay.style.height = "1920px";
      overlay.style.top = "0";
      overlay.style.left = "0";
      
      // 텍스트 요소들 추가
      const addTextElement = (text: string, x: number, y: number, fontSize: string = "34px", fontWeight: string = "normal") => {
        if (!text) return;
        const element = document.createElement("div");
        element.textContent = text;
        element.style.position = "absolute";
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.transform = "translateY(-100%)";
        element.style.fontSize = fontSize;
        element.style.color = "#000000";
        element.style.fontFamily = "sans-serif";
        element.style.fontWeight = fontWeight;
        overlay.appendChild(element);
      };
      
      // 체크 표시 추가
      const addCheckMark = (x: number, y: number) => {
        const element = document.createElement("div");
        element.textContent = "✓";
        element.style.position = "absolute";
        element.style.left = `${x}px`;
        element.style.top = `${y}px`;
        element.style.transform = "translateY(-100%)";
        element.style.fontSize = "48px";
        element.style.color = "#000000";
        element.style.fontFamily = "sans-serif";
        element.style.fontWeight = "bold";
        element.style.lineHeight = "1";
        overlay.appendChild(element);
      };
      
      // 텍스트 배치
      addTextElement(cardRenderData.englishName, 300, 357);
      addTextElement(cardRenderData.koreanName, 300, 436);
      addTextElement(cardRenderData.birthDate, 300, 515);
      addTextElement(cardRenderData.languages, 300, 673, "34px");
      addTextElement(cardRenderData.bloodType, 300, 752, "34px", "bold");
      addTextElement(cardRenderData.phoneNumber, 365, 977);
      addTextElement(cardRenderData.email, 365, 1056);
      addTextElement(cardRenderData.emergencyContact, 418, 1135);
      
      // 체크박스 배치
      if (cardRenderData.hasAllergy === "yes") {
        addCheckMark(632, 1438);
      } else {
        addCheckMark(891, 1438);
      }
      
      if (cardRenderData.isSmoker === "yes") {
        addCheckMark(632, 1559);
      } else {
        addCheckMark(891, 1559);
      }
      
      renderContainer.appendChild(overlay);
      
      // 추가 대기 (렌더링 완료 보장)
      await new Promise(resolve => setTimeout(resolve, 200));
      
      // html2canvas로 캡처
      const canvas = await html2canvas(renderContainer, {
        width: 1080,
        height: 1920,
        scale: 1,
        useCORS: true,
        backgroundColor: "#ffffff",
        logging: false,
        allowTaint: false,
      });
      
      // 이미지로 변환 및 다운로드
      const imageUrl = canvas.toDataURL("image/png", 1.0);
      const link = document.createElement("a");
      link.href = imageUrl;
      link.download = "SOS_Medical_Card.png";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      // 렌더링 컨테이너 제거
      document.body.removeChild(renderContainer);
      
      // 로딩 종료
      setIsGenerating(false);
      
      // 토스트 메시지 표시
      toast({
        title: "저장 완료",
        description: "저장이 완료되었습니다. 파일에서 확인하세요!",
      });
      
      // 팝업 자동 닫기
      setTimeout(() => {
        onClose();
      }, 500);
      
    } catch (error) {
      console.error("이미지 생성 중 오류 발생:", error);
      setIsGenerating(false);
      toast({
        title: "오류 발생",
        description: "카드 생성 중 오류가 발생했습니다. 다시 시도해주세요.",
        variant: "destructive",
      });
    }
  };

  // 카드 만들기 버튼 클릭 핸들러
  const handleSubmit = () => {
    // 흡연 여부 확인
    if (formData.isSmoker === "yes") {
      // 흡연자인 경우 마케팅 팝업 표시
      setShowMarketingPopup(true);
    } else {
      // 비흡연자인 경우 바로 카드 생성 진행
      proceedWithCardGeneration();
    }
  };

  // 마케팅 팝업에서 동의 버튼 클릭 핸들러
  const handleMarketingConsent = (userChoice: boolean) => {
    // TODO: DB 연동 시 사용할 변수
    // const iqosConsent = userChoice;
    
    // 팝업 닫기
    setShowMarketingPopup(false);
    
    // 카드 생성 진행
    proceedWithCardGeneration();
  };

  // 월/일 입력 시 한 자리 수는 앞에 0을 붙이는 로직
  const handleMonthChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 2);
    setBirthMonth(numericValue);
  };

  const handleDayChange = (value: string) => {
    const numericValue = value.replace(/[^0-9]/g, "").slice(0, 2);
    setBirthDay(numericValue);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-0 sm:rounded-lg overflow-hidden">
        <DialogHeader className="flex-shrink-0 bg-white dark:bg-slate-900 z-10 border-b px-4 sm:px-6 py-4 shadow-sm relative">
          <DialogTitle className="text-base sm:text-lg font-semibold text-center text-slate-900 dark:text-white pr-8">
            응급 의료 카드 정보 입력
          </DialogTitle>
          <button
            onClick={onClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-opacity"
            aria-label="닫기"
          >
            <X className="h-5 w-5 text-slate-900 dark:text-white" />
          </button>
        </DialogHeader>
        
        {/* 스크롤 가능한 폼 영역 */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 min-h-0">
          {/* 영문 이름 */}
          <div className="space-y-2">
            <Label htmlFor="englishName" className="text-sm font-medium text-slate-900 dark:text-white">
              영문 이름 (여권 기준)
            </Label>
            <Input
              id="englishName"
              value={formData.englishName}
              onChange={(e) => setFormData(prev => ({ ...prev, englishName: e.target.value }))}
              placeholder="예: HONG GILDONG"
              className="border-slate-300"
            />
          </div>

          {/* 한글 이름 */}
          <div className="space-y-2">
            <Label htmlFor="koreanName" className="text-sm font-medium text-slate-900 dark:text-white">
              한글 이름
            </Label>
            <Input
              id="koreanName"
              value={formData.koreanName}
              onChange={(e) => setFormData(prev => ({ ...prev, koreanName: e.target.value }))}
              placeholder="홍길동"
              className="border-slate-300"
            />
          </div>

          {/* 생년월일 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-900 dark:text-white">
              생년월일
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="birthYear"
                value={birthYear}
                onChange={(e) => {
                  const value = e.target.value.replace(/[^0-9]/g, "").slice(0, 4);
                  setBirthYear(value);
                }}
                placeholder=""
                maxLength={4}
                className="flex-1 border-slate-300 text-center"
              />
              <span className="text-slate-500 font-medium">년</span>
              <Input
                id="birthMonth"
                value={birthMonth}
                onChange={(e) => handleMonthChange(e.target.value)}
                placeholder=""
                maxLength={2}
                className="w-16 border-slate-300 text-center"
              />
              <span className="text-slate-500 font-medium">월</span>
              <Input
                id="birthDay"
                value={birthDay}
                onChange={(e) => handleDayChange(e.target.value)}
                placeholder=""
                maxLength={2}
                className="w-16 border-slate-300 text-center"
              />
              <span className="text-slate-500 font-medium">일</span>
            </div>
          </div>

          {/* 혈액형 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-900 dark:text-white">
              혈액형
            </Label>
            <div className="flex flex-wrap gap-2">
              {bloodTypeOptions.map((type) => (
                <button
                  key={type}
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, bloodType: type }))}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                    ${
                      formData.bloodType === type
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                    }
                  `}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* 국적 */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Label className="text-sm font-medium text-slate-900 dark:text-white">
                국적
              </Label>
              <span className="text-xs text-gray-400">
                (한국 고정입니다)
              </span>
            </div>
            <Input
              value={formData.nationality}
              readOnly
              className="border-slate-300 bg-slate-200 dark:bg-slate-700 cursor-not-allowed opacity-70"
            />
          </div>

          {/* 언어 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-900 dark:text-white">
              언어
            </Label>
            <div className="flex flex-wrap gap-2">
              {languageOptions.map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => handleLanguageToggle(lang)}
                  className={`
                    px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200
                    ${
                      formData.languages.includes(lang)
                        ? "bg-blue-600 text-white shadow-sm"
                        : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                    }
                    ${lang === "한국어" ? "opacity-100 cursor-default" : ""}
                  `}
                  disabled={lang === "한국어"}
                >
                  {lang}
                </button>
              ))}
            </div>
          </div>

          {/* 전화번호 */}
          <div className="space-y-2">
            <Label htmlFor="phoneNumber" className="text-sm font-medium text-slate-900 dark:text-white">
              전화번호
            </Label>
            <div className="flex items-center gap-2">
              <Input
                id="phoneNumber-first"
                value={formData.phoneNumber.first}
                onChange={(e) => handlePhoneChange("first", e.target.value)}
                readOnly
                maxLength={3}
                className="w-16 border-slate-300 text-center bg-slate-100 dark:bg-slate-700 cursor-not-allowed"
              />
              <span className="text-slate-500 font-medium">-</span>
              <Input
                id="phoneNumber-middle"
                value={formData.phoneNumber.middle}
                onChange={(e) => handlePhoneChange("middle", e.target.value)}
                maxLength={4}
                placeholder="0000"
                className="flex-1 border-slate-300 text-center"
              />
              <span className="text-slate-500 font-medium">-</span>
              <Input
                id="phoneNumber-last"
                value={formData.phoneNumber.last}
                onChange={(e) => handlePhoneChange("last", e.target.value)}
                maxLength={4}
                placeholder="0000"
                className="flex-1 border-slate-300 text-center"
              />
            </div>
          </div>

          {/* 이메일 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-900 dark:text-white">
              이메일 주소
            </Label>
            <div className="flex items-center gap-2">
              <Input
                value={formData.email.id}
                onChange={(e) => setFormData(prev => ({ ...prev, email: { ...prev.email, id: e.target.value } }))}
                placeholder="아이디"
                className="flex-1 border-slate-300"
              />
              <span className="text-slate-500">@</span>
              <Input
                value={formData.email.domain}
                onChange={(e) => setFormData(prev => ({ ...prev, email: { ...prev.email, domain: e.target.value } }))}
                placeholder="도메인"
                className="flex-1 border-slate-300"
              />
            </div>
          </div>

          {/* 비상 연락처 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-900 dark:text-white">
              비상 연락처
            </Label>
            <div className="flex items-center gap-2 mb-2">
              <Input
                value={formData.emergencyContact.phone.first}
                onChange={(e) => handlePhoneChange("first", e.target.value, "emergency")}
                maxLength={3}
                className="w-16 border-slate-300 text-center"
              />
              <span className="text-slate-500">-</span>
              <Input
                value={formData.emergencyContact.phone.middle}
                onChange={(e) => handlePhoneChange("middle", e.target.value, "emergency")}
                maxLength={4}
                className="flex-1 border-slate-300 text-center"
              />
              <span className="text-slate-500">-</span>
              <Input
                value={formData.emergencyContact.phone.last}
                onChange={(e) => handlePhoneChange("last", e.target.value, "emergency")}
                maxLength={4}
                className="flex-1 border-slate-300 text-center"
              />
            </div>
            <RadioGroup
              value={formData.emergencyContact.relationship}
              onValueChange={(value) => setFormData(prev => ({
                ...prev,
                emergencyContact: { ...prev.emergencyContact, relationship: value }
              }))}
              className="flex gap-4"
            >
              {relationshipOptions.map((option) => (
                <div key={option} className="flex items-center space-x-2">
                  <RadioGroupItem value={option} id={`relationship-${option}`} />
                  <Label htmlFor={`relationship-${option}`} className="text-sm cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* 알러지 여부 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-900 dark:text-white">
              알러지 여부
            </Label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, hasAllergy: "yes" }))}
                className={`
                  flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    formData.hasAllergy === "yes"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  }
                `}
              >
                예
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, hasAllergy: "no" }))}
                className={`
                  flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    formData.hasAllergy === "no"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  }
                `}
              >
                아니오
              </button>
            </div>
          </div>

          {/* 흡연 여부 */}
          <div className="space-y-2">
            <Label className="text-sm font-medium text-slate-900 dark:text-white">
              흡연 여부
            </Label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isSmoker: "yes" }))}
                className={`
                  flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    formData.isSmoker === "yes"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  }
                `}
              >
                예
              </button>
              <button
                type="button"
                onClick={() => setFormData(prev => ({ ...prev, isSmoker: "no" }))}
                className={`
                  flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200
                  ${
                    formData.isSmoker === "no"
                      ? "bg-blue-600 text-white shadow-sm"
                      : "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-300"
                  }
                `}
              >
                아니오
              </button>
            </div>
          </div>

          {/* 법적 면책 조항 */}
          <div className="bg-gray-50 dark:bg-slate-800 rounded-lg p-3 mt-2">
            <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
              본 정보는 응급 상황 시 참고를 위한 정보이며, 의료적 판단이나 법적 효력을 대신하지 않습니다. 입력 오류 또는 정보 누락으로 발생한 문제에 대한 책임은 사용자에게 있습니다.
            </p>
          </div>

          {/* 카드 만들기 버튼 - 폼의 마지막 요소 */}
          <div className="pt-2 pb-4">
            <Button
              onClick={handleSubmit}
              disabled={isGenerating}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isGenerating ? (
                <span className="flex items-center justify-center gap-3">
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  안전 카드 생성 중...
                </span>
              ) : (
                "카드 만들기"
              )}
            </Button>
          </div>
          
          {/* 로딩 오버레이 */}
          {isGenerating && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
              <div className="bg-white dark:bg-slate-800 rounded-lg p-8 flex flex-col items-center gap-4">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-base font-medium text-gray-700 dark:text-gray-300">안전 카드 생성 중...</p>
              </div>
            </div>
          )}
        </div>
      </DialogContent>

      {/* 마케팅 동의 팝업 */}
      <Dialog open={showMarketingPopup} onOpenChange={setShowMarketingPopup}>
        <DialogContent className="max-w-md p-0 sm:rounded-lg overflow-hidden">
          <DialogHeader className="bg-white dark:bg-slate-900 border-b px-6 py-4">
            <DialogTitle className="text-lg font-semibold text-center text-slate-900 dark:text-white">
              🚬 해외 여행 흡연 에티켓 안내 (MyRealTrip x IQOS)
            </DialogTitle>
          </DialogHeader>
          
          <div className="px-6 py-6 space-y-6">
            <p className="text-sm text-gray-700 dark:text-gray-300 leading-relaxed">
              마이리얼트립과 아이코스가 준비한 해외 여행 흡연 에티켓을 알려드려요! 정보제공에 동의하시면 입력하신 메일로 관련 정보 및 면세점 담배 팁을 보내드립니다! 동의하시겠습니까?
            </p>
            
            <div className="flex flex-col gap-3">
              <Button
                onClick={() => handleMarketingConsent(true)}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-semibold"
              >
                동의하고 혜택 받기
              </Button>
              <Button
                onClick={() => handleMarketingConsent(false)}
                variant="outline"
                className="w-full py-6 text-base font-semibold border-gray-300 hover:bg-gray-50"
              >
                괜찮습니다
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};

export default MedicalCardModal;
