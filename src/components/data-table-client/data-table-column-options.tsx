"use client"

import * as React from "react"
import type { StringKeyOf } from "@/types"
import type { Table } from "@tanstack/react-table"
import {
  Check,
  ChevronsUpDown,
  GripVertical,
  Pin,
  PinOff,
  Settings2,
} from "lucide-react"

import { cn, toSentenceCase } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Sortable,
  SortableDragHandle,
  SortableItem,
} from "@/components/ui/sortable"

type PinDirection = "left" | "right" | false

interface DataTableColumnOptionsProps<TData> {
  table: Table<TData>
}

export function DataTableColumnOptions<TData>({
  table,
}: DataTableColumnOptionsProps<TData>) {
  //   const id = React.useId()
  const triggerRef = React.useRef<HTMLButtonElement>(null)
  const pinning = table.getState().columnPinning

  console.log("Pining", pinning)

  const pinnedColumns = React.useMemo(() => {
    const left =
      pinning.left?.map((id) => ({
        id,
        pinned: "left" as PinDirection,
      })) || []
    const right =
      pinning.right?.map((id) => ({
        id,
        pinned: "right" as PinDirection,
      })) || []
    return [...left, ...right]
  }, [pinning])

  //   const pinnableColumns = React.useMemo(
  //     () =>
  //       table
  //         .getAllColumns()
  //         .filter((column) => column.getCanPin() && !column.getIsPinned())
  //         .map((column) => ({
  //           id: column.id,
  //           label: toSentenceCase(column.id),
  //         })),
  //     [table, pinnedColumns]
  //   )

  function updatePin(columnId: string, direction: PinDirection) {
    table.setColumnPinning((old) => {
      const newPinning = {
        left: [...(old.left || [])].filter((id) => id !== columnId),
        right: [...(old.right || [])].filter((id) => id !== columnId),
      }
      if (direction === "left") {
        newPinning.left.push(columnId)
      } else if (direction === "right") {
        newPinning.right.push(columnId)
      }
      return newPinning
    })
  }

  function removePin(columnId: string) {
    table.setColumnPinning((old) => ({
      left: [...(old.left || [])].filter((id) => id !== columnId),
      right: [...(old.right || [])].filter((id) => id !== columnId),
    }))
  }

  return (
    <Popover modal>
      <PopoverTrigger asChild>
        <Button
          ref={triggerRef}
          variant="outline"
          size="sm"
          className="ml-auto hidden h-8 gap-2 lg:flex"
        >
          <Settings2 className="size-4" />
          Columns
          {pinnedColumns.length > 0 && (
            <Badge
              variant="secondary"
              className="h-[1.14rem] px-1 font-mono text-xs"
            >
              {pinnedColumns.length}
            </Badge>
          )}
          <ChevronsUpDown className="ml-auto size-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        align="end"
        className="w-[300px] p-0"
        onCloseAutoFocus={() => triggerRef.current?.focus()}
      >
        <Command>
          <CommandInput placeholder="Search columns..." />
          <CommandList>
            <CommandEmpty>No columns found.</CommandEmpty>

            {/* Pinned Columns Section */}
            {pinnedColumns.length > 0 && (
              <CommandGroup heading="Pinned Columns">
                <Sortable
                  value={pinnedColumns}
                  onValueChange={(newPinning) => {
                    const left = newPinning
                      .filter((p) => p.pinned === "left")
                      .map((p) => p.id)
                    const right = newPinning
                      .filter((p) => p.pinned === "right")
                      .map((p) => p.id)
                    table.setColumnPinning({ left, right })
                  }}
                >
                  {pinnedColumns.map((pin) => (
                    <SortableItem
                      key={pin.id}
                      id={pin.id}
                      value={pin.id}
                      className="flex items-center gap-2 px-2 py-1"
                    >
                      <SortableDragHandle
                        variant="outline"
                        size="icon"
                        className="size-8 shrink-0 rounded"
                      >
                        <GripVertical className="size-3.5" aria-hidden="true" />
                      </SortableDragHandle>
                      <span className="flex-1 truncate">
                        {toSentenceCase(pin.id)}
                      </span>
                      <Select
                        value={pin.pinned.toString()}
                        onValueChange={(value) =>
                          updatePin(pin.id, value as PinDirection)
                        }
                      >
                        <SelectTrigger className="h-7 w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="left">Left</SelectItem>
                          <SelectItem value="right">Right</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="size-7"
                        onClick={() => removePin(pin.id)}
                      >
                        <PinOff className="size-3" />
                      </Button>
                    </SortableItem>
                  ))}
                </Sortable>
                <CommandSeparator />
              </CommandGroup>
            )}

            {/* Column Visibility Section */}
            <CommandGroup heading="Toggle Visibility">
              {table
                .getAllColumns()
                .filter(
                  (column) =>
                    typeof column.accessorFn !== "undefined" &&
                    column.getCanHide()
                )
                .map((column) => {
                  return (
                    <CommandItem
                      key={column.id}
                      onSelect={() =>
                        column.toggleVisibility(!column.getIsVisible())
                      }
                      className="gap-2"
                    >
                      <Check
                        className={cn(
                          "size-4",
                          column.getIsVisible() ? "opacity-100" : "opacity-0"
                        )}
                      />
                      <span className="flex-1 truncate">
                        {toSentenceCase(column.id)}
                      </span>
                      {column.getCanPin() && !column.getIsPinned() && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="size-7"
                          onClick={(e) => {
                            e.stopPropagation()
                            updatePin(column.id, "left")
                          }}
                        >
                          <Pin className="size-3" />
                        </Button>
                      )}
                    </CommandItem>
                  )
                })}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
