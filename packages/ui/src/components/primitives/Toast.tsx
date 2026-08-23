import type { ComponentProps, ReactElement } from 'react'
import { Toaster as SonnerToaster, toast as sonnerToast } from 'sonner'

export type ToasterProps = ComponentProps<typeof SonnerToaster>

export function Toaster(props: ToasterProps): ReactElement {
  return (
    <SonnerToaster
      position="top-right"
      richColors
      closeButton
      toastOptions={{
        classNames: {
          toast: 'border border-border bg-card text-foreground shadow-sm',
        },
      }}
      {...props}
    />
  )
}

/** Thin wrapper — prefer this over importing sonner in apps. */
export const toast = {
  success: (message: string): string | number => sonnerToast.success(message),
  error: (message: string): string | number => sonnerToast.error(message),
  info: (message: string): string | number => sonnerToast.info(message),
  message: (message: string): string | number => sonnerToast.message(message),
}
