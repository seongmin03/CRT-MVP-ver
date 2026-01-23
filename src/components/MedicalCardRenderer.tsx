import { useEffect, useRef, useState } from "react";
import { type MedicalCardData } from "./MedicalCardModal";
import html2canvas from "html2canvas";

interface MedicalCardRendererProps {
  data: MedicalCardData;
  onImageGenerated?: (imageUrl: string) => void;
}

// 언어 변환 맵
const languageMap: Record<string, string> = {
  "한국어": "Korean",
  "영어": "English",
  "일본어": "Japanese",
  "중국어": "Chinese",
  "러시아어": "Russian",
  "스페인어": "Spanish",
  "프랑스어": "French",
  "기타": "Other",
};

// 관계 변환 맵
const relationshipMap: Record<string, string> = {
  "가족": "Family",
  "친구": "Friend",
  "지인": "Acquaintance",
};

// 데이터 변환 함수 (외부에서도 사용 가능하도록 export)
export const transformDataForCard = (data: MedicalCardData) => {
  // 언어 변환 (한국어는 항상 포함)
  const languages = data.languages
    .filter(lang => lang !== "한국어")
    .map(lang => languageMap[lang] || lang);
  const formattedLanguages = ["Korean", ...languages].join(" / ");

  // 전화번호 포맷: +82) 10-0000-0000
  const phoneNumber = `+82) ${data.phoneNumber.first}-${data.phoneNumber.middle.padStart(4, "0")}-${data.phoneNumber.last.padStart(4, "0")}`;

  // 비상 연락처 포맷
  const emergencyPhone = `+82) ${data.emergencyContact.phone.first}-${data.emergencyContact.phone.middle.padStart(4, "0")}-${data.emergencyContact.phone.last.padStart(4, "0")}`;
  const relationship = relationshipMap[data.emergencyContact.relationship] || "Acquaintance";
  const emergencyContact = `${emergencyPhone} (${relationship})`;

  // 이메일 주소
  const email = data.email.id && data.email.domain 
    ? `${data.email.id}@${data.email.domain}` 
    : "";

  // 생년월일 포맷: YYYY-MM-DD
  const birthDate = data.birthDate.length === 8
    ? `${data.birthDate.slice(0, 4)}-${data.birthDate.slice(4, 6)}-${data.birthDate.slice(6, 8)}`
    : data.birthDate;

  return {
    englishName: data.englishName,
    koreanName: data.koreanName,
    birthDate,
    bloodType: data.bloodType,
    nationality: data.nationality,
    languages: formattedLanguages,
    phoneNumber,
    email,
    emergencyContact,
    hasAllergy: data.hasAllergy,
    isSmoker: data.isSmoker,
  };
};

const MedicalCardRenderer = ({ data, onImageGenerated }: MedicalCardRendererProps) => {
  const canvasRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [imageLoaded, setImageLoaded] = useState(false);

  // 이미지 로드 완료 확인
  useEffect(() => {
    if (imageRef.current?.complete) {
      setImageLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!canvasRef.current || !imageLoaded) return;

    const generateImage = async () => {
      try {
        // 폰트 로딩 완료 대기
        await document.fonts.ready;
        
        // 이미지가 완전히 로드될 때까지 추가 대기
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const transformedData = transformDataForCard(data);
        
        // html2canvas로 이미지 생성 (1080x1920 원본 해상도 유지)
        const canvas = await html2canvas(canvasRef.current!, {
          width: 1080,
          height: 1920,
          scale: 1, // 원본 해상도 유지
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          allowTaint: false,
        });

        // Canvas를 이미지로 변환
        const imageUrl = canvas.toDataURL("image/png", 1.0);
        
        if (onImageGenerated) {
          onImageGenerated(imageUrl);
        }
      } catch (error) {
        console.error("이미지 생성 중 오류 발생:", error);
      }
    };

    generateImage();
  }, [data, onImageGenerated, imageLoaded]);

  const transformedData = transformDataForCard(data);

  return (
    <div 
      ref={canvasRef} 
      className="relative bg-white"
      style={{ 
        width: "1080px",
        height: "1920px",
        position: "absolute",
        left: "-9999px",
        top: "-9999px",
        overflow: "hidden",
        contain: "layout size",
        willChange: "transform",
      }}
    >
      {/* 배경 이미지 */}
      <img
        ref={imageRef}
        src="/image/info/MedicalCard.png"
        alt="Medical Card Template"
        onLoad={() => setImageLoaded(true)}
        onError={(e) => {
          console.error("이미지 로드 실패:", e);
          setImageLoaded(true); // 에러가 나도 진행
        }}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: "1080px",
          height: "1920px",
          objectFit: "cover",
          display: "block",
          willChange: "transform",
        }}
        crossOrigin="anonymous"
      />

      {/* 텍스트 오버레이 - 절대 좌표 기반 */}
      <div 
        className="absolute inset-0" 
        style={{ 
          width: "1080px", 
          height: "1920px",
          willChange: "transform",
        }}
      >
        {/* 영문 이름 - (300, 357) 하단 기준 */}
        {transformedData.englishName && (
          <div
            style={{
              position: "absolute",
              left: "300px",
              top: "357px",
              transform: "translateY(-100%)",
              fontSize: "34px",
              color: "#000000",
              fontFamily: "sans-serif",
              willChange: "transform",
            }}
          >
            {transformedData.englishName}
          </div>
        )}

        {/* 국문 이름 - (300, 436) 하단 기준 */}
        {transformedData.koreanName && (
          <div
            style={{
              position: "absolute",
              left: "300px",
              top: "436px",
              transform: "translateY(-100%)",
              fontSize: "34px",
              color: "#000000",
              fontFamily: "sans-serif",
              willChange: "transform",
            }}
          >
            {transformedData.koreanName}
          </div>
        )}

        {/* 생년월일 - (300, 515) 하단 기준 */}
        {transformedData.birthDate && (
          <div
            style={{
              position: "absolute",
              left: "300px",
              top: "515px",
              transform: "translateY(-100%)",
              fontSize: "34px",
              color: "#000000",
              fontFamily: "sans-serif",
              willChange: "transform",
            }}
          >
            {transformedData.birthDate}
          </div>
        )}

        {/* 언어 정보 - (300, 673) 하단 기준 */}
        {transformedData.languages && (
          <div
            style={{
              position: "absolute",
              left: "300px",
              top: "673px",
              transform: "translateY(-100%)",
              fontSize: "34px",
              color: "#000000",
              fontFamily: "sans-serif",
              maxWidth: "700px",
              willChange: "transform",
            }}
          >
            {transformedData.languages}
          </div>
        )}

        {/* 혈액형 - (300, 752) 하단 기준 */}
        {transformedData.bloodType && (
          <div
            style={{
              position: "absolute",
              left: "300px",
              top: "752px",
              transform: "translateY(-100%)",
              fontSize: "34px",
              color: "#000000",
              fontFamily: "sans-serif",
              fontWeight: "bold",
              willChange: "transform",
            }}
          >
            {transformedData.bloodType}
          </div>
        )}

        {/* 전화번호 - (365, 977) 하단 기준 */}
        {transformedData.phoneNumber && (
          <div
            style={{
              position: "absolute",
              left: "365px",
              top: "977px",
              transform: "translateY(-100%)",
              fontSize: "34px",
              color: "#000000",
              fontFamily: "sans-serif",
              willChange: "transform",
            }}
          >
            {transformedData.phoneNumber}
          </div>
        )}

        {/* 이메일 주소 - (365, 1056) 하단 기준 */}
        {transformedData.email && (
          <div
            style={{
              position: "absolute",
              left: "365px",
              top: "1056px",
              transform: "translateY(-100%)",
              fontSize: "34px",
              color: "#000000",
              fontFamily: "sans-serif",
              maxWidth: "700px",
              willChange: "transform",
            }}
          >
            {transformedData.email}
          </div>
        )}

        {/* 비상 연락처 - (418, 1135) 하단 기준 */}
        {transformedData.emergencyContact && (
          <div
            style={{
              position: "absolute",
              left: "418px",
              top: "1135px",
              transform: "translateY(-100%)",
              fontSize: "34px",
              color: "#000000",
              fontFamily: "sans-serif",
              maxWidth: "650px",
              willChange: "transform",
            }}
          >
            {transformedData.emergencyContact}
          </div>
        )}

        {/* 알러지 체크박스 - (632, 1438) Yes / (891, 1438) No - 뾰족한 하단 끝점 기준 */}
        <div
          style={{
            position: "absolute",
            left: transformedData.hasAllergy === "yes" ? "632px" : "891px",
            top: "1438px",
            transform: "translateY(-100%)",
            fontSize: "48px",
            color: "#000000",
            fontFamily: "sans-serif",
            fontWeight: "bold",
            lineHeight: "1",
            willChange: "transform",
          }}
        >
          ✓
        </div>

        {/* 흡연 여부 체크박스 - (632, 1559) Yes / (891, 1559) No - 뾰족한 하단 끝점 기준 */}
        <div
          style={{
            position: "absolute",
            left: transformedData.isSmoker === "yes" ? "632px" : "891px",
            top: "1559px",
            transform: "translateY(-100%)",
            fontSize: "48px",
            color: "#000000",
            fontFamily: "sans-serif",
            fontWeight: "bold",
            lineHeight: "1",
            willChange: "transform",
          }}
        >
          ✓
        </div>
      </div>
    </div>
  );
};

export default MedicalCardRenderer;
