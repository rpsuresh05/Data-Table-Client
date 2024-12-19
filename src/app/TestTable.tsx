"use client"

import * as React from "react"
import { DataTableAdvancedFilterField } from "@/types"
import {
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"

import { DataTableAdvancedToolbar } from "@/components/data-table-client/data-table-advanced-toolbar"
import { DataTableColumnHeader } from "@/components/data-table-client/data-table-column-header"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"

import { TasksTableToolbarActions } from "./_components/tasks-table-toolbar-actions"

const advancedFilter = <TData extends Record<string, any>>(
  row: any,
  columnId: string,
  filterValues: FilterValue[]
): boolean => {
  console.log(filterValues, "LINE 377 filters")
  const value = row.getValue(columnId)
  if (!filterValues?.length) return true

  // Handle empty/null checks first
  if (value === null || value === undefined) {
    return filterValues.some(
      (filter) =>
        filter.type === "isEmpty" ||
        (filter.type === "isNotEmpty" ? false : true)
    )
  }

  return filterValues.every((filter) => {
    console.log(filter, "LINE 390 filters")
    switch (filter.type) {
      case "iLike":
        return String(value)
          .toLowerCase()
          .includes(String(filter.value).toLowerCase())

      case "notILike":
        return !String(value)
          .toLowerCase()
          .includes(String(filter.value).toLowerCase())

      case "eq":
        if (value instanceof Date) {
          return new Date(value).getTime() === new Date(filter.value).getTime()
        }
        if (typeof value === "boolean") {
          return value === (filter.value === "true")
        }
        if (Array.isArray(value)) {
          return value.includes(filter.value)
        }
        return value == filter.value

      case "ne":
        if (value instanceof Date) {
          return new Date(value).getTime() !== new Date(filter.value).getTime()
        }
        if (typeof value === "boolean") {
          return value !== (filter.value === "true")
        }
        if (Array.isArray(value)) {
          return !value.includes(filter.value)
        }
        return value != filter.value

      case "gt":
        if (value instanceof Date) {
          return new Date(value) > new Date(filter.value)
        }
        return Number(value) > Number(filter.value)

      case "gte":
        if (value instanceof Date) {
          return new Date(value) >= new Date(filter.value)
        }
        return Number(value) >= Number(filter.value)

      case "lt":
        if (value instanceof Date) {
          return new Date(value) < new Date(filter.value)
        }
        return Number(value) < Number(filter.value)

      case "lte":
        if (value instanceof Date) {
          return new Date(value) <= new Date(filter.value)
        }
        return Number(value) <= Number(filter.value)

      case "has":
        return (
          Array.isArray(value) &&
          Array.isArray(filter.value) &&
          filter.value.every((val) => value.includes(val))
        )

      case "hasNot":
        return (
          Array.isArray(value) &&
          Array.isArray(filter.value) &&
          !filter.value.some((val) => value.includes(val))
        )

      case "isEmpty":
        if (Array.isArray(value)) return value.length === 0
        if (typeof value === "string") return value.trim() === ""
        return value === null || value === undefined

      case "isNotEmpty":
        if (Array.isArray(value)) return value.length > 0
        if (typeof value === "string") return value.trim() !== ""
        return value !== null && value !== undefined

      case "isBetween":
        // if (value instanceof Date) {
        const [start, end] = filter.value as unknown as [string, string]
        return (
          new Date(value) >= new Date(start) && new Date(value) <= new Date(end)
        )
      // }
      // const [min, max] = String(filter.value).split(',').map(Number)
      // return Number(value) >= min && Number(value) <= max

      //   case 'isRelativeToToday':
      //     const today = new Date()
      //     const days = Number(filter.value)
      //     const compareDate = new Date(value)
      //     const diffTime = Math.abs(today.getTime() - compareDate.getTime())
      //     const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
      //     return diffDays <= days

      default:
        return true
    }
  })
}

// Auto-remove if filter value array is empty
advancedFilter.autoRemove = (filterValues: FilterValue[]) => {
  return !filterValues?.length
}

const columns: ColumnDef<TestData>[] = [
  {
    accessorKey: "id",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="ID" />
    ),
    filterFn: "advanced",
    enableColumnFilter: true,
  },
  {
    accessorKey: "name",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Name" />
    ),
    filterFn: "advanced",
    enableColumnFilter: true,
  },
  {
    accessorKey: "email",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "age",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Age" />
    ),
  },
  {
    accessorKey: "birthDate",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="DOB" />
    ),
  },
  {
    accessorKey: "isActive",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Active" />
    ),
  },
  {
    accessorKey: "education",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Education" />
    ),
  },
  {
    accessorKey: "gender",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Gender" />
    ),
  },
]
const advancedFilterFields = [
  {
    id: "id",
    label: "ID",
    type: "number",
  },
  {
    id: "name",
    label: "Name",
    type: "text",
  },
  {
    id: "email",
    label: "Email",
    type: "text",
  },
  {
    id: "birthDate",
    label: "DOB",
    type: "date",
  },
  {
    id: "age",
    label: "Age",
    type: "number",
  },
  {
    id: "education",
    label: "Education",
    type: "multi-select",
    options: ["Bachelors", "Masters", "PHD", "12thGrade", "10thGrade"].map(
      (education) => ({
        label: education,
        value: education,
      })
    ),
  },
  {
    id: "gender",
    label: "Gender",
    type: "select",
    options: ["Male", "Female", "Binary"].map((gender) => ({
      label: gender,
      value: gender,
    })),
  },
]
interface TestData {
  id: string
  name: string
  email: string
  age: number
  birthDate: string
  isActive: boolean
  education: "Bachelors" | "Masters" | "PHD" | "12thGrade" | "10thGrade"
  gender: "Male" | "Female" | "Binary"
}

const data: TestData[] = [
  {
    id: "1",
    name: "John Doe",
    email: "john@example.com",
    age: 25,
    birthDate: "1999-03-15",
    isActive: true,
    education: "Masters",
    gender: "Male",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    age: 32,
    birthDate: "1992-07-21",
    isActive: false,
    education: "PHD",
    gender: "Female",
  },
  {
    id: "3",
    name: "Bob Wilson",
    email: "bob@example.com",
    age: 19,
    birthDate: "2005-11-30",
    isActive: true,
    education: "12thGrade",
    gender: "Male",
  },
  {
    id: "4",
    name: "Mary Johnson",
    email: "mary@example.com",
    age: 28,
    birthDate: "1996-01-10",
    isActive: true,
    education: "Bachelors",
    gender: "Female",
  },
  {
    id: "5",
    name: "Alex Rivera",
    email: "alex@example.com",
    age: 23,
    birthDate: "2001-05-17",
    isActive: false,
    education: "Bachelors",
    gender: "Binary",
  },
  {
    id: "6",
    name: "Sarah Davis",
    email: "sarah@example.com",
    age: 17,
    birthDate: "2007-09-03",
    isActive: true,
    education: "10thGrade",
    gender: "Female",
  },
  {
    id: "7",
    name: "Michael Lee",
    email: "michael@example.com",
    age: 35,
    birthDate: "1989-12-25",
    isActive: true,
    education: "PHD",
    gender: "Male",
  },
  {
    id: "8",
    name: "Jennifer Taylor",
    email: "jennifer@example.com",
    age: 29,
    birthDate: "1995-04-12",
    isActive: false,
    education: "Masters",
    gender: "Female",
  },
  {
    id: "9",
    name: "David Miller",
    email: "david@example.com",
    age: 21,
    birthDate: "2003-08-07",
    isActive: true,
    education: "12thGrade",
    gender: "Male",
  },
  {
    id: "10",
    name: "Lisa Anderson",
    email: "lisa@example.com",
    age: 31,
    birthDate: "1993-06-19",
    isActive: true,
    education: "Masters",
    gender: "Female",
  },
  {
    id: "11",
    name: "Chris Parker",
    email: "chris@example.com",
    age: 27,
    birthDate: "1997-02-14",
    isActive: true,
    education: "Bachelors",
    gender: "Binary",
  },
  {
    id: "12",
    name: "Emma Wilson",
    email: "emma@example.com",
    age: 24,
    birthDate: "2000-10-08",
    isActive: false,
    education: "Masters",
    gender: "Female",
  },
  {
    id: "13",
    name: "Ryan Thompson",
    email: "ryan@example.com",
    age: 33,
    birthDate: "1991-11-23",
    isActive: true,
    education: "PHD",
    gender: "Male",
  },
  {
    id: "14",
    name: "Sophie Brown",
    email: "sophie@example.com",
    age: 18,
    birthDate: "2006-07-30",
    isActive: true,
    education: "12thGrade",
    gender: "Female",
  },
  {
    id: "15",
    name: "Daniel Kim",
    email: "daniel@example.com",
    age: 30,
    birthDate: "1994-04-05",
    isActive: false,
    education: "Masters",
    gender: "Male",
  },
  {
    id: "16",
    name: "Rachel Green",
    email: "rachel@example.com",
    age: 26,
    birthDate: "1998-08-12",
    isActive: true,
    education: "Bachelors",
    gender: "Female",
  },
  {
    id: "17",
    name: "Sam Martinez",
    email: "sam@example.com",
    age: 22,
    birthDate: "2002-03-27",
    isActive: true,
    education: "12thGrade",
    gender: "Binary",
  },
  {
    id: "18",
    name: "Oliver White",
    email: "oliver@example.com",
    age: 34,
    birthDate: "1990-09-16",
    isActive: false,
    education: "PHD",
    gender: "Male",
  },
  {
    id: "19",
    name: "Emily Clark",
    email: "emily@example.com",
    age: 16,
    birthDate: "2008-01-20",
    isActive: true,
    education: "10thGrade",
    gender: "Female",
  },
  {
    id: "20",
    name: "Thomas Wright",
    email: "thomas@example.com",
    age: 28,
    birthDate: "1996-12-03",
    isActive: true,
    education: "Masters",
    gender: "Male",
  },
  {
    id: "21",
    name: "Grace Lee",
    email: "grace@example.com",
    age: 25,
    birthDate: "1999-05-28",
    isActive: false,
    education: "Bachelors",
    gender: "Female",
  },
  {
    id: "22",
    name: "Jordan Casey",
    email: "jordan@example.com",
    age: 29,
    birthDate: "1995-07-09",
    isActive: true,
    education: "Masters",
    gender: "Binary",
  },
]

type FilterValue = {
  type:
    | "iLike"
    | "notILike"
    | "eq"
    | "ne"
    | "gte"
    | "lte"
    | "gt"
    | "lt"
    | "has"
    | "hasNot"
    | "isRelativeToToday"
    | "isEmpty"
    | "isNotEmpty"
    | "isBetween"
  value: string | number
}

const filterFns = {
  advanced: advancedFilter,
} as const

export function TestTable() {
  const [columnFilters, setColumnFilters] = React.useState<
    {
      id: string
      value: FilterValue[]
    }[]
  >([])

  const handleFilterChange = React.useCallback(
    (updater: any) => {
      console.log(updater, "LINE 516 updater")
      const newFilters =
        typeof updater === "function" ? updater(columnFilters) : updater
      setColumnFilters(newFilters)
    },
    [columnFilters]
  )

  const table = useReactTable({
    state: {
      columnFilters,
    },
    // state: {
    //   columnFilters: [
    //     {
    //       id: "name",
    //       value: [
    //         {
    //           type: "iLike",
    //           value: "John",
    //         },
    //       ],
    //     },
    //   ],
    // },
    onColumnFiltersChange: handleFilterChange,
    enableColumnFilters: true,
    enableFilters: true,
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    filterFns: {
      advanced: advancedFilter,
    },
  })

  return (
    <DataTable table={table}>
      <DataTableAdvancedToolbar
        table={table}
        setColumnFilters={setColumnFilters}
        filterFields={
          advancedFilterFields as DataTableAdvancedFilterField<TestData>[]
        }
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
