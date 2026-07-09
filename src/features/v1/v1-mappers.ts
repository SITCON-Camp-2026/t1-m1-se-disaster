import type { Phase0MessyRecord } from "../phase-0/phase0-types";
import type {
  V1KnowledgeMethod,
  V1Observation,
  V1ObservationKind,
  V1ReporterRole,
  V1ReviewState,
  V1Urgency,
} from "./v1-types";

type DemoObservationDraft = {
  knowledgeMethod: V1KnowledgeMethod;
  knowledgeMethodNote: string;
  locationDescription: string;
  reporterRole: V1ReporterRole;
  reporterRoleNote: string;
  kind: V1ObservationKind;
  kindNote: string;
  urgency: V1Urgency;
  urgencyNote: string;
  reviewState?: V1ReviewState;
};

const fallbackDemoDraft: DemoObservationDraft = {
  knowledgeMethod: "unknown",
  knowledgeMethodNote: "示範假資料：取得方式尚未補上，請人工回到原文確認。",
  locationDescription: "示範假資料：位置尚未整理，只能先保留模糊範圍。",
  reporterRole: "unknown",
  reporterRoleNote: "示範假資料：回報者角色尚未確認。",
  kind: "unknown",
  kindNote: "示範假資料：目前只作為候選分類，不是正式分類。",
  urgency: "unknown",
  urgencyNote: "示範假資料：尚未由人類判斷急迫程度。",
};

const demoDraftsByRecordId: Record<string, DemoObservationDraft> = {
  "M-001": {
    knowledgeMethod: "told_by_other",
    knowledgeMethodNote:
      "示範假資料：整理者先記為社群轉述，仍需找到原回報者確認。",
    locationDescription: "示範假資料：光復車站後方一帶，靠近舊店面地標。",
    reporterRole: "secondhand_reporter",
    reporterRoleNote: "示範假資料：目前像是轉述者，不視為現場目擊。",
    kind: "cleanup",
    kindNote: "示範假資料：先標成清理或人力需求，實際內容待人工確認。",
    urgency: "medium",
    urgencyNote: "示範假資料：看起來需要追蹤，但不是系統優先順序。",
  },
  "M-002": {
    knowledgeMethod: "direct_heard",
    knowledgeMethodNote: "示範假資料：假設來自志工口頭盤點，下午狀態仍需更新。",
    locationDescription: "示範假資料：溪畔活動中心物資領取區附近。",
    reporterRole: "volunteer",
    reporterRoleNote: "示範假資料：先記為值守志工回報，尚未核對名單。",
    kind: "supplies",
    kindNote: "示範假資料：與雨鞋庫存相關，不能當成即時庫存。",
    urgency: "low",
    urgencyNote: "示範假資料：可稍後確認，但需注意庫存可能變動。",
  },
  "M-003": {
    knowledgeMethod: "direct_seen",
    knowledgeMethodNote:
      "示範假資料：先假設現場有人更新需求，但仍需確認時間點。",
    locationDescription: "示範假資料：老街口服務點周邊。",
    reporterRole: "on_site_person",
    reporterRoleNote: "示範假資料：可能人在現場，但角色與權限未確認。",
    kind: "infrastructure",
    kindNote: "示範假資料：看起來偏水電檢修，不代表已建立任務。",
    urgency: "medium",
    urgencyNote: "示範假資料：需要整理與追蹤，不能自動排優先序。",
  },
  "M-004": {
    knowledgeMethod: "reposted",
    knowledgeMethodNote:
      "示範假資料：群組轉傳訊息，可能與其他雨鞋資訊重複或過期。",
    locationDescription: "示範假資料：溪畔活動中心，實際領取點待確認。",
    reporterRole: "secondhand_reporter",
    reporterRoleNote: "示範假資料：轉傳者不一定在現場。",
    kind: "supplies",
    kindNote: "示範假資料：先作為物資線索，不當成可直接前往領取。",
    urgency: "low",
    urgencyNote: "示範假資料：可能只是提醒，不是派工或領取指示。",
  },
  "M-005": {
    knowledgeMethod: "reposted",
    knowledgeMethodNote: "示範假資料：截圖來源不明，日期與公告身分都待確認。",
    locationDescription: "示範假資料：疑似道路封閉範圍，尚未確認路段。",
    reporterRole: "secondhand_reporter",
    reporterRoleNote: "示範假資料：目前只有截圖轉傳者，沒有公告發布者。",
    kind: "traffic",
    kindNote: "示範假資料：先標成交通或道路資訊，不能當成官方封路。",
    urgency: "high",
    urgencyNote: "示範假資料：若影響通行需快速確認，但不是已確認警示。",
  },
  "M-006": {
    knowledgeMethod: "direct_heard",
    knowledgeMethodNote: "示範假資料：兩位志工說法衝突，需保留兩邊版本。",
    locationDescription: "示範假資料：學校側門與附近停留空間。",
    reporterRole: "volunteer",
    reporterRoleNote: "示範假資料：志工回報，但尚未確認是否同一時間觀測。",
    kind: "shelter",
    kindNote: "示範假資料：先當作集合點或安置線索，需確認安全性。",
    urgency: "high",
    urgencyNote: "示範假資料：有淹水衝突訊息，需優先人工釐清。",
  },
  "M-007": {
    knowledgeMethod: "reposted",
    knowledgeMethodNote:
      "示範假資料：社群名單可能是昨天資料，不能當成今日可用。",
    locationDescription: "示範假資料：外部工班聯繫線索，沒有穩定服務點。",
    reporterRole: "secondhand_reporter",
    reporterRoleNote: "示範假資料：留言者與工班關係不明。",
    kind: "infrastructure",
    kindNote: "示範假資料：可能是水電支援線索，不能直接派案。",
    urgency: "medium",
    urgencyNote: "示範假資料：需要追蹤是否仍可支援。",
  },
  "M-008": {
    knowledgeMethod: "direct_heard",
    knowledgeMethodNote: "示範假資料：現場口頭提醒，但原因不明。",
    locationDescription: "示範假資料：A 區，需補上更清楚的範圍描述。",
    reporterRole: "on_site_person",
    reporterRoleNote: "示範假資料：可能是現場者，但未確認負責範圍。",
    kind: "other",
    kindNote: "示範假資料：原因不明，暫不分類成任務完成或危險。",
    urgency: "high",
    urgencyNote: "示範假資料：可能影響派人，需要先問清楚原因。",
  },
  "M-009": {
    knowledgeMethod: "direct_seen",
    knowledgeMethodNote:
      "組織演練資料：實地核查員已在現場確認入口公告與報到限制。",
    locationDescription: "組織演練資料：光復車站東側出口臨時集合點。",
    reporterRole: "volunteer",
    reporterRoleNote: "組織演練資料：由組織內部現場核查志工回報。",
    kind: "shelter",
    kindNote: "組織演練資料：集合點開放條件已可交給協調組執行。",
    urgency: "medium",
    urgencyNote: "組織演練資料：可通知已報到清淤志工依規則前往。",
    reviewState: "field_checked_actionable",
  },
  "M-010": {
    knowledgeMethod: "direct_seen",
    knowledgeMethodNote: "組織演練資料：實地核查員已完成現場物資盤點。",
    locationDescription: "組織演練資料：溪畔活動中心現場物資區與登記服務台。",
    reporterRole: "volunteer",
    reporterRoleNote: "組織演練資料：由值守志工與核查員共同回報。",
    kind: "supplies",
    kindNote: "組織演練資料：雨鞋庫存與水電登記分流已可交給現場組執行。",
    urgency: "medium",
    urgencyNote: "組織演練資料：可立即更新物資引導與服務台指示。",
    reviewState: "field_checked_actionable",
  },
  "M-011": {
    knowledgeMethod: "told_by_other",
    knowledgeMethodNote: "示範假資料：志工代長者轉述，仍需確認長者同意與細節。",
    locationDescription: "示範假資料：大進路口往溪邊方向的模糊住家範圍。",
    reporterRole: "volunteer",
    reporterRoleNote: "示範假資料：志工代述，不代表當事人已授權公開完整資訊。",
    kind: "cleanup",
    kindNote: "示範假資料：可能是搬運或清理需求，不能直接派工。",
    urgency: "medium",
    urgencyNote: "示範假資料：需要人工補問位置、同意與可協助內容。",
  },
  "M-012": {
    knowledgeMethod: "told_by_other",
    knowledgeMethodNote: "示範假資料：外地家屬來電，家屬不在現場且位置未確認。",
    locationDescription: "示範假資料：光復老街附近的大範圍線索。",
    reporterRole: "family",
    reporterRoleNote: "示範假資料：家屬代為求助，仍需確認親友現況與位置。",
    kind: "medical",
    kindNote: "示範假資料：疑似藥品協助線索，不等於醫療任務成立。",
    urgency: "critical",
    urgencyNote: "示範假資料：可能涉及藥品，但必須先人工確認。",
  },
};

export function mapPhase0ReportsToObservations(
  records: Phase0MessyRecord[],
): V1Observation[] {
  return records.map((record) => {
    const demoDraft = demoDraftsByRecordId[record.id] ?? fallbackDemoDraft;

    return {
      id: record.id,
      source: "phase0_raw",
      originalRecordId: record.id,
      text: record.rawText,
      knowledgeMethod: demoDraft.knowledgeMethod,
      knowledgeMethodNote: demoDraft.knowledgeMethodNote,
      observedAt: record.updatedAt,
      locationDescription: demoDraft.locationDescription,
      reporterRole: demoDraft.reporterRole,
      reporterRoleNote: demoDraft.reporterRoleNote,
      kind: demoDraft.kind,
      kindNote: demoDraft.kindNote,
      urgency: demoDraft.urgency,
      urgencyNote: demoDraft.urgencyNote,
      reviewState:
        demoDraft.reviewState ??
        (record.verificationStatus === "unverified"
          ? "unverified_source"
          : "needs_review"),
      sourceType: record.sourceType,
      originalVerificationStatus: record.verificationStatus,
      createdAt: record.updatedAt,
      supplements: [],
    };
  });
}

export function getReviewStateLabel(state: V1Observation["reviewState"]) {
  const labels: Record<V1Observation["reviewState"], string> = {
    needs_review: "待人工確認",
    unverified_source: "原始資訊未查核",
    supplemented_unreviewed: "有人補充觀測，尚未人工確認",
    field_checked_actionable: "組織實地核查完成，可行動",
  };

  return labels[state];
}

export function getUnsafeReasons(observation: V1Observation) {
  if (observation.reviewState === "field_checked_actionable") return [];

  const reasons = new Set<string>();
  const observationNotes = [
    observation.knowledgeMethodNote,
    observation.locationDescription,
    observation.reporterRoleNote,
    observation.kindNote,
    observation.urgencyNote,
  ].join(" ");

  if (observation.reviewState === "needs_review") {
    reasons.add("目前仍是待人工確認，不能直接作為行動依據。");
  }

  if (observation.reviewState === "unverified_source") {
    reasons.add("原始資訊未查核，不能直接作為行動依據。");
  }

  if (observation.reviewState === "supplemented_unreviewed") {
    reasons.add("有人補充觀測，但補充內容尚未人工查核。");
  }

  if (observationNotes.includes("示範假資料")) {
    reasons.add("欄位內容含有示範假資料，不能直接作為行動依據。");
  }

  if (
    observation.knowledgeMethod === "unknown" ||
    observation.knowledgeMethod === "unclear_sense"
  ) {
    reasons.add("資訊取得方式不明或只是模糊感知。");
  }

  if (
    observation.knowledgeMethod === "told_by_other" ||
    observation.knowledgeMethod === "reposted" ||
    observation.reporterRole === "secondhand_reporter"
  ) {
    reasons.add("內容含有轉述或轉傳，可能不是獨立觀測。");
  }

  if (observation.reporterRole === "unknown") {
    reasons.add("回報者角色尚未清楚，不能判斷是否為當事人或現場者。");
  }

  if (
    observation.locationDescription.trim().length === 0 ||
    observation.locationDescription.includes("不可補真實地址")
  ) {
    reasons.add("地點或範圍仍不完整，且不能自行補真實地址。");
  }

  if (observation.urgency !== "unknown") {
    reasons.add("急迫程度是回報者主觀感受，不是系統優先順序。");
  } else {
    reasons.add("尚未有人類整理過急迫程度。");
  }

  return Array.from(reasons);
}
