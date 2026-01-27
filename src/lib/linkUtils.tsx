import React from 'react';

// 국가별 키워드-링크 매핑
const linkMappings: Record<string, Record<string, string>> = {
  "일본": {
    "비짓재팬": "https://services.digital.go.jp/ko/visit-japan-web/",
    "전용 어댑터": "https://link.coupang.com/a/dAJOua",
    "프리볼트": "https://link.coupang.com/a/dAJUYQ",
    "손수건 휴대": "https://link.coupang.com/a/dAJZ0D",
    "할인 쿠폰": "https://www.myrealtrip.com/promotions/Japan_donki_coupon",
  },
  "베트남": {
    "멀티 어댑터": "https://link.coupang.com/a/dAJOua",
    "배터리": "https://link.coupang.com/a/dAKiH8",
    "방수팩": "https://link.coupang.com/a/dAKmB5",
    "휴대용 샤워기 필터": "https://link.coupang.com/a/dAKn7a",
    "기피제": "https://link.coupang.com/a/dAKqb7",
    "빨래용 소형 파우치": "https://link.coupang.com/a/dAKu76",
  },
  "태국": {
    "공식 사이트": "http://tdac.immigration.go.th",
    "방수팩": "https://link.coupang.com/a/dAKmB5",
    "빨래용 소형 파우치": "https://link.coupang.com/a/dAKu76",
  },
  "필리핀": {
    "eTravel": "https://etravel.gov.ph/kr",
    "멀티 어댑터": "https://link.coupang.com/a/dAJOua",
    "휴대용 샤워기 필터": "https://link.coupang.com/a/dAKn7a",
    "밴드": "https://link.coupang.com/a/dALeAK",
    "기피제": "https://link.coupang.com/a/dAKqb7",
  },
};

/**
 * 텍스트에서 키워드를 찾아 링크로 변환하는 함수
 * @param text 원본 텍스트
 * @param country 현재 선택된 국가
 * @returns React 요소 배열 (텍스트와 링크가 혼합된 형태)
 */
export const parseTextWithLinks = (
  text: string,
  country: string | null
): React.ReactNode[] => {
  if (!text || !country) {
    return [text];
  }

  const mappings = linkMappings[country];
  if (!mappings) {
    return [text];
  }

  // 키워드를 길이 순으로 정렬 (긴 키워드부터 매칭하여 부분 매칭 방지)
  const sortedKeywords = Object.keys(mappings).sort((a, b) => b.length - a.length);

  // 모든 키워드의 위치를 찾기
  interface Match {
    start: number;
    end: number;
    keyword: string;
    url: string;
  }

  const matches: Match[] = [];
  
  for (const keyword of sortedKeywords) {
    let searchIndex = 0;
    while (true) {
      const index = text.indexOf(keyword, searchIndex);
      if (index === -1) break;
      
      // 이미 다른 키워드에 포함되어 있는지 확인 (겹침 방지)
      const isOverlapping = matches.some(
        m => index < m.end && index + keyword.length > m.start
      );
      
      if (!isOverlapping) {
        matches.push({
          start: index,
          end: index + keyword.length,
          keyword,
          url: mappings[keyword],
        });
      }
      
      searchIndex = index + 1;
    }
  }

  // 위치 순으로 정렬
  matches.sort((a, b) => a.start - b.start);

  // 겹치는 매칭 제거 (긴 키워드 우선)
  const finalMatches: Match[] = [];
  for (const match of matches) {
    const isOverlapping = finalMatches.some(
      m => match.start < m.end && match.end > m.start
    );
    if (!isOverlapping) {
      finalMatches.push(match);
    }
  }
  finalMatches.sort((a, b) => a.start - b.start);

  // 매칭이 없으면 원본 텍스트 반환
  if (finalMatches.length === 0) {
    return [text];
  }

  // 텍스트를 파싱하여 링크와 텍스트 조합
  const result: React.ReactNode[] = [];
  let lastIndex = 0;

  for (let i = 0; i < finalMatches.length; i++) {
    const match = finalMatches[i];
    
    // 매칭 전의 텍스트 추가
    if (match.start > lastIndex) {
      result.push(text.substring(lastIndex, match.start));
    }
    
    // 링크 추가
    result.push(
      <a
        key={`link-${match.start}-${i}`}
        href={match.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-blue-600 hover:text-blue-800 transition-colors"
        onClick={(e) => e.stopPropagation()}
      >
        {match.keyword}
      </a>
    );
    
    lastIndex = match.end;
  }

  // 남은 텍스트 추가
  if (lastIndex < text.length) {
    result.push(text.substring(lastIndex));
  }

  return result.length > 0 ? result : [text];
};
