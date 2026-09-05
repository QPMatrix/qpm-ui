import "../../test-setup";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "bun:test";

import { QPMessageBubble } from "./message-bubble";
import { QP_MESSAGE_BUBBLE_AUTHOR_LABELS } from "./message-bubble.constants";
import { qpResolveMessageAuthorLabel } from "./message-bubble.utils";

afterEach(() => {
  cleanup();
});

describe("QPMessageBubble", () => {
  test("renders the message body", () => {
    const { getByText } = render(<QPMessageBubble author="assistant">Hello there</QPMessageBubble>);

    expect(getByText("Hello there")).toBeInTheDocument();
  });

  test("is an article named by its author, so AT announces who spoke", () => {
    const { getByRole } = render(<QPMessageBubble author="user">Hi</QPMessageBubble>);

    const article = getByRole("article", { name: "You" });
    expect(article.tagName).toBe("ARTICLE");
  });

  test("the author is carried by text, not by colour alone (WCAG 2.2 SC 1.4.1)", () => {
    const { container } = render(<QPMessageBubble author="system">Reindexed</QPMessageBubble>);

    // The label is clipped, not removed: greyscale and screen readers both
    // still get the author.
    const label = container.querySelector(".sr-only");
    expect(label).toHaveTextContent("System");
  });

  test("author labels are overridable per message and per locale", () => {
    const { getByRole, rerender } = render(
      <QPMessageBubble author="assistant" authorLabel="Layla">
        مرحبا
      </QPMessageBubble>,
    );
    expect(getByRole("article", { name: "Layla" })).toBeInTheDocument();

    rerender(
      <QPMessageBubble author="assistant" authorLabels={{ assistant: "المساعد" }}>
        مرحبا
      </QPMessageBubble>,
    );
    expect(getByRole("article", { name: "المساعد" })).toBeInTheDocument();
  });

  test("an explicit authorLabel outranks the locale map", () => {
    expect(qpResolveMessageAuthorLabel("assistant", "Layla", { assistant: "المساعد" })).toBe(
      "Layla",
    );
    expect(qpResolveMessageAuthorLabel("assistant", undefined, { assistant: "المساعد" })).toBe(
      "المساعد",
    );
    expect(qpResolveMessageAuthorLabel("assistant", undefined, undefined)).toBe(
      QP_MESSAGE_BUBBLE_AUTHOR_LABELS.assistant,
    );
  });

  test("author selects a token role and is exposed as a data attribute", () => {
    const { container } = render(<QPMessageBubble author="user">Hi</QPMessageBubble>);

    const article = container.querySelector('[data-slot="message-bubble"]');
    expect(article).toHaveAttribute("data-author", "user");
    expect(article?.className).toContain("bg-brand-strong");
    // Logical margin, so the conversation still reads correctly in RTL.
    expect(article?.className).toContain("ms-auto");
  });

  test("pending marks the bubble busy and announces an overridable label", () => {
    const { container, getByText } = render(
      <QPMessageBubble author="user" pending pendingLabel="جارٍ الإرسال">
        Hi
      </QPMessageBubble>,
    );

    const article = container.querySelector('[data-slot="message-bubble"]');
    expect(article).toHaveAttribute("aria-busy", "true");
    expect(article).toHaveAttribute("data-pending", "true");
    expect(getByText("جارٍ الإرسال").className).toContain("sr-only");
  });

  test("the timestamp slot only renders when given something", () => {
    const { container, rerender } = render(<QPMessageBubble author="user">Hi</QPMessageBubble>);
    const timestamp = () => container.querySelector('[data-slot="message-bubble-timestamp"]');

    expect(timestamp()).toBeNull();

    rerender(
      <QPMessageBubble author="user" timestamp={<time dateTime="2026-08-12T09:00">09:00</time>}>
        Hi
      </QPMessageBubble>,
    );
    expect(timestamp()).toHaveTextContent("09:00");
  });

  test("className merges last and native props reach the root", () => {
    const { container } = render(
      <QPMessageBubble author="assistant" className="max-w-md" id="m1" data-testid="bubble">
        Hi
      </QPMessageBubble>,
    );

    const article = container.querySelector("#m1");
    expect(article?.className).toContain("max-w-md");
    expect(article).toHaveAttribute("data-testid", "bubble");
  });

  test("has no axe violations", async () => {
    const { runAxe } = await import("../../testing/axe");
    const { container } = render(<QPMessageBubble author="assistant">Audited</QPMessageBubble>);

    const results = await runAxe(container);
    expect(results.violations).toEqual([]);
  });
});
