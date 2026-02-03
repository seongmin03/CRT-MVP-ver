import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { X } from "lucide-react";

interface IqosPartnershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

interface IqosFormData {
  name: string;
  phone: {
    first: string;
    middle: string;
    last: string;
  };
  email: {
    id: string;
    domain: string;
  };
  birthDate: string;
  isSmoker: "yes";
}

const IqosPartnershipModal = ({ isOpen, onClose, onConfirm }: IqosPartnershipModalProps) => {
  const [agreePersonalInfo, setAgreePersonalInfo] = useState(false);
  const [agreeThirdParty, setAgreeThirdParty] = useState(false);
  
  const [formData, setFormData] = useState<IqosFormData>({
    name: "",
    phone: {
      first: "010",
      middle: "",
      last: "",
    },
    email: {
      id: "",
      domain: "",
    },
    birthDate: "",
    isSmoker: "yes", // 흡연 항목 체크 시 뜨는 팝업이므로 항상 'yes'
  });

  // 연락처 중간 4자리 입력 (제한 없음)
  const handlePhoneMiddleChange = (value: string) => {
    const limitedValue = value.slice(0, 4);
    setFormData(prev => ({
      ...prev,
      phone: { ...prev.phone, middle: limitedValue }
    }));
  };

  // 연락처 마지막 4자리 입력 (제한 없음)
  const handlePhoneLastChange = (value: string) => {
    const limitedValue = value.slice(0, 4);
    setFormData(prev => ({
      ...prev,
      phone: { ...prev.phone, last: limitedValue }
    }));
  };

  // 생년월일 입력 (8자리 제한만)
  const handleBirthDateChange = (value: string) => {
    const limitedValue = value.slice(0, 8);
    setFormData(prev => ({ ...prev, birthDate: limitedValue }));
  };

  // 생년월일 포맷팅 (YYYYMMDD -> YYYY-MM-DD)
  const formatBirthDate = (value: string): string => {
    if (value.length === 8) {
      return `${value.slice(0, 4)}-${value.slice(4, 6)}-${value.slice(6, 8)}`;
    }
    return value;
  };

  // Google Spreadsheet API URL (환경변수 지원)
  const GOOGLE_SPREADSHEET_API_URL = import.meta.env.VITE_IQOS_API_URL || 
    "https://script.google.com/macros/s/AKfycbwJBQkD1ypEwHCD6kyD3OTyj63XM3ykQFyW8R1QIdS15slBpayYB-Pb6yQp9dyUE-fDkQ/exec";

  // 현재 시간을 YYYY-MM-DD HH:mm:ss 형식으로 반환
  const getCurrentTimestamp = (): string => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };

  // 데이터 가공 함수 (통합 DB 시트 규격: 12개 항목)
  const formatDataForSpreadsheet = () => {
    // 전화번호: 010-중간4자리-끝4자리
    const num = `${formData.phone.first}-${formData.phone.middle}-${formData.phone.last}`;
    
    // 이메일: 아이디@도메인
    const email = `${formData.email.id}@${formData.email.domain}`;
    
    // 생년월일: YYYYMMDD (8자리)
    const DOB = formData.birthDate;
    
    // 통합 DB 시트 규격에 맞춘 12개 항목
    return {
      timestamp: getCurrentTimestamp(), // 1. 현재 날짜와 시간
      name_en: "0", // 2. 입력받지 않음
      name_kr: formData.name.trim(), // 3. 한국어 성명
      DOB: DOB, // 4. 생년월일 (YYYYMMDD)
      nation: "0", // 5. 입력받지 않음
      language: "0", // 6. 입력받지 않음
      bloodtype: "0", // 7. 입력받지 않음
      num: num, // 8. 전화번호 (010-XXXX-XXXX)
      email: email, // 9. 이메일 (user@domain.com)
      emergency: "0", // 10. 입력받지 않음
      all: "0", // 11. 입력받지 않음
      smoking: "1" // 12. 정상 제출 시 1
    };
  };

  // 유효성 검사 (숫자 검증 포함)
  const validateFormData = (): boolean => {
    // 기본 필드 검사
    if (!isFormValid) {
      return false;
    }
    
    // 전화번호 중간/끝이 숫자인지 확인
    const phoneMiddleIsNumeric = /^\d+$/.test(formData.phone.middle);
    const phoneLastIsNumeric = /^\d+$/.test(formData.phone.last);
    
    // 생년월일이 숫자인지 확인
    const birthDateIsNumeric = /^\d+$/.test(formData.birthDate);
    
    return phoneMiddleIsNumeric && phoneLastIsNumeric && birthDateIsNumeric;
  };

  // Google Spreadsheet에 데이터 전송
  const sendDataToSpreadsheet = async (): Promise<boolean> => {
    try {
      const payload = formatDataForSpreadsheet();
      
      // Google Apps Script는 form 데이터나 URL-encoded 형식을 선호
      const formData = new FormData();
      Object.keys(payload).forEach(key => {
        formData.append(key, String(payload[key as keyof typeof payload]));
      });
      
      // fetch 요청 (no-cors 모드 사용)
      const response = await fetch(GOOGLE_SPREADSHEET_API_URL, {
        method: 'POST',
        mode: 'no-cors', // Google Apps Script의 CORS 제한 우회
        body: formData
      });
      
      // no-cors 모드에서는 response를 읽을 수 없지만, 요청은 전송됨
      return true;
    } catch (error) {
      console.error("Google Spreadsheet 데이터 전송 실패:", error);
      return false;
    }
  };

  // PDF 다운로드 함수
  const downloadPdf = () => {
    try {
      // PDF 파일 경로
      const pdfPath = "/image/info/test_iqos.pdf";
      
      // 동적으로 <a> 태그 생성하여 다운로드
      const link = document.createElement("a");
      link.href = pdfPath;
      link.download = "IQOS_ILUMA_Travel_Guide.pdf";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (error) {
      console.error("PDF 다운로드 중 오류 발생:", error);
      // 오류 발생 시 새 창에서 PDF 열기
      window.open("/image/info/test_iqos.pdf", "_blank");
    }
  };

  const handleConfirm = async () => {
    if (isFormValid && agreePersonalInfo && agreeThirdParty) {
      // 유효성 검사 (숫자 검증 포함)
      if (!validateFormData()) {
        console.error("유효성 검사 실패: 전화번호 또는 생년월일이 숫자가 아닙니다.");
        return;
      }
      
      // Google Spreadsheet에 데이터 전송 (비동기, 에러가 나도 계속 진행)
      sendDataToSpreadsheet().catch(error => {
        console.error("데이터 전송 중 오류:", error);
      });
      
      // PDF 다운로드
      downloadPdf();
      
      // 폼 데이터 전송 (필요시 onConfirm에 데이터 전달)
      onConfirm();
      
      // 팝업 닫기 및 상태 초기화
      handleClose();
    }
  };

  const handleClose = () => {
    onClose();
    // 팝업 닫을 때 상태 초기화
    setAgreePersonalInfo(false);
    setAgreeThirdParty(false);
    setFormData({
      name: "",
      phone: {
        first: "010",
        middle: "",
        last: "",
      },
      email: {
        id: "",
        domain: "",
      },
      birthDate: "",
      isSmoker: "yes",
    });
  };

  // 폼 유효성 검사
  const isFormValid = 
    formData.name.trim().length > 0 &&
    formData.phone.middle.length === 4 &&
    formData.phone.last.length === 4 &&
    formData.email.id.trim().length > 0 &&
    formData.email.domain.trim().length > 0 &&
    formData.birthDate.length === 8;

  const isButtonEnabled = isFormValid && agreePersonalInfo && agreeThirdParty;

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md max-h-[90vh] flex flex-col p-0 sm:rounded-lg overflow-hidden">
        <DialogHeader className="flex-shrink-0 bg-white dark:bg-slate-900 z-10 border-b px-4 sm:px-6 py-4 shadow-sm relative">
          <DialogTitle className="text-base sm:text-lg font-bold text-center text-slate-900 dark:text-white pr-8">
            마이리얼트립 X 아이코스 여행 가이드
          </DialogTitle>
          <button
            onClick={handleClose}
            className="absolute right-4 top-4 rounded-sm opacity-70 hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 transition-opacity"
            aria-label="닫기"
          >
            <X className="h-5 w-5 text-slate-900 dark:text-white" />
          </button>
        </DialogHeader>
        
        {/* 스크롤 가능한 본문 영역 */}
        <div className="flex-1 overflow-y-auto px-4 sm:px-6 py-4 space-y-4 min-h-0">
          {/* 본문 텍스트 */}
          <p className="text-sm text-slate-700 dark:text-gray-300 leading-relaxed">
            마이리얼트립과 아이코스가 제공하는 흡연자 분들을 위한 여행 가이드! 하단의 정보 제공에 동의하시면 가이드를 확인할 수 있어요.
          </p>

          {/* 입력 폼 */}
          <div className="space-y-3 pt-2">
            {/* 성명 */}
            <div className="space-y-1.5">
              <Label htmlFor="name" className="text-xs font-medium text-slate-900 dark:text-white">
                성명
              </Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="홍길동"
                className="h-9 text-sm border-slate-300 placeholder:text-gray-300"
              />
            </div>

            {/* 연락처 */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-900 dark:text-white">
                연락처
              </Label>
              <div className="flex items-center gap-1.5">
                <Input
                  value={formData.phone.first}
                  disabled
                  className="w-12 h-9 text-sm border-slate-300 bg-gray-100 text-center"
                />
                <Input
                  value={formData.phone.middle}
                  onChange={(e) => handlePhoneMiddleChange(e.target.value)}
                  placeholder="1234"
                  maxLength={4}
                  className="flex-1 h-9 text-sm border-slate-300 text-center placeholder:text-gray-300"
                />
                <Input
                  value={formData.phone.last}
                  onChange={(e) => handlePhoneLastChange(e.target.value)}
                  placeholder="5678"
                  maxLength={4}
                  className="flex-1 h-9 text-sm border-slate-300 text-center placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* 이메일 */}
            <div className="space-y-1.5">
              <Label className="text-xs font-medium text-slate-900 dark:text-white">
                이메일
              </Label>
              <div className="flex items-center gap-1.5">
                <Input
                  value={formData.email.id}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    email: { ...prev.email, id: e.target.value }
                  }))}
                  className="flex-1 h-9 text-sm border-slate-300 placeholder:text-gray-300"
                />
                <span className="text-slate-500 font-medium text-sm">@</span>
                <Input
                  value={formData.email.domain}
                  onChange={(e) => setFormData(prev => ({
                    ...prev,
                    email: { ...prev.email, domain: e.target.value }
                  }))}
                  className="flex-1 h-9 text-sm border-slate-300 placeholder:text-gray-300"
                />
              </div>
            </div>

            {/* 생년월일 */}
            <div className="space-y-1.5">
              <Label htmlFor="birthDate" className="text-xs font-medium text-slate-900 dark:text-white">
                생년월일
              </Label>
              <Input
                id="birthDate"
                type="text"
                value={formData.birthDate}
                onChange={(e) => handleBirthDateChange(e.target.value)}
                placeholder="19890101"
                maxLength={8}
                className="h-9 text-sm border-slate-300 placeholder:text-gray-300"
              />
              {formData.birthDate.length === 8 && (
                <p className="text-[10px] text-slate-500">
                  {formatBirthDate(formData.birthDate)}
                </p>
              )}
            </div>
          </div>

          {/* 동의 항목 */}
          <div className="space-y-3 pt-2">
            {/* 안내 문구 */}
            <p className="text-[10px] sm:text-[11px] text-gray-500 dark:text-gray-400 text-center pb-1">
              모두 동의해야 서비스를 이용할 수 있어요.
            </p>
            
            {/* 개인정보 수집·이용 동의 */}
            <div className="space-y-2">
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-2 mt-0.5">
                  <Checkbox
                    id="agree-personal-info"
                    checked={agreePersonalInfo}
                    onCheckedChange={(checked) => setAgreePersonalInfo(checked === true)}
                    className="flex-shrink-0"
                  />
                  <label
                    htmlFor="agree-personal-info"
                    className="text-[10px] sm:text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed cursor-pointer"
                  >
                    동의함
                  </label>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Checkbox
                    id="disagree-personal-info"
                    checked={!agreePersonalInfo}
                    onCheckedChange={(checked) => setAgreePersonalInfo(checked !== true)}
                    className="flex-shrink-0"
                  />
                  <label
                    htmlFor="disagree-personal-info"
                    className="text-[10px] sm:text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed cursor-pointer"
                  >
                    동의하지 않음
                  </label>
                </div>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-gray-500 leading-relaxed pl-0">
                1. 개인정보 수집·이용 동의 (목적: 정보 제공 / 항목: 성명, 연락처, 이메일, 생년월일, 흡연 여부 / 3개월 보관)
              </p>
            </div>

            {/* 개인정보 제3자 제공 동의 */}
            <div className="space-y-2">
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-2 mt-0.5">
                  <Checkbox
                    id="agree-third-party"
                    checked={agreeThirdParty}
                    onCheckedChange={(checked) => setAgreeThirdParty(checked === true)}
                    className="flex-shrink-0"
                  />
                  <label
                    htmlFor="agree-third-party"
                    className="text-[10px] sm:text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed cursor-pointer"
                  >
                    동의함
                  </label>
                </div>
                <div className="flex items-center gap-2 mt-0.5">
                  <Checkbox
                    id="disagree-third-party"
                    checked={!agreeThirdParty}
                    onCheckedChange={(checked) => setAgreeThirdParty(checked !== true)}
                    className="flex-shrink-0"
                  />
                  <label
                    htmlFor="disagree-third-party"
                    className="text-[10px] sm:text-[11px] text-slate-600 dark:text-gray-400 leading-relaxed cursor-pointer"
                  >
                    동의하지 않음
                  </label>
                </div>
              </div>
              <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-gray-500 leading-relaxed pl-0">
                2. 개인정보 제3자 제공 동의 (제공받는 자: 아이코스 / 목적: 업무 제휴)
              </p>
            </div>
          </div>
        </div>

        {/* 하단 버튼 영역 */}
        <div className="flex-shrink-0 border-t bg-white dark:bg-slate-900 px-4 sm:px-6 py-4">
          <Button
            onClick={handleConfirm}
            disabled={!isButtonEnabled}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-6 text-base font-semibold disabled:opacity-50 disabled:cursor-not-allowed transition-all"
          >
            가이드 확인하기
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default IqosPartnershipModal;
