import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Index from "./Index";
import { urlCodeToCountryName, countryInfoContent, europeInfoContent, countryNameToUrlCode } from "@/lib/countryUtils";

// 국가 선택 드롭다운에 표시할 국가 목록
const sortedCountries = [
  "일본", 
  "베트남", 
  "태국", 
  "필리핀", 
  "중국", 
  "대만", 
  "미국", 
  "홍콩", 
  "인도네시아", 
  "프랑스", 
  "싱가포르"
];

// 국가별 페이지 컴포넌트
const CountryPage = () => {
  const { code } = useParams<{ code: string }>();
  
  // URL 코드를 국가명으로 변환
  const countryName = code ? urlCodeToCountryName(code) : null;
  
  // 국가가 유효하지 않으면 404 처리 (나중에 NotFound로 리다이렉트 가능)
  if (!countryName) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">국가를 찾을 수 없습니다</h1>
          <Link to="/" className="text-blue-600 hover:underline">
            메인 페이지로 돌아가기
          </Link>
        </div>
      </div>
    );
  }

  // 유럽 전체 페이지인지 확인
  const isEurope = code === "eu";
  
  // 국가별 정보 콘텐츠
  const infoContent = isEurope 
    ? europeInfoContent 
    : countryInfoContent[countryName] || `${countryName} 여행을 위한 필수 준비물을 확인하세요.`;

  // 다른 국가 목록 (현재 국가 제외)
  const otherCountries = sortedCountries.filter(c => c !== countryName);

  // 페이지별 타이틀 설정 (SEO 최적화)
  useEffect(() => {
    const pageTitle = isEurope 
      ? "유럽 여행 준비물 체크리스트 | 마이리얼트립"
      : `${countryName} 여행 준비물 체크리스트 | 마이리얼트립`;
    document.title = pageTitle;
    
    // 컴포넌트 언마운트 시 원래 타이틀으로 복원 (선택사항)
    return () => {
      document.title = "해외여행 준비물 체크리스트 | 1분 맞춤 리스트 - 체크리얼트립";
    };
  }, [countryName, isEurope]);

  return (
    <div>
      {/* SEO용 숨김 콘텐츠 (화면에는 보이지 않지만 검색 엔진은 읽음) */}
      <div className="sr-only">
        <h1>
          {isEurope ? "유럽 여행 준비물 체크리스트" : `${countryName} 여행 준비물 체크리스트`}
        </h1>
        <h2>
          {isEurope ? "유럽 여행 준비물" : `${countryName} 여행 준비물`}
        </h2>
        <p>
          {infoContent}
        </p>
      </div>

      {/* 체크리스트 컴포넌트 (초기 국가 설정, Header 표시) */}
      {/* 유럽 페이지는 국가 선택 없이 일반 체크리스트 표시 */}
      <Index initialCountry={isEurope ? undefined : countryName} showHeader={true} />
    </div>
  );
};

export default CountryPage;
