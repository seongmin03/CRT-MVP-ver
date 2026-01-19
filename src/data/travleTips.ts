export interface TravelTip {
    title: string;
    content: string;
  }
  
  export const travelTips: Record<string, TravelTip[]> = {
    "일본": [
      { title: "현금은 필수", content: "일본은 현금 사용 비율이 매우 높아요! <a href='https://www.coupang.com/np/search?component=&q=%EC%9D%BC%EB%B3%B8+%EB%8F%99%EC%A0%84%EC%A7%80%EA%B0%91&traceId=mkclzz85&channel=user' target='_blank' rel='noopener noreferrer' class='underline text-blue-600 hover:text-blue-800'>일본 동전지갑</a> 챙기셨나요?" },
      { title: "비짓재팬(VJW) 캡처", content: "비짓재팬은 일본의 전자 입국신고서에요! 미리 큐알코드 캡처하세요!" },
      { title: "복잡한 지하철 노선", content: "일본은 운영사가 다양한 노선이 섞여 있어요. 구매한 패스가 어느 노선까지 커버하는지 꼭 확인하세요." },
      { title: "쇼핑과 수하물", content: "<a href='https://www.myrealtrip.com/promotions/Japan_donki_coupon' target='_blank' rel='noopener noreferrer' class='underline text-blue-600 hover:text-blue-800'>돈키호테 쇼핑</a> 리스트 꽉 채우실 예정인가요? 수하물 무게 초과되지 않게 '<a href='https://www.coupang.com/np/search?q=%EC%BA%90%EB%A6%AC%EC%96%B4%20%EB%AC%B4%EA%B2%8C%20%EC%B8%A1%EC%A0%95%EA%B8%B0&channel=auto&traceId=mkcm1qyv' target='_blank' rel='noopener noreferrer' class='underline text-blue-600 hover:text-blue-800'>휴대용 손저울</a>' 챙기면 마음이 편해요" }
    ],
    "베트남": [
      { title: "전자담배 반입 불법", content: "베트남은 전자담배 반입이 불법이에요! 공항에서 압수당하거나 벌금이 부과되기도 해요" },
      { title: "그랩(Grab) 미리 가입", content: "동남아 대표 택시 어플인 <a href='mrt://web?url=https%3A%2F%2Fgrab.onelink.me%2F2695613898%3Fpid%3DDB--MyRealTrip%26c%3DKR_CM0002_CLUSTERALL-CLUSTERALL_PAX_GT_ALL_031225_ACQ-MAIA-APPC_ASR__RG23GTPAT1KRTRAVQ1_DB--MyRealTrip_int_1170x1560_StdBnr_ADTK_ManualPlacement_pop-up-251202%26is_retargeting%3Dtrue%26af_dp%3DNA%26af_force_deeplink%3Dtrue%26af_sub5%3Ddisplay%26af_ad%3DKR_CM0002_CLUSTERALL-CLUSTERALL_PAX_GT_ALL_031225_ACQ-MAIA-APPC_ASR__RG23GTPAT1KRTRAVQ1_DB--MyRealTrip_int_1170x1560_StdBnr_ADTK_ManualPlacement_pop-up-251202%26af_adset%3DKR_CM0002_CLUSTERALL-CLUSTERALL_PAX_GT_ALL_031225_ACQ-MAIA-APPC_ASR__RG23GTPAT1KRTRAVQ1_DB--MyRealTrip_int_1170x1560_StdBnr_ADTK_ManualPlacement_pop-up-251202%26af_siteID%3DDB--MyRealTrip' target='_blank' rel='noopener noreferrer' class='underline text-blue-600 hover:text-blue-800'>그랩(Grab)</a>, 한국에서 미리 번호 인증하고 카드까지 등록하세요" },
      { title: "갑작스러운 비 대비", content: "베트남은 습도가 높고 갑자기 비가 내려요! <a href='https://www.coupang.com/np/search?component=&q=%EC%97%AC%ED%96%89%EC%9A%A9+%EC%A7%80%ED%8D%BC%EB%B0%B1&traceId=mkdmxoyn&channel=user' target='_blank' rel='noopener noreferrer' class='underline text-blue-600 hover:text-blue-800'>여분의 지퍼백</a>은 젖은 물건을 분리하기 좋아요" },
      { title: "입국심사 대비", content: "입국심사에서 체류계획을 질문받을 수 있어 예약내역을 바로 보여줄 수 있게 준비하세요!" }
    ],
    "태국": [
      { title: "전자담배 전면 금지", content: "태국은 전자담배가 전면 불법이에요! 절대 가져가지 마세요." },
      { title: "사원 복장 에티켓", content: "사원에 갈 때 복장규정이 있어요. 반바지, 민소매, 슬리퍼 등의 옷차림을 주의하세요." },
      { title: "강력한 실내 에어컨", content: "밖은 덥지만 건물 내부는 추워요! 냉방병에 대비하여 얇은 긴팔을 준비하세요." },
      { title: "택시 미터기 확인", content: "미터기 대신 고정 요금을 달라고 고집한다면 <a href='mrt://web?url=https%3A%2F%2Fgrab.onelink.me%2F2695613898%3Fpid%3DDB--MyRealTrip%26c%3DKR_CM0002_CLUSTERALL-CLUSTERALL_PAX_GT_ALL_031225_ACQ-MAIA-APPC_ASR__RG23GTPAT1KRTRAVQ1_DB--MyRealTrip_int_1170x1560_StdBnr_ADTK_ManualPlacement_pop-up-251202%26is_retargeting%3Dtrue%26af_dp%3DNA%26af_force_deeplink%3Dtrue%26af_sub5%3Ddisplay%26af_ad%3DKR_CM0002_CLUSTERALL-CLUSTERALL_PAX_GT_ALL_031225_ACQ-MAIA-APPC_ASR__RG23GTPAT1KRTRAVQ1_DB--MyRealTrip_int_1170x1560_StdBnr_ADTK_ManualPlacement_pop-up-251202%26af_adset%3DKR_CM0002_CLUSTERALL-CLUSTERALL_PAX_GT_ALL_031225_ACQ-MAIA-APPC_ASR__RG23GTPAT1KRTRAVQ1_DB--MyRealTrip_int_1170x1560_StdBnr_ADTK_ManualPlacement_pop-up-251202%26af_siteID%3DDB--MyRealTrip' target='_blank' rel='noopener noreferrer' class='underline text-blue-600 hover:text-blue-800'>다른 택시</a>를 찾으세요!" }
    ],
    "필리핀": [
      { title: "공항세(Terminal Fee)", content: "필리핀은 공항세를 받습니다. 일부 공항은 현장에서 현금으로 받는 경우가 있으니 미리 확인하세요!" },
      { title: "오프라인 서류 준비", content: "와이파이 연결이 불안정한 경우가 있으니 중요 서류는 미리 캡쳐하거나 프린트하세요." },
      { title: "대형 쇼핑몰 실내 온도", content: "더운 날씨와 달리 대형 쇼핑몰 실내는 온도가 낮아요. 가벼운 겉옷을 준비하세요!" }
    ],
    "중국": [
      { title: "통신 서비스 차단 대비", content: "중국에서는 구글, 인스타 등 해외 서비스가 차단되거나 불안정할 수 있어요. 출국 전 대체 수단(VPN 등)을 준비하세요." },
      { title: "결제 앱 실전 테스트", content: "알리페이/위챗페이로 결제가 이루어져요! 한국에서 미리 등록과 테스트를 마치세요." },
      { title: "보조배터리 3C 인증", content: "중국 국내선을 탈 때는 <a href='https://link.coupang.com/a/drYfII' target='_blank' rel='noopener noreferrer' class='underline text-blue-600 hover:text-blue-800 font-semibold'>보조배터리 3C 인증</a>이나 용량 표기가 있어야 반입이 가능해요." }
    ],
    "미국 / 괌": [
      { title: "ESTA와 입국 심사", content: "ESTA는 입국 심사를 보장하지 않아요! 숙소 주소 등 질문에 대한 답변을 미리 준비하세요." },
      { title: "팁(Tip) 직접 입력", content: "결제 후 팁을 직접 입력해야 하는 경우가 많아요. 당황하지 마세요!" },
      { title: "실물 면허증 지참", content: "렌터카 이용 시 실물 한국 면허증과 여권을 함께 요구할 수 있어요. 모든 서류를 챙기세요." },
      { title: "세금 별도 표기", content: "일반적으로 가격표에 세금이 포함되어 있지 않으니 결제 시 주의하세요!" }
    ],
    "홍콩": [
      { title: "옥토퍼스 카드", content: "옥토퍼스 카드는 홍콩의 교통카드에요. 다양한 곳에서 사용할 수 있으니 꼭 발급하세요!" },
      { title: "우기 대비", content: "우기에는 갑자기 비가 와요! <a href='https://link.coupang.com/a/drYh8F' target='_blank' rel='noopener noreferrer' class='underline text-blue-600 hover:text-blue-800 font-semibold'>우산</a>이나 우비를 미리 준비하세요 :)" },
      { title: "합석 문화", content: "맛있는 음식이 정말 많은 홍콩, 그만큼 합석 문화도 존재하므로 당황하지 말고 현지인과 함께 음식을 즐기세요!" },
      { title: "숙소 크기", content: "숙소 객실 크기가 작은 편이에요." }
    ],
    "인도네시아": [
      { title: "여행자 보험", content: "인도네시아의 외국인 병원비는 비싼편이에요! <a href='https://www.myrealtrip.com/event/flight_insurance' target='_blank' rel='noopener noreferrer' class='underline text-blue-600 hover:text-blue-800 font-semibold'>여행자 보험</a>으로 미리 대비하세요." },
      { title: "현금 준비", content: "여전히 현금 사용 비중이 높아요!" },
      { title: "발리 밸리 주의", content: "발리 밸리(Bali Belly)라는 말이 있듯이 많은 여행자가 소화기 불량, 복통을 호소해요. 안전한 여행이 되도록 유의하세요!" }
    ],
    "유럽": [
      { title: "소매치기 주의", content: "유럽은 <a href='https://link.coupang.com/a/drYsXL' target='_blank' rel='noopener noreferrer' class='underline text-blue-600 hover:text-blue-800 font-semibold'>소매치기</a>가 빈번해요. 특히 관광지, 대중교통 처럼 사람이 많은 곳에서는 안보이는 가방에 소지품을 넣으세요!" },
      { title: "유료 화장실", content: "유료 화장실이 있는 지역이 많아, 동전이나 소액 결제수단을 준비하면 좋아요." },
      { title: "식당 자릿세", content: "자릿세가 부과되는 식당이 있습니다! 메뉴판을 잘 확인하세요." }
    ],
    "싱가포르": [
      { title: "껌 반입 금지", content: "싱가포르는 껌 반입 금지에요!" },
      { title: "음식물 섭취 금지", content: "대중교통에서 음식물 섭취하지 마세요. 벌금이 부과될 수 있어요!" },
      { title: "SG Arrival Card", content: "싱가포르 입국카드 (SG Arrival Card)를 미리 작성하세요. 입국 3일전부터 작성하여 입국 절차를 빠르게 끝내세요!" }
    ],
    "호주": [
      { title: "강력한 자외선", content: "호주의 태양은 차원이 달라요! 지수가 높은 자외선 차단제를 바르세요." },
      { title: "엄격한 검역", content: "호주는 아름다운 생태계를 보호하기 위해 검역 절차가 매우 까다로워요. 식품을 반입하려면 반드시 신고해야 합니다!" }
    ]
  };
