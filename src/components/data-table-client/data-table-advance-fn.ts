
export type FilterValue = {
  rowId: string
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
    | "row-select"
  value: string | number | Date
}

export const advancedFilter = <TData extends Record<string, any>>(
    row: any,
    columnId: string,
    filterValues: FilterValue[]
  ): boolean => {
    console.log(row, columnId,row.getIsSelected(), "LINE 377 filters")
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
        (filter.value === "" ||
        (Array.isArray(filter.value) && filter.value.length === 0)) && (filter.operator !== "isEmpty" &&
          filter.operator !== "isNotEmpty")
      )
        return true
  
      switch (filter.operator) {
        case "row-select":
          return row.getIsSelected()
          
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