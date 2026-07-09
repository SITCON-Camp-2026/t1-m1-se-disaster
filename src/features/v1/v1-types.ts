export type V1KnowledgeMethod =
  | "direct_seen"
  | "direct_heard"
  | "unclear_sense"
  | "told_by_other"
  | "reposted"
  | "unknown";

export type V1ReporterRole =
  | "affected_person"
  | "on_site_person"
  | "family"
  | "volunteer"
  | "secondhand_reporter"
  | "unknown";

export type V1ObservationKind =
  | "medical"
  | "traffic"
  | "supplies"
  | "cleanup"
  | "shelter"
  | "infrastructure"
  | "other"
  | "unknown";

export type V1Urgency = "critical" | "high" | "medium" | "low" | "unknown";

export type V1ReviewState =
  "needs_review" | "unverified_source" | "supplemented_unreviewed";

export type V1ObservationSource = "phase0_raw" | "user_observation";

export type V1SupplementField =
  | "what"
  | "method"
  | "time"
  | "location"
  | "role"
  | "kind"
  | "urgency"
  | "other";

export type V1OnSiteState = "on_site" | "not_on_site" | "unknown";

export type V1TransferState = "direct" | "secondhand" | "unknown";

export type V1Supplement = {
  id: string;
  field: V1SupplementField;
  fieldNote: string;
  content: string;
  knowledgeMethod: V1KnowledgeMethod;
  knowledgeMethodNote: string;
  observedAt: string;
  onSiteState: V1OnSiteState;
  transferState: V1TransferState;
  createdAt: string;
};

export type V1Observation = {
  id: string;
  source: V1ObservationSource;
  originalRecordId?: string;
  text: string;
  knowledgeMethod: V1KnowledgeMethod;
  knowledgeMethodNote: string;
  observedAt: string;
  locationDescription: string;
  reporterRole: V1ReporterRole;
  reporterRoleNote: string;
  kind: V1ObservationKind;
  kindNote: string;
  urgency: V1Urgency;
  urgencyNote: string;
  reviewState: V1ReviewState;
  sourceType: string;
  originalVerificationStatus?: string;
  createdAt: string;
  supplements: V1Supplement[];
};

export type V1ObservationForm = {
  text: string;
  knowledgeMethod: V1KnowledgeMethod;
  knowledgeMethodNote: string;
  observedAt: string;
  locationDescription: string;
  reporterRole: V1ReporterRole;
  reporterRoleNote: string;
  kind: V1ObservationKind;
  kindNote: string;
  urgency: V1Urgency;
  urgencyNote: string;
};

export type V1SupplementForm = {
  field: V1SupplementField;
  fieldNote: string;
  content: string;
  knowledgeMethod: V1KnowledgeMethod;
  knowledgeMethodNote: string;
  observedAt: string;
  onSiteState: V1OnSiteState;
  transferState: V1TransferState;
};
