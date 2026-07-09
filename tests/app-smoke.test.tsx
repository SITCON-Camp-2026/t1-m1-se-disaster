import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { App } from "../src/app/App";

describe("App", () => {
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
    expect(screen.getByLabelText("location：地點")).toBeChecked();
    expect(screen.getByLabelText("contact：聯絡方式")).toBeChecked();
    expect(screen.getByLabelText("reporterRole：回報者角色")).toBeChecked();
    expect(screen.getByText("公開徵集補充資訊")).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "送出補充資訊申請" }));

    expect(screen.getByText(/申請：/)).toBeInTheDocument();
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
});
