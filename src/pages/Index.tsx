import { useState, useRef } from "react";
import Header from "@/components/Header";
import ChecklistSection from "@/components/ChecklistSection";
import ActionButtons from "@/components/ActionButtons";
import { checklistData } from "@/data/checklistData";

const Index = () => {
  const [checkedItems, setCheckedItems] = useState<Set<string>>(new Set());
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

  return (
    <div className="min-h-screen bg-background pb-28">
      <div className="max-w-2xl mx-auto px-4">
        <Header />

        {/* Overall progress */}
        <div className="card-toss mb-6 animate-fade-in">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-foreground">전체 준비 현황</span>
            <span className="text-sm font-bold text-accent">{overallProgress}%</span>
          </div>
          <div className="h-2.5 bg-muted rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-accent to-primary rounded-full transition-all duration-500 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            {completedItems}/{totalItems} 항목 완료
          </p>
        </div>

        {/* Checklist sections */}
        <div ref={checklistRef} id="checklist-root" className="space-y-4 bg-background rounded-xl">
          {checklistData.sections.map((section, index) => (
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
      </div>

      <ActionButtons checklistRef={checklistRef} />
    </div>
  );
};

export default Index;
