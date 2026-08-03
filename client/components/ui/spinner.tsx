import { cn } from "@/lib/utils"
import { LuLoaderCircle } from "react-icons/lu"

function Spinner({ className, ...props }: React.ComponentProps<"svg">) {
  return (
    <LuLoaderCircle data-slot="spinner" role="status" aria-label="Loading" className={cn("size-4 animate-spin", className)} {...props} />
  )
}

export { Spinner }
