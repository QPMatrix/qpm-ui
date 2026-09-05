import "../../test-setup";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "bun:test";

import { QPChatPanel } from "./chat-panel";
import { qpHasMessages } from "./chat-panel.utils";

async function setupUser() {
  const { default: userEvent } = await import("@testing-library/user-event");
  return userEvent.setup();
}

afterEach(() => {
  cleanup();
});

describe("QPChatPanel", () => {
  test("is a named region so AT can jump straight to the conversation", () => {
    const { getByRole } = render(<QPChatPanel label="Conversation" />);

    expect(getByRole("region", { name: "Conversation" })).toBeInTheDocument();
  });

  test("a visible title names the panel instead of `label`, never both", () => {
    const { getByRole, getByText } = render(<QPChatPanel label="Conversation" title="Support" />);

    expect(getByRole("region", { name: "Support" })).toBeInTheDocument();
    expect(getByText("Support").tagName).toBe("H2");
  });

  test("the message list is a labelled log", () => {
    const { getByRole } = render(<QPChatPanel label="Conversation" listLabel="Messages" />);

    expect(getByRole("log", { name: "Messages" })).toBeInTheDocument();
  });

  test("the scrollable list is keyboard-focusable (WCAG 2.2 SC 2.1.1)", async () => {
    const user = await setupUser();
    const { getByRole } = render(<QPChatPanel label="Conversation">message</QPChatPanel>);

    const list = getByRole("log");
    expect(list).toHaveAttribute("tabindex", "0");

    await user.tab();
    expect(list).toHaveFocus();
  });

  test("shows the empty slot only when there are no messages", () => {
    const { queryByText, getByText, rerender } = render(
      <QPChatPanel label="Conversation" empty={<p>No messages yet</p>} />,
    );

    expect(getByText("No messages yet")).toBeInTheDocument();

    rerender(
      <QPChatPanel label="Conversation" empty={<p>No messages yet</p>}>
        <p>Hello</p>
      </QPChatPanel>,
    );
    expect(queryByText("No messages yet")).toBeNull();
    expect(getByText("Hello")).toBeInTheDocument();
  });

  test("an empty array of mapped messages still counts as empty", () => {
    const messages: string[] = [];
    const { getByText } = render(
      <QPChatPanel label="Conversation" empty={<p>No messages yet</p>}>
        {messages.map((message) => (
          <p key={message}>{message}</p>
        ))}
      </QPChatPanel>,
    );

    expect(getByText("No messages yet")).toBeInTheDocument();
  });

  test("qpHasMessages distinguishes every empty-ish shape React allows", () => {
    expect(qpHasMessages(undefined)).toBe(false);
    expect(qpHasMessages(null)).toBe(false);
    expect(qpHasMessages(false)).toBe(false);
    expect(qpHasMessages([])).toBe(false);
    expect(qpHasMessages([null, false])).toBe(false);
    expect(qpHasMessages("hello")).toBe(true);
  });

  test("the header and footer slots only render when given something", () => {
    const { container, rerender } = render(<QPChatPanel label="Conversation" />);
    const header = () => container.querySelector('[data-slot="chat-panel-header"]');
    const footer = () => container.querySelector('[data-slot="chat-panel-footer"]');

    expect(header()).toBeNull();
    expect(footer()).toBeNull();

    rerender(
      <QPChatPanel
        label="Conversation"
        title="Support"
        headerAction={<button type="button">Close</button>}
        footer={<p>composer</p>}
      />,
    );
    expect(header()).toBeInTheDocument();
    expect(footer()).toHaveTextContent("composer");
  });

  test("is not a live region unless asked", () => {
    const { getByRole, rerender } = render(<QPChatPanel label="Conversation" />);

    expect(getByRole("log")).not.toHaveAttribute("aria-live");

    rerender(<QPChatPanel label="Conversation" liveMessages />);
    const list = getByRole("log");
    expect(list).toHaveAttribute("aria-live", "polite");
    // Only appended messages interrupt — chat history re-renders constantly.
    expect(list).toHaveAttribute("aria-relevant", "additions");
  });

  test("className and listClassName merge last, native props reach the root", () => {
    const { container } = render(
      <QPChatPanel label="Conversation" className="h-96" listClassName="px-6" id="chat" />,
    );

    const root = container.querySelector("#chat");
    expect(root?.className).toContain("h-96");
    expect(container.querySelector('[data-slot="chat-panel-messages"]')?.className).toContain(
      "px-6",
    );
  });

  test("has no axe violations", async () => {
    const { runAxe } = await import("../../testing/axe");
    const { container } = render(
      <QPChatPanel label="Conversation" title="Support">
        <p>Hello</p>
      </QPChatPanel>,
    );

    const results = await runAxe(container);
    expect(results.violations).toEqual([]);
  });
});
