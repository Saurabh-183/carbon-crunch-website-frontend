import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner"

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      position="bottom-right"
      expand={true}
      richColors
      closeButton
      duration={4000}
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-gray-900 group-[.toaster]:border group-[.toaster]:border-gray-200 group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl group-[.toaster]:p-4 group-[.toaster]:min-w-[320px] dark:group-[.toaster]:bg-zinc-950 dark:group-[.toaster]:text-zinc-50 dark:group-[.toaster]:border-zinc-800",
          description: "group-[.toast]:text-gray-600 group-[.toast]:text-sm dark:group-[.toast]:text-zinc-400",
          actionButton:
            "group-[.toast]:bg-green-600 group-[.toast]:text-white group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:font-medium dark:group-[.toast]:bg-green-500",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-700 group-[.toast]:rounded-lg group-[.toast]:px-3 group-[.toast]:py-1.5 group-[.toast]:font-medium dark:group-[.toast]:bg-zinc-800 dark:group-[.toast]:text-zinc-400",
          success:
            "group-[.toaster]:bg-green-50 group-[.toaster]:border-green-200 group-[.toaster]:text-green-900",
          error:
            "group-[.toaster]:bg-red-50 group-[.toaster]:border-red-200 group-[.toaster]:text-red-900",
          warning:
            "group-[.toaster]:bg-amber-50 group-[.toaster]:border-amber-200 group-[.toaster]:text-amber-900",
          info:
            "group-[.toaster]:bg-blue-50 group-[.toaster]:border-blue-200 group-[.toaster]:text-blue-900",
          title: "group-[.toast]:font-semibold group-[.toast]:text-sm",
          closeButton:
            "group-[.toast]:bg-white group-[.toast]:border group-[.toast]:border-gray-200 group-[.toast]:text-gray-500 group-[.toast]:hover:text-gray-900 group-[.toast]:rounded-lg",
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
