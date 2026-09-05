import type { UserEvent } from "@testing-library/user-event";
import { expect } from "bun:test";

/**
 * Reusable, DOM-level assertions for @qpmtx/ui's "interactive contract":
 * every interactive component must be reachable and operable by keyboard,
 * must expose a correct accessible name, and must never rely on a positive
 * `tabindex` to get there. Framework-agnostic on purpose — these operate on
 * plain `HTMLElement`s, not React fibers, so they work the same whether the
 * subtree came from `@testing-library/react`'s `render()` or from a plain DOM
 * fixture.
 *
 * `@testing-library/user-event` is imported dynamically inside the functions
 * that need it (not as a static top-level import), for the same reason
 * documented in `test-setup.ts`: its module-level defaults capture
 * `globalThis.document` at import time, so it must not evaluate before
 * happy-dom registration has run.
 */

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button",
  "input",
  "select",
  "textarea",
  "iframe",
  "audio[controls]",
  "video[controls]",
  "details > summary:first-of-type",
  "[contenteditable]:not([contenteditable='false'])",
  "[tabindex]",
].join(", ");

function hasTabIndexBelowZero(element: HTMLElement): boolean {
  const raw = element.getAttribute("tabindex");
  if (raw === null) {
    return false;
  }
  const value = Number.parseInt(raw, 10);
  return !Number.isNaN(value) && value < 0;
}

function hasInertAncestor(element: HTMLElement, root: ParentNode): boolean {
  let current = element.parentElement;
  while (current !== null && current !== root) {
    if (current.hasAttribute("inert")) {
      return true;
    }
    current = current.parentElement;
  }
  return false;
}

function isTabbable(element: HTMLElement, root: ParentNode): boolean {
  if (element.hasAttribute("hidden")) {
    return false;
  }
  if (element.hasAttribute("inert")) {
    return false;
  }
  if (element.hasAttribute("disabled")) {
    return false;
  }
  if (hasTabIndexBelowZero(element)) {
    return false;
  }
  return !hasInertAncestor(element, root);
}

/**
 * Every tabbable descendant of `root`, in DOM order. Excludes
 * `[tabindex="-1"]`, `[disabled]`, `[inert]` (or an inert ancestor), and
 * `[hidden]` elements — the standard set of things the platform itself skips
 * during Tab navigation.
 */
export function getTabbableElements(root: ParentNode): HTMLElement[] {
  const candidates = Array.from(root.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR));
  return candidates.filter((element) => isTabbable(element, root));
}

function getEffectiveRole(element: HTMLElement): string {
  const explicit = element.getAttribute("role");
  if (explicit !== null && explicit.trim() !== "") {
    return explicit.trim();
  }
  const tag = element.tagName.toLowerCase();
  if (tag === "a" && element.hasAttribute("href")) {
    return "link";
  }
  if (tag === "button") {
    return "button";
  }
  if (tag === "input") {
    const type = (element as HTMLInputElement).type;
    if (type === "checkbox") {
      return "checkbox";
    }
    if (type === "radio") {
      return "radio";
    }
    if (type === "submit" || type === "button" || type === "reset" || type === "image") {
      return "button";
    }
    return "textbox";
  }
  if (tag === "select") {
    return "listbox";
  }
  if (tag === "textarea") {
    return "textbox";
  }
  return "generic";
}

/** Roles the platform activates on Enter. */
const ENTER_ACTIVATED_ROLES = new Set(["link", "button", "menuitem", "tab"]);
/** Roles the platform activates on Space. */
const SPACE_ACTIVATED_ROLES = new Set([
  "button",
  "checkbox",
  "radio",
  "switch",
  "menuitemcheckbox",
  "menuitemradio",
  "option",
]);

/**
 * Assert `element` is reachable by Tab (it can receive DOM focus) and, for
 * roles the WAI-ARIA APG requires it of (buttons, links, checkboxes, radios,
 * switches, tabs, menu items), that it responds to Enter and/or Space with a
 * click — the platform's default action for those roles.
 */
export async function expectKeyboardOperable(element: HTMLElement): Promise<void> {
  const { default: userEvent } = await import("@testing-library/user-event");
  const user = userEvent.setup();

  element.focus();
  expect(document.activeElement).toBe(element);

  const role = getEffectiveRole(element);
  const keysToTest: string[] = [];
  if (ENTER_ACTIVATED_ROLES.has(role)) {
    keysToTest.push("{Enter}");
  }
  if (SPACE_ACTIVATED_ROLES.has(role)) {
    keysToTest.push(" ");
  }

  for (const key of keysToTest) {
    let activated = false;
    const onActivate = (): void => {
      activated = true;
    };
    element.addEventListener("click", onActivate);
    element.focus();
    try {
      await user.keyboard(key);
    } finally {
      element.removeEventListener("click", onActivate);
    }
    expect(activated).toBe(true);
  }
}

function collectLabelledByText(element: HTMLElement, labelledBy: string): string {
  const doc = element.ownerDocument;
  return labelledBy
    .split(/\s+/)
    .map((id) => doc.getElementById(id)?.textContent?.trim() ?? "")
    .filter((part) => part !== "")
    .join(" ");
}

function escapeIdForSelector(id: string): string {
  return typeof CSS !== "undefined" && typeof CSS.escape === "function" ? CSS.escape(id) : id;
}

function findAssociatedLabel(element: HTMLElement): HTMLLabelElement | null {
  const doc = element.ownerDocument;
  if (element.id !== "") {
    const byFor = doc.querySelector<HTMLLabelElement>(
      `label[for="${escapeIdForSelector(element.id)}"]`,
    );
    if (byFor !== null) {
      return byFor;
    }
  }
  return element.closest("label");
}

/**
 * Resolve `element`'s accessible name using the precedence order relevant to
 * @qpmtx/ui's components: `aria-labelledby` -> `aria-label` -> associated
 * `<label>` -> text content. This is a deliberately simplified subset of the
 * full W3C accname algorithm (no `aria-describedby`, no host-language title
 * fallback) — enough to catch the mistakes components in this package
 * actually make.
 */
function resolveAccessibleName(element: HTMLElement): string {
  const labelledBy = element.getAttribute("aria-labelledby");
  if (labelledBy !== null && labelledBy.trim() !== "") {
    const text = collectLabelledByText(element, labelledBy);
    if (text !== "") {
      return text;
    }
  }

  const ariaLabel = element.getAttribute("aria-label");
  if (ariaLabel !== null && ariaLabel.trim() !== "") {
    return ariaLabel.trim();
  }

  const associatedLabel = findAssociatedLabel(element);
  if (associatedLabel !== null) {
    const text = associatedLabel.textContent?.trim() ?? "";
    if (text !== "") {
      return text;
    }
  }

  return element.textContent?.trim() ?? "";
}

/** Assert `element`'s resolved accessible name equals `expected`. */
export function expectAccessibleName(element: HTMLElement, expected: string): void {
  expect(resolveAccessibleName(element)).toBe(expected);
}

/**
 * Tab through `container` `getTabbableElements(container).length + 1` times
 * (one full loop plus one) and assert focus never leaves `container` — the
 * standard way to prove a modal/drawer/menu's focus trap wraps instead of
 * escaping to the rest of the page.
 */
export async function expectFocusTrapped(container: HTMLElement, user: UserEvent): Promise<void> {
  const iterations = getTabbableElements(container).length + 1;
  for (let index = 0; index < iterations; index += 1) {
    await user.tab();
    expect(container.contains(document.activeElement)).toBe(true);
  }
}

/**
 * Assert focus has returned to `triggerElement` — the element that opened an
 * overlay must regain focus when the overlay closes (WCAG 2.2 3.2.1/2.4.3).
 */
export function expectFocusRestored(triggerElement: HTMLElement): void {
  expect(document.activeElement).toBe(triggerElement);
}

function describeTabIndexOffender(element: HTMLElement): string {
  const id = element.id !== "" ? `#${element.id}` : "";
  return `<${element.tagName.toLowerCase()}${id} tabindex="${element.getAttribute("tabindex") ?? ""}">`;
}

function hasPositiveTabIndex(element: HTMLElement): boolean {
  const raw = element.getAttribute("tabindex");
  if (raw === null) {
    return false;
  }
  const value = Number.parseInt(raw, 10);
  return !Number.isNaN(value) && value > 0;
}

/**
 * Fail if any element in `root` (root included) has a positive `tabindex`.
 * Positive tabindex overrides the natural DOM tab order, which reliably
 * produces a confusing keyboard experience (WCAG 2.4.3) — @qpmtx/ui never
 * needs it.
 */
export function expectNoPositiveTabIndex(root: ParentNode): void {
  const descendants = Array.from(root.querySelectorAll<HTMLElement>("[tabindex]"));
  const candidates =
    root instanceof HTMLElement && root.hasAttribute("tabindex")
      ? [root, ...descendants]
      : descendants;
  const offenders = candidates.filter(hasPositiveTabIndex).map(describeTabIndexOffender);
  expect(offenders).toEqual([]);
}
