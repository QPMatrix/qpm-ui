import type { Meta, StoryObj } from "@storybook/react-vite";

import {
  Questionnaire,
  QuestionnaireItem,
  QuestionnaireTitle,
  QuestionnaireChoices,
  QuestionnaireChoice,
} from "./questionnaire";

/**
 * Questionnaire — shadcn/Base UI primitive, source-owned by QPMatrix.
 *
 * Rendered against the real `styles/qpmatrix.css`, so what you see is what an
 * app gets: same tokens, same cascade, same dark/light switch. The a11y panel
 * runs axe on every story.
 */
const meta = {
  title: "Primitives/Forms/Questionnaire",
  component: Questionnaire,
  parameters: { layout: "centered" },
  tags: ["autodocs"],
} satisfies Meta<typeof Questionnaire>;

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  render: () => (
    <>
      <Questionnaire className="w-80">
        <QuestionnaireItem name="deploy-frequency">
          <QuestionnaireTitle>How often do you deploy?</QuestionnaireTitle>
          <QuestionnaireChoices>
            <QuestionnaireChoice value="daily">Daily</QuestionnaireChoice>
            <QuestionnaireChoice value="weekly">Weekly</QuestionnaireChoice>
          </QuestionnaireChoices>
        </QuestionnaireItem>
      </Questionnaire>
    </>
  ),
};
