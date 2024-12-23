"use client"

import * as React from "react"
import type {
  ColumnType,
  DataTableAdvancedFilterField,
  Filter,
  FilterOperator,
  JoinOperator,
  StringKeyOf,
} from "@/types"
import { type Table } from "@tanstack/react-table"
import {
  CalendarIcon,
  Check,
  ChevronsUpDown,
  GripVertical,
  ListFilter,
  Trash2,
} from "lucide-react"
import { customAlphabet } from "nanoid"
import { parseAsStringEnum, useQueryState } from "nuqs"

import { dataTableConfig } from "@/config/data-table"
import { getDefaultFilterOperator, getFilterOperators } from "@/lib/data-table"
import { getFiltersStateParser } from "@/lib/parsers"
import { cn, formatDate } from "@/lib/utils"
import { useDebouncedCallback } from "@/hooks/use-debounced-callback"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command"
import {
  FacetedFilter,
  FacetedFilterContent,
  FacetedFilterEmpty,
  FacetedFilterGroup,
  FacetedFilterInput,
  FacetedFilterItem,
  FacetedFilterList,
  FacetedFilterTrigger,
} from "@/components/ui/faceted-filter"
import { Input } from "@/components/ui/input"
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

interface DataTableFilterListProps<TData> {
  table: Table<TData>
  filterFields: DataTableAdvancedFilterField<TData>[]
  setColumnFilters: (updater: any) => void
  debounceMs: number
  shallow?: boolean
}

interface ColumnFilter {
  id: string
  value: Array<{ rowId: string; operator: string; value: string }>
}

export function DataTableFilterList<TData>({
  table,
  filterFields,
  setColumnFilters,
  debounceMs = 1000,
  shallow,
}: DataTableFilterListProps<TData>) {
  const id = React.useId()
  // const [filters, setFilters] = useQueryState(
  //   "filters",
  //   getFiltersStateParser(table.getRowModel().rows[0]?.original)
  //     .withDefault([])
  //     .withOptions({
  //       clearOnDefault: true,
  //       shallow,
  //     })
  // )
  const setFilters = setColumnFilters
  const filters = table.getState().columnFilters
  console.log(filters, "filters")

  const [joinOperator, setJoinOperator] = useQueryState(
    "joinOperator",
    parseAsStringEnum(["and", "or"]).withDefault("and").withOptions({
      clearOnDefault: true,
      shallow,
    })
  )

  const debouncedSetFilters = useDebouncedCallback(updateFilter, debounceMs)

  function addFilter() {
    const filterField = filterFields[0]

    if (!filterField) return
    updateFilter(
      "",
      "",
      filterField.id,
      {
        operator: getDefaultFilterOperator(filterField.type),
        value: "",
      },
      "",
      "",
      ""
    )

    // void setFilters([
    //   ...filters,
    //   {
    //     id: filterField.id,
    //     value: [
    //       {
    //         operator: getDefaultFilterOperator(filterField.type),
    //         value: "",
    //         rowId: customAlphabet(
    //           "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    //           6
    //         )()
    //       }
    //     ]
    //   },
    //   // {
    //   //   id: filterField.id,
    //   //   value: "",
    //   //   type: filterField.type,
    //   //   operator: getDefaultFilterOperator(filterField.type),
    //   //   rowId: customAlphabet(
    //   //     "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
    //   //     6
    //   //   )(),
    //   // },
    // ])
  }
  function updateFilter(
    removeColId: string,
    removeRowId: string,
    addColId: string,
    addValue: any,
    updateColId: string,
    updateRowId: string,
    updateValue: any
  ) {
    let newFilters = filters.slice()
    if (removeColId) {
      newFilters = newFilters.reduce<ColumnFilter[]>((res, curr) => {
        if (curr.id === removeColId) {
          let tempValue = (
            curr.value as Array<{
              rowId: string
              operator: string
              value: string
            }>
          ).slice()
          tempValue = tempValue.filter((item) => {
            if (item.rowId === removeRowId) {
              return false
            }
            return true
          })
          if (tempValue.length > 0) {
            res.push({
              ...curr,
              value: tempValue,
            })
          }
        } else {
          res.push(curr as ColumnFilter)
        }
        return res
      }, [] as ColumnFilter[])
    }
    if (updateColId) {
      newFilters = newFilters.map((item) => {
        if (item.id === updateColId) {
          let tempValue = (item.value as Array<{ rowId: string }>).slice()
          tempValue = tempValue.map((item) => {
            if (item.rowId === updateRowId) {
              return {
                ...item,
                ...updateValue,
              }
            }
            return item
          })
          return {
            ...item,
            value: tempValue,
          }
        }
        return item
      })
    }
    if (addColId) {
      const existingIdx = newFilters.findIndex((item) => item.id === addColId)
      if (existingIdx !== -1) {
        const existingFilter = newFilters[existingIdx]
        if (existingFilter) {
          existingFilter.value = [
            ...(existingFilter.value as Array<{ rowId: string }>),
            {
              ...addValue,
              rowId: customAlphabet(
                "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
                6
              )(),
            },
          ]
        }
      } else {
        newFilters.push({
          id: addColId,
          value: [
            {
              ...addValue,
              rowId: customAlphabet(
                "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz",
                6
              )(),
            },
          ],
        })
      }
    }
    // console.log(newFilters, "filters newFilters");
    setFilters(newFilters)
  }
  // function updateFilter({
  //   rowId,
  //   field,
  //   debounced = false,
  // }: {
  //   rowId: string
  //   field: Omit<Partial<Filter<TData>>, "rowId">
  //   debounced?: boolean
  // }) {
  //   const updateFunction = debounced ? debouncedSetFilters : setFilters
  //   updateFunction((prevFilters) => {
  //     const updatedFilters = prevFilters.map((filter) => {
  //       if (filter.rowId === rowId) {
  //         return { ...filter, ...field }
  //       }
  //       return filter
  //     })
  //     return updatedFilters
  //   })
  // }

  // function removeFilter(rowId: string) {
  //   const updatedFilters = filters.filter((filter) => filter.rowId !== rowId)
  //   void setFilters(updatedFilters)
  // }

  function moveFilter(activeIndex: number, overIndex: number) {
    void setFilters((prevFilters: any) => {
      const newFilters = [...prevFilters]
      const [removed] = newFilters.splice(activeIndex, 1)
      if (!removed) return prevFilters
      newFilters.splice(overIndex, 0, removed)
      return newFilters
    })
  }

  function renderFilterInput({
    filter,
    inputId,
  }: {
    filter: Filter<TData>
    inputId: string
  }) {
    const filterField = filterFields.find((f) => f.id === filter.id)
    console.log(filterField, filter, "filters filterField")

    if (!filterField) return null

    if (filter.operator === "isEmpty" || filter.operator === "isNotEmpty") {
      return (
        <div
          id={inputId}
          role="status"
          aria-live="polite"
          aria-label={`${filterField.label} filter is ${filter.operator === "isEmpty" ? "empty" : "not empty"}`}
          className="h-8 w-full rounded border border-dashed"
        />
      )
    }

    switch (filter.type) {
      case "text":
      case "number":
        return (
          <Input
            id={inputId}
            type={filter.type}
            aria-label={`${filterField.label} filter value`}
            aria-describedby={`${inputId}-description`}
            placeholder={filterField.placeholder ?? "Enter a value..."}
            className="h-8 w-full rounded"
            defaultValue={
              typeof filter.value === "string" ? filter.value : undefined
            }
            onChange={(event) =>
              debouncedSetFilters(
                "",
                "",
                "",
                "",
                filter.id,
                filter.rowId as string,
                {
                  value: event.target.value,
                }
              )
            }
          />
        )
      case "select":
        return (
          <FacetedFilter>
            <FacetedFilterTrigger asChild>
              <Button
                id={inputId}
                variant="outline"
                size="sm"
                aria-label={`${filterField.label} filter value`}
                aria-controls={`${inputId}-listbox`}
                className="h-8 w-full justify-start gap-2 rounded px-1.5 text-left text-muted-foreground hover:text-muted-foreground"
              >
                {filter.value && typeof filter.value === "string" ? (
                  <Badge
                    variant="secondary"
                    className="rounded-sm px-1 font-normal"
                  >
                    {filterField?.options?.find(
                      (option) => option.value === filter.value
                    )?.label || filter.value}
                  </Badge>
                ) : (
                  <>
                    {filterField.placeholder ?? "Select an option..."}
                    <ChevronsUpDown className="size-4" aria-hidden="true" />
                  </>
                )}
              </Button>
            </FacetedFilterTrigger>
            <FacetedFilterContent
              id={`${inputId}-listbox`}
              className="w-[12.5rem] origin-[var(--radix-popover-content-transform-origin)]"
            >
              <FacetedFilterInput
                placeholder={filterField?.label ?? "Search options..."}
                aria-label={`Search ${filterField?.label} options`}
              />
              <FacetedFilterList>
                <FacetedFilterEmpty>No options found.</FacetedFilterEmpty>
                <FacetedFilterGroup>
                  {filterField?.options?.map((option) => (
                    <FacetedFilterItem
                      key={option.value}
                      value={option.value}
                      selected={filter.value === option.value}
                      onSelect={(value) => {
                        updateFilter(
                          "",
                          "",
                          "",
                          "",
                          filter.id,
                          filter.rowId as string,
                          { value }
                        )
                        setTimeout(() => {
                          document.getElementById(inputId)?.click()
                        }, 0)
                      }}
                    >
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
                    </FacetedFilterItem>
                  ))}
                </FacetedFilterGroup>
              </FacetedFilterList>
            </FacetedFilterContent>
          </FacetedFilter>
        )
      case "multi-select":
        const selectedValues = new Set(
          Array.isArray(filter.value) ? filter.value : []
        )

        return (
          <FacetedFilter>
            <FacetedFilterTrigger asChild>
              <Button
                id={inputId}
                variant="outline"
                size="sm"
                aria-label={`${filterField.label} filter values`}
                aria-controls={`${inputId}-listbox`}
                className="h-8 w-full justify-start gap-2 rounded px-1.5 text-left text-muted-foreground hover:text-muted-foreground"
              >
                <>
                  {selectedValues.size === 0 && (
                    <>
                      {filterField.placeholder ?? " Select options..."}
                      <ChevronsUpDown className="size-4" aria-hidden="true" />
                    </>
                  )}
                </>
                {selectedValues?.size > 0 && (
                  <div className="flex items-center">
                    <Badge
                      variant="secondary"
                      className="rounded-sm px-1 font-normal lg:hidden"
                    >
                      {selectedValues.size}
                    </Badge>
                    <div className="hidden min-w-0 gap-1 lg:flex">
                      {selectedValues.size > 2 ? (
                        <Badge
                          variant="secondary"
                          className="rounded-sm px-1 font-normal"
                        >
                          {selectedValues.size} selected
                        </Badge>
                      ) : (
                        filterField?.options
                          ?.filter((option) => selectedValues.has(option.value))
                          .map((option) => (
                            <Badge
                              variant="secondary"
                              key={option.value}
                              className="truncate rounded-sm px-1 font-normal"
                            >
                              {option.label}
                            </Badge>
                          ))
                      )}
                    </div>
                  </div>
                )}
              </Button>
            </FacetedFilterTrigger>
            <FacetedFilterContent
              id={`${inputId}-listbox`}
              className="w-[12.5rem] origin-[var(--radix-popover-content-transform-origin)]"
            >
              <FacetedFilterInput
                aria-label={`Search ${filterField?.label} options`}
                placeholder={filterField?.label ?? "Search options..."}
              />
              <FacetedFilterList>
                <FacetedFilterEmpty>No options found.</FacetedFilterEmpty>
                <FacetedFilterGroup>
                  {filterField?.options?.map((option) => (
                    <FacetedFilterItem
                      key={option.value}
                      value={option.value}
                      selected={selectedValues.has(option.value)}
                      onSelect={(value) => {
                        const currentValue = Array.isArray(filter.value)
                          ? filter.value
                          : []
                        const newValue = currentValue.includes(value)
                          ? currentValue.filter((v) => v !== value)
                          : [...currentValue, value]
                        debouncedSetFilters(
                          "",
                          "",
                          "",
                          "",
                          filter.id,
                          filter.rowId as string,
                          { value: newValue }
                        )
                      }}
                    >
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
                    </FacetedFilterItem>
                  ))}
                </FacetedFilterGroup>
              </FacetedFilterList>
            </FacetedFilterContent>
          </FacetedFilter>
        )
      case "date":
        const dateValue = Array.isArray(filter.value)
          ? filter.value.filter(Boolean)
          : [filter.value, filter.value].filter(Boolean)

        const displayValue =
          filter.operator === "isBetween" && dateValue.length === 2
            ? `${formatDate(dateValue[0] ?? new Date())} - ${formatDate(
                dateValue[1] ?? new Date()
              )}`
            : dateValue[0]
              ? formatDate(dateValue[0])
              : "Pick a date"

        return (
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id={inputId}
                variant="outline"
                size="sm"
                aria-label={`${filterField.label} date filter`}
                aria-controls={`${inputId}-calendar`}
                className={cn(
                  "h-8 w-full justify-start gap-2 rounded text-left font-normal",
                  !filter.value && "text-muted-foreground"
                )}
              >
                <CalendarIcon
                  className="size-3.5 shrink-0"
                  aria-hidden="true"
                />
                <span className="truncate">{displayValue}</span>
              </Button>
            </PopoverTrigger>
            <PopoverContent
              id={`${inputId}-calendar`}
              align="start"
              className="w-auto p-0"
            >
              {filter.operator === "isBetween" ? (
                <Calendar
                  id={`${inputId}-calendar`}
                  mode="range"
                  aria-label={`Select ${filterField.label} date range`}
                  selected={
                    dateValue.length === 2
                      ? {
                          from: new Date(dateValue[0] ?? ""),
                          to: new Date(dateValue[1] ?? ""),
                        }
                      : {
                          from: new Date(),
                          to: new Date(),
                        }
                  }
                  onSelect={(date) => {
                    updateFilter(
                      "",
                      "",
                      "",
                      "",
                      filter.id,
                      filter.rowId as string,
                      {
                        value: date
                          ? [
                              date.from?.toISOString() ?? "",
                              date.to?.toISOString() ?? "",
                            ]
                          : [],
                      }
                    )
                  }}
                  initialFocus
                  numberOfMonths={1}
                />
              ) : (
                <Calendar
                  id={`${inputId}-calendar`}
                  mode="single"
                  aria-label={`Select ${filterField.label} date`}
                  selected={dateValue[0] ? new Date(dateValue[0]) : undefined}
                  onSelect={(date) => {
                    updateFilter(
                      "",
                      "",
                      "",
                      "",
                      filter.id,
                      filter.rowId as string,
                      { value: date?.toISOString() ?? "" }
                    )

                    setTimeout(() => {
                      document.getElementById(inputId)?.click()
                    }, 0)
                  }}
                  initialFocus
                />
              )}
            </PopoverContent>
          </Popover>
        )
      case "boolean": {
        if (Array.isArray(filter.value)) return null

        return (
          <Select
            value={filter.value}
            onValueChange={(value) =>
              updateFilter("", "", "", "", filter.id, filter.rowId as string, {
                value,
              })
            }
          >
            <SelectTrigger
              id={inputId}
              aria-label={`${filterField.label} boolean filter`}
              aria-controls={`${inputId}-listbox`}
              className="h-8 w-full rounded bg-transparent"
            >
              <SelectValue placeholder={filter.value ? "True" : "False"} />
            </SelectTrigger>
            <SelectContent id={`${inputId}-listbox`}>
              <SelectItem value="true">True</SelectItem>
              <SelectItem value="false">False</SelectItem>
            </SelectContent>
          </Select>
        )
      }
      default:
        return null
    }
  }
  const destructuredFilters: Array<{ id: string } & Record<string, unknown>> =
    []
  const filterMap = new Map<string, ColumnType>()
  filterFields.forEach((field) => {
    filterMap.set(field.id, field.type)
  })
  filters?.forEach((item: ColumnFilter) => {
    const tempId = item.id
    if (Array.isArray(item.value)) {
      item.value.forEach((val: Record<string, unknown>) => {
        destructuredFilters.push({
          id: tempId,
          type: filterMap.get(tempId),
          ...val,
        })
      })
    }
  })
  console.log(
    destructuredFilters,
    "FILTER LIST RENDERING filters destructuredFilters"
  )
  return (
    <Sortable
      value={destructuredFilters.map((item) => ({ id: item.rowId }))}
      onMove={({ activeIndex, overIndex }) =>
        moveFilter(activeIndex, overIndex)
      }
      overlay={
        <div className="flex items-center gap-2">
          <div className="h-8 min-w-[4.5rem] rounded-sm bg-primary/10" />
          <div className="h-8 w-32 rounded-sm bg-primary/10" />
          <div className="h-8 w-32 rounded-sm bg-primary/10" />
          <div className="h-8 min-w-36 flex-1 rounded-sm bg-primary/10" />
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
            aria-label="Open filters"
            aria-controls={`${id}-filter-dialog`}
          >
            <ListFilter className="size-3" aria-hidden="true" />
            Filters
            {filters.length > 0 && (
              <Badge
                variant="secondary"
                className="h-[1.14rem] rounded-[0.2rem] px-[0.32rem] font-mono text-[0.65rem] font-normal"
              >
                {filters.length}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          id={`${id}-filter-dialog`}
          align="start"
          collisionPadding={16}
          className={cn(
            "flex w-[calc(100vw-theme(spacing.12))] min-w-60 origin-[var(--radix-popover-content-transform-origin)] flex-col p-4 sm:w-[36rem]",
            filters.length > 0 ? "gap-3.5" : "gap-2"
          )}
        >
          {filters.length > 0 ? (
            <h4 className="font-medium leading-none">Filters</h4>
          ) : (
            <div className="flex flex-col gap-1">
              <h4 className="font-medium leading-none">No filters applied</h4>
              <p className="text-sm text-muted-foreground">
                Add filters to refine your results.
              </p>
            </div>
          )}
          <div className="flex max-h-40 flex-col gap-2 overflow-y-auto py-0.5 pr-1">
            {destructuredFilters.map((filter, index) => {
              const filterId = `${id}-filter-${filter.rowId}`
              const joinOperatorListboxId = `${filterId}-join-operator-listbox`
              const fieldListboxId = `${filterId}-field-listbox`
              const fieldTriggerId = `${filterId}-field-trigger`
              const operatorListboxId = `${filterId}-operator-listbox`
              const inputId = `${filterId}-input`

              return (
                <SortableItem
                  key={filter.rowId as string}
                  value={filter.rowId as string}
                  asChild
                >
                  <div className="flex items-center gap-2">
                    <div className="min-w-[4.5rem] text-center">
                      {index === 0 ? (
                        <span className="text-sm text-muted-foreground">
                          Where
                        </span>
                      ) : index === 1 ? (
                        <Select
                          value={joinOperator}
                          onValueChange={(value: JoinOperator) =>
                            setJoinOperator(value)
                          }
                        >
                          <SelectTrigger
                            aria-label="Select join operator"
                            aria-controls={joinOperatorListboxId}
                            className="h-8 rounded lowercase"
                          >
                            <SelectValue placeholder={joinOperator} />
                          </SelectTrigger>
                          <SelectContent
                            id={joinOperatorListboxId}
                            position="popper"
                            className="min-w-[var(--radix-select-trigger-width)] lowercase"
                          >
                            {dataTableConfig.joinOperators.map((op) => (
                              <SelectItem key={op.value} value={op.value}>
                                {op.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <span className="text-sm text-muted-foreground">
                          {joinOperator}
                        </span>
                      )}
                    </div>
                    <Popover modal>
                      <PopoverTrigger asChild>
                        <Button
                          id={fieldTriggerId}
                          variant="outline"
                          size="sm"
                          role="combobox"
                          aria-label="Select filter field"
                          aria-controls={fieldListboxId}
                          className="h-8 w-32 justify-between gap-2 rounded focus:outline-none focus:ring-1 focus:ring-ring focus-visible:ring-0"
                        >
                          <span className="truncate">
                            {filterFields.find(
                              (field) => field.id === filter.id
                            )?.label ?? "Select field"}
                          </span>
                          <ChevronsUpDown className="size-4 shrink-0 opacity-50" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        id={fieldListboxId}
                        align="start"
                        className="w-40 p-0"
                        onCloseAutoFocus={() =>
                          document.getElementById(fieldTriggerId)?.focus({
                            preventScroll: true,
                          })
                        }
                      >
                        <Command>
                          <CommandInput placeholder="Search fields..." />
                          <CommandList>
                            <CommandEmpty>No fields found.</CommandEmpty>
                            <CommandGroup>
                              {filterFields.map((field) => (
                                <CommandItem
                                  key={field.id}
                                  value={field.id}
                                  onSelect={(value) => {
                                    const filterField = filterFields.find(
                                      (col) => col.id === value
                                    )

                                    if (!filterField) return

                                    updateFilter(
                                      filter.id,
                                      filter.rowId as string,
                                      value,
                                      {
                                        rowId: filter.rowId,
                                        operator:
                                          filterMap.get(value) === filter.type // TODO: if current operator in new filter type: NP else use getDefaultFilterOperator
                                            ? filter.operator
                                            : getDefaultFilterOperator(
                                                filterMap.get(
                                                  value
                                                ) as ColumnType
                                              ),
                                        value:
                                          filterMap.get(value) === filter.type
                                            ? filter.value
                                            : "",
                                      },
                                      "",
                                      "",
                                      ""
                                    )

                                    document
                                      .getElementById(fieldTriggerId)
                                      ?.click()
                                  }}
                                >
                                  <span className="mr-1.5 truncate">
                                    {field.label}
                                  </span>
                                  <Check
                                    className={cn(
                                      "ml-auto size-4 shrink-0",
                                      field.id === filter.id
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Select
                      value={filter.operator as string}
                      onValueChange={(value: FilterOperator) =>
                        updateFilter(
                          "",
                          "",
                          "",
                          "",
                          filter.id,
                          filter.rowId as string,
                          { operator: value, value: filter.value }
                        )
                      }
                    >
                      <SelectTrigger
                        aria-label="Select filter operator"
                        aria-controls={operatorListboxId}
                        className="h-8 w-32 rounded"
                      >
                        <div className="truncate">
                          <SelectValue placeholder={filter.operator} />
                        </div>
                      </SelectTrigger>
                      <SelectContent id={operatorListboxId}>
                        {getFilterOperators(filter.type).map((op) => (
                          <SelectItem key={op.value} value={op.value}>
                            {op.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <div className="min-w-36 flex-1">
                      {renderFilterInput({ filter, inputId })}
                    </div>
                    <Button
                      variant="outline"
                      size="icon"
                      aria-label={`Remove filter ${index + 1}`}
                      className="size-8 shrink-0 rounded"
                      onClick={() =>
                        updateFilter(
                          filter.id,
                          filter.rowId as string,
                          "",
                          "",
                          "",
                          "",
                          ""
                        )
                      }
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                    </Button>
                    <SortableDragHandle
                      variant="outline"
                      size="icon"
                      className="size-8 shrink-0 rounded"
                    >
                      <GripVertical className="size-3.5" aria-hidden="true" />
                    </SortableDragHandle>
                  </div>
                </SortableItem>
              )
            })}
          </div>
          <div className="flex w-full items-center gap-2">
            <Button
              size="sm"
              className="h-[1.85rem] rounded"
              onClick={addFilter}
            >
              Add filter
            </Button>
            {filters.length > 0 ? (
              <Button
                size="sm"
                variant="outline"
                className="rounded"
                onClick={() => {
                  void setFilters([])
                  void setJoinOperator("and")
                }}
              >
                Reset filters
              </Button>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
    </Sortable>
  )
}
