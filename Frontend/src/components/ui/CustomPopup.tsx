import * as React from "react"
import { cn } from "@/lib/utils"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "./dialog"

interface CustomPopupProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children: React.ReactNode
  footer?: React.ReactNode
  className?: string
  headerClassName?: string
  maxWidth?: "sm" | "md" | "lg" | "xl" | "2xl" | "3xl" | "4xl" | "5xl"
}

const maxWidthMap = {
  sm: "max-w-sm",
  md: "max-w-md",
  lg: "max-w-lg",
  xl: "max-w-xl",
  "2xl": "max-w-2xl",
  "3xl": "max-w-3xl",
  "4xl": "max-w-4xl",
  "5xl": "max-w-5xl",
}

export function CustomPopup({
  isOpen,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  headerClassName,
  maxWidth = "lg",
}: CustomPopupProps) {
  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent 
        className={cn(
          "overflow-hidden border-none p-0 bg-transparent shadow-none",
          maxWidthMap[maxWidth]
        )}
      >
        <div className={cn(
          "relative flex flex-col w-full bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border border-white/20 dark:border-slate-800/50 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.2)] dark:shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden",
          className
        )}>
          {/* Top Decorative Gradient */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
          
          <DialogHeader className={cn("px-8 pt-8 pb-4", headerClassName)}>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-br from-slate-900 to-slate-600 dark:from-white dark:to-slate-400 bg-clip-text text-transparent">
              {title}
            </DialogTitle>
            {description && (
              <DialogDescription className="text-slate-500 dark:text-slate-400 font-medium">
                {description}
              </DialogDescription>
            )}
          </DialogHeader>

          <div className="px-8 pb-8 flex-1 overflow-y-auto max-h-[70vh] custom-scrollbar">
            {children}
          </div>

          {footer && (
            <DialogFooter className="px-8 py-6 bg-slate-50/50 dark:bg-slate-900/50 border-t border-slate-100 dark:border-slate-800">
              {footer}
            </DialogFooter>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
