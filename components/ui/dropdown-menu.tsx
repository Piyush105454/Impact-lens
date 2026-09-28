"use client";
import * as React from "react";
import * as Dropdown from "@radix-ui/react-dropdown-menu";
import { cn } from "@/lib/utils";

export const DropdownMenu = Dropdown.Root;
export const DropdownMenuTrigger = Dropdown.Trigger;

export const DropdownMenuContent = React.forwardRef<React.ElementRef<typeof Dropdown.Content>, React.ComponentPropsWithoutRef<typeof Dropdown.Content>>(({ className, sideOffset = 8, ...props }, ref) => (
  <Dropdown.Portal>
    <Dropdown.Content ref={ref} sideOffset={sideOffset} className={cn("z-50 min-w-[220px] overflow-hidden rounded-xl border bg-popover p-1.5 shadow-xl shadow-black/40 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95", className)} {...props} />
  </Dropdown.Portal>
));
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuItem = React.forwardRef<React.ElementRef<typeof Dropdown.Item>, React.ComponentPropsWithoutRef<typeof Dropdown.Item>>(({ className, ...props }, ref) => (
  <Dropdown.Item ref={ref} className={cn("flex cursor-pointer select-none items-center gap-2 rounded-lg px-2.5 py-2 text-sm outline-none transition-colors focus:bg-accent data-[disabled]:opacity-50 [&_svg]:size-4 [&_svg]:text-muted-foreground", className)} {...props} />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuSeparator = () => <Dropdown.Separator className="-mx-1.5 my-1.5 h-px bg-border" />;
export const DropdownMenuLabel = ({ children }: { children: React.ReactNode }) => <Dropdown.Label className="px-2.5 py-2">{children}</Dropdown.Label>;
