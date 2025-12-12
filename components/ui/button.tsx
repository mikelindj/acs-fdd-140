import * as React from "react"
import { cn } from "@/lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", ...props }, ref) => {
    return (
      <button
        className={cn(
          "inline-flex items-center justify-center rounded-lg text-sm font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:pointer-events-none disabled:opacity-50",
          variant === "default" && "bg-blue-600 text-white shadow-sm hover:bg-blue-500 focus-visible:outline-blue-600 h-10 px-4 py-2",
          variant === "destructive" && "bg-red-600 text-white shadow-sm hover:bg-red-500 focus-visible:outline-red-600 h-10 px-4 py-2",
          variant === "outline" && "border border-slate-300 bg-white text-slate-700 shadow-sm hover:bg-slate-50 focus-visible:outline-blue-600 h-10 px-4 py-2",
          variant === "secondary" && "bg-slate-100 text-slate-900 shadow-sm hover:bg-slate-200 focus-visible:outline-blue-600 h-10 px-4 py-2",
          variant === "ghost" && "text-slate-700 hover:bg-slate-100 focus-visible:outline-blue-600 h-10 px-4 py-2",
          variant === "link" && "text-blue-600 underline-offset-4 hover:underline hover:text-blue-500 h-10 px-4 py-2",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }

