import * as React from "react"
import { DataTableAdvancedFilterField } from "@/types"
import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type Table as TanstackTable,
} from "@tanstack/react-table"

import { getCommonPinningStyles } from "@/lib/data-table"
import { cn } from "@/lib/utils"
import { Checkbox } from "@/components/ui/checkbox"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { DataTablePagination } from "@/components/data-table/data-table-pagination"
import { TasksTableToolbarActions } from "@/app/_components/tasks-table-toolbar-actions"

import { advancedFilter, FilterValue } from "./data-table-advance-fn"
import { DataTableAdvancedToolbar } from "./data-table-advanced-toolbar"
import { DataTableColumnHeader } from "./data-table-column-header"
import { DataTableToolbar } from "./data-table-toolbar"

type CustomColumnDef<TData> = ColumnDef<TData> & {
  id: Extract<keyof TData, string>
  label: string
  columnProperties?: any
  headerChildren?: React.ReactNode
  type: "text" | "number" | "date" | "boolean" | "select" | "multi-select"
  accessorFn?: (row: TData) => any
  quickFilter: boolean
}

// type FilterField = {
//   id: string
//   label: string
//   type: string
//   options?: {
//     label: string
//     value: string
//   }[]
// }

const filterFns = {
  advanced: advancedFilter,
} as const

interface DataTableProps<TData> extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * The table instance returned from useDataTable hook with pagination, sorting, filtering, etc.
   * @type TanstackTable<TData>
   */
  // table: TanstackTable<TData>

  /**
   * The floating bar to render at the bottom of the table on row selection.
   * @default null
   * @type React.ReactNode | null
   * @example floatingBar={<TasksTableFloatingBar table={table} />}
   */
  floatingBar?: React.ReactNode | null
  data: TData[]
  columnsArray: CustomColumnDef<TData>[]
  isSelectable: boolean
}

function DataTableAbstract<TData>({
  floatingBar = null,
  columnsArray,
  data,
  children,
  className,
  isSelectable = true,
  ...props
}: DataTableProps<TData>) {
  // console.log("Table Abs", data)
  const { columns, filterFields } = React.useMemo(() => {
    let columns: ColumnDef<TData>[] = []
    let filterFields: DataTableAdvancedFilterField<TData>[] = []

    if (isSelectable) {
      columns.push({
        id: "select",
        accessorFn: (_, index) => index,
        header: ({ table }) => (
          <Checkbox
            // key={`${"tableName"}-select-all`}
            checked={
              table.getIsAllPageRowsSelected() ||
              (table.getIsSomePageRowsSelected() && "indeterminate")
            }
            onCheckedChange={(value) =>
              table.toggleAllPageRowsSelected(!!value)
            }
            aria-label="Select all"
            className="translate-y-0.5"
          />
        ),
        cell: ({ row }) => (
          <Checkbox
            // key={`${"tableName"}${row.index}-select`}
            checked={row.getIsSelected()}
            onCheckedChange={(value) => row.toggleSelected(!!value)}
            aria-label="Select row"
            className="translate-y-0.5"
          />
        ),
        enableSorting: false,
        enableHiding: false,
        filterFn: "advanced",
      })
    }

    columnsArray.forEach((columnArray) => {
      columns.push({
        accessorKey: columnArray.id,
        accessorFn: columnArray.accessorFn,
        id: columnArray.id,
        header: ({ column }) => (
          <DataTableColumnHeader column={column} title={columnArray.label}>
            {columnArray.headerChildren}
          </DataTableColumnHeader>
        ),
        filterFn: "advanced",
        ...columnArray.columnProperties,
      })

      filterFields.push({
        quickFilter: columnArray.quickFilter,
        id: columnArray.id,
        label: columnArray.label,
        type: columnArray.type,
        options: [],
      })
    })

    return { columns, filterFields }
  }, [columnsArray])

  const processedData = React.useMemo(() => {
    const map = new Map<string, Set<string>>()
    const selectCols = filterFields
      .filter(
        (filterField) =>
          filterField.type === "select" || filterField.type === "multi-select"
      )
      .map((filterField) => {
        if (!map.has(filterField.id)) {
          map.set(filterField.id, new Set())
        }
        return filterField.id
      })
    if (selectCols.length > 0) {
      data.forEach((row) => {
        selectCols.forEach((col: string) => {
          const value = (row as Record<string, unknown>)[col]
          if (typeof value === "string") {
            map.get(col)?.add(value)
          }
        })
      })
      console.log("map", map)
      for (let i = 0; i < filterFields.length; i++) {
        if (
          map.has(
            (filterFields[i] as DataTableAdvancedFilterField<TData>)
              .id as string
          )
        ) {
          ;(filterFields[i] as DataTableAdvancedFilterField<TData>).options =
            Array.from(
              map.get(
                (filterFields[i] as DataTableAdvancedFilterField<TData>).id
              ) || []
            ).map((value) => ({
              label: value,
              value: value,
            }))
        }
      }
    }
    return data
  }, [data])

  const [columnFilters, setColumnFilters] = React.useState<
    {
      id: string
      value: FilterValue[]
    }[]
  >([])

  const tableConfig = React.useMemo(
    () => ({
      state: {
        columnFilters,
      },
      enableColumnFilters: true,
      enableFilters: true,
      data,
      columns,
      getCoreRowModel: getCoreRowModel(),
      getPaginationRowModel: getPaginationRowModel(),
      getSortedRowModel: getSortedRowModel(),
      getFilteredRowModel: getFilteredRowModel(),
      filterFns: {
        advanced: advancedFilter,
      },
    }),
    [columnFilters] // Only depend on columnFilters
  )

  const table = useReactTable(tableConfig)

  return (
    <div
      className={cn("w-full space-y-2.5 overflow-auto", className)}
      {...props}
    >
      {/* <div>This is Test..</div> */}
      <DataTableAdvancedToolbar
        table={table}
        setColumnFilters={setColumnFilters}
        filterFields={filterFields}
        shallow={false}
      ></DataTableAdvancedToolbar>
      <DataTableToolbar
        table={table}
        filterFields={filterFields}
        setColumnFilters={setColumnFilters}
      >
        {children}
      </DataTableToolbar>
      <div className="overflow-hidden rounded-md border">
        <Table>
          <TableHeader>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id}>
                {headerGroup.headers.map((header) => {
                  return (
                    <TableHead
                      key={header.id}
                      colSpan={header.colSpan}
                      style={{
                        ...getCommonPinningStyles({ column: header.column }),
                      }}
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext()
                          )}
                    </TableHead>
                  )
                })}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows?.length ? (
              table.getRowModel().rows.map((row) => (
                <TableRow
                  key={row.id}
                  data-state={row.getIsSelected() && "selected"}
                >
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      style={{
                        ...getCommonPinningStyles({
                          column: cell.column,
                          withBorder: true,
                        }),
                      }}
                    >
                      {flexRender(
                        cell.column.columnDef.cell,
                        cell.getContext()
                      )}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell
                  colSpan={table.getAllColumns().length}
                  className="h-24 text-center"
                >
                  No results.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      <div className="flex flex-col gap-2.5">
        <DataTablePagination table={table} />
        {table.getFilteredSelectedRowModel().rows.length > 0 && floatingBar}
      </div>
    </div>
  )
}

export const DataTableAbstractMemo = React.memo(DataTableAbstract)
