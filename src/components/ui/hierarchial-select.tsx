"use client"

import type React from "react"
import { useState } from "react"
import { ChevronDown, ChevronRight } from "lucide-react"

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface Option {
  [key: string]: any
  children?: Option[]
}

interface HierarchicalSelectProps {
  options: Option[]
  onChange: (value: any) => void
  displayKey: string
  valueKey: string
  saveEntireObject?: boolean
}

const NestedOptions: React.FC<{
  options: Option[]
  level: number
  onSelect: (value: any) => void
  displayKey: string
  valueKey: string
  saveEntireObject: boolean
}> = ({ options, level, onSelect, displayKey, valueKey, saveEntireObject }) => {
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) {
        newSet.delete(id)
      } else {
        newSet.add(id)
      }
      return newSet
    })
  }

  return (
    <>
      {options.map((option) => (
        <div key={option[valueKey]} className={`pl-${level * 4}`}>
          <div className="flex items-center">
            {option.children && option.children.length > 0 ? (
              <button
                onClick={() => toggleExpand(option[valueKey])}
                className="mr-1 rounded-full p-1 hover:bg-gray-200"
              >
                {expandedItems.has(option[valueKey]) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <div className="mr-1 h-6 w-6" />
            )}
            <SelectItem
              value={
                saveEntireObject ? JSON.stringify(option) : option[valueKey]
              }
              className="flex-grow"
            >
              {option[displayKey]}
            </SelectItem>
          </div>
          {option.children && expandedItems.has(option[valueKey]) && (
            <NestedOptions
              options={option.children}
              level={level + 1}
              onSelect={onSelect}
              displayKey={displayKey}
              valueKey={valueKey}
              saveEntireObject={saveEntireObject}
            />
          )}
        </div>
      ))}
    </>
  )
}

export const HierarchicalSelect: React.FC<HierarchicalSelectProps> = ({
  options,
  onChange,
  displayKey,
  valueKey,
  saveEntireObject = false,
}) => {
  const handleChange = (value: string) => {
    if (saveEntireObject) {
      onChange(JSON.parse(value))
    } else {
      onChange(value)
    }
  }

  return (
    <Select onValueChange={handleChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <NestedOptions
          options={options}
          level={0}
          onSelect={onChange}
          displayKey={displayKey}
          valueKey={valueKey}
          saveEntireObject={saveEntireObject}
        />
      </SelectContent>
    </Select>
  )
}
