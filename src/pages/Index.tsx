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
import { parseTextWithLinks } from "@/lib/linkUtils";
import { toast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import confetti from "canvas-confetti";
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

// 국가 선택 드롭다운에 표시할 국가 목록 (링크 연동이 완료된 국가만)
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
  // 여행팁 아코디언 펼침 상태
  const [isTravelTipsExpanded, setIsTravelTipsExpanded] = useState(false);
  // 여행 기간 선택 상태
  const [selectedDuration, setSelectedDuration] = useState<DurationType | null>(null);
  // 항공기 반입 물품 가이드 모달 상태
  const [isFlightGuideOpen, setIsFlightGuideOpen] = useState(false);
  // 응급 의료 카드 모달 상태
  const [isMedicalCardOpen, setIsMedicalCardOpen] = useState(false);
  // 응급 의료 카드 데이터 (흡연 여부는 별도 저장)
  const [medicalCardData, setMedicalCardData] = useState<MedicalCardData | null>(null);
  // 완료 항목 숨김 토글 상태
  const [hideCompletedItems, setHideCompletedItems] = useState(false);
  // 축하 팝업 상태
  const [showCelebrationModal, setShowCelebrationModal] = useState(false);
  const [isClosingCelebrationModal, setIsClosingCelebrationModal] = useState(false);
  // 이전 progress 추적 (100% 달성 감지용)
  const prevProgressRef = useRef<number>(0);
  // 초기 로딩 완료 여부 (초기 로딩 중 일시적 100% 상태 무시)
  const isInitializedRef = useRef<boolean>(false);

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
        description: "\"관광입니다(칸코데스)\" \"쇼핑입니다(카이모노데스)\" \"호텔(호테루)\" \"여권(파스포토)\"",
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
        cta_type: "link",
        cta_label: "빨래용 소형 파우치",
        link_url: "https://link.coupang.com/a/dAKu76"
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
      },
      {
        item_id: "vietnam_tip_sunscreen_repellent",
        title: "선크림과 기피제",
        description: "선크림을 먼저 바르고 30분 뒤에 기피제를 발라야 차단 효과가 유지됩니다.",
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
        item_id: "thailand_passport",
        title: "여권 준비",
        description: "유효기간이 6개월 이상 남은 여권을 요구해요!",
        cta_type: "none",
        cta_label: ""
      },
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
        cta_type: "link",
        cta_label: "빨래용 소형 파우치",
        link_url: "https://link.coupang.com/a/dAKu76"
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
      },
      {
        item_id: "thailand_tip_sunscreen_repellent",
        title: "선크림과 기피제",
        description: "선크림을 먼저 바르고 30분 정도 흡수시킨 뒤 기피제를 발라야 효과가 유지됩니다.",
        cta_type: "none",
        cta_label: ""
      }
    ]
  };

  // 필리핀 전용 추가 데이터 정의
  const philippinesSpecificItems: Record<string, typeof checklistData.sections[0]['items']> = {
    essentials: [
      {
        item_id: "philippines_passport_note",
        title: "여권 준비",
        description: "여권 유효기간이 최소 6개월 이상 남아있는지 꼭 확인하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "philippines_visa_note",
        title: "비자 / 입국 허가 확인",
        description: "대한민국 여권 소지자는 관광 목적으로 비자 없이 최대 30일간 체류할 수 있어요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "philippines_etravel",
        title: "eTravel 작성",
        description: "필리핀 온라인 입국 수속 서비스입니다. 무료로 등록하고 QR코드를 미리 저장하여 빠르게 입국하세요!",
        cta_type: "link",
        cta_label: "eTravel",
        link_url: "https://etravel.gov.ph/kr"
      },
      {
        item_id: "philippines_immigration",
        title: "입국 심사 준비",
        description: "왕복 항공권을 요구하는 경우가 많으므로 항공권을 사전에 인쇄하거나 캡처해두세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "philippines_family_certificate",
        title: "영문 가족관계 증명서",
        description: "부모와 아이의 성이 달라 자녀 관계 증명이 필요할 수 있으니 준비하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "philippines_passport_cover",
        title: "여권 보호용 커버 & 방수팩",
        description: "필리핀은 비가 잦은 지역이므로 소중한 여권이 젖지 않도록 주의하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "philippines_terminal_fee",
        title: "공항세(Terminal Fee)",
        description: "일부 공항은 현장에서 현금으로 공항세를 받는 경우가 있으니 미리 확인하고 현금을 준비하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    finance: [
      {
        item_id: "philippines_usd_to_peso",
        title: "달러에서 페소",
        description: "원화를 바로 페소로 바꾸는 것보다 달러로 먼저 환전한 뒤 현지에서 페소로 환전하는 것이 유리한 경우가 많아요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "philippines_official_exchange",
        title: "공식 환전소 이용",
        description: "길거리 환전소는 위조지폐 위험이 있으니 반드시 공식 환전소나 쇼핑몰 내 환전소를 이용하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "philippines_small_denomination",
        title: "소액권 환전",
        description: "가게나 택시에서 거스름돈이 부족할 수 있으니 소액권을 섞어서 환전하는 것이 좋습니다.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    electronics: [
      {
        item_id: "philippines_adapter_note",
        title: "멀티 어댑터 준비",
        description: "전압은 220V로 같지만 콘센트 모양이 '11자'인 곳이 있으니 멀티 어댑터를 챙기세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "philippines_multitap",
        title: "멀티탭 준비",
        description: "콘센트가 부족할 수 있고, 정전 후 복구 시 전자기기 보호를 위해 멀티탭 사용을 권장해요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "philippines_offline_map",
        title: "지도 오프라인 다운로드",
        description: "인터넷이 느리거나 끊기는 상황에 대비해 미리 지도를 다운로하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    health: [
      {
        item_id: "philippines_shower_filter",
        title: "휴대용 샤워기 필터",
        description: "수돗물의 석회질이나 노후 배관 불순물이 걱정된다면 필터 사용을 추천해요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "philippines_bandage",
        title: "방수 밴드와 연고",
        description: "슬리퍼를 신고 걷다 생기는 발 상처에 대비하여 방수 기능이 있는 밴드를 준비하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "philippines_mosquito_repellent",
        title: "모기 기피제",
        description: "동남아 모기는 매우 독해요! 현지에서 강력한 기피제나 완화제를 꼭 구비하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    packing: [
      {
        item_id: "philippines_mall_temperature",
        title: "대형 쇼핑몰 실내 온도",
        description: "실외는 덥지만 쇼핑몰 내부는 에어컨 때문에 매우 춥습니다. 가벼운 겉옷을 준비하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "philippines_functional_clothing",
        title: "기능성 의류",
        description: "습도가 높아 옷이 잘 마르지 않으므로 건조가 빠른 기능성 의류를 챙기면 유용해요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    travel_tips: [
      {
        item_id: "philippines_filipino_time",
        title: "필리피노 타임",
        description: "느긋하고 천천히 삶의 여유를 즐기는 현지 문화를 존중하며 여유로운 마음을 가지세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "philippines_tip_culture",
        title: "팁 문화",
        description: "벨보이나 마사지사에게 고마움의 표시로 50~100페소 정도의 팁을 건네는 것이 관례입니다.",
        cta_type: "none",
        cta_label: ""
      }
    ]
  };

  // 중국 전용 추가 데이터 정의
  const chinaSpecificItems: Record<string, typeof checklistData.sections[0]['items']> = {
    essentials: [
      {
        item_id: "china_passport_note",
        title: "여권 준비",
        description: "여권 유효기간이 최소 6개월 이상 남아있는지 반드시 확인하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "china_visa_note",
        title: "비자 / 입국 허가 확인",
        description: "관광이나 비즈니스 목적으로 30일 이내 무비자 체류가 가능해요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "china_arrival_card",
        title: "Arrival Card 작성",
        description: "중국의 전자 입국 신고서입니다. QR코드를 생성하여 저장하거나 출력해 입국 심사 시 제시하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "china_immigration",
        title: "입국 심사 준비",
        description: "왕복 항공권을 요구하는 경우가 많으니 사전에 증빙 서류를 인쇄해 두세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    finance: [
      {
        item_id: "china_payment_apps",
        title: "출국 전 카드 연동",
        description: "현지 필수 결제 수단인 알리페이(Alipay)와 위챗페이(WeChat Pay)에 카드를 미리 연동하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    electronics: [
      {
        item_id: "china_powerbank_note",
        title: "보조배터리 준비",
        description: "대부분의 결제가 QR로 이루어지므로 핸드폰 배터리 방전에 각별히 주의해야 합니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "china_vpn_roaming",
        title: "통신 서비스 차단 대비",
        description: "구글, 인스타그램 등 해외 서비스 이용을 위해 로밍이나 VPN 등 대체 수단을 미리 준비하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "china_gaode_map",
        title: "고덕지도 다운로드",
        description: "현지 정보가 가장 정확한 고덕지도(가오더 지도)를 미리 설치해 두세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "china_translation_app",
        title: "번역 앱 설치",
        description: "파파고나 바이두 번역 앱을 설치하면 현지 소통에 큰 도움이 됩니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "china_didi",
        title: "디디추싱 설치",
        description: "길거리 택시 잡기가 매우 어렵습니다. 택시 호출 앱인 디디추싱(DiDi)을 미리 설치하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "china_transformer",
        title: "변압기 준비",
        description: "한국과 전압은 같지만 주파수가 달라 고전력 제품(고데기 등)은 과열될 수 있으니 주의하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    health: [
      {
        item_id: "china_digestive_medicine",
        title: "지사제와 소화제",
        description: "기름진 음식과 강한 향신료로 인해 위장이 탈나기 쉬우니 비상약을 꼭 챙기세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "china_tissue",
        title: "휴대용 티슈와 물티슈",
        description: "로컬 식당이나 공공 화장실에 휴지가 없는 경우가 많으므로 항상 소지하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    packing: [
      {
        item_id: "china_mall_temperature",
        title: "대형 쇼핑몰 실내 온도",
        description: "실내 에어컨 가동으로 온도가 낮을 수 있으니 가벼운 겉옷을 준비하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "china_functional_clothing",
        title: "기능성 의류",
        description: "습한 날씨에는 옷이 잘 마르지 않으므로 건조가 빠른 기능성 의류가 유용합니다.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    travel_tips: [
      {
        item_id: "china_payment_test",
        title: "결제 앱 실전 테스트",
        description: "한국에서 미리 등록을 마치고 결제가 정상적으로 작동하는지 확인하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "china_battery_3c",
        title: "보조배터리 3C 인증",
        description: "중국 국내선 탑승 시 3C 인증이나 용량 표기가 없는 배터리는 반입이 불가할 수 있습니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "china_chinese_address",
        title: "주소는 '중국어 원문'으로 저장",
        description: "영어 주소는 기사님이 이해하기 어려우니 반드시 목적지의 중국어 주소를 저장해 두세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "china_high_speed_rail",
        title: "대륙의 고속철",
        description: "기차역 보안 검색이 공항 수준으로 철저하므로 시간적 여유를 두고 출발하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "china_museum_booking",
        title: "박물관/명소 사전 예약",
        description: "유명 관광지는 사전 예약 없이는 입장이 불가한 경우가 많으니 확인하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "china_hot_water",
        title: "뜨거운 물 문화",
        description: "식당에서는 주로 뜨거운 물이 제공됩니다. 찬물을 원하시면 '빙수이(冰水)'를 요청하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ]
  };

  // 대만 전용 추가 데이터 정의
  const taiwanSpecificItems: Record<string, typeof checklistData.sections[0]['items']> = {
    essentials: [
      {
        item_id: "taiwan_passport_note",
        title: "여권 준비",
        description: "여권 유효기간이 최소 6개월 이상 남아있는지 반드시 확인하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "taiwan_visa_note",
        title: "비자 / 입국 허가 확인",
        description: "대한민국 여권 소지자는 관광 목적으로 최대 90일까지 무비자 체류가 가능해요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "taiwan_twac",
        title: "온라인 입국신고서 작성",
        description: "TWAC(Taiwan Arrival Card)는 필수입니다. 입국 심사 전까지 온라인 등록을 완료하세요!",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "taiwan_egate",
        title: "e-Gate 이용",
        description: "한국-대만 자동출입국 심사대 프로그램을 통해 대면 심사 없이 빠르게 입국하세요. (만 17세 이상 가능)",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "taiwan_passport_copy",
        title: "여권 사본 준비",
        description: "야시장 신분 확인이나 택스 리펀 시 유용하니 사본을 저장하거나 인쇄해 두세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "taiwan_hotel_chinese",
        title: "호텔 중국어 표기 저장",
        description: "확실한 소통을 위해 호텔 이름과 주소를 영어뿐만 아니라 중국어로도 준비하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "taiwan_immigration",
        title: "입국 심사 준비",
        description: "왕복 항공권 제시를 요구받을 수 있으니 항공권을 미리 인쇄하거나 캡처하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    finance: [
      {
        item_id: "taiwan_easycard",
        title: "이지카드(EasyCard) 발급",
        description: "교통뿐만 아니라 병원, 카페, 식당에서도 쓰이는 만능 직불카드입니다. 역이나 편의점에서 구입하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "taiwan_easycard_app",
        title: "이지카드 잔액 확인 앱",
        description: "이지카드를 다양하게 사용하는 만큼 실시간 잔액 확인 앱을 설치해 관리하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "taiwan_small_denomination",
        title: "소액 위주 환전",
        description: "야시장, 로컬 택시, 작은 카페 등에서는 큰 지폐 사용이 어려울 수 있으니 소액권을 준비하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    electronics: [
      {
        item_id: "taiwan_powerbank_note",
        title: "보조배터리 준비",
        description: "길 찾기와 이지카드 잔액 확인 등 핸드폰 사용이 많으니 보조배터리는 필수입니다.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    health: [
      {
        item_id: "taiwan_mosquito_repellent",
        title: "소흑문(샤오하이) 퇴치제",
        description: "대만의 작은 모기 '소흑문'은 매우 독해요. 현지에서 전용 퇴치제(Sheng Wen)를 구입해 사용하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "taiwan_tissue",
        title: "휴대용 티슈와 물티슈",
        description: "야시장 음식 섭취 전후나 화장실 이용 시 유용하니 항상 소지하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    packing: [
      {
        item_id: "taiwan_mall_temperature",
        title: "대형 쇼핑몰 실내 온도",
        description: "실외는 덥지만 실내는 에어컨으로 인해 춥습니다. 가벼운 겉옷을 꼭 챙기세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "taiwan_umbrella",
        title: "튼튼한 우양산",
        description: "변덕스러운 소나기와 강한 자외선을 동시에 막아줄 우양산은 가방에 항상 넣어두세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    travel_tips: [
      {
        item_id: "taiwan_minor_immigration",
        title: "만 17세 이하 입국 심사",
        description: "만 17세 이하 여행자는 e-Gate 이용이 불가하므로 대면 입국 심사대를 이용해야 합니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "taiwan_lucky_draw",
        title: "럭키 드로우 종료 안내",
        description: "대만 여행지원금 이벤트는 2025년 9월 30일부로 종료되었으니 참고하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "taiwan_night_market",
        title: "대만 야시장 방문",
        description: "야시장이 가장 활기찬 시간은 저녁 7시부터 10시 사이입니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "taiwan_receipt_lottery",
        title: "대만 영수증 복권 확인",
        description: "영수증 하단 번호는 국가 발행 복권입니다. 외국인도 당첨금 수령이 가능하니 버리지 마세요!",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "taiwan_mrt_no_eating",
        title: "지하철(MRT) 내 취식 엄금",
        description: "개찰구 안쪽부터는 물, 껌을 포함한 모든 취식이 금지되며 위반 시 벌금이 부과되니 주의하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ]
  };

  // 미국 전용 추가 데이터 정의
  const usaSpecificItems: Record<string, typeof checklistData.sections[0]['items']> = {
    essentials: [
      {
        item_id: "usa_passport_note",
        title: "여권 준비",
        description: "여권 유효기간이 최소 6개월 이상 남아있는지 반드시 확인하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "usa_esta",
        title: "ESTA 준비",
        description: "미국의 전자 여행 허가 프로그램입니다. 승인 시 최대 90일 체류가 가능하며 출국 전 미리 신청하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "usa_accommodation_address",
        title: "영문 숙소 주소 및 연락처",
        description: "입국 심사 시 가장 꼼꼼하게 묻는 항목입니다. 인쇄하거나 메모지에 따로 적어두세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "usa_driving_license",
        title: "국제운전면허증과 한국 면허증",
        description: "렌터카 이용 시 국제운전면허증뿐만 아니라 한국 면허증도 함께 요구하므로 둘다 지참하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "usa_immigration",
        title: "입국 심사 준비",
        description: "관광 목적임을 분명히 하고 체류 후 반드시 한국으로 돌아갈 계획임을 명확히 설명하는 것이 중요해요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    finance: [
      {
        item_id: "usa_card_name_match",
        title: "본인 명의 카드 이용",
        description: "카드에 적힌 영문 이름과 여권 상의 이름이 일치하는지 확인하는 경우가 많으니 체크하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "usa_zip_code",
        title: "ZIP Code(우편번호) 숙지",
        description: "무인 결제기에서 우편번호를 요구할 때가 있어요. 숙소 우편번호를 입력하면 성공률이 높아요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "usa_small_cash",
        title: "소액 현금 준비",
        description: "현금만 받는 가게나 팁 지불 상황을 대비해 1달러, 5달러 등 소액 지폐를 넉넉히 준비하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    electronics: [
      {
        item_id: "usa_powerbank_note",
        title: "보조배터리 준비",
        description: "장거리 이동과 지도 사용이 잦은 미국 여행에서 보조배터리는 필수 생존 아이템이에요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "usa_uber_lyft",
        title: "Uber와 Lyft 비교",
        description: "우버와 리프트는 미국의 대표 택시 앱이에요. 같은 거리라도 요금이 다르니 두 앱을 비교한 뒤 호출하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "usa_yelp",
        title: "Yelp 앱 설치",
        description: "현지인들의 검증된 맛집 정보를 볼 수 있습니다. 별점 4.0 이상인 곳을 공략하면 실패 확률이 거의 없어요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "usa_adapter_note",
        title: "멀티 어댑터 준비",
        description: "미국은 110V 전압을 사용하므로 '돼지코' 모양의 멀티 어댑터가 필요합니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "usa_high_power",
        title: "고전력 제품 주의",
        description: "고데기나 드라이기 같은 전자제품은 과열될 수 있으니 반드시 프리볼트 여부를 확인하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    health: [
      {
        item_id: "usa_prescription_medicine",
        title: "처방약 소분 금지",
        description: "불필요한 오해를 피하기 위해 처방약은 소분하지 말고 처방전이 포함된 원래 용기 그대로 지참하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    packing: [
      {
        item_id: "usa_sunglasses_sunscreen",
        title: "선글라스와 선크림",
        description: "미국의 자외선은 한국보다 훨씬 강력해요. 눈과 피부 보호를 위한 필수 생존템으로 챙기세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    travel_tips: [
      {
        item_id: "usa_tip_included",
        title: "영수증 팁 포함 여부 확인",
        description: "'Gratuity'나 'Service Charge'가 이미 포함되어 있는지 확인하여 팁을 중복 지출하지 않도록 주의하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "usa_sales_tax",
        title: "부가세 별도 결제",
        description: "가격표 금액이 끝이 아닙니다! 주마다 다른 판매세가 결제 시 붙으니 예산에 10% 정도 여유를 두세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "usa_public_drinking",
        title: "공공장소 음주 금지",
        description: "길거리나 공원 등 야외에서 술을 마시는 것은 불법입니다. 술은 식당 내부나 숙소에서만 즐기세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "usa_tip_culture",
        title: "팁 문화 숙지",
        description: "식당 서비스 이용 시 보통 결제 금액의 18% 내외를 팁으로 주는 것이 일반적이에요!",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "usa_no_tip",
        title: "No-Tip 상황",
        description: "패스트푸드점이나 셀프 서비스 등 직접적인 서빙을 받지 않는 곳에서는 팁을 주지 않아도 괜찮아요.",
        cta_type: "none",
        cta_label: ""
      }
    ]
  };

  // 홍콩 전용 추가 데이터 정의
  const hongkongSpecificItems: Record<string, typeof checklistData.sections[0]['items']> = {
    essentials: [
      {
        item_id: "hongkong_passport_note",
        title: "여권 준비",
        description: "홍콩 입국 시 여권 유효기간이 최소 30일 이상 남아있어야 해요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "hongkong_visa_note",
        title: "비자 / 입국 허가 확인",
        description: "대한민국 여권 소지자는 관광 목적으로 최대 90일간 무비자 체류가 가능해요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "hongkong_landing_slip",
        title: "입국 슬립(랜딩 슬립) 보관",
        description: "여권 사이에 끼워주는 작은 종이 슬립은 여행 중 신분 확인용으로 쓰일 수 있으니 잘 보관하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "hongkong_macau_passport",
        title: "마카오 여권 유효기간 확인",
        description: "마카오 방문 계획이 있다면 유효기간이 90일 이상 남았는지 꼭 확인하세요. 홍콩보다 엄격합니다!",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "hongkong_student_id",
        title: "국제학생증 발급",
        description: "대학생이라면 학생 할인이 적용되는 미술관, 박물관이 많으니 사전에 발급받으세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    finance: [
      {
        item_id: "hongkong_octopus_card",
        title: "옥토퍼스 카드 발급",
        description: "홍콩의 만능 교통카드입니다. 대중교통은 물론 편의점, 식당에서도 널리 쓰이니 필수입니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "hongkong_cash",
        title: "소액 현금 준비",
        description: "로컬 노포 식당이나 재래시장에서는 카드 결제가 안 되는 곳이 많으니 현금을 챙기세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    electronics: [
      {
        item_id: "hongkong_powerbank_note",
        title: "보조배터리 준비",
        description: "빽빽한 고층 빌딩 숲에서 길을 찾고 사진을 찍다 보면 배터리가 매우 빨리 소모됩니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "hongkong_citymapper",
        title: "Citymapper 설치",
        description: "홍콩 대중교통 경로를 정확하게 안내해주는 필수 지도 어플입니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "hongkong_uber",
        title: "Uber 설치",
        description: "택시 호출이 편리하고 투명한 결제가 가능하므로 이동 시 유용하게 사용하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    health: [
      {
        item_id: "hongkong_bandage",
        title: "방수 밴드와 연고",
        description: "많이 걷게 되는 홍콩 여행 특성상 발 상처에 대비하는 것이 좋습니다.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    packing: [
      {
        item_id: "hongkong_small_bag",
        title: "작은 백팩 또는 크로스백",
        description: "인파가 많은 야시장이나 대중교통 이용 시 몸에 밀착되는 작은 가방이 활동하기 편해요.",
        cta_type: "none",
        cta_label: ""
      },
      
    ],
    travel_tips: [
      {
        item_id: "hongkong_cigarette_limit",
        title: "담배 소지 주의",
        description: "홍콩 입국 시 면세 담배는 딱 '19개비'까지만 허용됩니다. 1갑(20개비)만 가져가도 벌금이 부과되니 주의하세요!",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "hongkong_seatbelt",
        title: "대중교통 안전벨트",
        description: "미니버스 등 대중교통 이용 시 안전벨트 착용은 의무이며 미착용 시 벌금이 부과될 수 있어요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "hongkong_tea_water",
        title: "식사 전 식기 세척",
        description: "식당에서 주는 뜨거운 찻물은 마시는 용도가 아니라 수저와 앞접시를 헹구는 용도이니 자연스럽게 헹구세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "hongkong_sharing_table",
        title: "합석 문화",
        description: "좁은 식당에서는 합석이 일상이니 당황하지 말고 현지의 식사 문화를 즐겨보세요.",
        cta_type: "none",
        cta_label: ""
      }
    ]
  };

  // 인도네시아 전용 추가 데이터 정의
  const indonesiaSpecificItems: Record<string, typeof checklistData.sections[0]['items']> = {
    essentials: [
      {
        item_id: "indonesia_passport_note",
        title: "여권 준비",
        description: "인도네시아 입국을 위해 여권 유효기간이 최소 6개월 이상 남아있어야 해요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "indonesia_visa_note",
        title: "비자 / 입국 허가 확인",
        description: "관광 목적 방문 시 eVOA(전자도착비자) 발급이 필수입니다. 온라인으로 미리 신청하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "indonesia_evoa_documents",
        title: "eVOA 준비물",
        description: "여권 사본, 비자용 사진, 영문 왕복 항공권, 숙소 정보가 필요하니 파일로 저장해두세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "indonesia_departure_ticket",
        title: "출국 항공권 저장",
        description: "체류 의도를 확인하기 위해 입국 심사 시 요구하는 경우가 많으니 미리 준비하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "indonesia_all_indonesia",
        title: "올 인도네시아(All Indonesia) 작성",
        description: "출입국, 세관, 검역이 통합된 새로운 온라인 신고서입니다. 입국 3일 전부터 작성 가능해요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "indonesia_bali_tax",
        title: "발리 관광세 납부",
        description: "발리 방문 시 1인당 150,000루피아의 환경 부담금을 납부하고 QR코드나 영수증을 지참하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "indonesia_driving_license",
        title: "국제운전면허증 지참",
        description: "스쿠터 대여 시 요구되지만, 인도네시아는 공식적으로 국제면허증을 인정하지 않아 단속 대상이 될 수 있으니 주의하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "indonesia_travel_insurance",
        title: "여행자 보험 가입",
        description: "외국인 대상 현지 병원비가 매우 비싸므로 만약의 상황을 대비해 보험 가입을 권장합니다.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    finance: [
      {
        item_id: "indonesia_idr_exchange",
        title: "루피아(IDR) 환전",
        description: "원화 직환전보다 달러(USD)로 환전 후 현지에서 루피아로 바꾸는 것이 환율 면에서 유리할 수 있어요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "indonesia_cash",
        title: "소액 현금 준비",
        description: "로컬 노포나 시장, 일부 주차비 등은 현금만 받는 경우가 많으니 소액권을 챙기세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "indonesia_gopay",
        title: "GoPay 등록",
        description: "인도네시아의 대표 전자결제 수단입니다. 현지 전화번호가 있어야 가입 가능하니 참고하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "indonesia_offline_map",
        title: "지도 오프라인 다운로드",
        description: "인터넷 속도가 느리거나 끊길 수 있으니 구글 맵 등의 오프라인 지도를 미리 받아두세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    electronics: [
      {
        item_id: "indonesia_adapter_note",
        title: "멀티 어댑터 준비",
        description: "220V로 한국과 동일하지만 주파수 차이로 고전력 제품(드라이기 등) 사용 시 주의가 필요해요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "indonesia_imei",
        title: "핸드폰 IMEI 등록",
        description: "90일 이상 장기 체류 시 기기 등록(IMEI)을 하지 않으면 현지 유심 사용이 차단됩니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "indonesia_grab_gojek",
        title: "Grab / Gojek 설치",
        description: "인도네시아 필수 택시/배달 앱입니다. 결제 수단까지 한국에서 미리 등록해두면 편리해요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "indonesia_whatsapp",
        title: "WhatsApp 설치",
        description: "현지 업체나 식당 예약 시 가장 널리 쓰이는 메신저이므로 필수 설치를 권장합니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "indonesia_powerbank_note",
        title: "보조배터리 준비",
        description: "장거리 이동과 잦은 지도 확인으로 배터리 소모가 빠르니 반드시 챙기세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    health: [
      {
        item_id: "indonesia_mosquito_repellent",
        title: "모기 기피제",
        description: "한국보다 강력한 현지 기피제나 완화제를 구비하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "indonesia_tissue",
        title: "휴대용 티슈와 물티슈",
        description: "공공 화장실에 화장지가 없는 경우가 빈번하므로 항상 휴대하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "indonesia_bali_belly",
        title: "발리 밸리(Bali Belly) 주의",
        description: "수돗물이나 오염된 음식으로 인한 배탈에 대비해 지사제와 소화제를 꼭 준비하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    packing: [
      {
        item_id: "indonesia_small_bag",
        title: "작은 백팩 또는 크로스백",
        description: "활동량이 많은 투어나 혼잡한 장소 이동 시 소지품 관리가 편한 가방을 준비하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "indonesia_rain_preparation",
        title: "우기 대비 용품",
        description: "갑작스러운 폭우에 대비해 가벼운 우산이나 우비를 상비하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "indonesia_waterproof_pack",
        title: "방수팩 준비",
        description: "해양 액티비티나 비 오는 날 소지품 보호를 위해 유용하게 쓰입니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "indonesia_long_sleeve",
        title: "얇은 긴팔 의류",
        description: "강한 자외선 차단과 모기 방지를 위해 통기성 좋은 긴팔 옷을 챙기세요.",
        cta_type: "none",
        cta_label: ""
      },
 
    ],
    travel_tips: [
      {
        item_id: "indonesia_police_check",
        title: "경찰 검문 대비",
        description: "오토바이 운전 시 헬멧 착용은 필수이며 검문 시 당황하지 말고 국제면허증을 제시하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "indonesia_tip_culture",
        title: "팁 문화",
        description: "필수는 아니지만 만족스러운 서비스를 받았다면 소액의 팁을 건네보세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "indonesia_water_caution",
        title: "물갈이 및 양치질 주의",
        description: "수돗물로 양치하거나 노점 얼음을 먹는 것은 위험할 수 있으니 가급적 생수를 사용하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "indonesia_swimming_hygiene",
        title: "수영 후 구강 위생",
        description: "수영장이나 바다 수영 후 깨끗한 물로 입안을 헹구면 배탈(발리 밸리) 예방에 도움이 됩니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "indonesia_sunscreen_repellent",
        title: "선크림과 기피제 순서",
        description: "선크림을 먼저 바르고 30분 후 기피제를 발라야 두 제품의 효과를 모두 지킬 수 있어요.",
        cta_type: "none",
        cta_label: ""
      }
    ]
  };

  // 프랑스 전용 추가 데이터 정의
  const franceSpecificItems: Record<string, typeof checklistData.sections[0]['items']> = {
    essentials: [
      {
        item_id: "france_passport_note",
        title: "여권 준비",
        description: "프랑스 입국 시 여권 유효기간이 최소 3개월 이상 남아있어야 해요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "france_passport_copy",
        title: "여권 사본 및 증명사진",
        description: "소매치기로 인한 분실 사고를 대비해 여권 사본과 증명사진을 별도로 준비하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "france_visa_note",
        title: "비자 / 입국 허가 확인",
        description: "최대 90일 무비자 체류가 가능하며 2026년 4분기부터는 온라인 입국 허가(ETIAS)가 필수입니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "france_student_id",
        title: "국제학생증 발급",
        description: "미술관이나 박물관에서 학생 할인이 가능하므로 대학생이라면 반드시 지참하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "france_extra_photos",
        title: "추가적인 증명사진",
        description: "교통카드(나비고) 발급 등에 사진이 필요할 수 있습니다. (여권 3.5x4.5 / 나비고 2.5x3)",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "france_booking_offline",
        title: "관광지 예약 내역 저장",
        description: "현지 데이터 연결이 불안정할 수 있으니 티켓이나 예약증은 오프라인 파일로 저장해두세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    finance: [
      {
        item_id: "france_small_cash",
        title: "소액 현금 준비",
        description: "0.5~1유로의 유료 화장실이나 일부 노포 식당 이용을 위해 소액 유로 화폐를 지참하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "france_card_pin",
        title: "카드 PIN번호 확인",
        description: "결제 시 IC카드 비밀번호를 요구합니다. 보통 4자리지만 6자리를 요구할 경우 '비밀번호 4자리 + 00'을 입력해 보세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "france_card_app",
        title: "카드사 공식 앱 설치",
        description: "분실 즉시 카드를 정지하거나 해외 결제를 차단할 수 있도록 앱 설치와 로그인을 미리 마치세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "france_virtual_card",
        title: "안심 카드번호 서비스",
        description: "부적절한 결제 방지를 위해 카드사에서 제공하는 가상 카드번호 서비스를 신청해 이용하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "france_split_storage",
        title: "나눠서 보관",
        description: "카드와 현금을 한곳에 모으지 말고 가방, 지갑, 캐리어 등에 나누어 보관해 리스크를 줄이세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    electronics: [
      {
        item_id: "france_adapter_note",
        title: "멀티 어댑터 준비",
        description: "220V로 한국과 동일하지만 주파수 차이로 고전력 제품(고데기 등)은 과열될 수 있으니 주의하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "france_bonjour_ratp",
        title: "Bonjour RATP 설치",
        description: "파리 대중교통 공식 앱입니다. 파업이나 지연 상황을 가장 빠르게 반영하므로 필수 설치하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "france_uber_bolt",
        title: "Uber와 Bolt 비교",
        description: "글로벌 택시 앱인 우버와 볼트를 모두 설치하여 가격과 도착 시간을 비교해 호출하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "france_velib",
        title: "Velib(벨리브) 설치",
        description: "파리 시내 곳곳을 이동하기 좋은 공공자전거 대여 서비스입니다. 앱으로 쉽게 이용하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "france_blablacar",
        title: "BlaBlaCar(블라블라카) 설치",
        description: "유럽 내 장거리 도시 이동 시 유용한 카풀 서비스입니다. 비용을 절감하고 싶을 때 고려하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "france_the_fork",
        title: "The Fork(더 포크) 설치",
        description: "프랑스 맛집 예약 앱입니다. 리뷰 확인과 예약은 물론 할인 혜택도 받을 수 있어요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    health: [
      {
        item_id: "france_shower_filter",
        title: "휴대용 샤워기 필터",
        description: "프랑스는 석회수 성분이 강해 피부 트러블이나 머릿결 손상이 발생할 수 있으니 필터를 꼭 챙기세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "france_bedbug_spray",
        title: "베드버그 스프레이",
        description: "숙소 도착 즉시 매트리스와 가구에 스프레이를 뿌려 베드버그 피해를 예방하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "france_tissue",
        title: "휴대용 티슈와 물티슈",
        description: "공공 화장실에 화장지가 없는 경우가 빈번하므로 항상 주머니에 상비하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    packing: [
      {
        item_id: "france_earplugs",
        title: "수면용 귀마개 준비",
        description: "프랑스 구시가지 숙소는 방음이 약하고 실외 소음이 심할 수 있으니 숙면을 위해 준비하세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    travel_tips: [
      {
        item_id: "france_online_booking",
        title: "온라인 사전 예약 권장",
        description: "루브르 등 주요 명소는 현장 발권이 불가능한 경우가 많으므로 반드시 온라인 예약을 완료하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "france_tap_water",
        title: "무료 식수(Tap Water)",
        description: "식당에서 'Carafe d'eau(까라프 도)'를 요청하면 무료로 수돗물을 제공받을 수 있어요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "france_navigo_toilet",
        title: "기차역 화장실 팁",
        description: "유효한 나비고(Navigo) 카드가 있다면 주요 기차역 내 유료 화장실을 무료로 이용 가능합니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "france_bonjour",
        title: "인사 문화(Bonjour)",
        description: "상점이나 식당 입장 시 무조건 \"Bonjour(봉쥬르)\" 먼저 인사하세요. 인사는 서비스의 질이 결정되는 중요한 예절이에요.",
        cta_type: "none",
        cta_label: ""
      }
    ]
  };

  // 싱가포르 전용 추가 데이터 정의
  const singaporeSpecificItems: Record<string, typeof checklistData.sections[0]['items']> = {
    essentials: [
      {
        item_id: "singapore_passport_note",
        title: "여권 준비",
        description: "싱가포르 입국을 위해 여권 유효기간이 최소 6개월 이상 남아있어야 해요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "singapore_visa_note",
        title: "비자 / 입국 허가 확인",
        description: "대한민국 국민은 비자 없이 최대 90일간 체류할 수 있으며 전자 입국카드는 필수 제출 사항입니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "singapore_arrival_card",
        title: "SG Arrival Card 작성",
        description: "싱가포르의 전자 입국카드입니다. 입국 3일 전부터 온라인으로 작성할 수 있어요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "singapore_return_ticket",
        title: "귀국 항공권 저장",
        description: "입국 심사 시 귀국 항공권 제시를 요구할 수 있으니 미리 파일로 저장해두세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    finance: [
      {
        item_id: "singapore_contactless_card",
        title: "컨택리스 카드 지참",
        description: "매장 결제와 대중교통 이용 시 컨택리스 결제가 보편적입니다. 카드에 와이파이 모양 아이콘이 있는지 확인하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "singapore_small_cash",
        title: "현금은 소액만 준비",
        description: "카드 결제가 매우 잘 정착된 나라입니다. 일부 재래시장이나 식당을 대비해 약간의 현금만 챙기셔도 충분해요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "singapore_taxi_app_payment",
        title: "택시 앱 결제 수단 등록",
        description: "공항 도착 후 당황하지 않도록 한국에서 미리 택시 앱에 결제 카드를 등록해두세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    electronics: [
      {
        item_id: "singapore_adapter_note",
        title: "멀티 어댑터 준비",
        description: "싱가포르는 콘센트 모양이 우리나라와 다르므로 반드시 멀티 어댑터를 준비하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "singapore_powerbank_note",
        title: "보조배터리 준비",
        description: "사진 촬영, 지도 확인, 택시 호출 등으로 배터리 소모가 빠르니 상시 휴대하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "singapore_grab",
        title: "Grab(그랩) 설치",
        description: "동남아 여행 필수 택시 앱입니다. 현지에서 가장 빠르고 편리하게 이동할 수 있어요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "singapore_map_apps",
        title: "지도 앱 설치(Google/Citymapper)",
        description: "글로벌 지도인 구글맵과 더불어 대중교통 정보가 상세한 시티매퍼를 함께 활용해 보세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "singapore_bus_timing",
        title: "SG Bus Timing 설치",
        description: "싱가포르 버스의 실시간 도착 정보를 확인할 수 있어 정류장에서 유용합니다.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    health: [
      {
        item_id: "singapore_wet_tissue",
        title: "휴대용 물티슈와 비닐장갑",
        description: "일부 식당은 물티슈를 유료로 판매합니다. 개인용 물티슈를 지참하면 위생적이고 경제적이에요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "singapore_aircon_medicine",
        title: "냉방병 대비 약 준비",
        description: "실외는 덥지만 실내는 에어컨이 매우 강해 온도 차가 큽니다. 감기약이나 해열제 등 복약을 챙기세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "singapore_mosquito_repellent",
        title: "모기 퇴치제 준비",
        description: "가든스 바이 더 베이나 보타닉 가든 등 숲이 우거진 관광지를 방문할 때 필수입니다.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    packing: [
      {
        item_id: "singapore_light_outer",
        title: "얇은 아우터 상비",
        description: "지하철, 쇼핑몰, 영화관 내부가 상당히 춥습니다. 가벼운 가디건이나 바람막이를 준비하세요.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "singapore_umbrella",
        title: "튼튼한 우양산",
        description: "갑작스러운 소나기와 뜨거운 자외선을 동시에 막아줄 튼튼한 우양산을 가방에 넣어두세요.",
        cta_type: "none",
        cta_label: ""
      }
    ],
    travel_tips: [
      {
        item_id: "singapore_gum_ban",
        title: "껌 반입 금지",
        description: "싱가포르는 껌 반입과 판매가 엄격히 금지되어 있습니다. 입국 시 소지하지 않도록 주의하세요!",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "singapore_no_food_transit",
        title: "대중교통 음식물 섭취 금지",
        description: "지하철이나 버스 내에서 물을 포함한 음식물 섭취 시 고액의 벌금이 부과될 수 있습니다.",
        cta_type: "none",
        cta_label: ""
      },
      {
        item_id: "singapore_hawker_chope",
        title: "호커 센터 자리 맡기",
        description: "휴지나 명함으로 자리를 먼저 찜한 뒤 주문하는 현지 문화가 있으니 당황하지 마세요!",
        cta_type: "none",
        cta_label: ""
      }
    ]
  };

  const checklistRef = useRef<HTMLDivElement>(null);
  const commandInputRef = useRef<HTMLInputElement>(null);
  const customInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // 국가 변경 시 체크 상태 초기화 및 아코디언 접기
  useEffect(() => {
    if (selectedCountry) {
      setCheckedItems(new Set<string>());
      localStorage.removeItem(STORAGE_KEY);
      setIsTravelTipsExpanded(false);
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
    // 사용자 액션 플래그 설정 (체크박스 클릭)
    checkAndTriggerCelebration();
  };

  // 체크리스트 초기화 함수
  const resetChecklist = () => {
    setCheckedItems(new Set<string>());
    localStorage.removeItem(STORAGE_KEY);
    toast({ title: "체크리스트가 초기화되었습니다", duration: 2000 });
  };

  // 커스텀 항목 추가
  const addCustomItem = () => {
    // 고유 ID 생성: 타임스탬프 + 랜덤 문자열
    const newId = `custom_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;
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

  // 삭제 중복 호출 방지를 위한 ref
  const deletingItemIdRef = useRef<string | null>(null);

  // 커스텀 항목 삭제
  const deleteCustomItem = useCallback((id: string) => {
    // 이미 삭제 중인 항목이면 무시
    if (deletingItemIdRef.current === id) {
      return;
    }
    
    deletingItemIdRef.current = id;
    
    setCustomItems(prev => {
      const filtered = prev.filter(item => item.id !== id);
      // 삭제 완료 후 ref 초기화
      setTimeout(() => {
        deletingItemIdRef.current = null;
      }, 100);
      return filtered;
    });
    
    // 체크 상태에서도 제거
    setCheckedItems(prev => {
      const newSet = new Set(prev);
      newSet.delete(id);
      return newSet;
    });
  }, []);

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

  // 체크리스트 섹션 분리: essentials는 마지막에, 나머지는 먼저 (useMemo로 최적화)
  const essentialsSection = useMemo(() => {
    try {
      const section = checklistData.sections.find(s => s && s.section_id === "essentials");
      if (!section || !section.items) return null;
      
      // 국가 전용 항목 스마트 병합
      const isJapan = selectedCountry === "일본";
      const isVietnam = selectedCountry === "베트남";
      const isThailand = selectedCountry === "태국";
      const isPhilippines = selectedCountry === "필리핀";
      const isChina = selectedCountry === "중국";
      const isTaiwan = selectedCountry === "대만";
      const isUSA = selectedCountry === "미국";
      const isHongkong = selectedCountry === "홍콩";
      const isIndonesia = selectedCountry === "인도네시아";
      const isFrance = selectedCountry === "프랑스";
      const isSingapore = selectedCountry === "싱가포르";
      const japanItems = isJapan ? (japanSpecificItems["essentials"] || []) : [];
      const vietnamItems = isVietnam ? (vietnamSpecificItems["essentials"] || []) : [];
      const thailandItems = isThailand ? (thailandSpecificItems["essentials"] || []) : [];
      const philippinesItems = isPhilippines ? (philippinesSpecificItems["essentials"] || []) : [];
      const chinaItems = isChina ? (chinaSpecificItems["essentials"] || []) : [];
      const taiwanItems = isTaiwan ? (taiwanSpecificItems["essentials"] || []) : [];
      const usaItems = isUSA ? (usaSpecificItems["essentials"] || []) : [];
      const hongkongItems = isHongkong ? (hongkongSpecificItems["essentials"] || []) : [];
      const indonesiaItems = isIndonesia ? (indonesiaSpecificItems["essentials"] || []) : [];
      const franceItems = isFrance ? (franceSpecificItems["essentials"] || []) : [];
      const singaporeItems = isSingapore ? (singaporeSpecificItems["essentials"] || []) : [];
      
      const mergedItems = mergeItems(section.items || [], mergeItems(mergeItems(mergeItems(mergeItems(mergeItems(mergeItems(mergeItems(mergeItems(mergeItems(mergeItems(japanItems, vietnamItems), thailandItems), philippinesItems), chinaItems), taiwanItems), usaItems), hongkongItems), indonesiaItems), franceItems), singaporeItems));
      
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
            const isPhilippines = selectedCountry === "필리핀";
            const isChina = selectedCountry === "중국";
            const isTaiwan = selectedCountry === "대만";
            const isUSA = selectedCountry === "미국";
            const isHongkong = selectedCountry === "홍콩";
            const isIndonesia = selectedCountry === "인도네시아";
            const isFrance = selectedCountry === "프랑스";
            const isSingapore = selectedCountry === "싱가포르";
            const japanItems = isJapan ? (japanSpecificItems[section.section_id] || []) : [];
            const vietnamItems = isVietnam ? (vietnamSpecificItems[section.section_id] || []) : [];
            const thailandItems = isThailand ? (thailandSpecificItems[section.section_id] || []) : [];
            const philippinesItems = isPhilippines ? (philippinesSpecificItems[section.section_id] || []) : [];
            const chinaItems = isChina ? (chinaSpecificItems[section.section_id] || []) : [];
            const taiwanItems = isTaiwan ? (taiwanSpecificItems[section.section_id] || []) : [];
            const usaItems = isUSA ? (usaSpecificItems[section.section_id] || []) : [];
            const hongkongItems = isHongkong ? (hongkongSpecificItems[section.section_id] || []) : [];
            const indonesiaItems = isIndonesia ? (indonesiaSpecificItems[section.section_id] || []) : [];
            const franceItems = isFrance ? (franceSpecificItems[section.section_id] || []) : [];
            const singaporeItems = isSingapore ? (singaporeSpecificItems[section.section_id] || []) : [];

            // 여행팁 섹션 처리
            if (section.section_id === "travel_tips") {
              // travelTipItems와 국가 전용 항목 스마트 병합
              const mergedItems = mergeItems(travelTipItems || [], mergeItems(mergeItems(mergeItems(mergeItems(mergeItems(mergeItems(mergeItems(mergeItems(mergeItems(mergeItems(japanItems, vietnamItems), thailandItems), philippinesItems), chinaItems), taiwanItems), usaItems), hongkongItems), indonesiaItems), franceItems), singaporeItems));
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
              const mergedItems = mergeItems(finalItems, mergeItems(mergeItems(mergeItems(mergeItems(mergeItems(mergeItems(mergeItems(mergeItems(mergeItems(mergeItems(japanItems, vietnamItems), thailandItems), philippinesItems), chinaItems), taiwanItems), usaItems), hongkongItems), indonesiaItems), franceItems), singaporeItems));
              return {
                ...section,
                items: mergedItems || finalItems || []
              };
            }
            
            // 기타 섹션: 기본 항목과 국가 전용 항목 스마트 병합
            const mergedItems = mergeItems(section.items || [], mergeItems(mergeItems(mergeItems(mergeItems(mergeItems(mergeItems(mergeItems(mergeItems(mergeItems(mergeItems(japanItems, vietnamItems), thailandItems), philippinesItems), chinaItems), taiwanItems), usaItems), hongkongItems), indonesiaItems), franceItems), singaporeItems));
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

  // 현재 선택된 국가의 모든 체크 가능한 항목 ID 수집 (useMemo로 최적화)
  // 실제 화면에 렌더링되는 체크박스 항목만 수집하여 동적 카운팅의 기준으로 사용
  // ⚠️ 여행팁(travel_tips) 섹션은 체크박스가 없는 정보성 섹션이므로 제외
  const allCheckableItemIds = useMemo(() => {
    const itemIds = new Set<string>();
    
    // essentials 섹션 항목 추가 (체크박스가 있는 항목만)
    if (essentialsSection?.items) {
      essentialsSection.items.forEach(item => {
        if (item && item.item_id) {
          itemIds.add(item.item_id);
        }
      });
    }
    
    // otherSections 항목 추가 (travel_tips는 체크박스가 없으므로 반드시 제외)
    otherSections.forEach(section => {
      // 여행팁 섹션은 진행률 계산에서 제외
      if (section && section.items && section.section_id !== "travel_tips") {
        section.items.forEach(item => {
          if (item && item.item_id) {
            itemIds.add(item.item_id);
          }
        });
      }
    });
    
    // 커스텀 항목 추가 (체크박스가 있는 항목만)
    customItems.forEach(item => {
      if (item && item.id) {
        itemIds.add(item.id);
      }
    });
    
    return itemIds;
  }, [essentialsSection, otherSections, customItems, selectedCountry]);

  // 동적 분모 설정: 현재 선택된 국가의 실제 체크박스 항목 개수
  // ⚠️ 여행팁(travel_tips)은 체크박스가 없으므로 제외됨
  const totalItems = useMemo(() => {
    return allCheckableItemIds.size;
  }, [allCheckableItemIds]);
  
  // 현재 국가의 체크박스 항목 중 체크된 항목만 카운트
  // ⚠️ 여행팁(travel_tips)은 체크박스가 없으므로 제외됨
  const completedItems = useMemo(() => {
    let count = 0;
    allCheckableItemIds.forEach(itemId => {
      if (checkedItems.has(itemId)) {
        count++;
      }
    });
    return count;
  }, [allCheckableItemIds, checkedItems]);
  
  // 진행률 계산: 현재 국가 기준으로만 계산
  const overallProgress = useMemo(() => {
    if (totalItems === 0) return 0;
    return Math.round((completedItems / totalItems) * 100);
  }, [completedItems, totalItems]);

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

  // 사용자 액션 플래그 (체크박스 클릭 또는 모두 선택 버튼 클릭 시 true)
  const userActionFlagRef = useRef<boolean>(false);

  // 100% 달성 축하 효과 실행 함수 (사용자 액션 기반 트리거)
  const checkAndTriggerCelebration = useCallback(() => {
    // 사용자 액션 플래그 설정
    userActionFlagRef.current = true;
  }, []);

  // 사용자 액션 후 축하 효과 체크 (useEffect로 상태 업데이트 후 실행)
  useEffect(() => {
    // 사용자 액션이 없으면 실행하지 않음
    if (!userActionFlagRef.current) {
      return;
    }

    // Zero 방지: totalItems가 0이면 실행하지 않음
    if (totalItems === 0) {
      userActionFlagRef.current = false;
      return;
    }

    // 초기 로딩 중에는 실행하지 않음 (일시적 100% 상태 무시)
    if (!isInitializedRef.current) {
      userActionFlagRef.current = false;
      return;
    }

    // 엄격한 조건 검증: checkedCount === totalCount && totalCount > 0
    const isComplete = completedItems === totalItems && totalItems > 0;
    
    const prevProgress = prevProgressRef.current;
    const currentProgress = overallProgress;

    // 진행률이 100% 미만으로 떨어졌다가 다시 100%가 될 때마다 축하 효과 실행
    if (prevProgress < 100 && currentProgress === 100 && isComplete) {
      userActionFlagRef.current = false;

      // 중앙 버스트 폭죽 효과 (팝업과 동시에 실행)
      const colors = ['#3B82F6', '#60A5FA', '#FFFFFF', '#FCD34D', '#E5E7EB']; // 블루, 라이트 블루, 화이트, 골드, 실버
      
      // 중앙에서 한 번에 터지는 버스트 효과
      confetti({
        particleCount: 150,
        spread: 70,
        origin: { x: 0.5, y: 0.5 },
        colors: colors,
        startVelocity: 45,
        gravity: 0.8,
        ticks: 100,
        zIndex: 1000
      });

      // 축하 팝업 표시
      setIsClosingCelebrationModal(false);
      setShowCelebrationModal(true);

      // 2.5초 후 자동으로 팝업 닫기 (0.5s fade-in + 1.5s 유지 + 0.5s fade-out)
      setTimeout(() => {
        setIsClosingCelebrationModal(true);
        setTimeout(() => {
          setShowCelebrationModal(false);
          setIsClosingCelebrationModal(false);
        }, 500); // 페이드 아웃 애니메이션 시간 (0.5초)
      }, 2000); // 0.5s fade-in + 1.5s 유지 = 2초 후 fade-out 시작
    }

    // 현재 progress를 이전 progress로 저장 (100% 미만으로 떨어졌을 때도 업데이트하여 재실행 가능하도록)
    prevProgressRef.current = currentProgress;
    userActionFlagRef.current = false;
  }, [completedItems, totalItems, overallProgress]);

  // 모두 선택 함수 (사용자 액션 기반)
  const selectAllItems = () => {
    setCheckedItems(new Set(allCheckableItemIds));
    toast({ title: "모든 항목을 선택했습니다", duration: 2000 });
    // 사용자 액션 플래그 설정 (모두 선택 버튼 클릭)
    checkAndTriggerCelebration();
  };

  // 모두 해제 함수 (현재 국가의 항목만 해제)
  const deselectAllItems = () => {
    const newCheckedItems = new Set(checkedItems);
    allCheckableItemIds.forEach(itemId => {
      newCheckedItems.delete(itemId);
    });
    setCheckedItems(newCheckedItems);
    toast({ title: "모든 항목을 해제했습니다", duration: 2000 });
  };

  // 국가 전환 시 팝업 닫기 및 축하 상태 리셋
  useEffect(() => {
    if (selectedCountry !== null) {
      // 팝업 닫기
      setIsClosingCelebrationModal(true);
      setTimeout(() => {
        setShowCelebrationModal(false);
        setIsClosingCelebrationModal(false);
      }, 300);
      // 진행률 추적 리셋 (새 국가에서 다시 축하 효과를 받을 수 있도록)
      prevProgressRef.current = 0;
    }
  }, [selectedCountry]);

  // 초기 로딩 완료 감지 (데이터 세팅 완료 후에만 축하 효과 활성화)
  useEffect(() => {
    // selectedCountry가 설정되고 totalItems가 0이 아닐 때 초기화 완료로 간주
    if (selectedCountry !== null && totalItems > 0) {
      // 약간의 지연을 두어 데이터 세팅이 완전히 완료되도록 함
      const timer = setTimeout(() => {
        isInitializedRef.current = true;
        prevProgressRef.current = overallProgress;
      }, 500);
      return () => clearTimeout(timer);
    } else {
      isInitializedRef.current = false;
    }
  }, [selectedCountry, totalItems, overallProgress]);

  return (
    <div className="min-h-screen bg-background pb-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-4">
        <Header />

        {/* 링크 버튼 및 완료 항목 숨김 토글 */}
        <div className="flex flex-row items-center justify-center gap-1.5 sm:gap-3 animate-fade-in -mt-2 mb-1 overflow-x-auto">
          <button
            onClick={copyLink}
            className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200 text-[10px] sm:text-sm text-gray-700 hover:text-gray-900 shadow-sm hover:shadow whitespace-nowrap flex-shrink-0"
          >
            <Link className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>링크</span>
          </button>
          <div className="flex items-center gap-1 sm:gap-2 px-2 sm:px-4 py-1.5 sm:py-2 rounded-lg border border-gray-200 bg-white shadow-sm flex-shrink-0 h-[28px] sm:h-auto">
            <label htmlFor="hide-completed-toggle" className="text-[10px] sm:text-sm text-gray-700 cursor-pointer whitespace-nowrap">
              완료 항목 숨김
            </label>
            <Switch
              id="hide-completed-toggle"
              checked={hideCompletedItems}
              onCheckedChange={setHideCompletedItems}
              className="data-[state=checked]:!bg-blue-500 h-4 w-7 sm:h-6 sm:w-11 [&>span]:h-3 [&>span]:w-3 sm:[&>span]:h-5 sm:[&>span]:w-5 data-[state=checked]:[&>span]:translate-x-3 sm:data-[state=checked]:[&>span]:translate-x-5"
            />
          </div>
          <div className="flex items-center gap-1 sm:gap-1.5 px-2 sm:px-3 py-1.5 sm:py-2 rounded-lg border border-gray-200 bg-white shadow-sm flex-shrink-0">
            <button
              onClick={selectAllItems}
              className="text-[10px] sm:text-xs text-gray-600 hover:text-gray-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              disabled={allCheckableItemIds.size === 0}
            >
              모두 선택
            </button>
            <span className="text-[10px] sm:text-xs text-gray-300">|</span>
            <button
              onClick={deselectAllItems}
              className="text-[10px] sm:text-xs text-gray-600 hover:text-gray-900 transition-colors font-medium disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
              disabled={allCheckableItemIds.size === 0}
            >
              모두 해제
            </button>
          </div>
        </div>

        {/* 1. 최상단: 여행 국가 선택 영역 (검색 가능한 드롭다운) */}
        <div className="animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 sm:gap-3 p-3 bg-card rounded-xl border border-border shadow-sm">
            <span className="text-sm font-semibold text-foreground">
              여행지를 선택하고 맞춤 정보를 확인하하세요!
            </span>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full sm:w-[200px] justify-between h-9"
                  data-gtm="destination_dropdown"
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
                        // 엄격한 선택 조건: 오직 selectedCountry와 정확히 일치할 때만 하이라이트
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
                              "cursor-pointer transition-all data-[selected=true]:bg-transparent data-[selected=true]:text-foreground",
                              isSelected && "!bg-[#45B1E5] !text-white"
                            )}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                isSelected ? "opacity-100 text-white" : "opacity-0"
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

        {/* 여행팁 아코디언 - 국가 선택 시에만 표시 */}
        {selectedCountry && (() => {
          const travelTipsSection = otherSections.find(s => s?.section_id === "travel_tips");
          const tipsItems = travelTipsSection?.items || [];
          
          if (tipsItems.length === 0) return null;
          
          return (
            <div className="animate-fade-in">
              <div className="w-full rounded-lg overflow-hidden">
                {/* 아코디언 헤더 */}
                <button
                  onClick={() => setIsTravelTipsExpanded(!isTravelTipsExpanded)}
                  className={cn(
                    "w-full py-2 px-4 flex justify-between items-center cursor-pointer transition-all duration-200",
                    "bg-blue-400 hover:bg-blue-500 text-white"
                  )}
                >
                  <span className="text-sm font-medium text-white">
                    💡 {selectedCountry} 여행팁 펼쳐보기
                  </span>
                  <ChevronDown 
                    className={cn(
                      "w-4 h-4 text-white transition-transform duration-200",
                      isTravelTipsExpanded && "transform rotate-180"
                    )}
                  />
                </button>
                
                {/* 아코디언 컨텐츠 */}
                <div
                  className={cn(
                    "overflow-hidden transition-all duration-300 ease-in-out",
                    isTravelTipsExpanded ? "max-h-[5000px] opacity-100" : "max-h-0 opacity-0"
                  )}
                >
                  <div className="px-4 py-3 space-y-3 bg-blue-50 border-t border-blue-100 rounded-b-lg">
                    {tipsItems.map((item) => {
                      if (!item || !item.item_id) return null;
                      return (
                        <div
                          key={item.item_id}
                          className="flex items-start gap-3"
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            <Check className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 
                              className="font-bold text-sm sm:text-base text-slate-900 dark:text-white mb-1"
                              style={{ lineHeight: '1.5' }}
                            >
                              {item.title}
                            </h4>
                            {item.description && (
                              <p 
                                className="text-xs sm:text-sm leading-relaxed text-slate-700 dark:text-gray-300 mt-1"
                                style={{ lineHeight: '1.5' }}
                              >
                                {parseTextWithLinks(item.description, selectedCountry)}
                              </p>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          );
        })()}

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
                selectedCountry={selectedCountry}
                hideCompletedItems={hideCompletedItems}
              />
            </div>
          )}

          {/* 일반 체크리스트 (essentials, travel_tips 제외) */}
          {otherSections && Array.isArray(otherSections) && otherSections.length > 0 ? (
            otherSections
              .filter(section => section && section.section_id && section.section_id !== "travel_tips")
              .map((section, index) => {
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
                      selectedCountry={selectedCountry}
                      hideCompletedItems={hideCompletedItems}
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
                  {customItems
                    .filter((item) => {
                      // 완료 항목 숨김가 켜져있으면 체크되지 않은 항목만 표시
                      if (hideCompletedItems) {
                        return !checkedItems.has(item.id);
                      }
                      return true;
                    })
                    .map((item) => {
                    const isChecked = checkedItems.has(item.id);
                    const checkboxId = `custom-item-check-${item.id}`;
                    const textInputId = `custom-item-text-${item.id}`;
                    return (
                      <div 
                        key={item.id}
                        className="relative flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all duration-200 group custom-item-container"
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
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onTouchStart={(e) => {
                            e.stopPropagation();
                          }}
                          className="absolute right-3 top-1/2 -translate-y-1/2 flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center bg-red-50 hover:bg-red-100 active:bg-red-200 transition-all duration-200 custom-delete-button"
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
          <EssentialItems 
            checkedItems={checkedItems} 
            selectedCountry={selectedCountry}
            allSections={[
              ...(essentialsSection ? [essentialsSection] : []),
              ...(otherSections || [])
            ]}
          />
        </div>

        {/* 하단 혜택 버튼 섹션 */}
        <div className="mt-6 mb-24 animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            {/* 항공기 반입 물품 가이드 */}
            <button
              onClick={() => setIsFlightGuideOpen(true)}
              className="rounded-xl py-4 h-14 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 bg-sky-500/100 text-white flex items-center justify-center"
            >
              <p className="text-sm font-semibold">
                항공기 반입 물품 가이드
              </p>
            </button>

            {/* 국가별 가변 혜택 버튼 */}
            {selectedCountry === "일본" ? (
              <a
                href="https://www.myrealtrip.com/promotions/Japan_donki_coupon"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl py-4 h-14 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center"
                style={{ 
                  backgroundColor: "#FFDB58",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                }}
              >
                <p className="text-sm font-semibold text-foreground">
                  돈키호테 할인 쿠폰 증정!
                </p>
              </a>
            ) : (
              <a
                href="https://www.myrealtrip.com/promotions/benefit"
                target="_blank"
                rel="noopener noreferrer"
                className="block rounded-xl py-4 h-14 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center"
                style={{ 
                  backgroundColor: "#E3F2FD",
                  border: "1px solid rgba(0, 0, 0, 0.05)",
                }}
              >
                <p className="text-sm font-semibold text-foreground">
                  마이리얼트립 혜택 보기
                </p>
              </a>
            )}
          </div>
        </div>

        {/* 감성 푸터 */}
        <div className="mt-12 pb-32 animate-fade-in">
          <div className="text-left space-y-3">
            <p className="text-sm text-gray-500 leading-relaxed">
              세상을 보고 무수한 장애물을 넘어<nav></nav>벽을 허물고 더 가까이 다가가<nav></nav>서로를 알아가고 느끼는 것.<nav></nav>그것이 바로 삶의 목적이다.
            </p>
            <p className="text-sm text-gray-500">
              — <em>영화 '월터의 상상은 현실이 된다'</em>
            </p>
            <p className="text-sm text-gray-700 font-medium mt-4">
              마이리얼트립은 여러분의 진정한 여행을 응원합니다!
            </p>
          </div>
        </div>
      </div>

      {/* 준비현황 바: 화면 하단에 고정 */}
      <BottomProgressSheet 
        progress={overallProgress}
        completedItems={completedItems}
        totalItems={totalItems}
        isInline={false}
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
          console.log("Medical Card Data:", data);
          console.log("Is Smoker:", data.isSmoker);
          // TODO: 메디컬 카드 이미지 템플릿에 데이터 매핑
        }}
      />

      {/* 100% 달성 축하 팝업 */}
      {showCelebrationModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm"
          style={{
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            animation: isClosingCelebrationModal ? 'fadeOut 0.5s ease-in-out' : 'fadeIn 0.5s ease-in-out',
            opacity: isClosingCelebrationModal ? 0 : 1
          }}
          onClick={() => {
            setIsClosingCelebrationModal(true);
            setTimeout(() => {
              setShowCelebrationModal(false);
              setIsClosingCelebrationModal(false);
            }, 500);
          }}
        >
          <div
            className="bg-white rounded-2xl shadow-2xl px-8 py-6 mx-4 text-center"
            style={{
              animation: isClosingCelebrationModal ? 'fadeOutScale 0.5s ease-in' : 'fadeInScale 0.5s ease-out',
              opacity: isClosingCelebrationModal ? 0 : 1,
              transform: isClosingCelebrationModal ? 'scale(0.9)' : 'scale(1)'
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <p className="text-2xl font-bold text-gray-800">
              모든 준비를 마쳤어요! 🎉
            </p>
          </div>
        </div>
      )}

      {/* 애니메이션 스타일 */}
      <style>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }
        @keyframes fadeOut {
          from {
            opacity: 1;
          }
          to {
            opacity: 0;
          }
        }
        @keyframes fadeInScale {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }
        @keyframes fadeOutScale {
          from {
            opacity: 1;
            transform: scale(1);
          }
          to {
            opacity: 0;
            transform: scale(0.9);
          }
        }
      `}</style>
    </div>
  );
};

export default Index;
