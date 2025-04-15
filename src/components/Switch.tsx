"use client"

import * as React from "react"
import * as SwitchPrimitives from "@radix-ui/react-switch"

import { cn } from "@/config/tailwindUtils"

const Switch = React.forwardRef<
  React.ElementRef<typeof SwitchPrimitives.Root>,
  React.ComponentPropsWithoutRef<typeof SwitchPrimitives.Root>
>(({ className, ...props }, ref) => (
  <SwitchPrimitives.Root
    className={cn(
      // Switch outer style
      "peer inline-flex h-[28px] w-[60px] shrink-0 cursor-pointer items-center rounded-full border border-gray-300 bg-[#E6EAEC] transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 data-[state=checked]:bg-camp-primary data-[state=unchecked]:bg-[#1E8E3E]",
      className
    )}
    {...props}
    ref={ref}
  >
    <SwitchPrimitives.Thumb
      className={cn(
        // Switch circle style
        "pointer-events-none block h-[20px] w-[20px] rounded-full bg-white shadow-md ring-0 transition-transform duration-300 data-[state=checked]:translate-x-[34px] data-[state=unchecked]:translate-x-[4px]"
      )}
    />
  </SwitchPrimitives.Root>
))
Switch.displayName = SwitchPrimitives.Root.displayName

export { Switch }
