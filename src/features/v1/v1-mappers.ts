import type { Phase0MessyRecord } from "../phase-0/phase0-types";
import type { V1Observation } from "./v1-types";

export function mapPhase0ReportsToObservations(
  records: Phase0MessyRecord[],
): V1Observation[] {
  return records.map((record) => ({
    id: record.id,
    source: "phase0_raw",
    originalRecordId: record.id,
    text: record.rawText,
    knowledgeMethod: "unknown",
    knowledgeMethodNote:
      "由 Phase 0 原始資訊轉入；原文未必能判斷回報者怎麼知道。",
    observedAt: record.updatedAt,
    locationDescription: "請人工從原文辨識地點或範圍；不可補真實地址。",
    reporterRole: "unknown",
    reporterRoleNote: "Phase 0 原始資訊未整理成正式回報者角色。",
    kind: "unknown",
    kindNote: "保留原文，不把 AI 或 UI 推測當成正式分類。",
    urgency: "unknown",
    urgencyNote: "尚未由人類整理，不能從文字自動判斷優先順序。",
    reviewState:
      record.verificationStatus === "unverified"
        ? "unverified_source"
        : "needs_review",
    sourceType: record.sourceType,
    originalVerificationStatus: record.verificationStatus,
    createdAt: record.updatedAt,
    supplements: [],
  }));
}

export function getReviewStateLabel(state: V1Observation["reviewState"]) {
  const labels: Record<V1Observation["reviewState"], string> = {
    needs_review: "待人工確認",
    unverified_source: "原始資訊未查核",
    supplemented_unreviewed: "有人補充觀測，尚未人工確認",
  };

  return labels[state];
}

export function getUnsafeReasons(observation: V1Observation) {
  const reasons = new Set<string>();

  if (observation.reviewState === "needs_review") {
    reasons.add("目前仍是待人工確認，不能直接作為行動依據。");
  }

  if (observation.reviewState === "unverified_source") {
    reasons.add("原始資訊未查核，不能直接作為行動依據。");
  }

  if (observation.reviewState === "supplemented_unreviewed") {
    reasons.add("有人補充觀測，但補充內容尚未人工查核。");
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
