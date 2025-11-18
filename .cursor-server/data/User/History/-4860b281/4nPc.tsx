import { cn } from "@/lib/utils"

function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-xl bg-gradient-to-r from-muted via-muted/50 to-muted",
        className
      )}
      style={{ borderRadius: '16px' }}
      {...props}
    />
  )
}

export { Skeleton }
