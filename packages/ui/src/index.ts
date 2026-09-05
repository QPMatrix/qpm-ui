/**
 * @qpmatrix/ui — public barrel.
 *
 * The only module QPMatrix apps import components from (ADR-005). The package
 * is a shadcn/ui source-owned library: Base UI primitives underneath, Tailwind
 * v4 on top, and every colour/size/motion value resolved from
 * @qpmatrix/tokens through the adapter in `styles/qpmatrix.css`.
 *
 * MUI is gone. There is no theme provider to mount: dark is `:root` and light
 * is `[data-theme="light"]`, both defined by @qpmatrix/tokens, so switching
 * themes is a single attribute on `<html>` — see `resolveThemeSelection` /
 * `themeAttributes` below.
 *
 * Apps must import the stylesheet once, at the app root:
 *
 * ```css
 * @import "@qpmatrix/ui/css";
 * ```
 *
 * It pulls in Tailwind, shadcn's variants, and @qpmatrix/tokens in the order
 * the cascade requires. Do not import `@qpmatrix/tokens/css` separately.
 *
 * ## The QP prefix
 *
 * EVERY public export is prefixed — `QPButton`, `QPMetricCard`,
 * `qpMetricCardVariants`, `QP_PRODUCT_BADGE_NAMES`. An app importing from a
 * dozen packages should never have to wonder whose `Button` it just imported,
 * and a prefixed name makes a stray `import { Button } from "@mui/material"`
 * visible on sight rather than at review time.
 *
 * The primitives under `src/components/ui/` keep their UNPREFIXED shadcn names
 * ON DISK — `Button`, `Card`, `Field` — because those files are written and
 * re-written by the shadcn CLI, and renaming their declarations would break
 * `shadcn add` / `shadcn update` and every upstream diff. The prefix is applied
 * here instead, at the package boundary: one aliased re-export per symbol, so
 * the public API is uniformly QP-prefixed while the source stays upgradeable.
 * Inside the package, components import the unprefixed local names directly.
 */

// ---------------------------------------------------------------------------
// Primitives (shadcn/ui on Base UI, source-owned by QPMatrix)
//
// Re-exported under QP names. Generated to match src/components/ui/*.tsx — if
// you add a primitive with the shadcn CLI, add its block here too.
// ---------------------------------------------------------------------------
export {
  Accordion as QPAccordion,
  AccordionContent as QPAccordionContent,
  AccordionItem as QPAccordionItem,
  AccordionTrigger as QPAccordionTrigger,
} from "./components/ui/accordion";

export {
  AlertDialog as QPAlertDialog,
  AlertDialogAction as QPAlertDialogAction,
  AlertDialogCancel as QPAlertDialogCancel,
  AlertDialogContent as QPAlertDialogContent,
  AlertDialogDescription as QPAlertDialogDescription,
  AlertDialogFooter as QPAlertDialogFooter,
  AlertDialogHeader as QPAlertDialogHeader,
  AlertDialogMedia as QPAlertDialogMedia,
  AlertDialogOverlay as QPAlertDialogOverlay,
  AlertDialogPortal as QPAlertDialogPortal,
  AlertDialogTitle as QPAlertDialogTitle,
  AlertDialogTrigger as QPAlertDialogTrigger,
} from "./components/ui/alert-dialog";

export {
  Alert as QPAlert,
  AlertAction as QPAlertAction,
  AlertDescription as QPAlertDescription,
  AlertTitle as QPAlertTitle,
} from "./components/ui/alert";

export { AspectRatio as QPAspectRatio } from "./components/ui/aspect-ratio";

export {
  Attachment as QPAttachment,
  AttachmentAction as QPAttachmentAction,
  AttachmentActions as QPAttachmentActions,
  AttachmentContent as QPAttachmentContent,
  AttachmentDescription as QPAttachmentDescription,
  AttachmentGroup as QPAttachmentGroup,
  AttachmentMedia as QPAttachmentMedia,
  AttachmentTitle as QPAttachmentTitle,
  AttachmentTrigger as QPAttachmentTrigger,
} from "./components/ui/attachment";

export {
  Avatar as QPAvatar,
  AvatarBadge as QPAvatarBadge,
  AvatarFallback as QPAvatarFallback,
  AvatarGroup as QPAvatarGroup,
  AvatarGroupCount as QPAvatarGroupCount,
  AvatarImage as QPAvatarImage,
} from "./components/ui/avatar";

export { Badge as QPBadge, badgeVariants as qpBadgeVariants } from "./components/ui/badge";

export {
  Breadcrumb as QPBreadcrumb,
  BreadcrumbEllipsis as QPBreadcrumbEllipsis,
  BreadcrumbItem as QPBreadcrumbItem,
  BreadcrumbLink as QPBreadcrumbLink,
  BreadcrumbList as QPBreadcrumbList,
  BreadcrumbPage as QPBreadcrumbPage,
  BreadcrumbSeparator as QPBreadcrumbSeparator,
} from "./components/ui/breadcrumb";

export {
  Bubble as QPBubble,
  BubbleContent as QPBubbleContent,
  BubbleGroup as QPBubbleGroup,
  BubbleReactions as QPBubbleReactions,
} from "./components/ui/bubble";

export {
  ButtonGroup as QPButtonGroup,
  ButtonGroupSeparator as QPButtonGroupSeparator,
  ButtonGroupText as QPButtonGroupText,
  buttonGroupVariants as qpButtonGroupVariants,
} from "./components/ui/button-group";

export { Button as QPButton, buttonVariants as qpButtonVariants } from "./components/ui/button";

export {
  Calendar as QPCalendar,
  CalendarDayButton as QPCalendarDayButton,
} from "./components/ui/calendar";

export {
  Card as QPCard,
  CardAction as QPCardAction,
  CardContent as QPCardContent,
  CardDescription as QPCardDescription,
  CardFooter as QPCardFooter,
  CardHeader as QPCardHeader,
  CardTitle as QPCardTitle,
} from "./components/ui/card";

export {
  Carousel as QPCarousel,
  CarouselContent as QPCarouselContent,
  CarouselItem as QPCarouselItem,
  CarouselNext as QPCarouselNext,
  CarouselPrevious as QPCarouselPrevious,
  useCarousel as qpUseCarousel,
} from "./components/ui/carousel";

export type { CarouselApi as QPCarouselApi } from "./components/ui/carousel";

export {
  ChartContainer as QPChartContainer,
  ChartLegend as QPChartLegend,
  ChartLegendContent as QPChartLegendContent,
  ChartStyle as QPChartStyle,
  ChartTooltip as QPChartTooltip,
  ChartTooltipContent as QPChartTooltipContent,
} from "./components/ui/chart";

export { Checkbox as QPCheckbox } from "./components/ui/checkbox";

export {
  Collapsible as QPCollapsible,
  CollapsibleContent as QPCollapsibleContent,
  CollapsibleTrigger as QPCollapsibleTrigger,
} from "./components/ui/collapsible";

export {
  Combobox as QPCombobox,
  ComboboxChip as QPComboboxChip,
  ComboboxChips as QPComboboxChips,
  ComboboxChipsInput as QPComboboxChipsInput,
  ComboboxCollection as QPComboboxCollection,
  ComboboxContent as QPComboboxContent,
  ComboboxEmpty as QPComboboxEmpty,
  ComboboxGroup as QPComboboxGroup,
  ComboboxInput as QPComboboxInput,
  ComboboxItem as QPComboboxItem,
  ComboboxLabel as QPComboboxLabel,
  ComboboxList as QPComboboxList,
  ComboboxSeparator as QPComboboxSeparator,
  ComboboxTrigger as QPComboboxTrigger,
  ComboboxValue as QPComboboxValue,
  useComboboxAnchor as qpUseComboboxAnchor,
} from "./components/ui/combobox";

export {
  Command as QPCommand,
  CommandDialog as QPCommandDialog,
  CommandEmpty as QPCommandEmpty,
  CommandGroup as QPCommandGroup,
  CommandInput as QPCommandInput,
  CommandItem as QPCommandItem,
  CommandList as QPCommandList,
  CommandSeparator as QPCommandSeparator,
  CommandShortcut as QPCommandShortcut,
} from "./components/ui/command";

export {
  ContextMenu as QPContextMenu,
  ContextMenuCheckboxItem as QPContextMenuCheckboxItem,
  ContextMenuContent as QPContextMenuContent,
  ContextMenuGroup as QPContextMenuGroup,
  ContextMenuItem as QPContextMenuItem,
  ContextMenuLabel as QPContextMenuLabel,
  ContextMenuPortal as QPContextMenuPortal,
  ContextMenuRadioGroup as QPContextMenuRadioGroup,
  ContextMenuRadioItem as QPContextMenuRadioItem,
  ContextMenuSeparator as QPContextMenuSeparator,
  ContextMenuShortcut as QPContextMenuShortcut,
  ContextMenuSub as QPContextMenuSub,
  ContextMenuSubContent as QPContextMenuSubContent,
  ContextMenuSubTrigger as QPContextMenuSubTrigger,
  ContextMenuTrigger as QPContextMenuTrigger,
} from "./components/ui/context-menu";

export {
  Dialog as QPDialog,
  DialogClose as QPDialogClose,
  DialogContent as QPDialogContent,
  DialogDescription as QPDialogDescription,
  DialogFooter as QPDialogFooter,
  DialogHeader as QPDialogHeader,
  DialogOverlay as QPDialogOverlay,
  DialogPortal as QPDialogPortal,
  DialogTitle as QPDialogTitle,
  DialogTrigger as QPDialogTrigger,
} from "./components/ui/dialog";

export {
  DirectionProvider as QPDirectionProvider,
  useDirection as qpUseDirection,
} from "./components/ui/direction";

export {
  Drawer as QPDrawer,
  DrawerClose as QPDrawerClose,
  DrawerContent as QPDrawerContent,
  DrawerDescription as QPDrawerDescription,
  DrawerFooter as QPDrawerFooter,
  DrawerHeader as QPDrawerHeader,
  DrawerOverlay as QPDrawerOverlay,
  DrawerPortal as QPDrawerPortal,
  DrawerSwipeHandle as QPDrawerSwipeHandle,
  DrawerTitle as QPDrawerTitle,
  DrawerTrigger as QPDrawerTrigger,
} from "./components/ui/drawer";

export {
  DropdownMenu as QPDropdownMenu,
  DropdownMenuCheckboxItem as QPDropdownMenuCheckboxItem,
  DropdownMenuContent as QPDropdownMenuContent,
  DropdownMenuGroup as QPDropdownMenuGroup,
  DropdownMenuItem as QPDropdownMenuItem,
  DropdownMenuLabel as QPDropdownMenuLabel,
  DropdownMenuPortal as QPDropdownMenuPortal,
  DropdownMenuRadioGroup as QPDropdownMenuRadioGroup,
  DropdownMenuRadioItem as QPDropdownMenuRadioItem,
  DropdownMenuSeparator as QPDropdownMenuSeparator,
  DropdownMenuShortcut as QPDropdownMenuShortcut,
  DropdownMenuSub as QPDropdownMenuSub,
  DropdownMenuSubContent as QPDropdownMenuSubContent,
  DropdownMenuSubTrigger as QPDropdownMenuSubTrigger,
  DropdownMenuTrigger as QPDropdownMenuTrigger,
} from "./components/ui/dropdown-menu";

export {
  Empty as QPEmpty,
  EmptyContent as QPEmptyContent,
  EmptyDescription as QPEmptyDescription,
  EmptyHeader as QPEmptyHeader,
  EmptyMedia as QPEmptyMedia,
  EmptyTitle as QPEmptyTitle,
} from "./components/ui/empty";

export {
  Field as QPField,
  FieldContent as QPFieldContent,
  FieldDescription as QPFieldDescription,
  FieldError as QPFieldError,
  FieldGroup as QPFieldGroup,
  FieldLabel as QPFieldLabel,
  FieldLegend as QPFieldLegend,
  FieldSeparator as QPFieldSeparator,
  FieldSet as QPFieldSet,
  FieldTitle as QPFieldTitle,
} from "./components/ui/field";

export {
  HoverCard as QPHoverCard,
  HoverCardContent as QPHoverCardContent,
  HoverCardTrigger as QPHoverCardTrigger,
} from "./components/ui/hover-card";

export {
  InputGroup as QPInputGroup,
  InputGroupAddon as QPInputGroupAddon,
  InputGroupButton as QPInputGroupButton,
  InputGroupInput as QPInputGroupInput,
  InputGroupText as QPInputGroupText,
  InputGroupTextarea as QPInputGroupTextarea,
} from "./components/ui/input-group";

export {
  InputOTP as QPInputOTP,
  InputOTPGroup as QPInputOTPGroup,
  InputOTPSeparator as QPInputOTPSeparator,
  InputOTPSlot as QPInputOTPSlot,
} from "./components/ui/input-otp";

export { Input as QPInput } from "./components/ui/input";

export {
  Item as QPItem,
  ItemActions as QPItemActions,
  ItemContent as QPItemContent,
  ItemDescription as QPItemDescription,
  ItemFooter as QPItemFooter,
  ItemGroup as QPItemGroup,
  ItemHeader as QPItemHeader,
  ItemMedia as QPItemMedia,
  ItemSeparator as QPItemSeparator,
  ItemTitle as QPItemTitle,
} from "./components/ui/item";

export { Kbd as QPKbd, KbdGroup as QPKbdGroup } from "./components/ui/kbd";

export { Label as QPLabel } from "./components/ui/label";

export {
  Marker as QPMarker,
  MarkerContent as QPMarkerContent,
  MarkerIcon as QPMarkerIcon,
  markerVariants as qpMarkerVariants,
} from "./components/ui/marker";

export {
  Menubar as QPMenubar,
  MenubarCheckboxItem as QPMenubarCheckboxItem,
  MenubarContent as QPMenubarContent,
  MenubarGroup as QPMenubarGroup,
  MenubarItem as QPMenubarItem,
  MenubarLabel as QPMenubarLabel,
  MenubarMenu as QPMenubarMenu,
  MenubarPortal as QPMenubarPortal,
  MenubarRadioGroup as QPMenubarRadioGroup,
  MenubarRadioItem as QPMenubarRadioItem,
  MenubarSeparator as QPMenubarSeparator,
  MenubarShortcut as QPMenubarShortcut,
  MenubarSub as QPMenubarSub,
  MenubarSubContent as QPMenubarSubContent,
  MenubarSubTrigger as QPMenubarSubTrigger,
  MenubarTrigger as QPMenubarTrigger,
} from "./components/ui/menubar";

export {
  MessageScroller as QPMessageScroller,
  MessageScrollerButton as QPMessageScrollerButton,
  MessageScrollerContent as QPMessageScrollerContent,
  MessageScrollerItem as QPMessageScrollerItem,
  MessageScrollerProvider as QPMessageScrollerProvider,
  MessageScrollerViewport as QPMessageScrollerViewport,
  useMessageScroller as qpUseMessageScroller,
  useMessageScrollerScrollable as qpUseMessageScrollerScrollable,
  useMessageScrollerVisibility as qpUseMessageScrollerVisibility,
} from "./components/ui/message-scroller";

export {
  Message as QPMessage,
  MessageAvatar as QPMessageAvatar,
  MessageContent as QPMessageContent,
  MessageFooter as QPMessageFooter,
  MessageGroup as QPMessageGroup,
  MessageHeader as QPMessageHeader,
} from "./components/ui/message";

export {
  NativeSelect as QPNativeSelect,
  NativeSelectOptGroup as QPNativeSelectOptGroup,
  NativeSelectOption as QPNativeSelectOption,
} from "./components/ui/native-select";

export {
  NavigationMenu as QPNavigationMenu,
  NavigationMenuContent as QPNavigationMenuContent,
  NavigationMenuIndicator as QPNavigationMenuIndicator,
  NavigationMenuItem as QPNavigationMenuItem,
  NavigationMenuLink as QPNavigationMenuLink,
  NavigationMenuList as QPNavigationMenuList,
  NavigationMenuPositioner as QPNavigationMenuPositioner,
  NavigationMenuTrigger as QPNavigationMenuTrigger,
  navigationMenuTriggerStyle as qpNavigationMenuTriggerStyle,
} from "./components/ui/navigation-menu";

export {
  Pagination as QPPagination,
  PaginationContent as QPPaginationContent,
  PaginationEllipsis as QPPaginationEllipsis,
  PaginationItem as QPPaginationItem,
  PaginationLink as QPPaginationLink,
  PaginationNext as QPPaginationNext,
  PaginationPrevious as QPPaginationPrevious,
} from "./components/ui/pagination";

export {
  Popover as QPPopover,
  PopoverContent as QPPopoverContent,
  PopoverDescription as QPPopoverDescription,
  PopoverHeader as QPPopoverHeader,
  PopoverTitle as QPPopoverTitle,
  PopoverTrigger as QPPopoverTrigger,
} from "./components/ui/popover";

export {
  Progress as QPProgress,
  ProgressIndicator as QPProgressIndicator,
  ProgressLabel as QPProgressLabel,
  ProgressTrack as QPProgressTrack,
  ProgressValue as QPProgressValue,
} from "./components/ui/progress";

export {
  Questionnaire as QPQuestionnaire,
  QuestionnaireActions as QPQuestionnaireActions,
  QuestionnaireChoice as QPQuestionnaireChoice,
  QuestionnaireChoiceDescription as QPQuestionnaireChoiceDescription,
  QuestionnaireChoices as QPQuestionnaireChoices,
  QuestionnaireDescription as QPQuestionnaireDescription,
  QuestionnaireError as QPQuestionnaireError,
  QuestionnaireInput as QPQuestionnaireInput,
  QuestionnaireItem as QPQuestionnaireItem,
  QuestionnaireNext as QPQuestionnaireNext,
  QuestionnairePrevious as QPQuestionnairePrevious,
  QuestionnaireProgress as QPQuestionnaireProgress,
  QuestionnaireSkip as QPQuestionnaireSkip,
  QuestionnaireSubmit as QPQuestionnaireSubmit,
  QuestionnaireTitle as QPQuestionnaireTitle,
} from "./components/ui/questionnaire";

export {
  RadioGroup as QPRadioGroup,
  RadioGroupItem as QPRadioGroupItem,
} from "./components/ui/radio-group";

export {
  ResizableHandle as QPResizableHandle,
  ResizablePanel as QPResizablePanel,
  ResizablePanelGroup as QPResizablePanelGroup,
} from "./components/ui/resizable";

export { ScrollArea as QPScrollArea, ScrollBar as QPScrollBar } from "./components/ui/scroll-area";

export {
  Select as QPSelect,
  SelectContent as QPSelectContent,
  SelectGroup as QPSelectGroup,
  SelectItem as QPSelectItem,
  SelectLabel as QPSelectLabel,
  SelectScrollDownButton as QPSelectScrollDownButton,
  SelectScrollUpButton as QPSelectScrollUpButton,
  SelectSeparator as QPSelectSeparator,
  SelectTrigger as QPSelectTrigger,
  SelectValue as QPSelectValue,
} from "./components/ui/select";

export { Separator as QPSeparator } from "./components/ui/separator";

export {
  Sheet as QPSheet,
  SheetClose as QPSheetClose,
  SheetContent as QPSheetContent,
  SheetDescription as QPSheetDescription,
  SheetFooter as QPSheetFooter,
  SheetHeader as QPSheetHeader,
  SheetTitle as QPSheetTitle,
  SheetTrigger as QPSheetTrigger,
} from "./components/ui/sheet";

export {
  Sidebar as QPSidebar,
  SidebarContent as QPSidebarContent,
  SidebarFooter as QPSidebarFooter,
  SidebarGroup as QPSidebarGroup,
  SidebarGroupAction as QPSidebarGroupAction,
  SidebarGroupContent as QPSidebarGroupContent,
  SidebarGroupLabel as QPSidebarGroupLabel,
  SidebarHeader as QPSidebarHeader,
  SidebarInput as QPSidebarInput,
  SidebarInset as QPSidebarInset,
  SidebarMenu as QPSidebarMenu,
  SidebarMenuAction as QPSidebarMenuAction,
  SidebarMenuBadge as QPSidebarMenuBadge,
  SidebarMenuButton as QPSidebarMenuButton,
  SidebarMenuItem as QPSidebarMenuItem,
  SidebarMenuSkeleton as QPSidebarMenuSkeleton,
  SidebarMenuSub as QPSidebarMenuSub,
  SidebarMenuSubButton as QPSidebarMenuSubButton,
  SidebarMenuSubItem as QPSidebarMenuSubItem,
  SidebarProvider as QPSidebarProvider,
  SidebarRail as QPSidebarRail,
  SidebarSeparator as QPSidebarSeparator,
  SidebarTrigger as QPSidebarTrigger,
  useSidebar as qpUseSidebar,
} from "./components/ui/sidebar";

export { Skeleton as QPSkeleton } from "./components/ui/skeleton";

export { Slider as QPSlider } from "./components/ui/slider";

export { Spinner as QPSpinner } from "./components/ui/spinner";

export { Switch as QPSwitch } from "./components/ui/switch";

export {
  Table as QPTable,
  TableBody as QPTableBody,
  TableCaption as QPTableCaption,
  TableCell as QPTableCell,
  TableFooter as QPTableFooter,
  TableHead as QPTableHead,
  TableHeader as QPTableHeader,
  TableRow as QPTableRow,
} from "./components/ui/table";

export {
  Tabs as QPTabs,
  TabsContent as QPTabsContent,
  TabsList as QPTabsList,
  TabsTrigger as QPTabsTrigger,
  tabsListVariants as qpTabsListVariants,
} from "./components/ui/tabs";

export { Textarea as QPTextarea } from "./components/ui/textarea";

export {
  Toast as QPToast,
  ToastAction as QPToastAction,
  ToastClose as QPToastClose,
  ToastContent as QPToastContent,
  ToastDescription as QPToastDescription,
  ToastPortal as QPToastPortal,
  ToastProvider as QPToastProvider,
  ToastTitle as QPToastTitle,
  ToastViewport as QPToastViewport,
  Toaster as QPToaster,
  createToastManager as qpCreateToastManager,
  toast as qpToast,
  useToastManager as qpUseToastManager,
} from "./components/ui/toast";

export {
  ToggleGroup as QPToggleGroup,
  ToggleGroupItem as QPToggleGroupItem,
} from "./components/ui/toggle-group";

export { Toggle as QPToggle, toggleVariants as qpToggleVariants } from "./components/ui/toggle";

export {
  Tooltip as QPTooltip,
  TooltipContent as QPTooltipContent,
  TooltipProvider as QPTooltipProvider,
  TooltipTrigger as QPTooltipTrigger,
} from "./components/ui/tooltip";

// ---------------------------------------------------------------------------
// QPMatrix components
//
// Each folder is one component: markup, .types.ts, .constants.ts, .utils.ts,
// tests and stories. Their exports are already QP-prefixed at the source.
// ---------------------------------------------------------------------------
export * from "./components/chat-panel";
export * from "./components/composer";
export * from "./components/heading";
export * from "./components/icon-button";
export * from "./components/message-bubble";
export * from "./components/metric-card";
export * from "./components/motion";
export * from "./components/page-container";
export * from "./components/page-transition";
export * from "./components/product-badge";
export * from "./components/prose";
export * from "./components/reveal";
export * from "./components/section";
export * from "./components/segmented-control";
export * from "./components/stagger";
export * from "./components/status-indicator";
export * from "./components/text";
export * from "./components/typing-indicator";

// ---------------------------------------------------------------------------
// Library
// ---------------------------------------------------------------------------
export { cn, isRenderable } from "./lib/utils";
export * from "./lib/motion";
export {
  isApprovedThemeSelection,
  QP_ACCENT_TOKEN_ROLES,
  QP_DEFAULT_THEME_SELECTION,
  QP_THEME_ACCENTS,
  QP_THEME_MODES,
  resolveThemeSelection,
  themeAttributes,
  type QpAccentRoles,
  type QpThemeAccent,
  type QpThemeMode,
  type QpThemeSelection,
} from "./lib/theme";
