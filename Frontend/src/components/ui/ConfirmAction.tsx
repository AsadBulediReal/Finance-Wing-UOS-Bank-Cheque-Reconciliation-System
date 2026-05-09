
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "./alert-dialog"

interface ConfirmActionProps {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
  showCancel?: boolean
}

export function ConfirmAction({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Continue",
  cancelText = "Cancel",
  variant = "default",
  showCancel = true,
}: ConfirmActionProps) {
  return (
    <AlertDialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <AlertDialogContent className="rounded-3xl border-none bg-white dark:bg-slate-900 shadow-2xl p-0 overflow-hidden max-w-[400px]">
        <div className="p-8">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
              {title}
            </AlertDialogTitle>
            <AlertDialogDescription className="text-slate-500 dark:text-slate-400 font-medium text-sm leading-relaxed mt-2">
              {description}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-8 flex gap-3 sm:gap-3">
            {showCancel && (
              <AlertDialogCancel className="flex-1 rounded-2xl border-slate-200 text-slate-600 font-bold text-xs uppercase tracking-widest hover:bg-slate-50 transition-all h-12">
                {cancelText}
              </AlertDialogCancel>
            )}
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault();
                onConfirm();
                onClose();
              }}
              className={variant === "destructive" 
                ? "flex-1 rounded-2xl bg-red-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-red-700 shadow-lg shadow-red-500/20 transition-all h-12"
                : "flex-1 rounded-2xl bg-indigo-600 text-white font-bold text-xs uppercase tracking-widest hover:bg-indigo-700 shadow-lg shadow-indigo-500/20 transition-all h-12"
              }
            >
              {confirmText}
            </AlertDialogAction>
          </AlertDialogFooter>
        </div>
      </AlertDialogContent>
    </AlertDialog>
  )
}
