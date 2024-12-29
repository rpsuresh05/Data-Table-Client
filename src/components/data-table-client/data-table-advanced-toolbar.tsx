"use client"

import * as React from "react"
import type { DataTableAdvancedFilterField } from "@/types"
import { type Table } from "@tanstack/react-table"
import { Download, X } from "lucide-react"

import { exportTableToCSV } from "@/lib/export"
import { cn } from "@/lib/utils"
import { DataTableFilterList } from "@/components/data-table-client/data-table-filter-list"
import { DataTableSortList } from "@/components/data-table-client/data-table-sort-list"
import { DataTableViewOptions } from "@/components/data-table-client/data-table-view-options"

import { Button } from "../ui/button"
import { DataTableColumnOptions } from "./data-table-column-options"

interface DataTableAdvancedToolbarProps<TData>
  extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The table instance returned from useDataTable hook with pagination, sorting, filtering, etc.
   * @type Table<TData>
   */
  table: Table<TData>

  /**
   * An array of filter field configurations for the data table.
   * @type DataTableAdvancedFilterField<TData>[]
   * @example
   * const filterFields = [
   *   {
   *     id: 'name',
   *     label: 'Name',
   *     type: 'text',
   *     placeholder: 'Filter by name...'
   *   },
   *   {
   *     id: 'status',
   *     label: 'Status',
   *     type: 'select',
   *     options: [
   *       { label: 'Active', value: 'active', count: 10 },
   *       { label: 'Inactive', value: 'inactive', count: 5 }
   *     ]
   *   }
   * ]
   */
  filterFields: DataTableAdvancedFilterField<TData>[]

  /**
   * A function to set the column filters.
   * @type (updater: any) => void
   */
  setColumnFilters: (updater: any) => void

  /**
   * Debounce time (ms) for filter updates to enhance performance during rapid input.
   * @default 300
   */
  debounceMs?: number

  /**
   * Shallow mode keeps query states client-side, avoiding server calls.
   * Setting to `false` triggers a network request with the updated querystring.
   * @default true
   */
  shallow?: boolean
}

export function DataTableAdvancedToolbar<TData>({
  table,
  setColumnFilters,
  filterFields = [],
  debounceMs = 300,
  shallow = true,
  children,
  className,
  ...props
}: DataTableAdvancedToolbarProps<TData>) {
  const isFiltered = table.getState().columnFilters.length > 0

  return (
    <div
      className={cn(
        "flex w-full items-center justify-between gap-2 overflow-auto p-1",
        className
      )}
      {...props}
    >
      <div className="flex items-center gap-2">
        <DataTableFilterList
          table={table}
          filterFields={filterFields}
          setColumnFilters={setColumnFilters}
          debounceMs={debounceMs}
          shallow={shallow}
        />
        <DataTableSortList
          table={table}
          debounceMs={debounceMs}
          shallow={shallow}
        />
      </div>
      <div className="flex items-center gap-2">
        {isFiltered && (
          <Button
            aria-label="Reset filters"
            variant="ghost"
            className="h-8 px-2 lg:px-3"
            onClick={() => setColumnFilters([])}
          >
            Reset
            <X className="ml-2 size-4" aria-hidden="true" />
          </Button>
        )}
        {children}
        <Button
          variant="outline"
          size="sm"
          onClick={() =>
            exportTableToCSV(table, {
              filename: "tasks",
            })
          }
          className="gap-2"
        >
          <Download className="size-4" aria-hidden="true" />
          Export
        </Button>
        <DataTableColumnOptions table={table} />
      </div>
    </div>
  )
}
