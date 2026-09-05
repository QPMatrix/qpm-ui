import type { Meta, StoryObj } from "@storybook/react-vite";

import { Table, TableHeader, TableBody, TableHead, TableRow, TableCell } from "./table";

/**
 * Table — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered here against the real `styles/qpmatrix.css`, so what you see is
 * what an app gets: same tokens, same cascade, same dark/light switch. The
 * a11y panel runs axe on every story.
 */
const meta = {
  title: "Primitives/Data/Table",
  component: Table,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Table>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Table className="w-96">
        <TableHeader>
          <TableRow>
            <TableHead>Pipeline</TableHead>
            <TableHead>Status</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>build</TableCell>
            <TableCell>Passed</TableCell>
          </TableRow>
          <TableRow>
            <TableCell>deploy</TableCell>
            <TableCell>Failed</TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </>
  ),
};
