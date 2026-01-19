export interface ChecklistItem {
  item_id: string;
  title: string;
  description: string;
  cta_type: string;
  cta_label: string;
  image_url?: string;
  link_url?: string;
}

export interface ChecklistSection {
  section_id: string;
  section_title: string;
  items: ChecklistItem[];
}

export interface ChecklistData {
  template_version: string;
  scope: string;
  sections: ChecklistSection[];
}

export const checklistData: ChecklistData = {
  template_version: "global_basic_v1",
  scope: "global",
  sections: [
    {
      section_id: "essentials",
      section_title: "필수 서류 및 신분증",
      items: [
        {
          item_id: "passport",
          title: "여권 준비",
          description: "일부 국가는 입국 시 여권 잔여 유효기간을 요구할 수 있으니 출발 전 확인하세요.",
          cta_type: "none",
          cta_label: ""
        },
        {
          item_id: "visa",
          title: "비자 / 입국 허가 확인",
          description: "국가와 체류 목적에 따라 사전 허가가 필요할 수 있으니 공식 채널에서 확인하세요.",
          cta_type: "none",
          cta_label: ""
        },
        {
          item_id: "flight_ticket",
          title: "항공권 예약 정보 확인",
          description: "모바일 저장 및 오프라인에서도 확인 가능하도록 준비하면 좋아요.",
          cta_type: "none",
          cta_label: ""
        },
        {
          item_id: "accommodation",
          title: "숙소 예약 정보 정리",
          description: "입국 심사나 이동 시 주소 확인이 필요한 경우를 대비해 정리해두세요.",
          cta_type: "none",
          cta_label: ""
        }
      ]
    },
    {
      section_id: "finance",
      section_title: "금융 및 결제 수단",
      items: [
        {
          item_id: "payment_card",
          title: "해외 결제 가능 카드 준비",
          description: "해외 사용이 가능한 카드 2종 이상을 준비하면 상황 대응이 수월해요.",
          cta_type: "none",
          cta_label: "",
          image_url: "/image/card.png",
          link_url: "https://link.coupang.com/a/drYGzJ"
        },
        {
          item_id: "cash",
          title: "소액 현금 준비",
          description: "카드 결제가 어려운 상황에 대비해 최소한의 현금을 준비하세요.",
          cta_type: "none",
          cta_label: "",
          image_url: "/image/cash.png",
          link_url: "https://link.coupang.com/a/drYGzJ"
        },
        {
          item_id: "backup_payment",
          title: "비상 결제 수단 확인",
          description: "해외 결제 차단 여부와 분실 시 대응 방법을 미리 확인해두세요.",
          cta_type: "none",
          cta_label: "",
          image_url: "/image/emergency.png",
          link_url: "https://link.coupang.com/a/drYGzJ"
        }
      ]
    },
    {
      section_id: "electronics",
      section_title: "전자제품 및 통신",
      items: [
        {
          item_id: "adapter",
          title: "멀티 어댑터 준비",
          description: "방문 국가의 전원 플러그 타입이 다를 수 있으니 호환 어댑터를 준비하세요.",
          cta_type: "none",
          cta_label: "",
          image_url: "/image/adapter.png",
          link_url: "https://link.coupang.com/a/drYGzJ"
        },
        {
          item_id: "powerbank",
          title: "보조배터리 준비",
          description: "항공사별 기내 반입 규정이 다를 수 있으니 사전 확인이 필요해요.",
          cta_type: "none",
          cta_label: "",
          image_url: "/image/battery.png",
          link_url: "https://link.coupang.com/a/drYIG0"
        },
        {
          item_id: "charging_cable",
          title: "충전 케이블 및 어댑터",
          description: "휴대폰, 카메라 등 사용하는 기기에 맞는 케이블을 챙기세요.",
          cta_type: "none",
          cta_label: "",
          image_url: "/image/cable.png",
          link_url: "https://link.coupang.com/a/drYGzJ"
        },
        {
          item_id: "connectivity",
          title: "유심 / eSIM / 로밍 준비",
          description: "여행 일정과 사용 패턴에 맞는 통신 수단을 미리 선택해두면 편리해요.",
          cta_type: "none",
          cta_label: "",
          image_url: "/image/sim.png",
          link_url: "https://link.coupang.com/a/drYJWG"
        }
      ]
    },
    {
      section_id: "health",
      section_title: "상비약 및 위생 용품",
      items: [
        {
          item_id: "medicine_basic",
          title: "기본 상비약 준비",
          description: "해열제, 소화제 등 개인에게 필요한 기본 약품을 준비하세요.",
          cta_type: "none",
          cta_label: "",
          image_url: "/image/capsule.png",
          link_url: "https://link.coupang.com/a/drYGzJ"
        },
        {
          item_id: "medicine_personal",
          title: "개인 복용 약 확인",
          description: "처방약의 경우 필요 시 설명 자료를 함께 준비하는 것이 좋아요.",
          cta_type: "none",
          cta_label: "",
          image_url: "/image/script.png",
          link_url: "https://link.coupang.com/a/drYGzJ"
        },
        {
          item_id: "hygiene",
          title: "위생 용품 준비",
          description: "휴대용 티슈, 물티슈, 손 소독제 등은 이동 중 유용해요.",
          cta_type: "none",
          cta_label: "",
          image_url: "/image/towel.png",
          link_url: "https://link.coupang.com/a/drYLaK"
        }
      ]
    },
    {
      section_id: "packing",
      section_title: "의류 및 편의용품",
      items: [
        {
          item_id: "clothing",
          title: "계절에 맞는 의류 준비",
          description: "출발 전 예보와 일정 특성을 참고해 기본 착장을 준비하세요.",
          cta_type: "none",
          cta_label: "",
          image_url: "/image/shorts.png",
          link_url: "https://link.coupang.com/a/drYGzJ"
        },
        {
          item_id: "underwear",
          title: "속옷 및 양말 준비",
          description: "여행 기간을 기준으로 여유분을 포함해 챙기면 좋아요.",
          cta_type: "none",
          cta_label: "",
          image_url: "/image/socks.png",
          link_url: "https://link.coupang.com/a/drYGzJ"
        },
        {
          item_id: "pouch",
          title: "수납용 파우치 준비",
          description: "짐 정리와 이동 시 편의를 위해 활용해보세요.",
          cta_type: "none",
          cta_label: "",
          image_url: "/image/pouch.png",
          link_url: "https://link.coupang.com/a/drYLM5"
        },
        {
          item_id: "umbrella",
          title: "우산 또는 우비 준비",
          description: "갑작스러운 기상 변화에 대비해 하나쯤 준비하면 유용해요.",
          cta_type: "none",
          cta_label: "",
          image_url: "/image/umbrella.png",
          link_url: "https://link.coupang.com/a/drY6ST"
        }
      ]
    }
  ]
};
