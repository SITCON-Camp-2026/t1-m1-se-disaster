import { fireEvent, render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it } from "vitest";
import { App } from "../src/app/App";

describe("App", () => {
  beforeEach(() => {
    window.history.pushState({}, "", "/");
  });

  it("renders starter title", () => {
    render(<App />);
    expect(screen.getByText("災害資訊整理工作台")).toBeInTheDocument();
  });

  it("keeps the home page focused on phase 0 tabs", () => {
    render(<App />);

    expect(
      screen.getByRole("button", { name: "原始資訊" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "整理工作台" }),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "通報" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "地點" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "志工任務" }),
    ).not.toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "人員指派" }),
    ).not.toBeInTheDocument();
  });

  it("shows review states in the phase 0 workbench", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));

    expect(
      screen.getByText("先找出缺少的欄位，再向聯絡人或公開徵集補充資訊。"),
    ).toBeInTheDocument();
    expect(screen.getAllByText("待人工確認").length).toBeGreaterThan(0);
    expect(screen.getAllByText("未查核").length).toBeGreaterThan(0);
  });

  it("moves info requests from pending to replied in the workbench", () => {
    render(<App />);

    fireEvent.click(screen.getByRole("button", { name: "整理工作台" }));

    expect(
      screen.getByRole("heading", { name: "M-001 缺失欄位" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("缺失欄位：location：地點")).toBeChecked();
    expect(screen.getByLabelText("缺失欄位：contact：聯絡方式")).toBeChecked();
    expect(
      screen.getByLabelText("缺失欄位：reporterRole：回報者角色"),
    ).toBeChecked();
    expect(screen.getByLabelText("送出方式")).toHaveDisplayValue(
      "公開徵集補充資訊",
    );
    expect(screen.getByLabelText("目前查核狀態")).toHaveDisplayValue(
      "待人工確認，不可顯示為已確認。",
    );
    expect(screen.getByLabelText("人工檢查提醒")).toHaveDisplayValue(
      "這筆仍是待確認或未查核；補充資訊回覆後也不能直接變成志工任務。",
    );

    fireEvent.change(screen.getByLabelText("location：地點"), {
      target: { value: "原文只提供模糊地點，等待補充。" },
    });
    fireEvent.change(screen.getByLabelText("reporterRole：回報者角色"), {
      target: { value: "需要確認是否為當事人或轉述者。" },
    });

    fireEvent.click(screen.getByRole("button", { name: "送出補充資訊申請" }));

    expect(screen.getByText(/申請：/)).toBeInTheDocument();
    expect(
      screen.getAllByText("原文只提供模糊地點，等待補充。").length,
    ).toBeGreaterThanOrEqual(2);
    expect(
      screen.getAllByText("需要確認是否為當事人或轉述者。").length,
    ).toBeGreaterThanOrEqual(2);
    expect(screen.getByLabelText("回覆摘要")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("回覆摘要"), {
      target: { value: "補充者回覆了地點線索，但仍需人工檢查。" },
    });
    fireEvent.click(screen.getByRole("button", { name: "標記為已回覆" }));

    expect(
      screen.getByText("補充者回覆了地點線索，但仍需人工檢查。"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("已回覆不代表已確認，仍需要人工檢查。"),
    ).toBeInTheDocument();
  });

  it("renders the v1 observation workbench without confirmed states", () => {
    window.history.pushState({}, "", "/v1/");
    render(<App />);

    expect(
      screen.getByRole("heading", {
        name: "觀測收集與可靠性整理工作台",
      }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("v1 訊號摘要")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        name: "先留下你知道的事，不需要假裝已確認。",
      }),
    ).toBeInTheDocument();
    expect(screen.queryByText(/^needs_review$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^unverified$/)).not.toBeInTheDocument();
    expect(screen.queryByText(/^已確認$/)).not.toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("補充內容"), {
      target: { value: "我只能補充地點範圍，還沒有確認需求是否仍存在。" },
    });
    fireEvent.click(screen.getByRole("button", { name: "送出補充觀測" }));

    expect(
      screen.getByText("我只能補充地點範圍，還沒有確認需求是否仍存在。"),
    ).toBeInTheDocument();
    expect(
      screen.getAllByText("有人補充觀測，尚未人工確認").length,
    ).toBeGreaterThan(0);
    expect(screen.queryByText(/^已確認$/)).not.toBeInTheDocument();
  });
});
