import { useState, useRef, useEffect } from "react";
import Header from "@/components/Header";
import ProgressBarWithPlane from "@/components/ProgressBarWithPlane";
import EssentialItems from "@/components/EssentialItems";
import ChecklistSection from "@/components/ChecklistSection";
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

// [그룹 A: 상위 노출 (21개)] - 정렬하지 않고 아래 순서 그대로 맨 위에 고정
const topCountries = [
  "일본", "베트남", "대한민국", "태국", "필리핀", "중국", "대만", 
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
  const checklistRef = useRef<HTMLDivElement>(null);
  const customInputRefs = useRef<{ [key: string]: HTMLInputElement | null }>({});

  // 체크 상태가 변경될 때마다 localStorage에 저장
  useEffect(() => {
    saveCheckedItemsToStorage(checkedItems);
  }, [checkedItems]);

  // 커스텀 항목이 변경될 때마다 localStorage에 저장
  useEffect(() => {
    saveCustomItemsToStorage(customItems);
  }, [customItems]);

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

  const totalItems = checklistData.sections.reduce((acc, section) => acc + section.items.length, 0) + customItems.length;
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

        {/* 링크 복사 버튼 */}
        <div className="flex justify-center animate-fade-in -mt-4">
          <button
            onClick={copyLink}
            className="flex items-center gap-2 px-4 py-2 rounded-lg border border-gray-200 bg-white hover:bg-gray-50 transition-all duration-200 text-sm text-gray-700 hover:text-gray-900 shadow-sm hover:shadow"
          >
            <Link className="w-4 h-4" />
            <span>링크 복사</span>
          </button>
        </div>

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
                className="w-[200px] p-0 bg-white border border-gray-100 shadow-2xl rounded-lg overflow-hidden z-50" 
                align="end"
                side="bottom"
                sideOffset={4}
                avoidCollisions={false}
                collisionPadding={0}
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
                {europeCountries.includes(selectedCountry) ? (
                  <>
                    <span className="text-xl">💡</span>
                    <h3 className="text-lg font-semibold text-foreground">
                      유럽 리얼 트립
                    </h3>
                  </>
                ) : (
                  <>
                    <span className="text-xl">✈️</span>
                    <h3 className="text-lg font-semibold text-foreground">
                      {selectedCountry} 리얼 트립
                    </h3>
                  </>
                )}
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

        {/* 체크리스트 영역만 Export 대상 */}
        <div ref={checklistRef} id="checklist-root" className="space-y-4 bg-background rounded-xl pb-24">
          {/* 필수 서류 및 신분증 섹션 (essentials) - 먼저 표시 */}
          {essentialsSection && (
            <div className="animate-fade-in">
              <ChecklistSection
                section={essentialsSection}
                checkedItems={checkedItems}
                onToggle={handleToggle}
              />
            </div>
          )}

          {/* 일반 체크리스트 (essentials 제외) */}
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
                    항목을 입력해야<br />새로운 항목을 추가할 수 있어요!
                  </span>
                </div>
                <div className="space-y-1">
                  {customItems.map((item) => {
                    const isChecked = checkedItems.has(item.id);
                    return (
                      <div 
                        key={item.id}
                        className="flex items-start gap-3 sm:gap-4 p-3 sm:p-4 rounded-xl transition-all duration-200 hover:bg-muted/50 group"
                      >
                        <div 
                          className={`
                            flex-shrink-0 w-6 h-6 rounded-lg border-2 flex items-center justify-center transition-all duration-200 mt-0.5 cursor-pointer
                            ${isChecked 
                              ? 'bg-accent border-accent animate-check-bounce shadow-sm' 
                              : 'border-muted-foreground/30 group-hover:border-accent/50'
                            }
                          `}
                          onClick={() => handleToggle(item.id)}
                        >
                          {isChecked && (
                            <Check className="w-4 h-4 text-accent-foreground" strokeWidth={3} />
                          )}
                        </div>
                        <input
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
                        />
                        <button
                          onClick={() => deleteCustomItem(item.id)}
                          className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all duration-200 opacity-0 group-hover:opacity-100"
                          aria-label="항목 삭제"
                        >
                          <X className="w-4 h-4" />
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
        <EssentialItems />
      </div>
    </div>
  );
};

export default Index;
