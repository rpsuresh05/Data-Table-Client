"use client"

import * as React from "react"
import type {
  ExtendedColumnSort,
  ExtendedSortingState,
  StringKeyOf,
} from "@/types"
import type { SortDirection, Table } from "@tanstack/react-table"
import {
  ArrowDownUp,
  Check,
  ChevronsUpDown,
  GripVertical,
  Pin,
  PinOff,
  PinOffIcon,
  Trash2,
} from "lucide-react"
import { useQueryState } from "nuqs"

import { dataTableConfig } from "@/config/data-table"
import { getSortingStateParser } from "@/lib/parsers"
import { cn, toSentenceCase } from "@/lib/utils"
import { useDebouncedCallback } from "@/hooks/use-debounced-callback"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
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

interface DataTablePinListProps<TData> {
  table: Table<TData>
  debounceMs?: number
  shallow?: boolean
}

type PinDirection = "left" | "right" | false

interface ExtendedPinningState<TData> {
  id: StringKeyOf<TData>
  pinned: PinDirection
}

export function DataTablePinList<TData>({
  table,
  debounceMs = 100,
  shallow,
}: DataTablePinListProps<TData>) {
  const id = React.useId()

  // const initialPinning = table.initialState.columnPinning ?? {
  //   left: [],
  //   right: [],
  // }

  // const [_, setColumnPinning] = React.useState(table.getState().columnPinning)
  let pinning = table.getState().columnPinning

  const pinnedColumns = React.useMemo(() => {
    console.log("PINNING", pinning)
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
    console.log("LEFT", right, left)
    return [...left, ...right]
  }, [pinning])

  const pinnableColumns = React.useMemo(
    () =>
      table
        .getAllColumns()
        .filter(
          (column) => column.getCanPin() && !column.getIsPinned() //!pinnedColumns.some((p) => p.id === column.id)
        )
        .map((column) => ({
          id: column.id,
          label: toSentenceCase(column.id),
          pin: column.pin,
        })),
    [pinnedColumns, table]
  )

  function addPin(columnId: string, direction: PinDirection) {
    table.setColumnPinning((old) => {
      const newPinning = { ...old }
      if (direction === "left") {
        newPinning.left = [...(old.left || []), columnId]
      } else if (direction === "right") {
        newPinning.right = [...(old.right || []), columnId]
      }
      return newPinning
    })
  }

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
      overlay={
        <div className="flex items-center gap-2">
          <div className="h-8 w-[7rem] rounded-sm bg-primary/10" />
          <div className="h-8 w-24 rounded-sm bg-primary/10" />
          <div className="size-8 shrink-0 rounded-sm bg-primary/10" />
          <div className="size-8 shrink-0 rounded-sm bg-primary/10" />
        </div>
      }
    >
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            size="sm"
            className="gap-2"
            aria-label="Open pinning"
            aria-controls={`${id}-pin-dialog`}
          >
            <Pin className="size-3" aria-hidden="true" />
            {/* <GripVertical className="size-3" aria-hidden="true" /> */}
            Pin
            {pinnedColumns.length > 0 && (
              <Badge
                variant="secondary"
                className="h-[1.14rem] rounded-[0.2rem] px-[0.32rem] font-mono text-[0.65rem] font-normal"
              >
                {pinnedColumns.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          id={`${id}-pin-dialog`}
          align="end"
          collisionPadding={16}
          className={cn(
            "flex w-[calc(100vw-theme(spacing.20))] min-w-72 max-w-[20rem] origin-[var(--radix-popover-content-transform-origin)] flex-col p-4 sm:w-[25rem]",
            pinnedColumns.length > 0 ? "gap-3.5" : "gap-2"
          )}
        >
          {pinnedColumns.length > 0 ? (
            <h4 className="font-medium leading-none">Pinned columns</h4>
          ) : (
            <div className="flex flex-col gap-1">
              <h4 className="font-medium leading-none">No columns pinned</h4>
              <p className="text-sm text-muted-foreground">
                Pin columns to keep them visible while scrolling
              </p>
            </div>
          )}
          {pinnedColumns.length > 0 && (
            <div className="flex flex-col gap-2">
              {pinnedColumns.map((pin) => (
                <SortableItem
                  key={pin.id}
                  id={pin.id}
                  className="flex items-center gap-2"
                  value={pin.id}
                >
                  <SortableDragHandle
                    variant="outline"
                    size="icon"
                    className="size-8 shrink-0 rounded"
                  >
                    <GripVertical className="size-3.5" aria-hidden="true" />
                  </SortableDragHandle>
                  <span className="flex-1 truncate text-sm">
                    {toSentenceCase(pin.id)}
                  </span>
                  <Select
                    value={pin.pinned.toString()}
                    onValueChange={(value) =>
                      updatePin(pin.id, value as PinDirection)
                    }
                  >
                    <SelectTrigger className="h-8 w-24">
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
                    className="size-8"
                    onClick={() => removePin(pin.id)}
                  >
                    <PinOff className="size-4" aria-hidden="true" />
                    <span className="sr-only">Remove pin</span>
                  </Button>
                </SortableItem>
              ))}
            </div>
          )}
          {pinnableColumns.length > 0 && (
            <Command>
              <CommandInput placeholder="Add column..." />
              <CommandList>
                <CommandEmpty>No columns found</CommandEmpty>
                <CommandGroup>
                  {pinnableColumns.map((column) => (
                    <CommandItem
                      key={column.id}
                      value={column.id}
                      onSelect={() => addPin(column.id, "left")}
                    >
                      {column.label}
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          )}
        </PopoverContent>
      </Popover>
    </Sortable>
  )
}
