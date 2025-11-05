"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { useParams } from "next/navigation"
import { ArrowLeft, Plus, Clock, CheckCircle2, Circle, Trash2 } from "lucide-react"
import TaskForm from "@/components/task-form"
import TaskStats from "@/components/task-stats"
import TaskFilter from "@/components/task-filter"
import TeamTaskSwapper from "@/components/team-task-swapper"
import TeamSelector from "@/components/team-selector"
import { useTeam } from "@/lib/team-context"

interface TimelineTask {
  id: string
  time: string
  title: string
  description: string
  completed: boolean
  duration: number
}

export default function DayPage() {
  const params = useParams()
  const dateStr = params.date as string
  const { currentUserId, getTasksByUserAndDate } = useTeam()
  const [showForm, setShowForm] = useState(false)
  const [activeFilter, setActiveFilter] = useState<"all" | "completed" | "pending">("all")

  const userTasks = getTasksByUserAndDate(currentUserId, dateStr)
  const [tasks, setTasks] = useState<TimelineTask[]>(
    userTasks.map((t) => ({
      id: t.id,
      time: t.time,
      title: t.title,
      description: t.description,
      completed: t.completed,
      duration: t.duration,
    })),
  )

  const formatDate = (date: string) => {
    const d = new Date(date + "T00:00:00")
    return d.toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  }

  const completedTasks = tasks.filter((t) => t.completed).length
  const pendingTasks = tasks.filter((t) => !t.completed).length
  const completionPercentage = Math.round((completedTasks / tasks.length) * 100)

  const handleAddTask = (newTask: { title: string; description: string; time: string; duration: number }) => {
    setTasks([
      ...tasks,
      {
        id: Date.now().toString(),
        ...newTask,
        completed: false,
      },
    ])
    setShowForm(false)
  }

  const toggleTaskComplete = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const filteredTasks = useMemo(() => {
    let filtered = tasks
    if (activeFilter === "completed") {
      filtered = tasks.filter((t) => t.completed)
    } else if (activeFilter === "pending") {
      filtered = tasks.filter((t) => !t.completed)
    }
    return filtered.sort((a, b) => a.time.localeCompare(b.time))
  }, [tasks, activeFilter])

  return (
    <main className="min-h-screen bg-background text-foreground p-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link
            href="/"
            className="p-2 hover:bg-secondary rounded-lg transition-colors text-primary"
            aria-label="Back to calendar"
          >
            <ArrowLeft size={24} />
          </Link>
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-primary">{formatDate(dateStr)}</h1>
            <p className="text-muted-foreground mt-1">{tasks.length} tasks scheduled</p>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-8">
          <TaskStats total={tasks.length} completed={completedTasks} pending={pendingTasks} />
        </div>

        {/* Progress Section */}
        <div className="bg-card border border-border rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-foreground">Daily Progress</h2>
            <span className="text-2xl font-bold text-primary">{completionPercentage}%</span>
          </div>
          <div className="w-full bg-secondary rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${completionPercentage}%` }}
            />
          </div>
        </div>

        {/* Timeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between mb-6 flex-wrap gap-4">
            <h2 className="text-xl font-semibold text-foreground">Timeline</h2>
            <button
              onClick={() => setShowForm(true)}
              className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:shadow-lg hover:shadow-primary/40 transition-all duration-200 font-semibold"
            >
              <Plus size={18} />
              Add Task
            </button>
          </div>

          {/* Filter */}
          <div className="mb-6">
            <TaskFilter activeFilter={activeFilter} onFilterChange={setActiveFilter} />
          </div>

          {/* Team Selector and Task Swapper */}
          <div className="mb-8">
            <TeamSelector />
            <TeamTaskSwapper dateStr={dateStr} />
          </div>

          {/* Timeline Items */}
          <div className="relative">
            {/* Timeline Line */}
            <div className="absolute left-6 top-0 bottom-0 w-0.5 bg-border" />

            {filteredTasks.length > 0 ? (
              filteredTasks.map((task) => (
                <div key={task.id} className="relative mb-6 ml-16">
                  {/* Timeline Dot */}
                  <button
                    onClick={() => toggleTaskComplete(task.id)}
                    className="absolute -left-10 top-1 p-1 transition-all duration-200"
                    aria-label={`Toggle task: ${task.title}`}
                  >
                    {task.completed ? (
                      <CheckCircle2 size={24} className="text-primary fill-primary" />
                    ) : (
                      <Circle size={24} className="text-border hover:text-primary" />
                    )}
                  </button>

                  {/* Task Card */}
                  <div
                    className={`rounded-lg border p-4 transition-all duration-200 ${
                      task.completed
                        ? "bg-secondary/30 border-border opacity-75"
                        : "bg-card border-border hover:border-primary hover:shadow-lg hover:shadow-primary/20"
                    }`}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <Clock size={16} className="text-muted-foreground" />
                          <time className="font-semibold text-primary">{task.time}</time>
                          <span className="text-xs text-muted-foreground">{task.duration}min</span>
                        </div>
                        <h3
                          className={`text-lg font-semibold mb-1 ${
                            task.completed ? "text-muted-foreground line-through" : "text-foreground"
                          }`}
                        >
                          {task.title}
                        </h3>
                        <p
                          className={`text-sm ${task.completed ? "text-muted-foreground/60" : "text-muted-foreground"}`}
                        >
                          {task.description}
                        </p>
                      </div>
                      <button
                        onClick={() => deleteTask(task.id)}
                        className="p-2 hover:bg-secondary rounded-lg transition-colors text-muted-foreground hover:text-destructive"
                        aria-label={`Delete task: ${task.title}`}
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-muted-foreground text-lg">
                  {activeFilter === "completed"
                    ? "No completed tasks yet"
                    : activeFilter === "pending"
                      ? "No pending tasks"
                      : "No tasks scheduled"}
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Task Form Modal */}
        {showForm && <TaskForm onSubmit={handleAddTask} onClose={() => setShowForm(false)} />}
      </div>
    </main>
  )
}
