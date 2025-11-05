"use client"

interface TaskFilterProps {
  activeFilter: "all" | "completed" | "pending"
  onFilterChange: (filter: "all" | "completed" | "pending") => void
}

export default function TaskFilter({ activeFilter, onFilterChange }: TaskFilterProps) {
  const filters = [
    { id: "all", label: "All Tasks" },
    { id: "completed", label: "Completed" },
    { id: "pending", label: "Pending" },
  ] as const

  return (
    <div className="flex gap-2 flex-wrap">
      {filters.map((filter) => (
        <button
          key={filter.id}
          onClick={() => onFilterChange(filter.id)}
          className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${
            activeFilter === filter.id
              ? "bg-primary text-primary-foreground shadow-lg shadow-primary/40"
              : "bg-secondary text-foreground hover:border-primary border border-border"
          }`}
        >
          {filter.label}
        </button>
      ))}
    </div>
  )
}
