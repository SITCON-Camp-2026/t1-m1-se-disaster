import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  descriptionForOption,
  knowledgeMethodOptions,
  labelForOption,
  observationKindOptions,
  onSiteOptions,
  reporterRoleOptions,
  supplementFieldOptions,
  transferStateOptions,
  urgencyOptions,
} from "./v1-options";
import {
  getReviewStateLabel,
  getUnsafeReasons,
  mapPhase0ReportsToObservations,
} from "./v1-mappers";
import type { Phase0MessyRecord } from "../phase-0/phase0-types";
import type {
  V1Observation,
  V1ObservationForm,
  V1Supplement,
  V1SupplementForm,
} from "./v1-types";
import { formatDateTime } from "../../lib/date";
import { labelForStatus } from "../../components/status-labels";

const sourceTypeLabels: Record<string, string> = {
  field_report: "現場回報",
  phone_call: "電話",
  social_post: "社群轉錄",
  official_notice: "公告類資訊",
  volunteer_update: "志工更新",
  user_input: "本次新增觀測",
};

const emptyObservationForm: V1ObservationForm = {
  text: "",
  knowledgeMethod: "unknown",
  knowledgeMethodNote: "",
  observedAt: "",
  locationDescription: "",
  reporterRole: "unknown",
  reporterRoleNote: "",
  kind: "unknown",
  kindNote: "",
  urgency: "unknown",
  urgencyNote: "",
};

const emptySupplementForm: V1SupplementForm = {
  field: "other",
  fieldNote: "",
  content: "",
  knowledgeMethod: "unknown",
  knowledgeMethodNote: "",
  observedAt: "",
  onSiteState: "unknown",
  transferState: "unknown",
};

function compactText(...parts: string[]) {
  return parts
    .map((part) => part.trim())
    .filter(Boolean)
    .join(" ");
}

function matchesQuery(observation: V1Observation, query: string) {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return true;

  const haystack = compactText(
    observation.id,
    observation.text,
    observation.locationDescription,
    observation.knowledgeMethodNote,
    observation.reporterRoleNote,
    observation.kindNote,
    observation.urgencyNote,
    ...observation.supplements.map((supplement) =>
      compactText(supplement.content, supplement.fieldNote),
    ),
  ).toLowerCase();

  return haystack.includes(normalizedQuery);
}

function findRelatedObservations(
  observations: V1Observation[],
  query: string,
  limit = 5,
) {
  const normalizedQuery = query.trim();
  if (normalizedQuery.length < 2) return [];

  return observations
    .filter((observation) => matchesQuery(observation, normalizedQuery))
    .slice(0, limit);
}

function toDateInputValue(date: Date) {
  return new Date(date.getTime() - date.getTimezoneOffset() * 60000)
    .toISOString()
    .slice(0, 16);
}

function renderOptionDescription(description: string) {
  return description ? <small>{description}</small> : null;
}

function SignalBadge({ children }: { children: ReactNode }) {
  return <span className="v1-signal-badge">{children}</span>;
}

function FieldNoteSpacer() {
  return <small aria-hidden="true" className="v1-field-note-spacer" />;
}

function FormReminder({ children }: { children: ReactNode }) {
  return (
    <p className="v1-form-reminder" role="status">
      {children}
    </p>
  );
}

function V1Select<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: Array<{ value: T; label: string; description: string }>;
  onChange: (value: T) => void;
}) {
  const selectedDescription = descriptionForOption(options, value);

  return (
    <label>
      {label}
      <select
        value={value}
        onChange={(event) => onChange(event.target.value as T)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {renderOptionDescription(selectedDescription)}
    </label>
  );
}

function createObservationFromForm(
  form: V1ObservationForm,
  nextIndex: number,
): V1Observation {
  const now = new Date();

  return {
    id: `V1-O-${String(nextIndex).padStart(3, "0")}`,
    source: "user_observation",
    text: form.text.trim(),
    knowledgeMethod: form.knowledgeMethod,
    knowledgeMethodNote: form.knowledgeMethodNote.trim(),
    observedAt: form.observedAt || toDateInputValue(now),
    locationDescription: form.locationDescription.trim(),
    reporterRole: form.reporterRole,
    reporterRoleNote: form.reporterRoleNote.trim(),
    kind: form.kind,
    kindNote: form.kindNote.trim(),
    urgency: form.urgency,
    urgencyNote: form.urgencyNote.trim(),
    reviewState: "needs_review",
    sourceType: "user_input",
    createdAt: now.toISOString(),
    supplements: [],
  };
}

function createSupplementFromForm(
  form: V1SupplementForm,
  nextIndex: number,
): V1Supplement {
  const now = new Date();

  return {
    id: `V1-S-${String(nextIndex).padStart(3, "0")}`,
    field: form.field,
    fieldNote: form.fieldNote.trim(),
    content: form.content.trim(),
    knowledgeMethod: form.knowledgeMethod,
    knowledgeMethodNote: form.knowledgeMethodNote.trim(),
    observedAt: form.observedAt || toDateInputValue(now),
    onSiteState: form.onSiteState,
    transferState: form.transferState,
    createdAt: now.toISOString(),
  };
}

export function V1Workbench({ records }: { records: Phase0MessyRecord[] }) {
  const initialObservations = useMemo(
    () => mapPhase0ReportsToObservations(records),
    [records],
  );
  const [observations, setObservations] =
    useState<V1Observation[]>(initialObservations);
  const [selectedObservationId, setSelectedObservationId] = useState(
    initialObservations[0]?.id ?? "",
  );
  const [observationForm, setObservationForm] =
    useState<V1ObservationForm>(emptyObservationForm);
  const [supplementForm, setSupplementForm] =
    useState<V1SupplementForm>(emptySupplementForm);
  const [searchQuery, setSearchQuery] = useState("");

  const selectedObservation =
    observations.find(
      (observation) => observation.id === selectedObservationId,
    ) ?? observations[0];
  const reportRelatedObservations = findRelatedObservations(
    observations,
    compactText(
      observationForm.text,
      observationForm.locationDescription,
      observationForm.kindNote,
    ),
  );
  const visibleObservations = observations.filter((observation) =>
    matchesQuery(observation, searchQuery),
  );
  const totalSupplements = observations.reduce(
    (sum, observation) => sum + observation.supplements.length,
    0,
  );
  const secondhandSignals = observations.filter(
    (observation) =>
      observation.knowledgeMethod === "told_by_other" ||
      observation.knowledgeMethod === "reposted" ||
      observation.reporterRole === "secondhand_reporter",
  ).length;
  const onSiteSupplements = observations.reduce(
    (sum, observation) =>
      sum +
      observation.supplements.filter(
        (supplement) => supplement.onSiteState === "on_site",
      ).length,
    0,
  );

  function updateObservationForm<K extends keyof V1ObservationForm>(
    key: K,
    value: V1ObservationForm[K],
  ) {
    setObservationForm((current) => ({ ...current, [key]: value }));
  }

  function updateSupplementForm<K extends keyof V1SupplementForm>(
    key: K,
    value: V1SupplementForm[K],
  ) {
    setSupplementForm((current) => ({ ...current, [key]: value }));
  }

  function submitObservation() {
    if (!observationForm.text.trim()) return;

    const nextObservation = createObservationFromForm(
      observationForm,
      observations.filter(
        (observation) => observation.source === "user_observation",
      ).length + 1,
    );

    setObservations((current) => [nextObservation, ...current]);
    setSelectedObservationId(nextObservation.id);
    setObservationForm(emptyObservationForm);
  }

  function submitSupplement() {
    if (!selectedObservation || !supplementForm.content.trim()) return;

    const nextSupplement = createSupplementFromForm(
      supplementForm,
      totalSupplements + 1,
    );

    setObservations((current) =>
      current.map((observation) =>
        observation.id === selectedObservation.id
          ? {
              ...observation,
              reviewState: "supplemented_unreviewed",
              supplements: [...observation.supplements, nextSupplement],
            }
          : observation,
      ),
    );
    setSupplementForm(emptySupplementForm);
  }

  function renderRelatedList(items: V1Observation[]) {
    if (items.length === 0) {
      return (
        <div className="empty-state">
          輸入兩個字以上會搜尋疑似相關回報，不會自動合併。
        </div>
      );
    }

    return (
      <div className="v1-related-list">
        {items.map((observation) => (
          <button
            key={observation.id}
            type="button"
            onClick={() => setSelectedObservationId(observation.id)}
          >
            <strong>{observation.id}</strong>
            <span>{observation.text}</span>
          </button>
        ))}
      </div>
    );
  }

  if (!selectedObservation) {
    return <div className="empty-state">目前沒有可顯示的觀測</div>;
  }

  const unsafeReasons = getUnsafeReasons(selectedObservation);
  const isFieldCheckedActionable =
    selectedObservation.reviewState === "field_checked_actionable";
  const actionableReasons = [
    "組織演練設定：已有實地核查人員回報，地點、時間、角色與限制已可被內部協作者理解。",
    "這筆可交給組織內部協調組安排下一步，但仍需依組織安全流程執行。",
    "此狀態只套用在 v1 假資料示範，不代表 Phase 0 原始資訊本身已被真實查核。",
  ];
  const shouldAskForTransferDetails =
    observationForm.knowledgeMethod === "told_by_other" ||
    observationForm.knowledgeMethod === "reposted";
  const isMissingPlaceOrTime =
    !observationForm.observedAt ||
    observationForm.locationDescription.trim().length === 0;

  return (
    <div className="v1-workbench">
      <section className="workbench__intro v1-intro">
        <p className="eyebrow">v1 觀測收集與可靠性整理工作台</p>
        <h2>收集可追溯觀測，不把補充或人數當成已確認。</h2>
        <p>
          這個畫面仍只使用 Phase 0
          原始資訊。本次新增與補充都只存在前端狀態，目的在於保留來源方式、角色、時間、地點描述與不確定性。
        </p>
      </section>

      <section className="v1-signal-strip" aria-label="v1 訊號摘要">
        <div>
          <strong>{observations.length}</strong>
          <span>觀測總數</span>
        </div>
        <div>
          <strong>{totalSupplements}</strong>
          <span>補充觀測</span>
        </div>
        <div>
          <strong>{secondhandSignals}</strong>
          <span>轉述或轉傳訊號</span>
        </div>
        <div>
          <strong>{onSiteSupplements}</strong>
          <span>現場自述補充，未查核</span>
        </div>
      </section>

      <section className="v1-top-grid">
        <form className="v1-form" onSubmit={(event) => event.preventDefault()}>
          <div className="v1-section-heading">
            <p className="eyebrow">新增觀測</p>
            <h3>先留下你知道的事，不需要假裝已確認。</h3>
          </div>

          <label>
            我看到/聽到/知道了什麼？
            <textarea
              value={observationForm.text}
              onChange={(event) =>
                updateObservationForm("text", event.target.value)
              }
              placeholder="請用自己的話描述；可以不完整，但不要補不知道的內容。"
            />
          </label>

          <div className="v1-field-pair">
            <V1Select
              label="我怎麼知道的？"
              value={observationForm.knowledgeMethod}
              options={knowledgeMethodOptions}
              onChange={(value) =>
                updateObservationForm("knowledgeMethod", value)
              }
            />
            <label>
              補充說明：我怎麼知道的
              <input
                value={observationForm.knowledgeMethodNote}
                onChange={(event) =>
                  updateObservationForm(
                    "knowledgeMethodNote",
                    event.target.value,
                  )
                }
                placeholder="例如：在群組看到截圖、在現場聽到廣播"
              />
              <FieldNoteSpacer />
            </label>
          </div>

          {shouldAskForTransferDetails ? (
            <FormReminder>
              請補上是誰說的、什麼時候看到的。這仍是轉述或轉傳，後續需要人工確認。
            </FormReminder>
          ) : null}

          <div className="v1-field-pair">
            <label>
              我大概什麼時候知道的？
              <input
                type="datetime-local"
                value={observationForm.observedAt}
                onChange={(event) =>
                  updateObservationForm("observedAt", event.target.value)
                }
              />
            </label>
            <label>
              我能不能補充地點或範圍？
              <input
                value={observationForm.locationDescription}
                onChange={(event) =>
                  updateObservationForm(
                    "locationDescription",
                    event.target.value,
                  )
                }
                placeholder="只能文字描述，不使用地圖 API。"
              />
            </label>
          </div>

          {isMissingPlaceOrTime ? (
            <FormReminder>
              地點或時間可以先空白送出，但這筆觀測後續一定需要人工確認。
            </FormReminder>
          ) : null}

          <div className="v1-field-pair">
            <V1Select
              label="我是什麼角色？"
              value={observationForm.reporterRole}
              options={reporterRoleOptions}
              onChange={(value) => updateObservationForm("reporterRole", value)}
            />
            <label>
              補充說明：角色
              <input
                value={observationForm.reporterRoleNote}
                onChange={(event) =>
                  updateObservationForm("reporterRoleNote", event.target.value)
                }
                placeholder="例如：幫家人轉述、在現場值班"
              />
              <FieldNoteSpacer />
            </label>
          </div>

          <div className="v1-field-pair">
            <V1Select
              label="這可能屬於什麼類型？不確定也可以。"
              value={observationForm.kind}
              options={observationKindOptions}
              onChange={(value) => updateObservationForm("kind", value)}
            />
            <label>
              補充說明：類型
              <input
                value={observationForm.kindNote}
                onChange={(event) =>
                  updateObservationForm("kindNote", event.target.value)
                }
                placeholder="例如：看起來像物資資訊，但不確定"
              />
              <FieldNoteSpacer />
            </label>
          </div>

          <div className="v1-field-pair">
            <V1Select
              label="這看起來有多急？只是回報者主觀感受。"
              value={observationForm.urgency}
              options={urgencyOptions}
              onChange={(value) => updateObservationForm("urgency", value)}
            />
            <label>
              補充說明：主觀急迫感
              <input
                value={observationForm.urgencyNote}
                onChange={(event) =>
                  updateObservationForm("urgencyNote", event.target.value)
                }
                placeholder="例如：我不確定，但對方語氣很急"
              />
              <FieldNoteSpacer />
            </label>
          </div>

          <div className="v1-related-panel">
            <h4>輸入時搜尋疑似相關回報</h4>
            <p>疑似相關只代表值得比對，不代表同一事件，也不會自動合併。</p>
            {renderRelatedList(reportRelatedObservations)}
          </div>

          <button
            className="primary-action"
            type="button"
            onClick={submitObservation}
            disabled={!observationForm.text.trim()}
          >
            送出新觀測
          </button>
        </form>
      </section>

      <section className="v1-main-grid">
        <div className="v1-observation-list">
          <div className="v1-section-heading">
            <p className="eyebrow">已有回報列表</p>
            <h3>所有項目都仍需人工確認。</h3>
          </div>

          <label className="v1-list-search">
            搜尋已有回報
            <input
              value={searchQuery}
              onChange={(event) => setSearchQuery(event.target.value)}
              placeholder="輸入地點、需求、編號或關鍵字"
            />
          </label>

          {visibleObservations.map((observation) => (
            <button
              className={
                observation.id === selectedObservation.id ? "active" : ""
              }
              key={observation.id}
              type="button"
              onClick={() => setSelectedObservationId(observation.id)}
            >
              <span className="v1-card-topline">
                <strong>{observation.id}</strong>
                <em
                  className={`v1-review-state-label v1-review-state-label--${observation.reviewState}`}
                >
                  {getReviewStateLabel(observation.reviewState)}
                </em>
              </span>
              <span>{observation.text}</span>
              <span className="v1-mini-meta">
                {sourceTypeLabels[observation.sourceType] ??
                  observation.sourceType}
                {" · "}
                補充 {observation.supplements.length} 筆
              </span>
            </button>
          ))}
        </div>

        <article className="v1-detail">
          <div className="v1-detail__header">
            <div>
              <p className="eyebrow">觀測詳情</p>
              <h3>{selectedObservation.id}</h3>
            </div>
            <span
              className={`v1-review-state v1-review-state-label v1-review-state-label--${selectedObservation.reviewState}`}
            >
              {getReviewStateLabel(selectedObservation.reviewState)}
            </span>
          </div>

          <p className="v1-primary-text">{selectedObservation.text}</p>

          <div className="v1-signal-list">
            <SignalBadge>
              資訊取得方式：
              {labelForOption(
                knowledgeMethodOptions,
                selectedObservation.knowledgeMethod,
              )}
            </SignalBadge>
            <SignalBadge>
              回報者角色：
              {labelForOption(
                reporterRoleOptions,
                selectedObservation.reporterRole,
              )}
            </SignalBadge>
            <SignalBadge>
              主觀類型：
              {labelForOption(observationKindOptions, selectedObservation.kind)}
            </SignalBadge>
            <SignalBadge>
              主觀急迫感：
              {labelForOption(urgencyOptions, selectedObservation.urgency)}
            </SignalBadge>
          </div>

          <dl className="v1-detail-grid">
            <div>
              <dt>資訊取得方式</dt>
              <dd>
                {sourceTypeLabels[selectedObservation.sourceType] ??
                  selectedObservation.sourceType}
              </dd>
            </div>
            <div>
              <dt>觀測或更新時間</dt>
              <dd>{formatDateTime(selectedObservation.observedAt)}</dd>
            </div>
            <div>
              <dt>地點或範圍</dt>
              <dd>{selectedObservation.locationDescription || "尚未提供"}</dd>
            </div>
            <div>
              <dt>原始查核狀態</dt>
              <dd>
                {selectedObservation.originalVerificationStatus
                  ? labelForStatus(
                      selectedObservation.originalVerificationStatus,
                    )
                  : "本次新增"}
              </dd>
            </div>
            <div>
              <dt>取得方式說明</dt>
              <dd>{selectedObservation.knowledgeMethodNote || "尚未提供"}</dd>
            </div>
            <div>
              <dt>角色說明</dt>
              <dd>{selectedObservation.reporterRoleNote || "尚未提供"}</dd>
            </div>
            <div>
              <dt>類型說明</dt>
              <dd>{selectedObservation.kindNote || "尚未提供"}</dd>
            </div>
            <div>
              <dt>急迫感說明</dt>
              <dd>{selectedObservation.urgencyNote || "尚未提供"}</dd>
            </div>
          </dl>

          <div
            className={
              isFieldCheckedActionable ? "v1-action-box" : "v1-risk-box"
            }
          >
            <h4>
              {isFieldCheckedActionable
                ? "組織內部可行動條件"
                : "目前不能直接行動的原因"}
            </h4>
            <ul>
              {(isFieldCheckedActionable
                ? actionableReasons
                : unsafeReasons
              ).map((reason) => (
                <li key={reason}>{reason}</li>
              ))}
            </ul>
          </div>

          <section className="v1-supplements">
            <h4>補充觀測</h4>
            {selectedObservation.supplements.length === 0 ? (
              <div className="empty-state">目前還沒有補充觀測</div>
            ) : (
              selectedObservation.supplements.map((supplement) => (
                <article key={supplement.id}>
                  <div className="v1-card-topline">
                    <strong>
                      {labelForOption(supplementFieldOptions, supplement.field)}
                    </strong>
                    <em>待人工確認</em>
                  </div>
                  <p>{supplement.content}</p>
                  <dl className="v1-detail-grid">
                    <div>
                      <dt>補充欄位說明</dt>
                      <dd>{supplement.fieldNote || "尚未提供"}</dd>
                    </div>
                    <div>
                      <dt>我怎麼知道</dt>
                      <dd>
                        {labelForOption(
                          knowledgeMethodOptions,
                          supplement.knowledgeMethod,
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt>取得方式說明</dt>
                      <dd>{supplement.knowledgeMethodNote || "尚未提供"}</dd>
                    </div>
                    <div>
                      <dt>觀測或得知時間</dt>
                      <dd>{formatDateTime(supplement.observedAt)}</dd>
                    </div>
                    <div>
                      <dt>是否在現場</dt>
                      <dd>
                        {labelForOption(onSiteOptions, supplement.onSiteState)}
                      </dd>
                    </div>
                    <div>
                      <dt>是否只是轉述</dt>
                      <dd>
                        {labelForOption(
                          transferStateOptions,
                          supplement.transferState,
                        )}
                      </dd>
                    </div>
                  </dl>
                </article>
              ))
            )}
          </section>

          <form
            className="v1-form v1-supplement-form"
            onSubmit={(event) => event.preventDefault()}
          >
            <div className="v1-section-heading">
              <p className="eyebrow">我可以補充一個觀測</p>
              <h4>補充不是確認，送出後仍待人工查核。</h4>
            </div>

            <div className="v1-field-pair">
              <V1Select
                label="我補充的是哪個欄位？"
                value={supplementForm.field}
                options={supplementFieldOptions}
                onChange={(value) => updateSupplementForm("field", value)}
              />
              <label>
                補充欄位說明
                <input
                  value={supplementForm.fieldNote}
                  onChange={(event) =>
                    updateSupplementForm("fieldNote", event.target.value)
                  }
                  placeholder="例如：只補充地點範圍，沒有確認人數"
                />
                <FieldNoteSpacer />
              </label>
            </div>

            <label>
              補充內容
              <textarea
                value={supplementForm.content}
                onChange={(event) =>
                  updateSupplementForm("content", event.target.value)
                }
                placeholder="請描述你能補充的觀測，不要寫成已確認結論。"
              />
            </label>

            <div className="v1-field-pair">
              <V1Select
                label="我怎麼知道？"
                value={supplementForm.knowledgeMethod}
                options={knowledgeMethodOptions}
                onChange={(value) =>
                  updateSupplementForm("knowledgeMethod", value)
                }
              />
              <label>
                取得方式說明
                <input
                  value={supplementForm.knowledgeMethodNote}
                  onChange={(event) =>
                    updateSupplementForm(
                      "knowledgeMethodNote",
                      event.target.value,
                    )
                  }
                  placeholder="例如：剛剛在現場看到、從朋友轉述"
                />
                <FieldNoteSpacer />
              </label>
            </div>

            <div className="v1-field-pair">
              <label>
                我觀測或得知的時間
                <input
                  type="datetime-local"
                  value={supplementForm.observedAt}
                  onChange={(event) =>
                    updateSupplementForm("observedAt", event.target.value)
                  }
                />
                <FieldNoteSpacer />
              </label>
              <V1Select
                label="我是否在現場？"
                value={supplementForm.onSiteState}
                options={onSiteOptions}
                onChange={(value) => updateSupplementForm("onSiteState", value)}
              />
            </div>

            <V1Select
              label="我是否只是轉述？"
              value={supplementForm.transferState}
              options={transferStateOptions}
              onChange={(value) => updateSupplementForm("transferState", value)}
            />

            <button
              className="primary-action"
              type="button"
              onClick={submitSupplement}
              disabled={!supplementForm.content.trim()}
            >
              送出補充觀測
            </button>
          </form>
        </article>
      </section>
    </div>
  );
}
