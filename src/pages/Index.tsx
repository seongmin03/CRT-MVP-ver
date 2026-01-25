import { useState, useRef, useEffect, useMemo, useCallback } from "react";
import Header from "@/components/Header";
import BottomProgressSheet from "@/components/BottomProgressSheet";
import { type DurationType } from "@/components/TravelDurationGuide";
import EssentialItems from "@/components/EssentialItems";
import ChecklistSection from "@/components/ChecklistSection";
import FlightLuggageGuideModal from "@/components/FlightLuggageGuideModal";
import MedicalCardModal, { type MedicalCardData } from "@/components/MedicalCardModal";
import { checklistData } from "@/data/checklistData";
import { travelTips } from "@/data/travleTips";
import { Lightbulb, Check, ChevronDown, Search, Link, X, Plus } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { cn } from "@/lib/utils";

// [그룹 A: 상위 노출 (20개)] - 정렬하지 않고 아래 순서 그대로 맨 위에 고정
const topCountries = [
  "일본", "베트남", "태국", "필리핀", "중국", "대만", 
  "미국", "홍콩", "인도네시아", "괌", "프랑스", "싱가포르", "호주", 
  "영국", "스페인", "이탈리아", "말레이시아", "캐나다", "독일", "몽골"
];

// [그룹 B: 나머지 국가 (100개)] - 가나다순 정렬
const otherCountries = [
  "가나", "과테말라", "그리스", "나미비아", "나이지리아", "남수단", 
  "남아프리카공화국", "네덜란드", "네팔", "노르웨이", "뉴질랜드", 
  "덴마크", "라오스", "라트비아", "러시아", "레바논", "레소토", 
  "루마니아", "룩셈부르크", "리투아니아", "마다가스카르", "마카오", 
  "말라위", "말타", "멕시코", "모로코", "모리셔스", "모잠비크", 
  "몬테네그로", "몰도바", "몰디브", "몰타", "미얀마", "바레인", 
  "바하마", "방글라데시", "벨라루스", "벨기에", "보츠와나", "볼리비아", 
  "부탄", "북마리아나 제도", "불가리아", "브라질", "브루나이", 
  "사우디아라비아", "세르비아", "세이셸", "스리랑카", "스웨덴", 
  "스위스", "슬로베니아", "아르메니아", "아르헨티나", "아랍에미리트", 
  "아제르바이잔", "아이슬란드", "아일랜드", "아프가니스탄", "알바니아", 
  "앙골라", "에스토니아", "에콰도르", "에티오피아", "엘살바도르", 
  "오만", "오스트리아", "온두라스", "요르단", "우간다", "우즈베키스탄", 
  "우루과이", "우크라이나", "이라크", "이란", "이스라엘", "이집트", 
  "인도", "잠비아", "조지아", "짐바브웨", "체코", "칠레", "카메룬", 
  "카자흐스탄", "카타르", "캄보디아", "케냐", "코스타리카", "코트디부아르", 
  "콜롬비아", "쿠바", "쿠웨이트", "크로아티아", "키르기스스탄", "타지키스탄", 
  "탄자니아", "토고", "튀르키예", "파나마", "파라과이", "파키스탄", 
  "팔라우", "페로 제도", "페루", "포르투갈", "폴란드", "프랑스령 폴리네시아", 
  "피지", "핀란드", "헝가리"
].sort((a, b) => a.localeCompare(b, 'ko'));

// 그룹 A + 그룹 B 결합 (그룹 A는 순서 유지, 그룹 B는 가나다순)
const sortedCountries = [...topCountries, ...otherCountries];

// 동남아시아 국가 리스트
const southeastAsiaCountries = [
  "베트남", "태국", "필리핀", "인도네시아", "싱가포르", 
  "말레이시아", "라오스", "캄보디아", "미얀마", "브루나이"
];

// 유럽 권역별 국가 리스트
const northEuropeCountries = [
  "노르웨이", "덴마크", "스웨덴", "아이슬란드", "핀란드", 
  "에스토니아", "라트비아", "리투아니아"
];

const westEuropeCountries = [
  "영국", "아일랜드", "프랑스", "벨기에", "네덜란드", 
  "룩셈부르크", "독일", "스위스", "오스트리아"
];

const southEuropeCountries = [
  "스페인", "포르투갈", "이탈리아", "그리스", "말타", 
  "알바니아", "세르비아", "몬테네그로", "크로아티아", "슬로베니아"
];

const eastEuropeCountries = [
  "러시아", "폴란드", "체코", "헝가리", "루마니아", 
  "불가리아", "벨라루스", "우크라이나", "몰도바"
];

// 전체 유럽 국가 리스트
const europeCountries = [
  ...northEuropeCountries,
  ...westEuropeCountries,
  ...southEuropeCountries,
  ...eastEuropeCountries
];

// localStorage 키
const STORAGE_KEY = 'travel_checklist_status';
const CUSTOM_ITEMS_KEY = 'travel_checklist_custom_items';

// 커스텀 항목 타입 정의
interface CustomItem {
  id: string;
  title: string;
}

// localStorage에서 체크 상태 불러오기
const loadCheckedItemsFromStorage = (): Set<string> => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return new Set(parsed);
      }
    }
  } catch (error) {
    console.error('Failed to load checklist status from localStorage:', error);
  }
  return new Set<string>();
};

// localStorage에 체크 상태 저장하기
const saveCheckedItemsToStorage = (checkedItems: Set<string>) => {
  try {
    const array = Array.from(checkedItems);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(array));
  } catch (error) {
    console.error('Failed to save checklist status to localStorage:', error);
  }
};

// localStorage에서 커스텀 항목 불러오기
const loadCustomItemsFromStorage = (): CustomItem[] => {
  try {
    const stored = localStorage.getItem(CUSTOM_ITEMS_KEY);
    if (stored) {
      const parsed = JSON.parse(stored);
      if (Array.isArray(parsed)) {
        return parsed;
      }
    }
  } catch (error) {
    console.error('Failed to load custom items from localStorage:', error);
  }
  return [];
};

// localStorage에 커스텀 항목 저장하기
const saveCustomItemsToStorage = (customItems: CustomItem[]) => {
  try {
    localStorage.setItem(CUSTOM_ITEMS_KEY, JSON.stringify(customItems));
  } catch (error) {
    console.error('Failed to save custom items to localStorage:', error);
  }
};

const Index = () => {
  // 초기 상태를 localStorage에서 불러오기
  const [checkedItems, setCheckedItems] = useState<Set<string>>(() => 
    loadCheckedItemsFromStorage()
  );
  const [customItems, setCustomItems] = useState<CustomItem[]>(() => 
    loadCustomItemsFromStorage()
  );
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [open, setOpen] = useState(false);
  const [isSearchActive, setIsSearchActive] = useState(false);
  // 여행팁 체크리스트 아이템 상태 (selectedCountry에 따라 나중에 동적으로 매핑 가능)
  const [travelTipItems, setTravelTipItems] = useState<typeof checklistData.sections[0]['items']>([]);
  // 여행 기간 선택 상태
  const [selectedDuration, setSelectedDuration] = useState<DurationType | null>(null);
  // 항공기 반입 물품 가이드 모달 상태
  const [isFlightGuideOpen, setIsFlightGuideOpen] = useState(false);
  // 응급 의료 카드 모달 상태
  const [isMedicalCardOpen, setIsMedicalCardOpen] = useState(false);
  // 응급 의료 카드 데이터 (흡연 여부는 별도 저장)
  const [medicalCardData, setMedicalCardData] = useState<MedicalCardData | null>(null);

  // 일본 전용 추가 데이터 정의
  const japanSpecificItems: Record<string, typeof checklistData.sections[0]['items']> = {
    essentials: [
      {
        item_id: "japan_passport_note",
        title: "여권 준비",
        description: "일본은 여권 잔여 유효기간 규정이 없으나 체류예정기간보다 넉넉한 유효기간을 권장합니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "japan_visa_note",
        title: "비자 / 입국 허가 확인",
        description: "한국인은 관광 목적으로 최대 90일간 무비자 입국이 가능합니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "japan_vjw",
        title: "사전 입국신고서 작성",
        description: "비짓재팬(전자 입국신고서)을 미리 작성하고 QR코드를 캡처해두세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "japan_immigration",
        title: "입국 심사 준비",
        description: "\"관광입니다(칸코데스)\", \"쇼핑입니다(카이모노데스)\" \"호텔(호테루)\", \"여권(파스포토)\"",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "japan_police_check",
        title: "불심검문 대비",
        description: "현지 경찰의 불심검문에 대비해 항상 여권을 휴대해야 합니다.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    electronics: [
      {
        item_id: "japan_adapter_110v",
        title: "멀티 어댑터 준비",
        description: "일본은 110V(11자형) 콘센트를 사용하므로 전용 어댑터가 필수입니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "japan_high_power",
        title: "고전력 제품 주의",
        description: "고데기, 드라이기 등은 변압기 없이는 고장날 수 있으니 프리볼트 여부를 확인하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "japan_disaster_app",
        title: "재난 알림 앱 설치",
        description: "일본 관광청 공식 앱 'Safety tips'를 설치해 한국어 재난 알림을 받으세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "japan_chargespot",
        title: "보조배터리 공유(ChargeSPOT)",
        description: "현지 대여 서비스인 차지 스팟 앱을 미리 설치해 방전에 대비하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    health: [
      {
        item_id: "japan_handkerchief",
        title: "개인용 손수건",
        description: "일본 공공 화장실은 핸드 드라이어가 없는 경우가 많아 손수건 휴대를 추천합니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "japan_medicine_restriction",
        title: "일본 반입 금지 성분",
        description: "한국 감기약 중 슈도에페드린, 코데인 성분은 일본 내 반입이 엄격히 제한됩니다.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    travel_tips: [
      {
        item_id: "japan_tip_cash",
        title: "현금은 필수",
        description: "현금 사용 비중이 높으므로 일본 전용 동전지갑을 준비하면 편리합니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "japan_tip_subway",
        title: "복잡한 지하철 노선",
        description: "운영사별로 노선이 다르니 보유한 패스의 커버리지를 반드시 확인하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "japan_tip_donki",
        title: "돈키호테 할인 쿠폰",
        description: "마이리얼트립에서 제공하는 할인 쿠폰을 미리 챙겨 혜택을 받으세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "japan_tip_convenience",
        title: "급하다면 편의점으로",
        description: "편의점 화장실은 대부분 개방되어 있고 청결하여 급할 때 유용합니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "japan_tip_bus",
        title: "버스 요금 계산법",
        description: "요금함 옆 환전기에서 잔돈을 만든 뒤 정확한 요금만 납부하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ]
  };

  // 베트남 전용 추가 데이터 정의
  const vietnamSpecificItems: Record<string, typeof checklistData.sections[0]['items']> = {
    essentials: [
      {
        item_id: "vietnam_passport_note",
        title: "여권 준비",
        description: "무비자 45일 입국을 위해 여권의 유효기간이 최소 6개월 이상 남아있어야 해요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "vietnam_visa_note",
        title: "비자 / 입국 허가 확인",
        description: "전자 비자를 신청할 경우 최대 90일까지 체류할 수 있어요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "vietnam_return_flight",
        title: "귀국 항공편 준비",
        description: "베트남 입국심사 시 왕복 항공권을 요청하는 경우가 있어요. 귀국 항공편을 미리 저장하거나 출력하세요!",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "vietnam_immigration",
        title: "입국 심사 준비",
        description: "관광(Du lịch - 주 릭), 출장(Công tác - 꽁 딱), 항공권(Vé máy bay - 베 마이 바이), 호텔(Khách sạn - 카익 산)",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "vietnam_family_certificate",
        title: "영문 가족관계증명서",
        description: "부모와 아이의 성이 다르거나 부모 중 한 명만 동반할 경우 입국 시 확인 절차가 있을 수 있습니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "vietnam_driving_license",
        title: "국제 운전 면허증과 운전",
        description: "오토바이 암행 단속이 잦고 도로마다 속도 제한이 다르므로 항상 주의하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    electronics: [
      {
        item_id: "vietnam_adapter_note",
        title: "멀티 어댑터 준비",
        description: "베트남의 220V 플러그는 모양이 다를 수 있어요. 멀티 어댑터나 3구 멀티탭을 챙기면 문제 해결!",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "vietnam_powerbank_note",
        title: "보조배터리 준비",
        description: "그랩 호출이나 구글 맵 사용 시 배터리가 금방 소모되니 필수입니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "vietnam_waterproof_pack",
        title: "방수팩 준비",
        description: "베트남은 갑작스러운 소나기(스콜)가 잦아요. 전자기기를 보호할 방수팩을 준비하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "vietnam_sim_note",
        title: "유심 / eSIM / 로밍 준비",
        description: "일반적으로 비엣텔(Viettel) 망이 커버리지가 넓은 것으로 알려져 있어요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "vietnam_bus_booking",
        title: "베트남 버스 예약",
        description: "'베쎄레(VEXERE)'는 베트남 최대 버스 승차권 예매 플랫폼이에요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "vietnam_zalo",
        title: "베트남 국민 메신저",
        description: "현지인과 소통할 경우 국민 앱인 '잘로(Zalo)'를 다운받으세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    health: [
      {
        item_id: "vietnam_bandage",
        title: "방수 밴드와 연고",
        description: "맨발에 슬리퍼를 신고 다니다가 발에 상처가 생기는 경우가 흔해요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "vietnam_motion_sickness",
        title: "멀미약 준비",
        description: "도시를 연결하는 슬리핑 버스는 매력적이지만 흔들림이 있으니 미리 방지하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "vietnam_shower_filter",
        title: "휴대용 샤워기 필터",
        description: "수돗물의 석회질이나 노후 배관 불순물이 걱정된다면 준비하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "vietnam_mosquito_repellent",
        title: "모기 기피제",
        description: "동남아 모기는 한국보다 독해요! 기피제 혹은 가려움 완화제를 준비하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "vietnam_sunscreen_repellent",
        title: "선크림과 기피제",
        description: "선크림을 먼저 바르고 30분 뒤에 기피제를 발라야 차단 효과가 유지됩니다.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    packing: [
      {
        item_id: "vietnam_extra_clothes",
        title: "여분의 반팔과 속옷",
        description: "땀이 많이 나는 날이 잦으므로 갈아입을 옷을 조금 넉넉히 챙기세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "vietnam_slippers",
        title: "슬리퍼 또는 샌들",
        description: "비 오는 날이나 숙소 근처 이동, 해변 일정 시 특히 유용해요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "vietnam_laundry_pouch",
        title: "빨래용 소형 파우치",
        description: "땀에 젖은 옷과 깨끗한 옷을 분리 보관하기 좋아 장기 여행 시 유용해요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    travel_tips: [
      {
        item_id: "vietnam_tip_grab",
        title: "Grab 앱 설치 및 결제수단 등록",
        description: "택시 흥정 스트레스를 줄일 수 있어요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "vietnam_tip_water",
        title: "생수로 양치하기",
        description: "수돗물은 석회질 등으로 인해 음용에 적합하지 않아요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "vietnam_tip_damaged_bills",
        title: "훼손된 지폐 확인 필수",
        description: "조금만 찢어져도 사용이 거절될 수 있으니 상태를 꼭 확인하세요. 훼손된 소액권은 은행에서만 교환이 가능합니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "vietnam_tip_snatch",
        title: "오토바이 날치기 주의",
        description: "스마트폰을 볼 때는 차도 쪽이 아닌 건물 쪽으로 몸을 돌려 보세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "vietnam_tip_crossing",
        title: "길 건너기 스킬",
        description: "오토바이가 몰려와도 멈추지 말고 일정한 속도로 천천히 걸어가세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "vietnam_tip_cilantro",
        title: "고수 빼기",
        description: "고수를 못 드신다면 미리 메모를 보여주세요. (북부: Không cho rau mùi / 남부: Không cho rau ngò)",
        cta_type: "none",
        cta_label: ""
      }
    ],
    finance: [
      {
        item_id: "vietnam_vnd_calculation",
        title: "베트남 동(VND) 계산법 숙지",
        description: "단위가 커서 헷갈릴 땐 '0 하나 빼고 2로 나누기'를 기억하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ]
  };

  // 태국 전용 추가 데이터 정의
  const thailandSpecificItems: Record<string, typeof checklistData.sections[0]['items']> = {
    essentials: [
      {
        item_id: "thailand_tdac",
        title: "태국 디지털 입국 카드",
        description: "TDAC는 입국 3일 전부터 작성 가능해요. 공식 사이트는 무료이니 유료 대행 사이트를 주의하세요!",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "thailand_visa_note",
        title: "비자 / 입국 허가 확인",
        description: "관광 목적으로 최대 90일까지 무비자 입국이 가능해요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "thailand_long_stay",
        title: "장기 체류",
        description: "90일 이상 체류 시 거주지 신고(90-day report)가 필요할 수 있으니 확인하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    finance: [
      {
        item_id: "thailand_atm_fee",
        title: "ATM 인출 주의",
        description: "수수료가 비싼 편이니 소액으로 여러 번 뽑기보다 한 번에 큰 금액을 인출하는 것이 경제적이에요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "thailand_app_card",
        title: "어플 카드 등록",
        description: "Grab이나 Bolt 등 현지 앱에 카드를 등록할 때 절차가 복잡할 수 있으니 한국에서 미리 설정하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    electronics: [
      {
        item_id: "thailand_grab_bolt",
        title: "Grab과 Bolt",
        description: "가격은 높지만 빠른 Grab, 배차는 길지만 저렴한 Bolt를 상황에 맞게 이용해 보세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "thailand_sim_note",
        title: "유심 / eSIM / 로밍 준비",
        description: "태국에서는 AIS 통신사가 가장 안정적인 커버리지를 제공하는 것으로 알려져 있어요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "thailand_waterproof_pack",
        title: "방수팩 준비",
        description: "갑작스러운 소나기(스콜)가 잦으므로 전자기기를 보호할 방수팩을 챙기세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    health: [
      {
        item_id: "thailand_bandage",
        title: "방수 밴드와 연고",
        description: "슬리퍼를 신고 걷다 생기는 발 상처에 대비하여 방수 기능이 있는 밴드를 준비하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "thailand_shower_filter",
        title: "휴대용 샤워기 필터",
        description: "수돗물의 석회질이나 노후 배관 불순물이 걱정된다면 필터 사용을 추천해요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "thailand_mosquito_repellent",
        title: "모기 기피제",
        description: "태국 모기는 매우 독해요! 현지에서 강력한 기피제나 완화제를 꼭 구비하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "thailand_sunscreen_repellent",
        title: "선크림과 기피제",
        description: "선크림을 먼저 바르고 30분 정도 흡수시킨 뒤 기피제를 발라야 효과가 유지됩니다.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    packing: [
      {
        item_id: "thailand_extra_clothes",
        title: "여분의 반팔과 속옷",
        description: "땀이 많이 나는 날씨이므로 갈아입을 옷을 평소보다 넉넉히 챙기세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "thailand_slippers",
        title: "슬리퍼 또는 샌들",
        description: "비 오는 날이나 숙소 근처, 해변 일정이 있을 때 가장 유용합니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "thailand_laundry_pouch",
        title: "빨래용 소형 파우치",
        description: "장기 여행 시 젖은 옷과 깨끗한 옷을 분리하여 쾌적하게 보관하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    travel_tips: [
      {
        item_id: "thailand_tip_traffic",
        title: "교통체증과 오토바이",
        description: "차가 심하게 막힐 땐 오토바이 택시(Win)를 이용해 보세요. 단거리를 빠르게 이동할 수 있어요!",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "thailand_tip_rain_taxi",
        title: "비 올 때 택시",
        description: "비가 오면 앱 호출 대기가 매우 길어지니 일정을 여유 있게 잡거나 미리 이동하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "thailand_tip_ice",
        title: "식용 얼음 확인",
        description: "노점 얼음이 불안하다면 가운데 구멍이 뚫린 공장제 얼음인지 확인하세요. 비교적 안전한 정수물 얼음입니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "thailand_tip_shoes",
        title: "신발 분실 주의",
        description: "맨발로 입장하는 사원에서는 비슷한 신발이 많아 바뀔 수 있으니 주의가 필요해요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "thailand_tip_ecig_ban",
        title: "전자담배 전면 금지",
        description: "태국은 전자담배가 전면 불법이에요! 절대 가져가지 마세요.",
        cta_type: "none",
        cta_label: ""
      }
    ]
  };

  const checklistRef = useRef<HTMLDivElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const customInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // 국가 변경 시 체크 상태 초기화
  useEffect(() => {
    if (selectedCountry) {
      setCheckedItems(new Set<string>());
      localStorage.removeItem(STORAGE_KEY);
    }
  }, [selectedCountry]);

  // 체크 상태가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    saveCheckedItemsToStorage(checkedItems);
  }, [checkedItems]);

  // 커스텀 항목이 변경될 때마다 localStorage에 저장
  useEffect(() => {
    saveCustomItemsToStorage(customItems);
  }, [customItems]);

  // Popover가 열릴 때 검색창 자동 포커스 방지 및 검색 활성화 상태 리셋
  useEffect(() => {
    if (open) {
      // 드롭다운이 열릴 때 검색 활성화 상태 리셋
      setIsSearchActive(false);
      
      // 데스크탑에서만 자동 포커스 허용 (모바일에서는 비활성화)
      const isDesktop = window.matchMedia('(pointer: fine)').matches;
      
      if (commandInputRef.current) {
        // 모바일에서는 포커스를 명시적으로 제거
        if (!isDesktop) {
          const timer = setTimeout(() => {
            if (commandInputRef.current && document.activeElement === commandInputRef.current) {
              commandInputRef.current.blur();
            }
          }, 0);
          return () => clearTimeout(timer);
        } else {
          // 데스크탑에서는 자동 포커스 허용
          const timer = setTimeout(() => {
            if (commandInputRef.current && !isSearchActive) {
              commandInputRef.current.focus();
              setIsSearchActive(true);
            }
          }, 100);
          return () => clearTimeout(timer);
        }
      }
    } else {
      // 드롭다운이 닫힐 때 검색 활성화 상태 리셋
      setIsSearchActive(false);
    }
  }, [open, isSearchActive]);

  // 검색 영역 클릭 핸들러
  const handleSearchAreaClick = () => {
    if (!isSearchActive && commandInputRef.current) {
      setIsSearchActive(true);
      // 사용자 제스처 내부에서만 포커스 (모바일 키보드 정책 준수)
      setTimeout(() => {
        commandInputRef.current?.focus();
      }, 0);
    }
  };

  const handleToggle = (itemId: string) => {
    setCheckedItems((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(itemId)) {
        newSet.delete(itemId);
      } else {
        newSet.add(itemId);
      }
      return newSet;
    });
  };

  // 체크리스트 초기화 함수
  const resetChecklist = () => {
    setCheckedItems(new Set<string>());
    localStorage.removeItem(STORAGE_KEY);
    toast({ title: "체크리스트가 초기화되었습니다", duration: 2000 });
  };

  // 커스텀 항목 추가
  const addCustomItem = () => {
    const newId = `custom_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const newItem: CustomItem = {
      id: newId,
      title: '',
    };
    setCustomItems([...customItems, newItem]);
    // 새 항목에 자동 포커스
    setTimeout(() => {
      const input = customInputRefs.current[newId];
      if (input) {
        input.focus();
      }
    }, 0);
  };

  // 커스텀 항목 수정
  const updateCustomItem = (id: string, title: string) => {
    setCustomItems(customItems.map(item => 
      item.id === id ? { ...item, title } : item
    ));
  };

  // 커스텀 항목 삭제
  const deleteCustomItem = (id: string) => {
    setCustomItems(customItems.filter(item => item.id !== id));
    // 체크 상태에서도 제거
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  };

  // 커스텀 항목 포커스 아웃 처리 (빈 항목 자동 삭제)
  const handleCustomItemBlur = (id: string, title: string) => {
    if (!title.trim()) {
      deleteCustomItem(id);
    }
  };

  // 기간별 의류 항목 매핑
  const durationItemsMap: Record<DurationType, string[]> = {
    "2-3": ['상의 3~4벌', '하의 1~2벌', '속옷 3~4벌', '양말 3~4켤레'],
    "4-5": ['상의 5~6벌', '하의 2~3벌', '속옷 5~6벌', '양말 5~6켤레'],
    "6-7": ['상의 6~7벌', '하의 3벌', '속옷 7~8벌', '양말 7~8켤레'],
    "7+": ['중간 세탁을 고려하세요.', '최대로 빨래를 하지 않고 버티는 날 + 하루 여유분을 준비하세요.']
  };

  // 선택된 기간에 따른 의류 항목 생성 (useMemo로 최적화)
  const durationItems = useMemo((): typeof checklistData.sections[0]['items'] => {
    // 기간이 선택되지 않았으면 빈 배열 반환 (기본 리스트 유지)
    if (!selectedDuration) {
      return [];
    }

    // 선택된 기간에 맞는 세부 수량 아이템들 생성
    return durationItemsMap[selectedDuration].map((title, index) => ({
      item_id: `duration_${selectedDuration}_${index}`,
      title: title,
      description: "",
      cta_type: "none",
      cta_label: ""
    }));
  }, [selectedDuration]);

  // 스마트 병합 함수: 제목 매칭 기반으로 치환 및 추가 (안전성 강화) - 먼저 정의
  const mergeItems = useCallback((
    baseItems: typeof checklistData.sections[0]['items'],
    countryItems: typeof checklistData.sections[0]['items']
  ): typeof checklistData.sections[0]['items'] => {
    try {
      // 안전성 체크: baseItems가 없으면 빈 배열 반환
      if (!baseItems || !Array.isArray(baseItems)) {
        return countryItems && Array.isArray(countryItems) ? countryItems : [];
      }

      // 안전성 체크: countryItems가 없으면 baseItems 반환
      if (!countryItems || !Array.isArray(countryItems) || countryItems.length === 0) {
        return baseItems;
      }

      // 1. 기본 항목들을 순회하면서 제목이 일치하는 국가 항목으로 치환
      const mergedItems = baseItems
        .filter(item => item && item.title) // 유효한 항목만 처리
        .map(baseItem => {
          if (!baseItem || !baseItem.title) return baseItem;
          
          const matchingCountryItem = countryItems.find(
            countryItem => countryItem && countryItem.title && countryItem.title === baseItem.title
          );
          // 제목이 일치하면 국가 전용 항목으로 치환, 없으면 기본 항목 유지
          return matchingCountryItem || baseItem;
        });

      // 2. 국가 전용 항목 중 기본 항목에 없는 제목은 맨 아래에 추가
      const baseTitles = new Set(
        baseItems
          .filter(item => item && item.title)
          .map(item => item.title)
      );
      const newCountryItems = countryItems.filter(
        countryItem => countryItem && countryItem.title && !baseTitles.has(countryItem.title)
      );

      return [...mergedItems, ...newCountryItems];
    } catch (error) {
      console.error('Error in mergeItems:', error);
      // 에러 발생 시 기본 항목 반환 (최소한의 데이터라도 보여주기)
      return baseItems && Array.isArray(baseItems) ? baseItems : [];
    }
  }, []);

  const totalItems = useMemo(() => {
    try {
      const isJapan = selectedCountry === "일본";
      const isVietnam = selectedCountry === "베트남";
      const isThailand = selectedCountry === "태국";
      
      return checklistData.sections.reduce((acc, section) => {
        if (!section || !section.items) return acc;
        
        try {
          // 여행팁 섹션은 체크박스가 없으므로 진행률 계산에서 제외
          if (section.section_id === "travel_tips") {
            return acc;
          }
          // packing 섹션 처리
          if (section.section_id === "packing") {
            const japanItems = isJapan ? (japanSpecificItems["packing"] || []) : [];
            const vietnamItems = isVietnam ? (vietnamSpecificItems["packing"] || []) : [];
            const thailandItems = isThailand ? (thailandSpecificItems["packing"] || []) : [];
            let finalItems = [...(section.items || [])];
            
            // 기간이 선택되었으면 underwear 제거하고 durationItems 추가
            if (selectedDuration) {
              const baseItems = finalItems.filter(item => item && item.item_id !== "underwear");
              const clothingIndex = baseItems.findIndex(item => item && item.item_id === "clothing");
              if (clothingIndex !== -1) {
                finalItems = [
                  ...baseItems.slice(0, clothingIndex + 1),
                  ...(durationItems || []),
                  ...baseItems.slice(clothingIndex + 1)
                ];
              } else {
                finalItems = [...(durationItems || []), ...baseItems];
              }
            }
            
            const merged = mergeItems(finalItems, mergeItems(mergeItems(japanItems, vietnamItems), thailandItems));
            return acc + (merged?.length || 0);
          }
          // 기타 섹션: 기본 항목과 국가 전용 항목 병합 결과
          const japanItems = isJapan ? (japanSpecificItems[section.section_id] || []) : [];
          const vietnamItems = isVietnam ? (vietnamSpecificItems[section.section_id] || []) : [];
          const thailandItems = isThailand ? (thailandSpecificItems[section.section_id] || []) : [];
          const merged = mergeItems(section.items || [], mergeItems(mergeItems(japanItems, vietnamItems), thailandItems));
          return acc + (merged?.length || 0);
        } catch (error) {
          console.error(`Error processing section ${section.section_id}:`, error);
          return acc + (section.items?.length || 0);
        }
      }, 0) + (customItems?.length || 0);
    } catch (error) {
      console.error('Error calculating totalItems:', error);
      // 에러 발생 시 기본값 반환 (여행팁 섹션 제외)
      return checklistData.sections.reduce((acc, section) => {
        if (section?.section_id === "travel_tips") return acc;
        return acc + (section?.items?.length || 0);
      }, 0) + (customItems?.length || 0);
    }
  }, [travelTipItems, selectedDuration, durationItems, customItems.length, selectedCountry, mergeItems]);
  const completedItems = checkedItems.size;
  const overallProgress = Math.round((completedItems / totalItems) * 100);

  // 체크리스트 섹션 분리: essentials는 마지막에, 나머지는 먼저 (useMemo로 최적화)
  const essentialsSection = useMemo(() => {
    try {
      const section = checklistData.sections.find(s => s && s.section_id === "essentials");
      if (!section || !section.items) return null;
      
      // 국가 전용 항목 스마트 병합
      const isJapan = selectedCountry === "일본";
      const isVietnam = selectedCountry === "베트남";
      const isThailand = selectedCountry === "태국";
      const japanItems = isJapan ? (japanSpecificItems["essentials"] || []) : [];
      const vietnamItems = isVietnam ? (vietnamSpecificItems["essentials"] || []) : [];
      const thailandItems = isThailand ? (thailandSpecificItems["essentials"] || []) : [];
      
      const mergedItems = mergeItems(section.items || [], mergeItems(mergeItems(japanItems, vietnamItems), thailandItems));
      
      return {
        ...section,
        items: mergedItems || section.items || []
      };
    } catch (error) {
      console.error('Error processing essentialsSection:', error);
      // 에러 발생 시 기본 섹션 반환
      const section = checklistData.sections.find(s => s && s.section_id === "essentials");
      return section || null;
    }
  }, [selectedCountry, mergeItems]);

  const otherSections = useMemo(() => {
    try {
      return checklistData.sections
        .filter(s => s && s.section_id && s.section_id !== "essentials")
        .map(section => {
          try {
            if (!section || !section.items) return section;
            
            // 국가 전용 데이터 추가 여부 확인
            const isJapan = selectedCountry === "일본";
            const isVietnam = selectedCountry === "베트남";
            const isThailand = selectedCountry === "태국";
            const japanItems = isJapan ? (japanSpecificItems[section.section_id] || []) : [];
            const vietnamItems = isVietnam ? (vietnamSpecificItems[section.section_id] || []) : [];
            const thailandItems = isThailand ? (thailandSpecificItems[section.section_id] || []) : [];

            // 여행팁 섹션 처리
            if (section.section_id === "travel_tips") {
              // travelTipItems와 국가 전용 항목 스마트 병합
              const mergedItems = mergeItems(travelTipItems || [], mergeItems(mergeItems(japanItems, vietnamItems), thailandItems));
              return {
                ...section,
                items: mergedItems || travelTipItems || []
              };
            }
            // packing 섹션 처리
            if (section.section_id === "packing") {
              let finalItems = [...(section.items || [])];
              
              // 기간이 선택되었으면 'underwear' 항목만 제거하고 durationItems로 교체
              if (selectedDuration) {
                const baseItems = finalItems.filter(item => item && item.item_id !== "underwear");
                // durationItems를 underwear 위치에 삽입 (clothing 다음에)
                const clothingIndex = baseItems.findIndex(item => item && item.item_id === "clothing");
                if (clothingIndex !== -1) {
                  finalItems = [
                    ...baseItems.slice(0, clothingIndex + 1),
                    ...(durationItems || []),
                    ...baseItems.slice(clothingIndex + 1)
                  ];
                } else {
                  finalItems = [...(durationItems || []), ...baseItems];
                }
              }
              
              // 국가 전용 항목 스마트 병합
              const mergedItems = mergeItems(finalItems, mergeItems(mergeItems(japanItems, vietnamItems), thailandItems));
              return {
                ...section,
                items: mergedItems || finalItems || []
              };
            }
            
            // 기타 섹션: 기본 항목과 국가 전용 항목 스마트 병합
            const mergedItems = mergeItems(section.items || [], mergeItems(mergeItems(japanItems, vietnamItems), thailandItems));
            return {
              ...section,
              items: mergedItems || section.items || []
            };
          } catch (error) {
            console.error(`Error processing section ${section.section_id}:`, error);
            return section;
          }
        });
    } catch (error) {
      console.error('Error processing otherSections:', error);
      // 에러 발생 시 기본 섹션 반환
      return checklistData.sections.filter(s => s && s.section_id && s.section_id !== "essentials");
    }
  }, [travelTipItems, selectedDuration, durationItems, selectedCountry, mergeItems]);

  // 선택된 국가의 여행 팁 가져오기 (권역별 처리)
  const getTravelTipsKey = (country: string | null): string | null => {
    if (!country) return null;
    
    // 미국/괌 처리
    if (country === "미국" || country === "괌") return "미국 / 괌";
    
    // 유럽 권역별 처리
    if (northEuropeCountries.includes(country)) return "북유럽";
    if (westEuropeCountries.includes(country)) return "서유럽";
    if (southEuropeCountries.includes(country)) return "남유럽";
    if (eastEuropeCountries.includes(country)) return "동유럽";
    
    // 일반 유럽 (폴백)
    if (europeCountries.includes(country)) return "유럽";
    
    // 기타 국가
    return country;
  };

  const travelTipsKey = getTravelTipsKey(selectedCountry);
  const currentTravelTips = selectedCountry && travelTipsKey ? travelTips[travelTipsKey] : null;
  
  // 표시할 지역명 결정
  const getDisplayRegionName = (country: string | null): string | null => {
    if (!country) return null;
    
    if (northEuropeCountries.includes(country)) return "북유럽";
    if (westEuropeCountries.includes(country)) return "서유럽";
    if (southEuropeCountries.includes(country)) return "남유럽";
    if (eastEuropeCountries.includes(country)) return "동유럽";
    
    return country;
  };
  
  const displayCountryName = getDisplayRegionName(selectedCountry) || selectedCountry;

  const copyLink = async () => {
    const url = "https://crt-mvp-ver.vercel.app/";
    
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

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-8">
        <Header />

        {/* 링크 복사 버튼 및 안내 문구 */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-2 animate-fade-in -mt-4">
          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200 text-sm text-gray-700 hover:text-gray-900 shadow-sm hover:shadow"
          >
            <Link className="w-4 h-4" />
            <span>링크 복사</span>
          </button>
          <p className="text-xs sm:text-sm text-black text-center">
            링크를 저장하거나 마이리얼트립에서 체크리스트를 검색하세요
          </p>
        </div>

        {/* 1. 최상단: 여행 국가 선택 영역 (검색 가능한 드롭다운) */}
        <div className="animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 bg-card rounded-xl border border-border shadow-sm">
            <span className="text-sm font-semibold text-foreground">
              여행지를 선택하고 맞춤 정보를 확인하하세요!
            </span>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full sm:w-[200px] justify-between"
                >
                  {selectedCountry || "국가 선택"}
                  <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent 
                className="w-[200px] p-0 bg-white border border-gray-100 shadow-2xl rounded-lg overflow-hidden z-50" 
                align="end"
                side="bottom"
                sideOffset={4}
                avoidCollisions={false}
                collisionPadding={0}
              >
                <Command className="bg-white">
                  <div 
                    onClick={handleSearchAreaClick}
                    onPointerDown={handleSearchAreaClick}
                    className="cursor-text border-b border-gray-100"
                    role="button"
                    aria-label="국가 검색"
                    tabIndex={0}
                    style={{
                      pointerEvents: 'auto'
                    }}
                  >
                    <CommandInput 
                      ref={commandInputRef}
                      placeholder="국가 검색..." 
                      className="h-11 bg-white border-0"
                      autoFocus={false}
                      tabIndex={isSearchActive ? 0 : -1}
                      onFocus={() => setIsSearchActive(true)}
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!isSearchActive) {
                          setIsSearchActive(true);
                          setTimeout(() => {
                            commandInputRef.current?.focus();
                          }, 0);
                        }
                      }}
                      onPointerDown={(e) => {
                        e.stopPropagation();
                        if (!isSearchActive) {
                          setIsSearchActive(true);
                          setTimeout(() => {
                            commandInputRef.current?.focus();
                          }, 0);
                        }
                      }}
                      style={{
                        pointerEvents: isSearchActive ? 'auto' : 'none'
                      }}
                    />
                  </div>
                  <CommandList className="max-h-80 overflow-y-auto bg-white">
                    <CommandEmpty className="py-6 text-sm text-gray-500">찾으시는 국가가 없습니다</CommandEmpty>
                    <CommandGroup>
                      {sortedCountries.map((country) => {
                        const isSelected = selectedCountry === country;
                        return (
                          <CommandItem
                            key={country}
                            value={country}
                            onSelect={() => {
                              setSelectedCountry(country);
                              setOpen(false);
                            }}
                            className={cn(
                              "cursor-pointer hover:bg-gray-50",
                              isSelected && "bg-accent text-accent-foreground"
                            )}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                isSelected ? "opacity-100" : "opacity-0"
                              )}
                            />
                            {country}
                          </CommandItem>
                        );
                      })}
                    </CommandGroup>
                  </CommandList>
                </Command>
              </PopoverContent>
            </Popover>
          </div>
        </div>

        {/* 2. 선택된 국가의 리얼 트립 섹션 - 국가 선택 시에만 표시 */}
        {selectedCountry && currentTravelTips && (
          <div className="animate-fade-in">
            <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <span className="text-xl">✈️</span>
                <h3 className="text-lg font-semibold text-foreground">
                  {displayCountryName} 리얼 트립
                </h3>
              </div>
              <div className="flex flex-col sm:flex-row gap-4 items-start">
                {/* 텍스트 영역 */}
                <div className="flex-1 space-y-3">
                  {currentTravelTips.map((tip, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-sm text-foreground mb-1 leading-tight">
                          {tip.title}
                        </h4>
                        <p 
                          className="text-sm text-muted-foreground leading-relaxed travel-tip-content"
                          dangerouslySetInnerHTML={{ __html: tip.content }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* 이미지 영역 (일본 또는 동남아시아 국가인 경우 표시) */}
                {selectedCountry === "일본" && (
                  <div className="flex-shrink-0 flex flex-col items-center justify-start w-full sm:w-auto sm:max-w-[128px] mt-4 sm:mt-0">
                    <a
                      href="/image/info/japan_donki.png"
                      download="돈키호테_추천템.png"
                      className="block cursor-pointer transition-all duration-300 hover:opacity-90 hover:scale-105 active:scale-95"
                    >
                      <img
                        src="/image/info/japan_donki.png"
                        alt="돈키호테 추천템"
                        className="w-32 h-auto rounded-lg shadow-sm object-cover"
                      />
                    </a>
                    <p className="text-xs text-gray-500 text-center mt-2">
                      이미지를 눌러 다운받기
                    </p>
                  </div>
                )}
                
                {southeastAsiaCountries.includes(selectedCountry) && (
                  <div className="flex-shrink-0 flex flex-col items-center justify-start w-full sm:w-auto sm:max-w-[128px] mt-4 sm:mt-0">
                    <a
                      href="/image/info/seAsia_water.png"
                      download="동남아시아_물갈이가이드.png"
                      className="block cursor-pointer transition-all duration-300 hover:opacity-90 hover:scale-105 active:scale-95"
                    >
                      <img
                        src="/image/info/seAsia_water.png"
                        alt="동남아시아 물갈이 가이드"
                        className="w-32 h-auto rounded-lg shadow-sm object-cover"
                      />
                    </a>
                    <p className="text-xs text-gray-500 text-center mt-2 whitespace-pre-line">
                      이미지를 눌러 다운받기
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* 3. 중단: 혜택 탭 2분할 - 항상 표시 */}
        <div className="animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            {/* 왼쪽 절반: 항공기 반입 물품 가이드 */}
            <button
              onClick={() => setIsFlightGuideOpen(true)}
              className="block rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 bg-sky-500/100 text-white"
            >
              <p className="text-sm font-semibold">
                항공기 반입 물품 가이드
              </p>
            </button>

            {/* 오른쪽 절반: 국가별 가변 */}
            {selectedCountry === "일본" ? (
              <a
                href="https://www.myrealtrip.com/promotions/Japan_donki_coupon"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                style={{ 
                  backgroundColor: "#FFDB58",
                  border: "1px solid rgba(0, 0, 0, 0.05)"
                }}
              >
                <p className="text-sm font-semibold text-foreground">
                  돈키호테 할인 쿠폰 증정!
                </p>
              </a>
            ) : selectedCountry === "베트남" || selectedCountry === "태국" ? (
              <a
                href="mrt://web?url=https%3A%2F%2Fgrab.onelink.me%2F2695613898%3Fpid%3DDB--MyRealTrip%26c%3DKR_CM0002_CLUSTERALL-CLUSTERALL_PAX_GT_ALL_031225_ACQ-MAIA-APPC_ASR__RG23GTPAT1KRTRAVQ1_DB--MyRealTrip_int_1170x1560_StdBnr_ADTK_ManualPlacement_pop-up-251202%26is_retargeting%3Dtrue%26af_dp%3DNA%26af_force_deeplink%3Dtrue%26af_sub5%3Ddisplay%26af_ad%3DKR_CM0002_CLUSTERALL-CLUSTERALL_PAX_GT_ALL_031225_ACQ-MAIA-APPC_ASR__RG23GTPAT1KRTRAVQ1_DB--MyRealTrip_int_1170x1560_StdBnr_ADTK_ManualPlacement_pop-up-251202%26af_adset%3DKR_CM0002_CLUSTERALL-CLUSTERALL_PAX_GT_ALL_031225_ACQ-MAIA-APPC_ASR__RG23GTPAT1KRTRAVQ1_DB--MyRealTrip_int_1170x1560_StdBnr_ADTK_ManualPlacement_pop-up-251202%26af_siteID%3DDB--MyRealTrip"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                style={{ 
                  backgroundColor: "#D4EDDA",
                  border: "1px solid rgba(0, 0, 0, 0.05)"
                }}
              >
                <p className="text-sm font-semibold text-foreground">
                  Grab 프로모션 확인하기
                </p>
              </a>
            ) : (
              <a
                href="https://www.myrealtrip.com/promotions/benefit"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
                style={{ 
                  backgroundColor: "#E3F2FD",
                  border: "1px solid rgba(0, 0, 0, 0.05)"
                }}
              >
                <p className="text-sm font-semibold text-foreground">
                  마이리얼트립 혜택 보기
                </p>
              </a>
            )}
          </div>
        </div>

        {/* 체크리스트 영역만 Export 대상 */}
        <div ref={checklistRef} id="checklist-root" className="space-y-4 bg-background rounded-xl pb-24">
          {/* 필수 서류 및 신분증 섹션 (essentials) - 먼저 표시 */}
          {essentialsSection && (
            <div className="animate-fade-in">
              <ChecklistSection
                section={essentialsSection}
                checkedItems={checkedItems}
                onToggle={handleToggle}
                selectedDuration={selectedDuration}
                onDurationChange={setSelectedDuration}
              />
            </div>
          )}

          {/* 일반 체크리스트 (essentials 제외) */}
          {otherSections && Array.isArray(otherSections) && otherSections.length > 0 ? (
            otherSections.map((section, index) => {
              if (!section || !section.section_id) return null;
              return (
                <div 
                  key={section.section_id}
                  className="animate-fade-in"
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <ChecklistSection
                    section={section}
                    checkedItems={checkedItems}
                    onToggle={handleToggle}
                    selectedDuration={selectedDuration}
                    onDurationChange={setSelectedDuration}
                    onMedicalCardClick={section.section_id === "health" ? () => setIsMedicalCardOpen(true) : undefined}
                  />
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              체크리스트를 불러오는 중...
            </div>
          )}

          {/* 커스텀 항목 섹션 */}
          {customItems.length > 0 && (
            <div className="animate-fade-in mt-6">
              <div className="card-toss">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="text-xl">✨</span>
                    <h3 className="section-title mb-0">나만의 리스트</h3>
                  </div>
                  <span className="text-xs text-gray-400 font-light">
                    기존의 항목을 입력해야<br />새로운 항목을 추가할 수 있어요!
                  </span>
                </div>
                <div className="space-y-1">
                  {customItems.map((item) => {
                    const isChecked = checkedItems.has(item.id);
                    const checkboxId = `custom-item-check-${item.id}`;
                    const textInputId = `custom-item-text-${item.id}`;
                    return (
                      <div 
                        key={item.id}
                        className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all duration-200 group custom-item-container"
                      >
                        {/* 체크박스 영역: label로 감싸서 클릭 영역 확대 */}
                        <label
                          htmlFor={checkboxId}
                          className={`
                            flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 mt-0.5 cursor-pointer touch-manipulation custom-checkbox-label
                            ${isChecked 
                              ? 'bg-accent border-accent animate-check-bounce shadow-sm' 
                              : 'border-muted-foreground/30'
                            }
                          `}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            // onPointerDown에서만 토글 실행
                            handleToggle(item.id);
                          }}
                          onClick={(e) => {
                            // onClick은 label의 기본 동작만 막기
                            e.preventDefault();
                            e.stopPropagation();
                            // onClick에서는 토글하지 않음 (onPointerDown에서 이미 처리됨)
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onTouchStart={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                        >
                          <input
                            type="checkbox"
                            id={checkboxId}
                            checked={isChecked}
                            onChange={(e) => {
                              // input의 onChange는 완전히 막기
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            onClick={(e) => {
                              // input 클릭도 막기
                              e.preventDefault();
                              e.stopPropagation();
                            }}
                            readOnly
                            className="sr-only"
                            tabIndex={-1}
                          />
                          {isChecked && (
                            <Check className="w-4 h-4 text-accent-foreground pointer-events-none" strokeWidth={3} />
                          )}
                        </label>
                        <input
                          id={textInputId}
                          ref={(el) => (customInputRefs.current[item.id] = el)}
                          type="text"
                          value={item.title}
                          onChange={(e) => updateCustomItem(item.id, e.target.value)}
                          onBlur={(e) => handleCustomItemBlur(item.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              e.currentTarget.blur();
                            }
                          }}
                          maxLength={30}
                          placeholder="항목을 입력하세요"
                          className={`
                            flex-1 bg-transparent border-none outline-none text-sm sm:text-base font-semibold
                            ${isChecked ? 'text-gray-400' : 'text-foreground'}
                            focus:ring-2 focus:ring-accent/50 focus:rounded-md focus:px-2 focus:py-1
                            transition-all duration-300
                            ${isChecked ? 'strikethrough-line' : ''}
                          `}
                          style={{ 
                            opacity: isChecked ? 0.7 : 1,
                            position: isChecked ? 'relative' : 'static',
                            display: isChecked ? 'inline-block' : 'block'
                          }}
                          onClick={(e) => e.stopPropagation()}
                          onPointerDown={(e) => e.stopPropagation()}
                          onMouseDown={(e) => e.stopPropagation()}
                          onTouchStart={(e) => e.stopPropagation()}
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteCustomItem(item.id);
                          }}
                          onPointerDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            deleteCustomItem(item.id);
                          }}
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                          }}
                          className="flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-red-50 hover:bg-red-100 active:bg-red-200 transition-all duration-200 custom-delete-button"
                          aria-label="항목 제거"
                        >
                          <X className="w-3 h-3 text-red-600" strokeWidth={2} />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* 추가하기 버튼 */}
          <div className="animate-fade-in mt-4">
            <button
              onClick={addCustomItem}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border-2 border-dashed border-muted-foreground/30 hover:border-accent/50 hover:bg-accent/5 transition-all duration-200 text-sm font-medium text-muted-foreground hover:text-accent"
            >
              <Plus className="w-4 h-4" />
              <span>추가하기</span>
            </button>
          </div>
        </div>

        {/* 이건 꼭 챙기셔야 해요 섹션 */}
        <div className="mt-6">
          <EssentialItems checkedItems={checkedItems} />
        </div>
      </div>

      {/* 하단 고정 바텀싯: 준비 현황 */}
      <BottomProgressSheet 
        progress={overallProgress}
        completedItems={completedItems}
        totalItems={totalItems}
      />

      {/* 항공기 반입 물품 가이드 모달 */}
      <FlightLuggageGuideModal 
        isOpen={isFlightGuideOpen} 
        onClose={() => setIsFlightGuideOpen(false)} 
      />

      {/* 응급 의료 카드 모달 */}
      <MedicalCardModal
        isOpen={isMedicalCardOpen}
        onClose={() => setIsMedicalCardOpen(false)}
        onSave={(data) => {
          setMedicalCardData(data);
          // 흡연 여부는 별도 상태로 저장 (아이코스 파트너십 활용)
          console.log("Medical Card Data:", data);
          console.log("Is Smoker:", data.isSmoker);
          // TODO: 메디컬 카드 이미지 템플릿에 데이터 매핑
        }}
      />
    </div>
  );
};

export default Index;
