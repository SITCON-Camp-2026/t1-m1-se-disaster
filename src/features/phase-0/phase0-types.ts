// Phase 0 only. This is not the formal data contract.
export type Phase0PossibleKind =
  | "help_request_candidate"
  | "site_status_candidate"
  | "task_candidate"
  | "assignment_candidate"
  | "announcement_candidate"
  | "unknown";

export type Phase0Confidence = "low" | "medium" | "high";

export type Phase0SuggestedNextStep =
  | "keep_raw"
  | "ask_for_more_info"
  | "send_to_human_review"
  | "create_candidate_report"
  | "create_site_update_suggestion"
  | "do_not_use_yet";

export type Phase0MessyRecord = {
  id: string;
  rawText: string;
  sourceType: string;
  verificationStatus: string;
  updatedAt: string;
};

export type Phase0JudgementDraft = {
  messyRecordId: string;
  possibleKind: Phase0PossibleKind;
  confidence: Phase0Confidence;
  evidence: string[];
  blockers: string[];
  suggestedNextStep: Phase0SuggestedNextStep;
  unsafeToActDirectly: boolean;
  humanReviewNote?: string;
};

export type Phase0InfoRequestStatus =
  "not_requested" | "requested_no_reply" | "replied";

export type Phase0MissingField =
  | "location"
  | "contact"
  | "reporter"
  | "createdAt"
  | "updatedAt"
  | "reporterRole";

export type Phase0InfoRequestChannel = "contact" | "public_call";

export type Phase0InfoRequest = {
  reportId: string;
  missingFields: Phase0MissingField[];
  channel: Phase0InfoRequestChannel;
  status: Phase0InfoRequestStatus;
  requestedAt: string;
  replySummary: string;
  repliedAt?: string;
};
