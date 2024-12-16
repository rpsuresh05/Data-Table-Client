"use client"

import * as React from "react"
import type { DataTableFilterField, ExtendedSortingState } from "@/types"
import {
  getCoreRowModel,
  getFacetedRowModel,
  getFacetedUniqueValues,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnFiltersState,
  type PaginationState,
  type RowSelectionState,
  type SortingState,
  type TableOptions,
  type TableState,
  type Updater,
  type VisibilityState,
} from "@tanstack/react-table"
import {
  parseAsArrayOf,
  parseAsInteger,
  parseAsString,
  useQueryState,
  useQueryStates,
  type Parser,
  type UseQueryStateOptions,
} from "nuqs"

import { getSortingStateParser } from "@/lib/parsers"
import { useDebouncedCallback } from "@/hooks/use-debounced-callback"

export function useDataTableClient<TData>({
    data,
    columns,
    ...props
  }: {
    data: TData[]
    columns: any[]
  }) {
    // Local state instead of URL state
    const [pagination, setPagination] = React.useState({
      pageIndex: 0,
      pageSize: 10,
    })
    const [sorting, setSorting] = React.useState([])
    const [columnFilters, setColumnFilters] = React.useState([])
  
    const table = useReactTable({
      data,
      columns,
    //   state: {
    //     pagination,
    //     sorting,
    //     columnFilters,
    //   },
      // Client-side operations
      manualPagination: false,    // Let TanStack handle pagination
      manualSorting: false,       // Let TanStack handle sorting
      manualFiltering: false,     // Let TanStack handle filtering
      
      // Enable client-side features
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      
    //   onPaginationChange: setPagination,
    //   onSortingChange: setSorting,
    //   onColumnFiltersChange: setColumnFilters,
    })
  
    return { table }
  }