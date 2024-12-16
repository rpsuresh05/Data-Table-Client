"use client"

import * as React from "react"
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableColumnHeader } from "@/components/data-table/data-table-column-header"
import { DataTableAdvancedToolbar } from "@/components/data-table-client/data-table-advanced-toolbar"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"
import { TasksTableToolbarActions } from "./_components/tasks-table-toolbar-actions"

interface TestData {
  id: string
  name: string
  email: string
}

const columns: ColumnDef<TestData>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="ID" />
      ),
  },
  {
    accessorKey: "name", 
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Name" />
      ),
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Email" />
      ),
  },
]

const data: TestData[] = [
  {
    id: "1",
    name: "John Doe", 
    email: "john@example.com"
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com"
  },
  {
    id: "3",
    name: "Bob Wilson",
    email: "bob@example.com"
  },
  {
    id: "4",
    name: "Mary Johnson",
    email: "mary@example.com"
  },
  {
    id: "5", 
    name: "James Brown",
    email: "james@example.com"
  },
  {
    id: "6",
    name: "Sarah Davis",
    email: "sarah@example.com"
  },
  {
    id: "7",
    name: "Michael Lee",
    email: "michael@example.com"
  },
  {
    id: "8",
    name: "Jennifer Taylor",
    email: "jennifer@example.com"
  },
  {
    id: "9",
    name: "David Miller",
    email: "david@example.com"
  },
  {
    id: "10",
    name: "Lisa Anderson",
    email: "lisa@example.com"
  },
  {
    id: "11",
    name: "Robert Martin",
    email: "robert@example.com"
  },
  {
    id: "12",
    name: "Patricia White",
    email: "patricia@example.com"
  },
  {
    id: "13",
    name: "Kevin Thompson",
    email: "kevin@example.com"
  },
  {
    id: "14",
    name: "Nancy Garcia",
    email: "nancy@example.com"
  },
  {
    id: "15",
    name: "Thomas Rodriguez",
    email: "thomas@example.com"
  },
  {
    id: "16",
    name: "Sandra Martinez",
    email: "sandra@example.com"
  },
  {
    id: "17",
    name: "Daniel Lewis",
    email: "daniel@example.com"
  },
  {
    id: "18",
    name: "Margaret Clark",
    email: "margaret@example.com"
  },
  {
    id: "19",
    name: "Joseph Walker",
    email: "joseph@example.com"
  },
  {
    id: "20",
    name: "Betty Hall",
    email: "betty@example.com"
  },
  {
    id: "21",
    name: "Christopher King",
    email: "christopher@example.com"
  },
  {
    id: "22",
    name: "Michelle Scott",
    email: "michelle@example.com"
  }
]
type FilterValue = {
  type: 'includes' | 'equals' | 'gte' | 'lte' | 'gt' | 'lt'
  value: string | number
}

const advancedFilter = <TData extends Record<string, any>>(
  row: any,
  columnId: string,
  filterValues: FilterValue[]
): boolean => {
  const value = row.getValue(columnId)
  if (!filterValues?.length) return true

  return filterValues.every(filter => {
    switch (filter.type) {
      case 'includes':
        return String(value).toLowerCase().includes(String(filter.value).toLowerCase())
      case 'equals':
        return value === filter.value
      case 'gte':
        return Number(value) >= Number(filter.value)
      case 'lte':
        return Number(value) <= Number(filter.value)
      case 'gt':
        return Number(value) > Number(filter.value)
      case 'lt':
        return Number(value) < Number(filter.value)
      default:
        return true
    }
  })
}

// Auto-remove if filter value array is empty
advancedFilter.autoRemove = (filterValues: FilterValue[]) => {
  return !filterValues?.length
}

const filterFns = {
  advanced: advancedFilter,
} as const



export function TestTable() {
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    filterFns
  })

  return (
    <DataTable table={table}>        
        <DataTableAdvancedToolbar
          table={table}
        //   filterFields={advancedFilterFields}
          filterFields={[]}
          shallow={false}
        >
          {/* <TasksTableToolbarActions table={table} /> */}
        </DataTableAdvancedToolbar>
      
        {/* <DataTableToolbar table={table} 
        // filterFields={filterFields}
        >
          <TasksTableToolbarActions table={table} /> 
        </DataTableToolbar> */}
      </DataTable>
  )
}

