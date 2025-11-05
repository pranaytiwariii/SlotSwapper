"use client"

import { useState } from "react"
import TaskCard from "./task-card"
import AddTaskModal from "./add-task-modal"
import { useLocalStorage } from "@/hooks/use-local-storage"

interface Task {
  id: string
  title: string
  date: string
  startTime: string
  endTime: string
}

export default function DayTimeline({ dateString }: { dateString: string }) {
  const [tasks, setTasks] = useLocalStorage<Task[]>("calendar-tasks", [])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedHour, setSelectedHour] = useState<number | null>(null)

  const date = new Date(dateString)
  const dayName = date.toLocaleDateString("en-US", { weekday: "long" })
  const formattedDate = date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })

  const dayTasks = tasks.filter((task) => task.date === dateString)

  const handleAddTask = (taskData: { title: string; startTime: string; endTime: string }) => {
    const newTask: Task = {
      id: Date.now().toString(),
      title: taskData.title,
      date: dateString,
      startTime: taskData.startTime,
      endTime: taskData.endTime,
    }
    setTasks([...tasks, newTask])
    setIsModalOpen(false)
  }

  const handleDeleteTask = (taskId: string) => {
    setTasks(tasks.filter((task) => task.id !== taskId))
  }

  const getTaskPosition = (startTime: string) => {
    const [hours, minutes] = startTime.split(":").map(Number)
    return (hours + minutes / 60) * 60
  }

  const getTaskHeight = (startTime: string, endTime: string) => {
    const [startHours, startMinutes] = startTime.split(":").map(Number)
    const [endHours, endMinutes] = endTime.split(":").map(Number)
    const startTotalMinutes = startHours * 60 + startMinutes
    const endTotalMinutes = endHours * 60 + endMinutes
    return Math.max(endTotalMinutes - startTotalMinutes, 30)
  }

  return (
    <div className="w-full">
      {/* Header */}
      <div className="mb-12 pb-8 border-b border-border">
        <h1 className="text-4xl md:text-5xl font-bold text-primary text-balance">{dayName}</h1>
        <p className="text-muted-foreground mt-2 text-lg">{formattedDate}</p>
        <button
          onClick={() => setIsModalOpen(true)}
          className="mt-6 px-6 py-3 bg-primary text-primary-foreground rounded-lg font-semibold hover:shadow-lg hover:shadow-primary/50 transition-all duration-200"
        >
          + Add Task
        </button>
      </div>

      {/* Timeline */}
      <div className="relative">
        <div className="space-y-0">
          {Array.from({ length: 24 }).map((_, hour) => {
            const timeStr = `${String(hour).padStart(2, "0")}:00`
            const hourTasks = dayTasks.filter((task) => {
              const [startHour] = task.startTime.split(":").map(Number)
              return startHour === hour
            })

            return (
              <div
                key={hour}
                className="relative h-24 border-t border-border cursor-pointer hover:bg-secondary/30 transition-colors group"
                onClick={() => {
                  setSelectedHour(hour)
                  setIsModalOpen(true)
                }}
              >
                <div className="absolute left-0 top-0 w-16 pt-1 text-sm text-muted-foreground font-mono">{timeStr}</div>
                <div className="ml-20 relative h-full">
                  {/* Task cards for this hour */}
                  {hourTasks.map((task) => (
                    <div
                      key={task.id}
                      style={{
                        top: `${getTaskPosition(task.startTime) - hour * 60}px`,
                        height: `${getTaskHeight(task.startTime, task.endTime)}px`,
                      }}
                      className="absolute left-0 right-4 bg-card border border-primary rounded-lg p-3 overflow-hidden group hover:shadow-lg hover:shadow-primary/20 transition-all duration-200"
                    >
                      <TaskCard task={task} onDelete={() => handleDeleteTask(task.id)} />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Add Task Modal */}
      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false)
          setSelectedHour(null)
        }}
        onAdd={handleAddTask}
        defaultHour={selectedHour}
      />
    </div>
  )
}
