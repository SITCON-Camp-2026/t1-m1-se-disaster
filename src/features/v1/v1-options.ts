import type {
  V1KnowledgeMethod,
  V1ObservationKind,
  V1OnSiteState,
  V1ReporterRole,
  V1SupplementField,
  V1TransferState,
  V1Urgency,
} from "./v1-types";

export type V1Option<T extends string> = {
  value: T;
  label: string;
  description: string;
};

export const knowledgeMethodOptions: Array<V1Option<V1KnowledgeMethod>> = [
  {
    value: "direct_seen",
    label: "親眼看到",
    description: "自己在現場直接看見，不代表系統已查核。",
  },
  {
    value: "direct_heard",
    label: "親耳聽到",
    description: "自己直接聽到聲音或說明，仍需記錄時間和情境。",
  },
  {
    value: "unclear_sense",
    label: "模糊感官",
    description: "疑似看到或疑似聽見，需要更保守地描述。",
  },
  {
    value: "told_by_other",
    label: "聽說或他人告知",
    description: "資訊來自他人，應保留轉述限制。",
  },
  {
    value: "reposted",
    label: "截圖或轉傳",
    description: "可能有時間差或重複轉述，不能當成獨立確認。",
  },
  {
    value: "unknown",
    label: "不確定",
    description: "目前無法判斷取得方式。",
  },
];

export const reporterRoleOptions: Array<V1Option<V1ReporterRole>> = [
  {
    value: "affected_person",
    label: "當事人",
    description: "自己受到影響或直接提出需求。",
  },
  {
    value: "on_site_person",
    label: "現場者",
    description: "人在現場，但不一定是當事人。",
  },
  {
    value: "family",
    label: "家屬",
    description: "替親友回報，仍需確認當事人位置與同意。",
  },
  {
    value: "volunteer",
    label: "志工",
    description: "以志工身分提供觀測或轉述現場資訊。",
  },
  {
    value: "secondhand_reporter",
    label: "轉述者",
    description: "不是親眼確認，必須保留轉述限制。",
  },
  {
    value: "unknown",
    label: "不確定",
    description: "目前無法判斷回報者角色。",
  },
];

export const observationKindOptions: Array<V1Option<V1ObservationKind>> = [
  {
    value: "medical",
    label: "醫療或人身安全",
    description: "例如疑似急救、藥品、身體狀況。",
  },
  {
    value: "traffic",
    label: "交通或道路",
    description: "例如道路阻斷、交通幹道受影響。",
  },
  {
    value: "supplies",
    label: "物資",
    description: "例如飲水、雨鞋、工具、衣物等供需。",
  },
  {
    value: "cleanup",
    label: "清理或人力",
    description: "例如清泥、搬運、志工人力需求。",
  },
  {
    value: "shelter",
    label: "集合點或安置",
    description: "例如集合點、活動中心、臨時空間狀態。",
  },
  {
    value: "infrastructure",
    label: "水電或基礎設施",
    description: "例如水電檢修、設備受損。",
  },
  {
    value: "other",
    label: "其他",
    description: "不屬於上述類型，但仍可先留下觀測。",
  },
  {
    value: "unknown",
    label: "不確定",
    description: "先保留原文，不強迫分類。",
  },
];

export const urgencyOptions: Array<V1Option<V1Urgency>> = [
  {
    value: "critical",
    label: "非常急迫",
    description: "回報者主觀感覺可能涉及立即人身危險。",
  },
  {
    value: "high",
    label: "急迫",
    description: "回報者主觀認為需要很快處理。",
  },
  {
    value: "medium",
    label: "需要注意",
    description: "需要整理與追蹤，但不代表已排定優先順序。",
  },
  {
    value: "low",
    label: "可稍後確認",
    description: "仍需保留，但回報者主觀上不覺得立即。",
  },
  {
    value: "unknown",
    label: "不確定",
    description: "不強迫回報者判斷急迫程度。",
  },
];

export const supplementFieldOptions: Array<V1Option<V1SupplementField>> = [
  {
    value: "what",
    label: "發生什麼事",
    description: "補充原始描述或需求內容。",
  },
  {
    value: "method",
    label: "我是怎麼知道的",
    description: "補充資訊取得方式。",
  },
  {
    value: "time",
    label: "觀測時間",
    description: "補充看到、聽到或得知的時間。",
  },
  {
    value: "location",
    label: "地點或範圍",
    description: "補充文字地點，不使用地圖 API。",
  },
  {
    value: "role",
    label: "回報者角色",
    description: "補充自己和事件的關係。",
  },
  {
    value: "kind",
    label: "可能類型",
    description: "補充主觀分類，不是正式分類。",
  },
  {
    value: "urgency",
    label: "主觀急迫感",
    description: "補充主觀感受，不是系統判定。",
  },
  {
    value: "other",
    label: "其他",
    description: "其他可追溯觀測。",
  },
];

export const onSiteOptions: Array<V1Option<V1OnSiteState>> = [
  {
    value: "on_site",
    label: "我在現場",
    description: "補充者表示人在現場。",
  },
  {
    value: "not_on_site",
    label: "我不在現場",
    description: "補充者不在現場，需保留限制。",
  },
  {
    value: "unknown",
    label: "不確定",
    description: "目前無法判斷是否在現場。",
  },
];

export const transferStateOptions: Array<V1Option<V1TransferState>> = [
  {
    value: "direct",
    label: "不是轉述",
    description: "補充者表示不是轉述他人。",
  },
  {
    value: "secondhand",
    label: "只是轉述",
    description: "補充者表示內容來自轉述。",
  },
  {
    value: "unknown",
    label: "不確定",
    description: "目前無法判斷是否為轉述。",
  },
];

export function labelForOption<T extends string>(
  options: Array<V1Option<T>>,
  value: T,
) {
  return options.find((option) => option.value === value)?.label ?? value;
}

export function descriptionForOption<T extends string>(
  options: Array<V1Option<T>>,
  value: T,
) {
  return options.find((option) => option.value === value)?.description ?? "";
}
