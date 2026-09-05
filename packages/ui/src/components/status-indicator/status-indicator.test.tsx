import "../../test-setup";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "bun:test";

import { QPStatusIndicator } from "./status-indicator";

afterEach(() => {
  cleanup();
});

describe("QPStatusIndicator", () => {
  test("renders the status text passed as children", () => {
    const { getByText } = render(
      <QPStatusIndicator status="success">Operational</QPStatusIndicator>,
    );

    expect(getByText("Operational")).toBeInTheDocument();
  });

  test("copy is a prop — nothing is baked in", () => {
    const { getByText } = render(<QPStatusIndicator status="connected">متصل</QPStatusIndicator>);

    expect(getByText("متصل")).toBeInTheDocument();
  });

  test("meaning never rests on colour alone: a label is always in the accessibility tree", () => {
    const { container } = render(
      <QPStatusIndicator status="error" label="Failed" labelHidden>
        {null}
      </QPStatusIndicator>,
    );

    const labelNode = container.querySelector('[data-slot="status-indicator-label"]');
    expect(labelNode).not.toBeNull();
    expect(labelNode).toHaveTextContent("Failed");
    // Visually hidden, but still announced — `sr-only` clips, it does not remove.
    expect(labelNode?.className).toContain("sr-only");
  });

  test("the dot is decorative and hidden from assistive technology", () => {
    const { container } = render(<QPStatusIndicator status="live">Live</QPStatusIndicator>);

    const dot = container.querySelector('[data-slot="status-indicator-dot"]');
    expect(dot).toHaveAttribute("aria-hidden", "true");
  });

  test("status selects a token role and is exposed as a data attribute", () => {
    const { container } = render(<QPStatusIndicator status="warning">Degraded</QPStatusIndicator>);

    const root = container.querySelector('[data-slot="status-indicator"]');
    expect(root).toHaveAttribute("data-status", "warning");
    const dot = container.querySelector('[data-slot="status-indicator-dot"]');
    expect(dot?.className).toContain("bg-status-warning");
  });

  test("is not a live region unless asked", () => {
    const { container, rerender } = render(
      <QPStatusIndicator status="processing">Working</QPStatusIndicator>,
    );
    const root = () => container.querySelector('[data-slot="status-indicator"]');

    expect(root()).not.toHaveAttribute("role");

    rerender(
      <QPStatusIndicator status="processing" live>
        Working
      </QPStatusIndicator>,
    );
    expect(root()).toHaveAttribute("role", "status");
    expect(root()).toHaveAttribute("aria-live", "polite");
  });

  test("pulse renders a reduced-motion-safe ring only when enabled", () => {
    const { container, rerender } = render(
      <QPStatusIndicator status="live">Live</QPStatusIndicator>,
    );
    const dot = () => container.querySelector('[data-slot="status-indicator-dot"]');

    expect(dot()?.children.length).toBe(0);

    rerender(
      <QPStatusIndicator status="live" pulse>
        Live
      </QPStatusIndicator>,
    );
    const ring = dot()?.firstElementChild;
    expect(ring?.className).toContain("motion-safe:animate-ping");
    expect(ring?.className).toContain("motion-reduce:hidden");
  });

  test("size scales both dot and text, and className merges last", () => {
    const { container } = render(
      <QPStatusIndicator status="info" size="lg" className="ms-4">
        Info
      </QPStatusIndicator>,
    );

    const root = container.querySelector('[data-slot="status-indicator"]');
    expect(root?.className).toContain("text-base");
    expect(root?.className).toContain("ms-4");
    expect(container.querySelector('[data-slot="status-indicator-dot"]')?.className).toContain(
      "size-2.5",
    );
  });

  test("forwards native span props", () => {
    const { container } = render(
      <QPStatusIndicator status="offline" id="conn" title="Connection state">
        Offline
      </QPStatusIndicator>,
    );

    const root = container.querySelector("#conn");
    expect(root).toHaveAttribute("title", "Connection state");
  });
});
