"use client"

import * as React from "react"
import NiceModal, { useModal } from "@ebay/nice-modal-react"
import { AlertCircleIcon, XIcon } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

type ContentElement = HTMLDivElement | null

type SurfaceContextValue = {
  close: () => Promise<void>
  drawerSnapAxis: "x" | "y" | null
  modal: boolean
  setContentElement: (element: ContentElement) => void
}

type SurfaceRootCompatibilityProps = {
  onOpenChangeComplete?: (open: boolean) => void
}

const SurfaceContext = React.createContext<SurfaceContextValue | null>(null)

function useNonModalPageAccess(
  contentElement: ContentElement,
  enabled: boolean
) {
  React.useEffect(() => {
    if (!contentElement || !enabled) return

    const ownerDocument = contentElement.ownerDocument
    const revealPage = () => {
      ownerDocument
        .querySelectorAll<HTMLElement>(
          '[data-aria-hidden="true"][aria-hidden="true"]'
        )
        .forEach((element) => {
          if (
            element.contains(contentElement) ||
            contentElement.contains(element)
          ) {
            return
          }

          element.removeAttribute("aria-hidden")
        })
    }

    revealPage()
    const observer = new MutationObserver(revealPage)
    observer.observe(ownerDocument.body, {
      attributeFilter: ["aria-hidden", "data-aria-hidden"],
      attributes: true,
      subtree: true,
    })

    return () => observer.disconnect()
  }, [contentElement, enabled])
}

function hideNonModalOverlay(
  contentElement: HTMLDivElement,
  portalSlot: string,
  overlaySlot: string
) {
  const portalElement = contentElement.closest(`[data-slot="${portalSlot}"]`)
  let overlayElement = portalElement?.querySelector<HTMLElement>(
    `:scope > [data-slot="${overlaySlot}"]`
  )

  let siblingElement = contentElement.previousElementSibling
  while (!overlayElement && siblingElement) {
    if (
      siblingElement instanceof HTMLElement &&
      siblingElement.dataset.slot === overlaySlot
    ) {
      overlayElement = siblingElement
      break
    }

    siblingElement = siblingElement.previousElementSibling
  }

  if (overlayElement) overlayElement.hidden = true
}

function useSurfaceContentRef(
  componentName: string,
  portalSlot: string,
  overlaySlot: string,
  ref: React.Ref<HTMLDivElement> | undefined
) {
  const context = React.useContext(SurfaceContext)

  const setContentRef = React.useCallback(
    (element: ContentElement) => {
      context?.setContentElement(element)

      if (element && context?.modal === false) {
        hideNonModalOverlay(element, portalSlot, overlaySlot)
      }

      if (typeof ref === "function") {
        ref(element)
      } else if (ref) {
        ref.current = element
      }
    },
    [context, overlaySlot, portalSlot, ref]
  )

  if (!context) {
    throw new Error(`${componentName} must be rendered inside a Surface.`)
  }

  return { context, setContentRef }
}

function useSurfaceLifecycle<T>(
  modal: ReturnType<typeof useModal>,
  resolveResult: (result: T | null | undefined) => void
) {
  const modalRef = React.useRef(modal)
  const contentRef = React.useRef<ContentElement>(null)
  const resultRef = React.useRef<T | undefined>(undefined)
  const closePromiseRef = React.useRef<Promise<void> | null>(null)
  const removedRef = React.useRef(false)
  const [closing, setClosing] = React.useState(false)
  const [contentElement, setContentElementState] =
    React.useState<ContentElement>(null)

  modalRef.current = modal

  const setContentElement = React.useCallback((element: ContentElement) => {
    contentRef.current = element
    setContentElementState(element)
  }, [])

  const finishClose = React.useCallback(() => {
    if (removedRef.current) return

    removedRef.current = true
    const currentModal = modalRef.current
    resolveResult(resultRef.current)
    currentModal.resolveHide()
    currentModal.remove()
  }, [resolveResult])

  const close = React.useCallback((result?: T): Promise<void> => {
    if (closePromiseRef.current) return closePromiseRef.current

    resultRef.current = result
    setClosing(true)
    closePromiseRef.current = Promise.resolve(modalRef.current.hide()).then(
      () => undefined
    )

    return closePromiseRef.current
  }, [])

  const finishWhenAnimationsComplete = React.useCallback(() => {
    const hasRunningAnimation = (
      contentRef.current?.getAnimations() ?? []
    ).some(
      (animation) =>
        animation.playState === "running" &&
        animation.playbackRate !== 0 &&
        animation.effect?.getComputedTiming().iterations !== Infinity
    )

    if (hasRunningAnimation) return false

    finishClose()
    return true
  }, [finishClose])

  const handleOpenChangeComplete = React.useCallback(
    (open: boolean) => {
      if (!open) finishWhenAnimationsComplete()
    },
    [finishWhenAnimationsComplete]
  )

  React.useEffect(() => {
    if (!closing || modal.visible) return

    let active = true
    let frame = 0

    const waitForAnimations = () => {
      if (finishWhenAnimationsComplete()) return

      if (active) frame = window.requestAnimationFrame(waitForAnimations)
    }

    frame = window.requestAnimationFrame(waitForAnimations)

    return () => {
      active = false
      window.cancelAnimationFrame(frame)
    }
  }, [closing, finishWhenAnimationsComplete, modal.visible])

  return {
    close,
    contentElement,
    handleOpenChangeComplete,
    setContentElement,
  }
}

type SurfaceDialogContentProps = Omit<
  React.ComponentProps<typeof DialogContent>,
  "showCloseButton"
> & {
  closeButtonLabel?: string
  showCloseButton?: boolean
}

function SurfaceDialogContent({
  className,
  children,
  closeButtonLabel = "Close",
  showCloseButton = true,
  ref,
  ...props
}: SurfaceDialogContentProps) {
  const { context, setContentRef } = useSurfaceContentRef(
    "SurfaceDialogContent",
    "dialog-portal",
    "dialog-overlay",
    ref
  )

  return (
    <DialogContent
      ref={setContentRef}
      showCloseButton={false}
      className={cn("sm:max-w-lg", className)}
      {...props}
    >
      {children}
      {showCloseButton && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-2 right-2"
          aria-label={closeButtonLabel}
          onClick={() => void context.close()}
        >
          <XIcon aria-hidden="true" />
        </Button>
      )}
    </DialogContent>
  )
}

type SurfaceDrawerContentProps = React.ComponentProps<typeof DrawerContent> & {
  closeButtonLabel?: string
  showCloseButton?: boolean
}

function SurfaceDrawerContent({
  className,
  children,
  closeButtonLabel = "Close",
  showCloseButton = true,
  ref,
  ...props
}: SurfaceDrawerContentProps) {
  const { context, setContentRef } = useSurfaceContentRef(
    "SurfaceDrawerContent",
    "drawer-portal",
    "drawer-overlay",
    ref
  )
  const snapPointStyle: React.CSSProperties =
    context.drawerSnapAxis === "y"
      ? { height: "100dvh", maxHeight: "100dvh" }
      : context.drawerSnapAxis === "x"
        ? { maxWidth: "100dvw", width: "100dvw" }
        : {}

  return (
    <DrawerContent
      ref={setContentRef}
      className={className}
      {...props}
      style={{ ...snapPointStyle, ...props.style }}
    >
      {children}
      {showCloseButton && (
        <Button
          type="button"
          variant="ghost"
          size="icon-sm"
          className="absolute top-3 right-3"
          aria-label={closeButtonLabel}
          onClick={() => void context.close()}
        >
          <XIcon aria-hidden="true" />
        </Button>
      )}
    </DrawerContent>
  )
}

type SurfaceButtonProps = Omit<
  React.ComponentProps<typeof Button>,
  "children" | "onClick" | "type"
>

type CustomDialogOptions = {
  modal?: boolean
  dismissible?: boolean
}

type DialogOptions = CustomDialogOptions & {
  showCloseButton?: boolean
  closeButtonLabel?: string
  title?: React.ReactNode
  titleIcon?: React.ReactNode
  showTitleIcon?: boolean
}

type AlertDialogOptions = DialogOptions & {
  message?: React.ReactNode
  closeButtonContent?: React.ReactNode
  closeButtonProps?: SurfaceButtonProps
}

type ConfirmDialogOptions = DialogOptions & {
  message?: React.ReactNode
  confirmButtonContent?: React.ReactNode
  confirmButtonProps?: SurfaceButtonProps
  cancelButtonContent?: React.ReactNode
  cancelButtonProps?: SurfaceButtonProps
}

type PromptDialogOptions = DialogOptions & {
  message?: React.ReactNode
  inputLabel?: string
  defaultValue?: string
  placeholder?: string
  inputProps?: Omit<
    React.ComponentProps<typeof Input>,
    "defaultValue" | "name" | "value"
  >
  confirmButtonContent?: React.ReactNode
  confirmButtonProps?: SurfaceButtonProps
  cancelButtonContent?: React.ReactNode
  cancelButtonProps?: SurfaceButtonProps
}

type DrawerSide = "top" | "right" | "bottom" | "left"
type DrawerSwipeDirection = "up" | "right" | "down" | "left"
type DrawerSnapPoint = number | `${number}px` | `${number}rem`

type CustomDrawerOptions = {
  side?: DrawerSide
  modal?: boolean
  dismissible?: boolean
  snapPoints?: DrawerSnapPoint[]
}

type DrawerOptions = CustomDrawerOptions & {
  title?: React.ReactNode
  message?: React.ReactNode
  showCloseButton?: boolean
  closeButtonLabel?: string
}

type DrawerActionItem<T> = {
  value: T
  label: React.ReactNode
  buttonProps?: SurfaceButtonProps
}

type ActionDrawerOptions<T> = DrawerOptions & {
  actions: readonly DrawerActionItem<T>[]
  cancelButtonContent?: React.ReactNode
  cancelButtonProps?: SurfaceButtonProps
}

type ConfirmDrawerOptions = DrawerOptions & {
  confirmButtonContent?: React.ReactNode
  confirmButtonProps?: SurfaceButtonProps
  cancelButtonContent?: React.ReactNode
  cancelButtonProps?: SurfaceButtonProps
}

type PromptDrawerOptions = DrawerOptions & {
  inputLabel?: string
  defaultValue?: string
  placeholder?: string
  inputProps?: Omit<
    React.ComponentProps<typeof Input>,
    "defaultValue" | "name" | "value"
  >
  confirmButtonContent?: React.ReactNode
  confirmButtonProps?: SurfaceButtonProps
  cancelButtonContent?: React.ReactNode
  cancelButtonProps?: SurfaceButtonProps
}

type CustomDialogSurfaceProps<T> = {
  content: (close: (result?: T) => Promise<void>) => React.ReactNode
  options: CustomDialogOptions
  resolveResult: (result: T | null | undefined) => void
}

function custom<T = unknown>(
  content: (close: (result?: T) => Promise<void>) => React.ReactNode,
  options: CustomDialogOptions = {}
): Promise<T | null> {
  const CustomSurfaceModal = NiceModal.create<CustomDialogSurfaceProps<T>>(
    ({ content: renderContent, options: modalOptions, resolveResult }) => {
      const modal = useModal()
      const {
        close,
        contentElement,
        handleOpenChangeComplete,
        setContentElement,
      } = useSurfaceLifecycle<T>(modal, resolveResult)
      const isModal = modalOptions.modal ?? true
      const isDismissible = modalOptions.dismissible ?? isModal

      useNonModalPageAccess(contentElement, !isModal)

      React.useEffect(() => {
        if (!modal.visible || isDismissible || !isModal) return

        if (!contentElement) return

        const ownerDocument = contentElement.ownerDocument
        const handleKeyDown = (event: KeyboardEvent) => {
          if (
            event.key !== "Escape" ||
            !contentElement.contains(event.target as Node)
          ) {
            return
          }

          event.preventDefault()
          event.stopPropagation()
          void close()
        }

        ownerDocument.addEventListener("keydown", handleKeyDown, true)
        return () =>
          ownerDocument.removeEventListener("keydown", handleKeyDown, true)
      }, [
        close,
        isDismissible,
        contentElement,
        isModal,
        modal.visible,
      ])

      const contextValue = React.useMemo<SurfaceContextValue>(
        () => ({
          close: () => close(),
          drawerSnapAxis: null,
          modal: isModal,
          setContentElement,
        }),
        [close, isModal, setContentElement]
      )
      const compatibilityProps: SurfaceRootCompatibilityProps = {
        onOpenChangeComplete: handleOpenChangeComplete,
      }

      return (
        <SurfaceContext.Provider value={contextValue}>
          <Dialog
            {...compatibilityProps}
            modal={isModal}
            open={modal.visible}
            onOpenChange={(open) => {
              if (
                open ||
                !modal.visible ||
                !isModal ||
                !isDismissible
              ) {
                return
              }

              void close()
            }}
          >
            {renderContent(close)}
          </Dialog>
        </SurfaceContext.Provider>
      )
    }
  )

  return new Promise<T | null>((resolveResult) => {
    void NiceModal.show(CustomSurfaceModal, {
      content,
      options,
      resolveResult: (result) => resolveResult(result ?? null),
    })
  })
}

type DrawerSurfaceProps<T> = {
  content: (close: (result?: T) => Promise<void>) => React.ReactNode
  options: CustomDrawerOptions
  resolveResult: (result: T | null | undefined) => void
}

type DrawerCompatibilityProps = {
  direction: DrawerSide
  swipeDirection: DrawerSwipeDirection
  showSwipeHandle: boolean
  dismissible: boolean
  disablePointerDismissal: boolean
  onOpenChangeComplete: (open: boolean) => void
}

function drawerSwipeDirection(side: DrawerSide): DrawerSwipeDirection {
  if (side === "top") return "up"
  if (side === "bottom") return "down"
  return side
}

function openDrawer<T = unknown>(
  content: (close: (result?: T) => Promise<void>) => React.ReactNode,
  options: CustomDrawerOptions = {}
): Promise<T | null> {
  const CustomSurfaceDrawer = NiceModal.create<DrawerSurfaceProps<T>>(
    ({ content: renderContent, options: drawerOptions, resolveResult }) => {
      const modal = useModal()
      const {
        close,
        contentElement,
        handleOpenChangeComplete,
        setContentElement,
      } = useSurfaceLifecycle<T>(modal, resolveResult)
      const isModal = drawerOptions.modal ?? true
      const isDismissible = drawerOptions.dismissible ?? isModal
      const side = drawerOptions.side ?? "bottom"
      const drawerSnapAxis = drawerOptions.snapPoints?.length
        ? side === "top" || side === "bottom"
          ? "y"
          : "x"
        : null

      useNonModalPageAccess(contentElement, !isModal)
      const compatibilityProps: DrawerCompatibilityProps = {
        direction: side,
        swipeDirection: drawerSwipeDirection(side),
        showSwipeHandle: side === "bottom",
        dismissible: isDismissible,
        disablePointerDismissal: !isDismissible,
        onOpenChangeComplete: handleOpenChangeComplete,
      }

      const contextValue = React.useMemo<SurfaceContextValue>(
        () => ({
          close: () => close(),
          drawerSnapAxis,
          modal: isModal,
          setContentElement,
        }),
        [close, drawerSnapAxis, isModal, setContentElement]
      )

      return (
        <SurfaceContext.Provider value={contextValue}>
          <Drawer
            {...compatibilityProps}
            modal={isModal}
            open={modal.visible}
            snapPoints={drawerOptions.snapPoints}
            onOpenChange={(open) => {
              if (open || !modal.visible || !isDismissible) return
              void close()
            }}
          >
            {renderContent(close)}
          </Drawer>
        </SurfaceContext.Provider>
      )
    }
  )

  return new Promise<T | null>((resolveResult) => {
    void NiceModal.show(CustomSurfaceDrawer, {
      content,
      options,
      resolveResult: (result) => resolveResult(result ?? null),
    })
  })
}

function titleIcon(options: DialogOptions) {
  if (!(options.showTitleIcon ?? true)) return null

  return (
    <span className="contents" aria-hidden="true">
      {options.titleIcon ?? <AlertCircleIcon className="size-5" />}
    </span>
  )
}

const dialog = {
  custom,

  async alert(options: AlertDialogOptions = {}): Promise<void> {
    await custom<null>(
      (close) => (
        <SurfaceDialogContent
          role="alertdialog"
          closeButtonLabel={options.closeButtonLabel}
          showCloseButton={options.showCloseButton ?? true}
        >
          <DialogHeader>
            <DialogTitle className="flex flex-row items-center gap-2">
              {titleIcon(options)}
              {options.title ?? "Alert"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3">
            <DialogDescription className="text-popover-foreground">
              {options.message}
            </DialogDescription>
            <Button
              {...options.closeButtonProps}
              type="button"
              onClick={() => void close(null)}
            >
              {options.closeButtonContent ?? "Close"}
            </Button>
          </div>
        </SurfaceDialogContent>
      ),
      {
        modal: options.modal,
        dismissible: options.dismissible ?? false,
      }
    )
  },

  async confirm(options: ConfirmDialogOptions = {}): Promise<boolean | null> {
    const result = await custom<boolean>(
      (close) => (
        <SurfaceDialogContent
          role="alertdialog"
          closeButtonLabel={options.closeButtonLabel}
          showCloseButton={options.showCloseButton ?? true}
        >
          <DialogHeader>
            <DialogTitle className="flex flex-row items-center gap-2">
              {titleIcon(options)}
              {options.title ?? "Confirm"}
            </DialogTitle>
          </DialogHeader>
          <div className="flex flex-col items-center gap-3">
            <DialogDescription className="text-popover-foreground">
              {options.message}
            </DialogDescription>
            <div className="flex flex-row gap-3">
              <Button
                {...options.cancelButtonProps}
                type="button"
                variant={options.cancelButtonProps?.variant ?? "outline"}
                onClick={() => void close(false)}
              >
                {options.cancelButtonContent ?? "Cancel"}
              </Button>
              <Button
                {...options.confirmButtonProps}
                type="button"
                onClick={() => void close(true)}
              >
                {options.confirmButtonContent ?? "Confirm"}
              </Button>
            </div>
          </div>
        </SurfaceDialogContent>
      ),
      {
        modal: options.modal,
        dismissible: options.dismissible ?? true,
      }
    )

    return result
  },

  async prompt(options: PromptDialogOptions = {}): Promise<string | null> {
    const result = await custom<string | null>(
      (close) => (
        <SurfaceDialogContent
          closeButtonLabel={options.closeButtonLabel}
          showCloseButton={options.showCloseButton ?? true}
        >
          <form
            className="contents"
            onSubmit={(event) => {
              event.preventDefault()
              const formData = new FormData(event.currentTarget)
              const value = formData.get("surface-prompt-value")
              void close(typeof value === "string" ? value : "")
            }}
          >
            <DialogHeader>
              <DialogTitle className="flex flex-row items-center gap-2">
                {titleIcon(options)}
                {options.title ?? "Prompt"}
              </DialogTitle>
            </DialogHeader>
            <div className="flex flex-col items-center gap-3">
              <DialogDescription className="text-popover-foreground">
                {options.message}
              </DialogDescription>
              <Input
                {...options.inputProps}
                name="surface-prompt-value"
                aria-label={
                  options.inputLabel ??
                  options.inputProps?.["aria-label"] ??
                  "Input"
                }
                defaultValue={options.defaultValue}
                placeholder={options.placeholder}
              />
              <div className="flex flex-row gap-3">
                <Button
                  {...options.cancelButtonProps}
                  type="button"
                  variant={options.cancelButtonProps?.variant ?? "outline"}
                  onClick={() => void close(null)}
                >
                  {options.cancelButtonContent ?? "Cancel"}
                </Button>
                <Button {...options.confirmButtonProps} type="submit">
                  {options.confirmButtonContent ?? "Confirm"}
                </Button>
              </div>
            </div>
          </form>
        </SurfaceDialogContent>
      ),
      options
    )

    return result ?? null
  },
}

const drawer = {
  custom: openDrawer,

  async actions<T>(options: ActionDrawerOptions<T>): Promise<T | null> {
    const result = await openDrawer<T | null>(
      (close) => (
        <SurfaceDrawerContent
          closeButtonLabel={options.closeButtonLabel}
          showCloseButton={options.showCloseButton ?? true}
        >
          <DrawerHeader>
            <DrawerTitle>{options.title ?? "Choose an action"}</DrawerTitle>
            {options.message !== undefined && (
              <DrawerDescription>{options.message}</DrawerDescription>
            )}
          </DrawerHeader>
          <div className="flex min-h-0 flex-col gap-2 overflow-y-auto p-4">
            {options.actions.map((action, index) => (
              <Button
                {...action.buttonProps}
                key={index}
                type="button"
                className={cn(
                  "w-full justify-start",
                  action.buttonProps?.className
                )}
                onClick={() => void close(action.value)}
              >
                {action.label}
              </Button>
            ))}
          </div>
          <DrawerFooter>
            <Button
              {...options.cancelButtonProps}
              type="button"
              variant={options.cancelButtonProps?.variant ?? "outline"}
              onClick={() => void close(null)}
            >
              {options.cancelButtonContent ?? "Cancel"}
            </Button>
          </DrawerFooter>
        </SurfaceDrawerContent>
      ),
      options
    )

    return result ?? null
  },

  async confirm(options: ConfirmDrawerOptions = {}): Promise<boolean | null> {
    const result = await openDrawer<boolean>(
      (close) => (
        <SurfaceDrawerContent
          role="alertdialog"
          closeButtonLabel={options.closeButtonLabel}
          showCloseButton={options.showCloseButton ?? true}
        >
          <DrawerHeader>
            <DrawerTitle>{options.title ?? "Confirm"}</DrawerTitle>
            {options.message !== undefined && (
              <DrawerDescription>{options.message}</DrawerDescription>
            )}
          </DrawerHeader>
          <DrawerFooter>
            <Button
              {...options.cancelButtonProps}
              type="button"
              variant={options.cancelButtonProps?.variant ?? "outline"}
              onClick={() => void close(false)}
            >
              {options.cancelButtonContent ?? "Cancel"}
            </Button>
            <Button
              {...options.confirmButtonProps}
              type="button"
              onClick={() => void close(true)}
            >
              {options.confirmButtonContent ?? "Confirm"}
            </Button>
          </DrawerFooter>
        </SurfaceDrawerContent>
      ),
      options
    )

    return result
  },

  async prompt(options: PromptDrawerOptions = {}): Promise<string | null> {
    const result = await openDrawer<string | null>(
      (close) => (
        <SurfaceDrawerContent
          closeButtonLabel={options.closeButtonLabel}
          showCloseButton={options.showCloseButton ?? true}
        >
          <form
            className="contents"
            onSubmit={(event) => {
              event.preventDefault()
              const formData = new FormData(event.currentTarget)
              const value = formData.get("surface-drawer-prompt-value")
              void close(typeof value === "string" ? value : "")
            }}
          >
            <DrawerHeader>
              <DrawerTitle>{options.title ?? "Prompt"}</DrawerTitle>
              {options.message !== undefined && (
                <DrawerDescription>{options.message}</DrawerDescription>
              )}
            </DrawerHeader>
            <div className="p-4">
              <Input
                {...options.inputProps}
                name="surface-drawer-prompt-value"
                aria-label={
                  options.inputLabel ??
                  options.inputProps?.["aria-label"] ??
                  "Input"
                }
                defaultValue={options.defaultValue}
                placeholder={options.placeholder}
              />
            </div>
            <DrawerFooter>
              <Button
                {...options.cancelButtonProps}
                type="button"
                variant={options.cancelButtonProps?.variant ?? "outline"}
                onClick={() => void close(null)}
              >
                {options.cancelButtonContent ?? "Cancel"}
              </Button>
              <Button {...options.confirmButtonProps} type="submit">
                {options.confirmButtonContent ?? "Confirm"}
              </Button>
            </DrawerFooter>
          </form>
        </SurfaceDrawerContent>
      ),
      options
    )

    return result ?? null
  },
}

export { dialog, drawer, SurfaceDialogContent, SurfaceDrawerContent }
export type {
  ActionDrawerOptions,
  AlertDialogOptions,
  ConfirmDrawerOptions,
  ConfirmDialogOptions,
  CustomDialogOptions,
  CustomDrawerOptions,
  DialogOptions,
  DrawerActionItem,
  DrawerOptions,
  DrawerSide,
  DrawerSnapPoint,
  PromptDrawerOptions,
  PromptDialogOptions,
  SurfaceButtonProps,
  SurfaceDialogContentProps,
  SurfaceDrawerContentProps,
}
