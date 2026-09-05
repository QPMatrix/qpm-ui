import type { Meta, StoryObj } from "@storybook/react-vite";

import { QPProse } from "./prose";

const meta = {
  title: "Content/QPProse",
  component: QPProse,
  parameters: { layout: "padded" },
  tags: ["autodocs"],
  argTypes: {
    width: { control: "select", options: ["measure", "full"] },
    size: { control: "select", options: ["sm", "default", "lg"] },
  },
} satisfies Meta<typeof QPProse>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The markup below is exactly what a Markdown compiler emits — no classes on
 * anything. Every style comes from QPProse's descendant rules, which is why
 * authored content matches hand-written JSX instead of being a second,
 * near-miss design system.
 */
const article = (
  <>
    <h1>Shared UI standards</h1>
    <p>
      QPMatrix ships one component kit across every system. This document explains what that means
      in practice, and what it costs to opt out.
    </p>
    <h2>Tokens are the contract</h2>
    <p>
      Every colour, size and duration resolves from <code>@qpmatrix/tokens</code>. Components
      consume semantic roles — <code>bg-surface-secondary</code>, not a hex value — so a theme
      change is a token change.
    </p>
    <ul>
      <li>No hard-coded product colours in shared components.</li>
      <li>No inline styles.</li>
      <li>Accessibility failures block completion.</li>
    </ul>
    <h3>Running the gates</h3>
    <pre>
      <code>bun run check</code>
    </pre>
    <blockquote>
      A registry item is a promise to a consumer. The validator exists so the promise cannot drift
      from the source.
    </blockquote>
    <h3>What ships</h3>
    <table>
      <thead>
        <tr>
          <th>Surface</th>
          <th>Owner</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Primitives</td>
          <td>shadcn CLI</td>
        </tr>
        <tr>
          <td>Components</td>
          <td>QPMatrix</td>
        </tr>
      </tbody>
    </table>
    <hr />
    <p>
      See <a href="#docs">the standards</a> for the full definition of done.
    </p>
  </>
);

export const Default: Story = {
  args: { children: article },
};

export const Small: Story = {
  args: { size: "sm", children: article },
};

export const Large: Story = {
  args: { size: "lg", children: article },
};

export const FullWidth: Story = {
  args: { width: "full", children: article },
};

/** Logical spacing throughout, so RTL content needs no second stylesheet. */
export const RightToLeft: Story = {
  args: {
    children: (
      <>
        <h2>معايير الواجهة المشتركة</h2>
        <p>تستخدم جميع الأنظمة نفس مجموعة المكونات.</p>
        <ul>
          <li>لا ألوان ثابتة في المكونات المشتركة.</li>
          <li>لا أنماط مضمّنة.</li>
        </ul>
      </>
    ),
  },
  render: (args) => (
    <div dir="rtl">
      <QPProse {...args} />
    </div>
  ),
};
