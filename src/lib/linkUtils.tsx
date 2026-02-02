import React from 'react';

// 쿠팡 링크인지 확인하는 헬퍼 함수
const isCoupangLink = (url: string): boolean => {
  return url.includes('coupang.com') || url.includes('link.coupang.com');
};

// 국가별 키워드-링크 매핑 (description용)
const linkMappings: Record<string, Record<string, string>> = {
  "일본": {
    "비짓재팬": "https://services.digital.go.jp/ko/visit-japan-web/",
    "전용 어댑터": "https://link.coupang.com/a/dAJOua",
    "프리볼트": "https://link.coupang.com/a/dAJUYQ",
    "손수건 휴대": "https://link.coupang.com/a/dAJZ0D",
    "할인 쿠폰": "https://www.myrealtrip.com/promotions/Japan_donki_coupon",
    "케이블": "https://link.coupang.com/a/dDNICf",
  },
  "베트남": {
    "멀티 어댑터": "https://link.coupang.com/a/dAJOua",
    "배터리": "https://link.coupang.com/a/dAKiH8",
    "방수팩": "https://link.coupang.com/a/dAKmB5",
    "휴대용 샤워기 필터": "https://link.coupang.com/a/dAKn7a",
    "기피제": "https://link.coupang.com/a/dAKqb7",
    "빨래용 소형 파우치": "https://link.coupang.com/a/dAKu76",
    "케이블": "https://link.coupang.com/a/dDNICf",
  },
  "태국": {
    "공식 사이트": "http://tdac.immigration.go.th",
    "방수팩": "https://link.coupang.com/a/dAKmB5",
    "빨래용 소형 파우치": "https://link.coupang.com/a/dAKu76",
    "어댑터": "https://link.coupang.com/a/dAJOua",
    "케이블": "https://link.coupang.com/a/dDNICf",
    "손 소독제": "https://link.coupang.com/a/dDNVzP",
    "밴드": "https://link.coupang.com/a/dDNMl3",
    "필터": "https://link.coupang.com/a/dDNNxO",
    "기피제": "https://link.coupang.com/a/dDNZMC",
  },
  "필리핀": {
    "eTravel": "https://etravel.gov.ph/kr",
    "멀티 어댑터": "https://link.coupang.com/a/dAJOua",
    "휴대용 샤워기 필터": "https://link.coupang.com/a/dAKn7a",
    "밴드": "https://link.coupang.com/a/dALeAK",
    "기피제": "https://link.coupang.com/a/dAKqb7",
    "케이블": "https://link.coupang.com/a/dDNICf",
    "멀티탭": "https://link.coupang.com/a/dDN4jW",
    "손 소독제": "https://link.coupang.com/a/dDNVzP",
  },
  "중국": {
    "어댑터": "https://link.coupang.com/a/dAJOua",
    "케이블": "https://link.coupang.com/a/dDNICf",
    "손 소독제": "https://link.coupang.com/a/dDNVzP",
  },
  "대만": {
    "TWAC": "https://twac.immigration.gov.tw/",
    "우양산": "https://link.coupang.com/a/dA8f7X",
    "어댑터": "https://link.coupang.com/a/dAJOua",
    "케이블": "https://link.coupang.com/a/dDNICf",
    "손 소독제": "https://link.coupang.com/a/dDNVzP",
  },
  "미국": {
    "멀티 어댑터": "https://link.coupang.com/a/dA8mSm",
    "보조배터리": "https://link.coupang.com/a/dA8tql",
    "프리볼트": "https://link.coupang.com/a/dAJUYQ",
    "케이블": "https://link.coupang.com/a/dDNICf",
    "손 소독제": "https://link.coupang.com/a/dDNVzP",
  },
  "홍콩": {
    "어댑터": "https://link.coupang.com/a/dAJOua",
    "케이블": "https://link.coupang.com/a/dDNICf",
    "손 소독제": "https://link.coupang.com/a/dDNVzP",
  },
  "인도네시아": {
    "eVOA": "https://evisa.imigrasi.go.id/",
    "기피제": "https://link.coupang.com/a/dA9BhR",
    "케이블": "https://link.coupang.com/a/dDNICf",
    "손 소독제": "https://link.coupang.com/a/dDNVzP",
    "편한 가방": "https://link.coupang.com/a/dDOt24",
  },
  "프랑스": {
    "필터": "https://link.coupang.com/a/dA9KuX",
    "스프레이": "https://link.coupang.com/a/dA9Mv7",
    "케이블": "https://link.coupang.com/a/dDNICf",
    "손 소독제": "https://link.coupang.com/a/dDNVzP",
  },
  "싱가포르": {
    "멀티 어댑터": "https://link.coupang.com/a/dAJOua",
    "개인용 물티슈": "https://link.coupang.com/a/dA8anh",
    "우양산": "https://link.coupang.com/a/dA8f7X",
    "케이블": "https://link.coupang.com/a/dDNICf",
    "손 소독제": "https://link.coupang.com/a/dDNVzP",
  },
};

// 국가별 키워드-링크 매핑 (title용 - "title"이라고 명시된 항목만)
// 모든 국가에 공통으로 적용되는 키워드
const commonTitleLinkMappings: Record<string, string> = {
  "수납용 파우치": "https://link.coupang.com/a/dDOBAg",
  "보조배터리": "https://link.coupang.com/a/dDNGwG",
  "우비": "https://link.coupang.com/a/dDOgfU",
};

const titleLinkMappings: Record<string, Record<string, string>> = {
  "일본": {
    ...commonTitleLinkMappings,
  },
  "베트남": {
    ...commonTitleLinkMappings,
    "방수 밴드": "https://link.coupang.com/a/dDNMl3",
    "휴대용 샤워기 필터": "https://link.coupang.com/a/dDNNxO",
  },
  "태국": {
    ...commonTitleLinkMappings,
  },
  "필리핀": {
    ...commonTitleLinkMappings,
    "방수팩": "https://link.coupang.com/a/dDN10Z",
  },
  "중국": {
    ...commonTitleLinkMappings,
    "보조배터리 3C 인증": "https://link.coupang.com/a/dA7eeJ",
    "Arrival Card": "https://s.nia.gov.cn/ArrivalCardFillingPC/entry-registation-home",
    "휴대용 티슈": "https://link.coupang.com/a/dA78I2",
    "물티슈": "https://link.coupang.com/a/dA8anh",
  },
  "대만": {
    ...commonTitleLinkMappings,
    "휴대용 티슈": "https://link.coupang.com/a/dA78I2",
    "물티슈": "https://link.coupang.com/a/dA8anh",
  },
  "미국": {
    ...commonTitleLinkMappings,
    "ESTA": "https://esta.cbp.dhs.gov/",
    "선크림": "https://link.coupang.com/a/dDOcXm",
  },
  "홍콩": {
    ...commonTitleLinkMappings,
    "보조배터리": "https://link.coupang.com/a/dA8tql",
    "방수 밴드": "https://link.coupang.com/a/dA9mzC",
    "크로스백": "https://link.coupang.com/a/dA9qgh",
  },
  "인도네시아": {
    ...commonTitleLinkMappings,
    "올 인도네시아": "https://allindonesia.imigrasi.go.id/",
    "멀티 어댑터": "https://link.coupang.com/a/dAJOua",
    "휴대용 티슈": "https://link.coupang.com/a/dA78I2",
    "물티슈": "https://link.coupang.com/a/dA8anh",
    "방수팩": "https://link.coupang.com/a/dAKmB5",
    "여행자 보험": "https://www.myrealtrip.com/event/flight_insurance",
  },
  "프랑스": {
    ...commonTitleLinkMappings,
    "멀티 어댑터": "https://link.coupang.com/a/dAJOua",
    "귀마개": "https://link.coupang.com/a/dA9Q7U",
    "물티슈": "https://link.coupang.com/a/dDOyl0",
  },
  "싱가포르": {
    ...commonTitleLinkMappings,
    "SG Arrival Card": "https://eservices.ica.gov.sg/sgarrivalcard/",
    "모기 퇴치제": "https://link.coupang.com/a/dA9BhR",
  },
};

/**
 * 텍스트에서 키워드를 찾아 링크로 변환하는 함수
 * @param text 원본 텍스트
 * @param country 현재 선택된 국가
 * @param isTitle title인지 여부 (true면 title용 맵 사용, false면 description용 맵 사용)
 * @returns React 요소 배열 (텍스트와 링크가 혼합된 형태)
 */
export const parseTextWithLinks = (
  text: string,
  country: string | null,
  isTitle: boolean = false
): React.ReactNode[] => {
  if (!text || !country) {
    return [text];
  }

  // title인지 description인지에 따라 다른 맵 사용
  const mappings = isTitle 
    ? (titleLinkMappings[country] || {})
    : (linkMappings[country] || {});
  
  if (!mappings || Object.keys(mappings).length === 0) {
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
    const isMyRealTripDonkiLink = match.url === "https://www.myrealtrip.com/promotions/Japan_donki_coupon";
    result.push(
      <a
        key={`link-${match.start}-${i}`}
        href={match.url}
        target="_blank"
        rel="noopener noreferrer"
        className="underline text-blue-600 hover:text-blue-800 transition-colors"
        style={{ pointerEvents: 'auto' }}
        onClick={(e) => e.stopPropagation()}
        {...(isCoupangLink(match.url) ? { 'data-gtm': 'outbound_coupang' } : {})}
        {...(isMyRealTripDonkiLink ? { 
          'data-gtm': 'outbound_link', 
          'data-gtm-label': 'japan_donki_coupon' 
        } : {})}
      >
        <span className="pointer-events-none">{match.keyword}</span>
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
