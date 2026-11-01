export const message = {
  lawn: {
    monday: "Mon",
    wednesday: "Wed",
    friday: "Fri",
  },
  mod: {
    api_key: "API Key",
    password: "Password",
    date: "Date",
    link: "Link",
    content: "Content",
    push_grass: "Push grass",
    saving: "Saving…",
    saved: (ref: string) => `저장했습니다. 배포가 완료되면 잔디에 반영됩니다. ${ref}`,
  },
  error: {
    invalid_date: "날짜를 YYYY-MM-DD 형식의 유효한 날짜로 입력해 주세요.",
    invalid_link: "링크가 유효하지 않습니다.",
    password_required: "비밀번호를 입력해 주세요.",
    key_storage_failed: "API 키 암호화 또는 브라우저 저장소 접근에 실패했습니다.",
    api_key_missing: "저장된 API 키가 없습니다. API Key를 입력해 주세요.",
    decryption_failed: "API 키를 복호화하지 못했습니다. 비밀번호 또는 저장된 키를 확인해 주세요.",
    load: {
      fetch: "데이터 로드 실패: fetch 실패",
      status: (status: string) => `데이터 로드 실패: ${status}`,
      parse: "데이터 로드 실패: 파싱 실패",
    },
    save: {
      fetch: "데이터 저장 실패: fetch 실패",
      conflict: "데이터 저장 실패: 데이터 SHA 불일치",
      status: (status: string) => `데이터 저장 실패: ${status}`,
      parse: "데이터 저장 실패: 파싱 실패",
    },
    dispatch: {
      fetch: "Data dispatch failed: fetch failed",
      status: (status: string) => `Data dispatch failed: status is not ok: ${status}`,
    },
  },
};
