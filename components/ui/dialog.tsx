"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  children: React.ReactNode
}

interface DialogContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

const DialogContext = React.createContext<{
  open: boolean
  onOpenChange: (open: boolean) => void
}>({
  open: false,
  onOpenChange: () => {},
})

export function Dialog({ open, onOpenChange, children }: DialogProps) {
  React.useEffect(() => {
    if (open) {
      document.body.style.overflow = "hidden"
    } else {
      document.body.style.overflow = ""
    }
    return () => {
      document.body.style.overflow = ""
    }
  }, [open])

  return (
    <DialogContext.Provider value={{ open, onOpenChange }}>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center"
          onClick={() => onOpenChange(false)}
        >
          <div
            className="fixed inset-0 bg-black/50"
            aria-hidden="true"
          />
          <div onClick={(e) => e.stopPropagation()}>{children}</div>
        </div>
      )}
    </DialogContext.Provider>
  )
}

export function DialogContent({
  className,
  children,
  ...props
}: DialogContentProps) {
  const { onOpenChange } = React.useContext(DialogContext)

  return (
    <div
      className={cn(
        "relative z-50 w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white rounded-lg shadow-lg p-6",
        className
      )}
      {...props}
    >
      <button
        onClick={() => onOpenChange(false)}
        className="absolute top-4 right-4 rounded-sm opacity-70 hover:opacity-100 transition-opacity"
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M6 18L18 6M6 6l12 12"
          />
        </svg>
      </button>
      {children}
    </div>
  )
}

export function DialogHeader({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn("flex flex-col space-y-1.5 mb-4", className)}
      {...props}
    />
  )
}

export function DialogTitle({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) {
  return (
    <h2
      className={cn("text-2xl font-semibold text-slate-900", className)}
      {...props}
    />
  )
}

export function DialogDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) {
  return (
    <p
      className={cn("text-sm text-slate-500", className)}
      {...props}
    />
  )
}

