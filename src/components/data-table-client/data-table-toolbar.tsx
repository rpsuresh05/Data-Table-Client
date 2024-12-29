"use client"

import * as React from "react"
import type { DataTableFilterField } from "@/types"
import type { Table } from "@tanstack/react-table"
import { SquareCheckBig, X } from "lucide-react"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DataTableFacetedFilter } from "@/components/data-table-client/data-table-faceted-filter"
import { DataTableViewOptions } from "@/components/data-table/data-table-view-options"

import { FilterValue } from "./data-table-advance-fn"

interface DataTableToolbarProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  table: Table<TData>
  /**
   * An array of filter field configurations for the data table.
   * When options are provided, a faceted filter is rendered.
   * Otherwise, a search filter is rendered.
   *
   * @example
   * const filterFields = [
   *   {
   *     id: 'name',
   *     label: 'Name',
   *     placeholder: 'Filter by name...'
   *   },
   *   {
   *     id: 'status',
   *     label: 'Status',
   *     options: [
   *       { label: 'Active', value: 'active', icon: ActiveIcon, count: 10 },
   *       { label: 'Inactive', value: 'inactive', icon: InactiveIcon, count: 5 }
   *     ]
   *   }
   * ]
   */
  filterFields?: DataTableFilterField<TData>[]
  setColumnFilters: React.Dispatch<
    React.SetStateAction<{ id: string; value: FilterValue[] }[]>
  >
}

export function DataTableToolbar<TData>({
  table,
  filterFields = [],
  children,
  className,
  setColumnFilters,
  ...props
}: DataTableToolbarProps<TData>) {
  // Memoize computation of searchableColumns and filterableColumns
  const { filterableColumns } = React.useMemo(() => {
    return {
      // searchableColumns: filterFields.filter((field) => !field.options),
      filterableColumns: filterFields.filter(
        (field) => field.options && field.quickFilter
      ),
    }
  }, [filterFields])

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-2 overflow-auto p-1",
        className
      )}
      {...props}
    >
      <Input
        placeholder="Search Table..."
        // value={
        //   (table.getColumn(String(column.id))?.getFilterValue() as string) ?? ""
        // }
        // onChange={(event) =>
        //   table.getColumn(String(column.id))?.setFilterValue(event.target.value)
        // }
        className="h-8 w-40 lg:w-64"
      />
      <div className="flex flex-1 items-center gap-2">
        {/* {searchableColumns.length > 0 &&
          searchableColumns.map(
            (column) =>
              table.getColumn(column.id ? String(column.id) : "") && (
                <Input
                  key={String(column.id)}
                  placeholder={column.placeholder}
                  value={
                    (table
                      .getColumn(String(column.id))
                      ?.getFilterValue() as string) ?? ""
                  }
                  onChange={(event) =>
                    table
                      .getColumn(String(column.id))
                      ?.setFilterValue(event.target.value)
                  }
                  className="h-8 w-40 lg:w-64"
                />
              )
          )} */}
      </div>
      <div className="flex items-center gap-2">
        {/* {table.getFilteredSelectedRowModel().rows.length > 0 && (
          <Button
            aria-label="Reset filters"
            variant="ghost"
            className="h-8 px-2 lg:px-3"
            onClick={() =>
              setColumnFilters([
                {
                  id: "select",
                  value: [
                    {
                      rowId: "1234",
                      operator: "row-select",
                      value: "true",
                    },
                  ],
                },
              ])
            }
          >
            Show Selected
            <SquareCheckBig className="ml-1 size-4" aria-hidden="true" />
          </Button>
        )} */}
        {filterableColumns.length > 0 &&
          filterableColumns.map(
            (column) =>
              table.getColumn(column.id ? String(column.id) : "") && (
                <DataTableFacetedFilter
                  key={String(column.id)}
                  column={table.getColumn(column.id ? String(column.id) : "")}
                  title={column.label}
                  options={column.options ?? []}
                  setColumnFilters={setColumnFilters}
                  table={table}
                />
              )
          )}

        {children}
      </div>
    </div>
  )
}
