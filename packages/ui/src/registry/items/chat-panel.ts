import { type QpRegistryItem } from "../schemas/registry-item.schema";

/** Conversation layout: named region, scrollable message log, footer slot. */
export const chatPanel: QpRegistryItem = {
  name: "chat-panel",
  type: "component",
  description: "Conversation layout: named region, scrollable message log, footer slot.",
  version: "0.1.0",
  files: [
    { path: "packages/ui/src/components/chat-panel/chat-panel.tsx" },
    { path: "packages/ui/src/components/chat-panel/chat-panel.types.ts" },
    { path: "packages/ui/src/components/chat-panel/chat-panel.constants.ts" },
    { path: "packages/ui/src/components/chat-panel/chat-panel.utils.ts" },
  ],
  dependencies: ["class-variance-authority"],
  registryDependencies: ["cn", "separator"],
  aliases: {
    components: "@/components",
    ui: "@/components/ui",
    utils: "@/lib/utils",
  },
  tokenDependencies: [
    "border-focus",
    "border-subtle",
    "elevation-raised",
    "fg-primary",
    "radius-xl",
    "surface-primary",
  ],
  accessibility: {
    status: "audited",
    wcagLevel: "2.2-AA",
    interactive: true,
    keyboardTested: true,
    focusManaged: false,
    notes:
      "Audited. The root is a named region landmark so AT can jump to the conversation (SC 2.4.1); a visible title takes over naming so the name is never announced twice. The message list is role=log with tabIndex={0} — an overflow container only a mouse can scroll is an SC 2.1.1 failure. Live announcement is opt-in and scoped to aria-relevant=additions, because chat history re-renders constantly.",
  },
  supportedPlatforms: ["web"],
  tags: ["chat", "layout"],
};
