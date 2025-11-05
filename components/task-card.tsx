"use client"

import { X } from "lucide-react"

interface Task {
  id: string
  title: string
  startTime: string
  endTime: string
}

interface TaskCardProps {
  task: Task
  onDelete: () => void
}

export default function TaskCard({ task, onDelete }: TaskCardProps) {
  return (
    <div className="flex items-start justify-between gap-2 h-full">
      <div className="flex-1 min-w-0">
        <h3 className="font-semibold text-primary text-sm leading-tight truncate">{task.title}</h3>
        <p className="text-xs text-muted-foreground mt-1">
          {task.startTime} - {task.endTime}
        </p>
      </div>
      <button
        onClick={(e) => {
          e.stopPropagation()
          onDelete()
        }}
        className="flex-shrink-0 p-1 hover:bg-primary/20 rounded text-primary transition-colors"
        aria-label="Delete task"
      >
        <X size={16} />
      </button>
    </div>
  )
}
