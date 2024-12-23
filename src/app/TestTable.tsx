"use client"

import * as React from "react"
import { DataTableAdvancedFilterField } from "@/types"
import {
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  useReactTable,
  type ColumnDef,
} from "@tanstack/react-table"

import { DataTableAdvancedToolbar } from "@/components/data-table-client/data-table-advanced-toolbar"
import { DataTableColumnHeader } from "@/components/data-table-client/data-table-column-header"
import { DataTablePinList } from "@/components/data-table-client/data-table-pin-list"
import { DataTable } from "@/components/data-table/data-table"
import { DataTableToolbar } from "@/components/data-table/data-table-toolbar"

import { TasksTableToolbarActions } from "./_components/tasks-table-toolbar-actions"

const advancedFilter = <TData extends Record<string, any>>(
  row: any,
  columnId: string,
  filterValues: FilterValue[]
): boolean => {
  // console.log(filterValues, row, columnId, "LINE 377 filters")
  const value = row.getValue(columnId)

  if (!filterValues?.length) return true

  // Handle empty/null checks first
  if (value === null || value === undefined) {
    return filterValues.some(
      (filter) =>
        filter.operator === "isEmpty" ||
        (filter.operator === "isNotEmpty" ? false : true)
    )
  }

  return filterValues.every((filter) => {
    if (
      filter.value === "" ||
      (Array.isArray(filter.value) && filter.value.length === 0)
    )
      return true

    switch (filter.operator) {
      case "iLike":
        return String(value)
          .toLowerCase()
          .includes(String(filter.value).toLowerCase())

      case "notILike":
        return !String(value)
          .toLowerCase()
          .includes(String(filter.value).toLowerCase())

      case "eq":
        if (typeof value === "boolean") {
          return value === (filter.value === "true")
        }
        if (Array.isArray(value)) {
          return value.includes(filter.value)
        }
        return value == filter.value

      case "ne":
        if (typeof value === "boolean") {
          return value !== (filter.value === "true")
        }
        if (Array.isArray(value)) {
          return !value.includes(filter.value)
        }
        return value != filter.value

      case "gt":
        return Number(value) > Number(filter.value)

      case "gte":
        return Number(value) >= Number(filter.value)

      case "lt":
        return Number(value) < Number(filter.value)

      case "lte":
        return Number(value) <= Number(filter.value)

      case "has":
        return (
          Array.isArray(filter.value) &&
          filter.value.findIndex((val) => val === value) !== -1
        )

      case "hasNot":
        return (
          Array.isArray(filter.value) &&
          filter.value.findIndex((val) => val === value) === -1
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
      case "date-eq":
        return new Date(value).getTime() === new Date(filter.value).getTime()
      case "date-ne":
        return new Date(value).getTime() !== new Date(filter.value).getTime()
      case "date-lt":
        return new Date(value) < new Date(filter.value)
      case "date-gt":
        return new Date(value) > new Date(filter.value)
      case "date-lte":
        return new Date(value) <= new Date(filter.value)
      case "date-gte":
        return new Date(value) >= new Date(filter.value)

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
    filterFn: "advanced",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Email" />
    ),
  },
  {
    accessorKey: "age",
    filterFn: "advanced",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Age" />
    ),
  },
  {
    accessorKey: "birthDate",
    filterFn: "advanced",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="DOB" />
    ),
  },
  {
    accessorKey: "isActive",
    filterFn: "advanced",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Active" />
    ),
  },
  {
    accessorKey: "education",
    filterFn: "advanced",
    header: ({ column }) => (
      <DataTableColumnHeader column={column} title="Education" />
    ),
  },
  {
    accessorKey: "gender",
    filterFn: "advanced",
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
    id: "isActive",
    label: "Active",
    type: "boolean",
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
    age: 1,
    birthDate: "2024-03-15",
    isActive: true,
    education: "Masters",
    gender: "Male",
  },
  {
    id: "2",
    name: "Jane Smith",
    email: "jane@example.com",
    age: 1,
    birthDate: "2024-07-21",
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
    age: 2,
    birthDate: "2022-01-10",
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
  operator:
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
    | "date-eq"
    | "date-ne"
    | "date-lt"
    | "date-gt"
    | "date-lte"
    | "date-gte"
  value: string | number | Date
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

  // const handleFilterChange = React.useCallback(
  //   (updater: any) => {
  //     // console.log(updater, "LINE 516 updater")
  //     const newFilters =
  //       typeof updater === "function" ? updater(columnFilters) : updater
  //     setColumnFilters(newFilters)
  //   },
  //   [columnFilters]
  // )
  // console.log("TABLE RENDERING b4")
  // const table = useReactTable({
  //   state: {
  //     columnFilters,
  //   },
  //   // state: {
  //   //   columnFilters: [
  //   //     {
  //   //       id: "name",
  //   //       value: [
  //   //         {
  //   //           type: "iLike",
  //   //           value: "John",
  //   //         },
  //   //       ],
  //   //     },
  //   //   ],
  //   // },
  //   // onColumnFiltersChange: handleFilterChange,
  //   enableColumnFilters: true,
  //   enableFilters: true,
  //   data,
  //   columns,
  //   getCoreRowModel: getCoreRowModel(),
  //   getPaginationRowModel: getPaginationRowModel(),
  //   getSortedRowModel: getSortedRowModel(),
  //   getFilteredRowModel: getFilteredRowModel(),
  //   filterFns: {
  //     advanced: advancedFilter,
  //   },
  // })
  // console.log("TABLE RENDERING")

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

  console.log("TABLE RENDERING b4")
  const table = useReactTable(tableConfig)
  console.log("TABLE RENDERING")

  React.useEffect(() => {
    console.log("TABLE RENDERING in useEffect")
  }, [table])

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
        <DataTablePinList table={table} />
      </DataTableAdvancedToolbar>

      {/* <DataTableToolbar table={table} 
        // filterFields={filterFields}
        >
          <TasksTableToolbarActions table={table} /> 
        </DataTableToolbar> */}
    </DataTable>
  )
}
