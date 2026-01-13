import { useState, useRef } from "react";
import Header from "@/components/Header";
import ProgressBarWithPlane from "@/components/ProgressBarWithPlane";
import EssentialItems from "@/components/EssentialItems";
import ChecklistSection from "@/components/ChecklistSection";
import ActionButtons from "@/components/ActionButtons";
import { checklistData } from "@/data/checklistData";
import { travelTips } from "@/data/travleTips";
import { Lightbulb } from "lucide-react";
import { Check } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

// 국가 리스트 정렬
const topCountries = [
  "일본", "베트남", "태국", "필리핀", "중국", "대만", 
  "미국", "홍콩", "인도네시아", "괌", "프랑스", "싱가포르"
];

const allCountries = [
  "알제리", "안도라", "아르헨티나", "아루바", "호주", "오스트리아", 
  "아제르바이잔", "바하마", "방글라데시", "벨기에", "부탄", "볼리비아", 
  "보스니아 헤르체고비나", "보츠와나", "브라질", "브루나이", "불가리아", 
  "캄보디아", "캐나다", "칠레", "중국", "콜롬비아", "콩고민주공화국", 
  "코스타리카", "크로아티아", "쿠바", "키프로스", "체코", "덴마크", 
  "도미니카 공화국", "에콰도르", "이집트", "에스토니아", "에티오피아", 
  "피지", "핀란드", "프랑스", "프렌치 폴리네시아", "조지아", "독일", 
  "지브롤터", "그리스", "그레나다", "괌", "과테말라", "건지", "기니", 
  "바티칸", "홍콩", "헝가리", "아이슬란드", "인도", "인도네시아", "이란", 
  "이라크", "아일랜드", "이스라엘", "이탈리아", "일본", "요르단", 
  "카자흐스탄", "케냐", "대한민국", "쿠웨이트", "키르기스스탄", "라오스", 
  "라트비아", "레바논", "리투아니아", "룩셈부르크", "마카오", "마케도니아", 
  "말레이시아", "몰디브", "몰타", "모리셔스", "멕시코", "몰도바", "모나코", 
  "몽골", "몬테네그로", "모로코", "미얀마", "나미비아", "네팔", "네덜란드", 
  "뉴질랜드", "나이지리아", "북마리아나 제도", "노르웨이", "오만", "파키스탄", 
  "팔라우", "파나마", "페루", "필리핀", "폴란드", "포르투갈", "카타르", 
  "루마니아", "러시아", "르완다", "사우디아라비아", "세르비아", "세이셸", 
  "싱가포르", "슬로바키아", "슬로베니아", "남아프리카 공화국", "스페인", 
  "스리랑카", "스웨덴", "스위스", "대만", "탄자니아", "태국", "튀니지", 
  "터키", "우간다", "우크라이나", "아랍에미리트", "영국", "미국", 
  "우즈베키스탄", "베트남", "잠비아", "짐바브웨"
];

// 중복 제거 및 정렬
const otherCountries = allCountries
  .filter(country => !topCountries.includes(country))
  .sort((a, b) => a.localeCompare(b, 'ko'));

const sortedCountries = [...topCountries, ...otherCountries];

const Index = () => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const checklistRef = useRef<HTMLDivElement>(null);

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

  const totalItems = checklistData.sections.reduce((acc, section) => acc + section.items.length, 0);
  const completedItems = checkedItems.size;
  const overallProgress = Math.round((completedItems / totalItems) * 100);

  // 체크리스트 섹션 분리: essentials는 마지막에, 나머지는 먼저
  const essentialsSection = checklistData.sections.find(s => s.section_id === "essentials");
  const otherSections = checklistData.sections.filter(s => s.section_id !== "essentials");

  // 선택된 국가의 여행 팁 가져오기 ("미국 / 괌" 같은 경우도 처리)
  const travelTipsKey = selectedCountry === "미국" || selectedCountry === "괌" 
    ? "미국 / 괌" 
    : selectedCountry;
  const currentTravelTips = selectedCountry && travelTipsKey ? travelTips[travelTipsKey] : null;

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 space-y-8">
        <Header />

        {/* Overall progress with airplane animation */}
        <div className="card-toss animate-fade-in">
          <div className="flex items-center justify-between mb-3">
            <span className="text-sm font-semibold text-foreground">전체 준비 현황</span>
            <span className="text-sm font-bold" style={{ color: "#007BFF" }}>{overallProgress}%</span>
          </div>
          <ProgressBarWithPlane progress={overallProgress} />
          <p className="text-xs text-muted-foreground mt-2">
            {completedItems}/{totalItems} 항목 완료
          </p>
        </div>

        {/* 1. 최상단: 여행 국가 선택 영역 */}
        <div className="animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 bg-card rounded-xl border border-border shadow-sm">
            <span className="text-sm font-semibold text-foreground">
              여행 국가를 선택하고 맞춤 혜택을 받으세요!
            </span>
            <Select value={selectedCountry} onValueChange={setSelectedCountry}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder="국가 선택" />
              </SelectTrigger>
              <SelectContent 
                position="popper" 
                side="bottom" 
                sideOffset={4}
                avoidCollisions={false}
                collisionPadding={0}
              >
                {sortedCountries.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* 2. 신설: {selectedCountry} 리얼 트립 섹션 - 국가 선택 시에만 표시 */}
        {selectedCountry && currentTravelTips && (
          <div className="animate-fade-in">
            <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100/50 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Lightbulb className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-foreground">
                  {selectedCountry} 리얼 트립
                </h3>
              </div>
              <div className="space-y-3">
                {currentTravelTips.map((tip, index) => (
                  <div key={index} className="flex items-start gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-blue-600" strokeWidth={2.5} />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm text-foreground mb-1 leading-tight">
                        {tip.title}
                      </h4>
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {tip.content}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* 3. 중단: 혜택 탭 2분할 - 항상 표시 */}
        <div className="animate-fade-in">
          <div className="grid grid-cols-2 gap-3">
            {/* 왼쪽 절반: 안전한 여행! 여행자 보험 - 항상 표시 */}
            <a
              href="https://direct.samsungfire.com/ria/pc/product/factory/?state=Front&product=travel&state=Front"
              target="_blank"
              rel="noopener noreferrer"
              className="block rounded-xl p-4 text-center transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0"
              style={{ 
                backgroundColor: "#FEF9E7",
                border: "1px solid rgba(0, 0, 0, 0.05)"
              }}
            >
              <p className="text-sm font-semibold text-foreground">
                안전한 여행! 여행자 보험
              </p>
            </a>

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
                  트래블카드 혜택 보기
                </p>
              </a>
            )}
          </div>
        </div>

        {/* Essential items section */}
        <EssentialItems />

        {/* 4. 중단: 일반 체크리스트 (essentials 제외) */}
        <div ref={checklistRef} id="checklist-root" className="space-y-4 bg-background rounded-xl">
          {otherSections.map((section, index) => (
            <div 
              key={section.section_id}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <ChecklistSection
                section={section}
                checkedItems={checkedItems}
                onToggle={handleToggle}
              />
            </div>
          ))}
        </div>

        {/* 5. 최하단: 필수 서류 및 신분증 섹션 (essentials) */}
        {essentialsSection && (
          <div className="animate-fade-in">
            <ChecklistSection
              section={essentialsSection}
              checkedItems={checkedItems}
              onToggle={handleToggle}
            />
          </div>
        )}
      </div>

      <ActionButtons checklistRef={checklistRef} />
    </div>
  );
};

export default Index;
