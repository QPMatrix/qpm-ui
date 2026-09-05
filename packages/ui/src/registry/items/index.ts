import { type QpRegistryItem } from "../schemas/registry-item.schema";
import { accordion } from "./accordion";
import { alert } from "./alert";
import { alertDialog } from "./alert-dialog";
import { aspectRatio } from "./aspect-ratio";
import { attachment } from "./attachment";
import { avatar } from "./avatar";
import { badge } from "./badge";
import { breadcrumb } from "./breadcrumb";
import { bubble } from "./bubble";
import { button } from "./button";
import { buttonGroup } from "./button-group";
import { calendar } from "./calendar";
import { card } from "./card";
import { carousel } from "./carousel";
import { chart } from "./chart";
import { chatPanel } from "./chat-panel";
import { checkbox } from "./checkbox";
import { cn } from "./cn";
import { collapsible } from "./collapsible";
import { combobox } from "./combobox";
import { command } from "./command";
import { composer } from "./composer";
import { contextMenu } from "./context-menu";
import { dialog } from "./dialog";
import { direction } from "./direction";
import { drawer } from "./drawer";
import { dropdownMenu } from "./dropdown-menu";
import { empty } from "./empty";
import { field } from "./field";
import { heading } from "./heading";
import { hoverCard } from "./hover-card";
import { iconButton } from "./icon-button";
import { input } from "./input";
import { inputGroup } from "./input-group";
import { inputOtp } from "./input-otp";
import { item } from "./item";
import { kbd } from "./kbd";
import { label } from "./label";
import { marker } from "./marker";
import { menubar } from "./menubar";
import { message } from "./message";
import { messageBubble } from "./message-bubble";
import { messageScroller } from "./message-scroller";
import { metricCard } from "./metric-card";
import { motion } from "./motion";
import { motionCore } from "./motion-core";
import { nativeSelect } from "./native-select";
import { navigationMenu } from "./navigation-menu";
import { pageContainer } from "./page-container";
import { pageTransition } from "./page-transition";
import { pagination } from "./pagination";
import { popover } from "./popover";
import { productBadge } from "./product-badge";
import { progress } from "./progress";
import { prose } from "./prose";
import { questionnaire } from "./questionnaire";
import { radioGroup } from "./radio-group";
import { resizable } from "./resizable";
import { reveal } from "./reveal";
import { scrollArea } from "./scroll-area";
import { section } from "./section";
import { segmentedControl } from "./segmented-control";
import { select } from "./select";
import { separator } from "./separator";
import { sheet } from "./sheet";
import { sidebar } from "./sidebar";
import { skeleton } from "./skeleton";
import { slider } from "./slider";
import { spinner } from "./spinner";
import { stagger } from "./stagger";
import { statusIndicator } from "./status-indicator";
import { switchItem } from "./switch";
import { table } from "./table";
import { tabs } from "./tabs";
import { text } from "./text";
import { textarea } from "./textarea";
import { themeContract } from "./theme-contract";
import { toast } from "./toast";
import { toggle } from "./toggle";
import { toggleGroup } from "./toggle-group";
import { tooltip } from "./tooltip";
import { typingIndicator } from "./typing-indicator";
import { useMobile } from "./use-mobile";

/**
 * Every item @qpmtx/ui distributes, listed EXPLICITLY.
 *
 * This is deliberately not a filesystem glob: the registry manifests are
 * generated from this array, and a glob would make their contents depend on
 * directory-read order and on files that happen to be lying around. Adding a
 * component means adding it here (`bun run scaffold` does it for you);
 * forgetting to fails the `unclaimed-file` rule.
 *
 * `switchItem` is the one binding whose name does not match its item name:
 * `switch` is a reserved word and cannot be a JavaScript binding. The item's
 * `name` field is still `"switch"`, which is what consumers install.
 */
export const QP_REGISTRY_ITEMS: readonly QpRegistryItem[] = [
  accordion,
  alert,
  alertDialog,
  aspectRatio,
  attachment,
  avatar,
  badge,
  breadcrumb,
  bubble,
  button,
  buttonGroup,
  calendar,
  card,
  carousel,
  chart,
  chatPanel,
  checkbox,
  cn,
  collapsible,
  combobox,
  command,
  composer,
  contextMenu,
  dialog,
  direction,
  drawer,
  dropdownMenu,
  empty,
  field,
  heading,
  hoverCard,
  iconButton,
  input,
  inputGroup,
  inputOtp,
  item,
  kbd,
  label,
  marker,
  menubar,
  message,
  messageBubble,
  messageScroller,
  metricCard,
  motion,
  motionCore,
  nativeSelect,
  navigationMenu,
  pageContainer,
  pageTransition,
  pagination,
  popover,
  productBadge,
  progress,
  prose,
  questionnaire,
  radioGroup,
  resizable,
  reveal,
  scrollArea,
  section,
  segmentedControl,
  select,
  separator,
  sheet,
  sidebar,
  skeleton,
  slider,
  spinner,
  stagger,
  statusIndicator,
  switchItem,
  table,
  tabs,
  text,
  textarea,
  themeContract,
  toast,
  toggle,
  toggleGroup,
  tooltip,
  typingIndicator,
  useMobile,
];

export {
  accordion,
  alert,
  alertDialog,
  aspectRatio,
  attachment,
  avatar,
  badge,
  breadcrumb,
  bubble,
  button,
  buttonGroup,
  calendar,
  card,
  carousel,
  chart,
  chatPanel,
  checkbox,
  cn,
  collapsible,
  combobox,
  command,
  composer,
  contextMenu,
  dialog,
  direction,
  drawer,
  dropdownMenu,
  empty,
  field,
  heading,
  hoverCard,
  iconButton,
  input,
  inputGroup,
  inputOtp,
  item,
  kbd,
  label,
  marker,
  menubar,
  message,
  messageBubble,
  messageScroller,
  metricCard,
  motion,
  motionCore,
  nativeSelect,
  navigationMenu,
  pageContainer,
  pageTransition,
  pagination,
  popover,
  productBadge,
  progress,
  prose,
  questionnaire,
  radioGroup,
  resizable,
  reveal,
  scrollArea,
  section,
  segmentedControl,
  select,
  separator,
  sheet,
  sidebar,
  skeleton,
  slider,
  spinner,
  stagger,
  statusIndicator,
  switchItem,
  table,
  tabs,
  text,
  textarea,
  themeContract,
  toast,
  toggle,
  toggleGroup,
  tooltip,
  typingIndicator,
  useMobile,
};
