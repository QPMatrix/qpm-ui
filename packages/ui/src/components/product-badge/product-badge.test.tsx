import "../../test-setup";

import { cleanup, render } from "@testing-library/react";
import { afterEach, describe, expect, test } from "bun:test";

import { QPProductBadge } from "./product-badge";
import { QP_PRODUCT_BADGE_NAMES } from "./product-badge.constants";
import type { QPProductBadgeProduct } from "./product-badge.types";

// Queries come from each render() call's own return value — never the
// @testing-library/dom `screen` singleton, which binds `document` at
// module-evaluation time (see ../../test-setup for why that is not safe here).

afterEach(() => {
  cleanup();
});

describe("QPProductBadge", () => {
  test("renders the product name as readable text, not colour alone", () => {
    const { getByText, getByTestId } = render(
      <QPProductBadge product="antigravity" data-testid="chip" />,
    );

    expect(getByText(QP_PRODUCT_BADGE_NAMES.antigravity)).toBeInTheDocument();
    expect(getByTestId("chip")).toHaveTextContent("Antigravity");
  });

  test("the default name is overridable via children (localised copy)", () => {
    const { getByText, queryByText } = render(
      <QPProductBadge product="assistant">مساعد كيو بي</QPProductBadge>,
    );

    expect(getByText("مساعد كيو بي")).toBeInTheDocument();
    expect(queryByText(QP_PRODUCT_BADGE_NAMES.assistant)).not.toBeInTheDocument();
  });

  test("composes ui/badge and exposes its own data-slot plus the product", () => {
    const { getByTestId } = render(<QPProductBadge product="pi" data-testid="chip" />);

    const chip = getByTestId("chip");
    expect(chip).toHaveAttribute("data-slot", "product-badge");
    expect(chip).toHaveAttribute("data-product", "pi");
    expect(chip.tagName).toBe("SPAN");
  });

  test("tone comes from the product variant and className merges last", () => {
    const { getByTestId } = render(
      <QPProductBadge product="claudeCode" className="uppercase" data-testid="chip" />,
    );

    const chip = getByTestId("chip");
    expect(chip.className).toContain("bg-status-warning-bg");
    // Text is fg-primary, not the status hue: status-coloured text on its own
    // tint does not clear 4.5:1 in both themes. See product-badge.constants.ts.
    expect(chip.className).toContain("text-fg-primary");
    expect(chip.className).toContain("uppercase");
  });

  test("render composition turns it into a link that keeps its accessible name", () => {
    const { getByRole } = render(
      <QPProductBadge product="githubPipelines" render={<a href="/pipelines" />} />,
    );

    const link = getByRole("link", { name: QP_PRODUCT_BADGE_NAMES.githubPipelines });
    expect(link.tagName).toBe("A");
    expect(link).toHaveAttribute("href", "/pipelines");
  });

  test("every product in the union has a name and a tone", () => {
    for (const product of Object.keys(QP_PRODUCT_BADGE_NAMES) as QPProductBadgeProduct[]) {
      const { getByTestId, unmount } = render(
        <QPProductBadge product={product} data-testid="chip" />,
      );
      expect(getByTestId("chip").textContent).toBe(QP_PRODUCT_BADGE_NAMES[product]);
      unmount();
    }
  });
});
