import { useState, useRef } from "react";
import Header from "@/components/Header";
import ProgressBarWithPlane from "@/components/ProgressBarWithPlane";
import EssentialItems from "@/components/EssentialItems";
import ChecklistSection from "@/components/ChecklistSection";
import ActionButtons from "@/components/ActionButtons";
import { checklistData } from "@/data/checklistData";
import { travelTips } from "@/data/travleTips";
import { Lightbulb, Check, ChevronDown, Search } from "lucide-react";
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

// travelTips의 키를 기준으로 검색 가능한 국가 목록 생성
// 유럽 국가들은 개별적으로도 표시되지만, 선택 시 "유럽"으로 처리됨
const availableCountries = Object.keys(travelTips).flatMap(key => {
  if (key === "유럽") {
    // 유럽은 개별 국가들로 분리하여 표시
    return ["프랑스", "영국", "스페인", "이탈리아"];
  } else if (key === "미국 / 괌") {
    // 미국 / 괌은 개별 국가로 분리
    return ["미국", "괌"];
  } else {
    return [key];
  }
});

// 중복 제거 및 정렬
const sortedCountries = [...new Set(availableCountries)].sort((a, b) => 
  a.localeCompare(b, 'ko')
);

const Index = () => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
  const [selectedCountry, setSelectedCountry] = useState<string>("");
  const [open, setOpen] = useState(false);
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

  // 선택된 국가의 여행 팁 가져오기 ("미국 / 괌", 유럽 국가들 처리)
  const europeCountries = ["프랑스", "영국", "스페인", "이탈리아"];
  const travelTipsKey = selectedCountry === "미국" || selectedCountry === "괌" 
    ? "미국 / 괌" 
    : europeCountries.includes(selectedCountry)
    ? "유럽"
    : selectedCountry;
  const currentTravelTips = selectedCountry && travelTipsKey ? travelTips[travelTipsKey] : null;
  const displayCountryName = europeCountries.includes(selectedCountry) ? "유럽" : selectedCountry;

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

        {/* 1. 최상단: 여행 국가 선택 영역 (검색 가능한 드롭다운) */}
        <div className="animate-fade-in">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 sm:gap-4 p-4 bg-card rounded-xl border border-border shadow-sm">
            <span className="text-sm font-semibold text-foreground">
              여행 국가를 선택하고 맞춤 혜택을 받으세요!
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
                className="w-[200px] p-0 bg-white border border-gray-100 shadow-2xl rounded-lg overflow-hidden" 
                align="end"
              >
                <Command className="bg-white">
                  <CommandInput 
                    placeholder="국가 검색..." 
                    className="h-11 bg-white border-b border-gray-100"
                  />
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
                <Lightbulb className="w-5 h-5 text-blue-600" />
                <h3 className="text-lg font-semibold text-foreground">
                  {displayCountryName} 리얼 트립
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
                      <p 
                        className="text-sm text-muted-foreground leading-relaxed travel-tip-content"
                        dangerouslySetInnerHTML={{ __html: tip.content }}
                      />
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

        {/* 6. 최하단: Essential items section */}
        <EssentialItems />
      </div>

      <ActionButtons checklistRef={checklistRef} />
    </div>
  );
};

export default Index;
