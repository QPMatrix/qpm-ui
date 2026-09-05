import type { Meta, StoryObj } from "@storybook/react-vite";
import { Bar, BarChart, CartesianGrid, XAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "./chart";

/**
 * Chart — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * The five series colours resolve from `--chart-1` … `--chart-5`, which
 * `styles/qpmatrix.css` binds to @qpmtx/tokens hues — so a chart recolours
 * with the theme rather than carrying its own palette.
 */
const meta = {
  title: "Primitives/Data/Chart",
  component: ChartContainer,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof ChartContainer>;

export default meta;
type Story = StoryObj<typeof meta>;

const data = [
  { day: "Mon", passed: 186, failed: 12 },
  { day: "Tue", passed: 305, failed: 8 },
  { day: "Wed", passed: 237, failed: 21 },
  { day: "Thu", passed: 273, failed: 5 },
  { day: "Fri", passed: 209, failed: 14 },
];

const config = {
  passed: { label: "Passed", color: "var(--chart-4)" },
  failed: { label: "Failed", color: "var(--chart-1)" },
};

export const Default: Story = {
  args: { config, children: <div /> },
  render: () => (
    <ChartContainer config={config} className="h-64 w-96">
      <BarChart data={data}>
        <CartesianGrid vertical={false} />
        <XAxis dataKey="day" tickLine={false} axisLine={false} />
        <ChartTooltip content={<ChartTooltipContent />} />
        <Bar dataKey="passed" fill="var(--color-passed)" radius={4} />
        <Bar dataKey="failed" fill="var(--color-failed)" radius={4} />
      </BarChart>
    </ChartContainer>
  ),
};
