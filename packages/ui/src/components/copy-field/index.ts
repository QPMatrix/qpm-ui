/**
 * QPCopyField — public surface of this folder.
 *
 * The barrel exports all four modules, so `@qpmtx/ui` consumers reach the
 * component, its types, its class maps and its helpers through one path and
 * never have to know the file split exists. Import from the folder, not from
 * a file inside it.
 */
export * from "./copy-field";
export * from "./copy-field.constants";
export type * from "./copy-field.types";
export * from "./copy-field.utils";
