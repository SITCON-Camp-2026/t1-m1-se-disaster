import { useState } from "react";
import { RecordCard } from "../../components/RecordCard";
import { SourceLabel } from "../../components/SourceLabel";
import { StatusBadge } from "../../components/StatusBadge";
import { formatDateTime } from "../../lib/date";
import type {
  Phase0InfoRequest,
  Phase0InfoRequestChannel,
  Phase0MessyRecord,
  Phase0MissingField,
} from "./phase0-types";

const missingFieldLabels: Record<Phase0MissingField, string> = {
  location: "location：地點",
  contact: "contact：聯絡方式",
  reporter: "reporter：回報者",
  createdAt: "createdAt：建立時間",
  updatedAt: "updatedAt：更新時間",
  reporterRole: "reporterRole：回報者角色",
};

const requestChannelLabels: Record<Phase0InfoRequestChannel, string> = {
  contact: "向聯絡人要求補充",
  public_call: "公開徵集補充資訊",
};

function getRequestChannel(
  missingFields: Phase0MissingField[],
): Phase0InfoRequestChannel {
  return missingFields.includes("contact") ? "public_call" : "contact";
}

function getRequestForRecord(requests: Phase0InfoRequest[], reportId: string) {
  return requests.find((request) => request.reportId === reportId);
}

function hasUnsafeStatus(record: Phase0MessyRecord) {
  return (
    record.verificationStatus === "needs_review" ||
    record.verificationStatus === "unverified"
  );
}

export function Phase0Workbench({
  records,
  selectedRecordId,
  onSelect,
}: {
  records: Phase0MessyRecord[];
  selectedRecordId: string;
  onSelect: (recordId: string) => void;
}) {
  const [requests, setRequests] = useState<Phase0InfoRequest[]>([]);
  const [selectedFields, setSelectedFields] = useState<Phase0MissingField[]>([
    "location",
    "contact",
    "reporterRole",
  ]);
  const [replyDrafts, setReplyDrafts] = useState<Record<string, string>>({});

  const selectedRecord =
    records.find((record) => record.id === selectedRecordId) ?? records[0];
  const selectedRequest = getRequestForRecord(requests, selectedRecord.id);
  const pendingRequests = requests.filter(
    (request) => request.status === "requested_no_reply",
  );
  const repliedRequests = requests.filter(
    (request) => request.status === "replied",
  );
  const requestChannel = getRequestChannel(selectedFields);

  function toggleMissingField(field: Phase0MissingField) {
    setSelectedFields((current) =>
      current.includes(field)
        ? current.filter((item) => item !== field)
        : [...current, field],
    );
  }

  function selectRecord(recordId: string) {
    onSelect(recordId);
    const existingRequest = getRequestForRecord(requests, recordId);
    setSelectedFields(
      existingRequest?.missingFields ?? ["location", "contact", "reporterRole"],
    );
  }

  function submitRequest() {
    if (selectedFields.length === 0) return;

    const nextRequest: Phase0InfoRequest = {
      reportId: selectedRecord.id,
      missingFields: selectedFields,
      channel: requestChannel,
      status: "requested_no_reply",
      requestedAt: new Date().toISOString(),
      replySummary: "",
    };

    setRequests((current) => [
      ...current.filter((request) => request.reportId !== selectedRecord.id),
      nextRequest,
    ]);
  }

  function markReplied(reportId: string) {
    const replySummary = replyDrafts[reportId]?.trim();
    if (!replySummary) return;

    setRequests((current) =>
      current.map((request) =>
        request.reportId === reportId
          ? {
              ...request,
              status: "replied",
              replySummary,
              repliedAt: new Date().toISOString(),
            }
          : request,
      ),
    );
    setReplyDrafts((current) => ({ ...current, [reportId]: "" }));
  }

  function resetRequest(reportId: string) {
    setRequests((current) =>
      current.filter((request) => request.reportId !== reportId),
    );
    setReplyDrafts((current) => {
      const next = { ...current };
      delete next[reportId];
      return next;
    });
  }

  function renderRequestCard(request: Phase0InfoRequest) {
    const record = records.find((item) => item.id === request.reportId);
    if (!record) return null;

    return (
      <article className="request-card" key={request.reportId}>
        <div className="request-card__header">
          <button type="button" onClick={() => selectRecord(record.id)}>
            {record.id}
          </button>
          <span>{requestChannelLabels[request.channel]}</span>
        </div>
        <p>{record.rawText}</p>
        <div className="request-card__meta">
          <SourceLabel sourceType={record.sourceType} />
          <span>申請：{formatDateTime(request.requestedAt)}</span>
        </div>
        <div className="missing-list">
          {request.missingFields.map((field) => (
            <span key={field}>{missingFieldLabels[field]}</span>
          ))}
        </div>

        {request.status === "requested_no_reply" ? (
          <div className="reply-box">
            <label>
              回覆摘要
              <textarea
                placeholder="只記錄對方補充了什麼；有回覆仍不代表已確認"
                value={replyDrafts[record.id] ?? ""}
                onChange={(event) =>
                  setReplyDrafts((current) => ({
                    ...current,
                    [record.id]: event.target.value,
                  }))
                }
              />
            </label>
            <button
              type="button"
              onClick={() => markReplied(record.id)}
              disabled={!replyDrafts[record.id]?.trim()}
            >
              標記為已回覆
            </button>
          </div>
        ) : (
          <div className="reply-summary">
            <strong>回覆摘要</strong>
            <p>{request.replySummary}</p>
            {request.repliedAt ? (
              <span>回覆：{formatDateTime(request.repliedAt)}</span>
            ) : null}
            <em>已回覆不代表已確認，仍需要人工檢查。</em>
          </div>
        )}
      </article>
    );
  }

  return (
    <div className="workbench info-request-workbench">
      <div className="workbench__intro">
        <p className="eyebrow">補充資訊申請工作台</p>
        <h2>先找出缺少的欄位，再向聯絡人或公開徵集補充資訊。</h2>
        <p>
          這裡只讀 Phase 0 原始資訊，申請與回覆只存在本次畫面的 React state。
          「已回覆」不等於「已確認」，不能直接變成志工任務。
        </p>
      </div>

      <div className="request-layout">
        <aside className="record-queue" aria-label="原始資訊清單">
          <h3>原始資訊</h3>
          {records.map((record) => {
            const request = getRequestForRecord(requests, record.id);
            return (
              <button
                className={record.id === selectedRecord.id ? "active" : ""}
                key={record.id}
                type="button"
                onClick={() => selectRecord(record.id)}
              >
                <span>{record.id}</span>
                <StatusBadge status={record.verificationStatus} />
                <small>
                  {request?.status === "requested_no_reply"
                    ? "未回覆"
                    : request?.status === "replied"
                      ? "已回覆，仍需檢查"
                      : "尚未申請"}
                </small>
              </button>
            );
          })}
        </aside>

        <section className="request-builder" aria-label="要求更多資訊">
          <RecordCard record={selectedRecord} />

          <div className="request-form">
            <div className="request-form__header">
              <div>
                <p className="eyebrow">要求更多資訊</p>
                <h3>{selectedRecord.id} 缺失欄位</h3>
              </div>
              {selectedRequest ? (
                <button
                  type="button"
                  onClick={() => resetRequest(selectedRecord.id)}
                >
                  清除這筆申請
                </button>
              ) : null}
            </div>

            <p>
              勾選這筆資料缺少、模糊或需要重新確認的欄位。若缺少
              contact，工作台會改用公開徵集補充資訊。
            </p>

            <div className="missing-field-grid">
              {(Object.keys(missingFieldLabels) as Phase0MissingField[]).map(
                (field) => (
                  <label key={field} className="missing-field-option">
                    <input
                      type="checkbox"
                      checked={selectedFields.includes(field)}
                      onChange={() => toggleMissingField(field)}
                    />
                    <span>{missingFieldLabels[field]}</span>
                  </label>
                ),
              )}
            </div>

            <dl className="request-preview">
              <div>
                <dt>送出方式</dt>
                <dd>{requestChannelLabels[requestChannel]}</dd>
              </div>
              <div>
                <dt>目前查核狀態</dt>
                <dd>
                  <StatusBadge status={selectedRecord.verificationStatus} />
                </dd>
              </div>
              <div>
                <dt>人工檢查提醒</dt>
                <dd>
                  {hasUnsafeStatus(selectedRecord)
                    ? "這筆仍是待確認或未查核。"
                    : "仍需人類確認補充資訊是否可信。"}
                </dd>
              </div>
            </dl>

            <button
              className="primary-action"
              type="button"
              onClick={submitRequest}
              disabled={selectedFields.length === 0}
            >
              送出補充資訊申請
            </button>
          </div>
        </section>

        <section className="request-board" aria-label="補充資訊狀態">
          <div className="request-column">
            <h3>未回覆</h3>
            <p>已送出申請，但尚未收到聯絡人或公開徵集的補充。</p>
            {pendingRequests.length === 0 ? (
              <div className="empty-state">目前沒有未回覆申請</div>
            ) : (
              pendingRequests.map(renderRequestCard)
            )}
          </div>

          <div className="request-column">
            <h3>已回覆</h3>
            <p>已有補充內容，但仍不是已確認資料。</p>
            {repliedRequests.length === 0 ? (
              <div className="empty-state">目前沒有已回覆資料</div>
            ) : (
              repliedRequests.map(renderRequestCard)
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
