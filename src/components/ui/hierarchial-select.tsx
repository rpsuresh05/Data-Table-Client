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
  id: string
  label: string
  children?: Option[]
}

interface HierarchicalSelectProps {
  options: Option[]
  onChange: (value: string) => void
}

const NestedOptions: React.FC<{
  options: Option[]
  level: number
  onSelect: (value: string) => void
}> = ({ options, level, onSelect }) => {
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
        <div key={option.id} className={`pl-${level * 4}`}>
          <div className="flex items-center">
            {option.children && option.children.length > 0 ? (
              <button
                onClick={() => toggleExpand(option.id)}
                className="mr-1 rounded-full p-1 hover:bg-gray-200"
              >
                {expandedItems.has(option.id) ? (
                  <ChevronDown className="h-4 w-4" />
                ) : (
                  <ChevronRight className="h-4 w-4" />
                )}
              </button>
            ) : (
              <div className="mr-1 h-6 w-6" /> // Placeholder for alignment
            )}
            <SelectItem value={option.id} className="flex-grow">
              {option.label}
            </SelectItem>
          </div>
          {option.children && expandedItems.has(option.id) && (
            <NestedOptions
              options={option.children}
              level={level + 1}
              onSelect={onSelect}
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
}) => {
  return (
    <Select onValueChange={onChange}>
      <SelectTrigger className="w-full">
        <SelectValue placeholder="Select an option" />
      </SelectTrigger>
      <SelectContent>
        <NestedOptions options={options} level={0} onSelect={onChange} />
      </SelectContent>
    </Select>
  )
}
