import type { DataTableAdvancedFilterField, Filter, Option } from "@/types"
import type { Column, Table } from "@tanstack/react-table"
import { Check, PlusCircle } from "lucide-react"
import { customAlphabet } from "nanoid"

import { cn } from "@/lib/utils"
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
import { Separator } from "@/components/ui/separator"

import { FilterValue } from "./data-table-advance-fn"
import { calcUpdateFilter, ColumnFilter } from "./data-table-filter-list"

interface DataTableFacetedFilterProps<TData, TValue> {
  column?: Column<TData, TValue>
  title?: string
  options: Option[]
  setColumnFilters: React.Dispatch<
    React.SetStateAction<{ id: string; value: FilterValue[] }[]>
  >
  table: Table<TData>
}

export function DataTableFacetedFilter<TData, TValue>({
  column,
  title,
  options,
  setColumnFilters,
  table,
}: DataTableFacetedFilterProps<TData, TValue>) {
  const unknownValue = column?.getFilterValue()

  const hasValue:
    | { rowId: string; operator: string; value: string }
    | undefined = (
    unknownValue as Array<{ rowId: string; operator: string; value: string }>
  )?.find((unknownVal: { operator: string }) => unknownVal.operator === "has")

  const selectedValues = new Set(
    Array.isArray(hasValue?.value) ? hasValue?.value : []
  )

  console.log(unknownValue, "faceted filter..", selectedValues, column.id)
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm" className="h-8 border-dashed">
          <PlusCircle className="mr-2 size-4" />
          {title}
          {selectedValues?.size > 0 && (
            <>
              <Separator orientation="vertical" className="mx-2 h-4" />
              <Badge
                variant="secondary"
                className="rounded-sm px-1 font-normal lg:hidden"
              >
                {selectedValues.size}
              </Badge>
              <div className="hidden space-x-1 lg:flex">
                {selectedValues.size > 2 ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {selectedValues.size} selected
                  </Badge>
                ) : (
                  options
                    .filter((option) => selectedValues.has(option.value))
                    .map((option) => (
                      <Badge
                        variant="secondary"
                        key={option.value}
                        className="rounded-sm px-1 font-normal"
                      >
                        {option.label}
                      </Badge>
                    ))
                )}
              </div>
            </>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[12.5rem] p-0" align="start">
        <Command>
          <CommandInput placeholder={title} />
          <CommandList className="max-h-full">
            <CommandEmpty>No results found.</CommandEmpty>
            <CommandGroup className="max-h-[18.75rem] overflow-y-auto overflow-x-hidden">
              {options.map((option) => {
                const isSelected = selectedValues.has(option.value)

                return (
                  <CommandItem
                    key={option.value}
                    onSelect={() => {
                      if (isSelected) {
                        selectedValues.delete(option.value)
                      } else {
                        selectedValues.add(option.value)
                      }
                      const filterValues = Array.from(selectedValues)
                      // column?.setFilterValue(
                      //   filterValues.length ? filterValues : undefined
                      // )
                      setColumnFilters(
                        calcUpdateFilter(
                          table.getState().columnFilters.slice(),
                          "",
                          "",
                          !hasValue && column ? column?.id : "",
                          !hasValue
                            ? {
                                value: filterValues,
                                operator: "has",
                                rowId: customAlphabet(
                                  "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
                                  6
                                )(),
                              }
                            : "",
                          hasValue && column ? column?.id : "",
                          hasValue ? hasValue.rowId : "",
                          hasValue ? { value: filterValues } : ""
                        )
                      )
                    }}
                  >
                    <div
                      className={cn(
                        "mr-2 flex size-4 items-center justify-center rounded-sm border border-primary",
                        isSelected
                          ? "bg-primary text-primary-foreground"
                          : "opacity-50 [&_svg]:invisible"
                      )}
                    >
                      <Check className="size-4" aria-hidden="true" />
                    </div>
                    {option.icon && (
                      <option.icon
                        className="mr-2 size-4 text-muted-foreground"
                        aria-hidden="true"
                      />
                    )}
                    <span>{option.label}</span>
                    {option.count && (
                      <span className="ml-auto flex size-4 items-center justify-center font-mono text-xs">
                        {option.count}
                      </span>
                    )}
                  </CommandItem>
                )
              })}
            </CommandGroup>
            {selectedValues.size > 0 && (
              <>
                <CommandSeparator />
                <CommandGroup>
                  <CommandItem
                    onSelect={() =>
                      setColumnFilters(
                        calcUpdateFilter(
                          table.getState().columnFilters.slice(),
                          column ? column?.id : "",
                          hasValue ? hasValue.rowId : "",
                          "",
                          "",
                          "",
                          "",
                          ""
                        )
                      )
                    }
                    className="justify-center text-center"
                  >
                    Clear filters
                  </CommandItem>
                </CommandGroup>
              </>
            )}
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
