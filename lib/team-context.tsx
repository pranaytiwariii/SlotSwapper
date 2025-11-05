"use client"

import type React from "react"
import { createContext, useContext, useState } from "react"

export interface TeamTask {
  id: string
  time: string
  title: string
  description: string
  completed: boolean
  duration: number
  date: string
  assignedTo: string
}

export interface TeamMember {
  id: string
  name: string
  role: string
  avatar: string
}

interface TeamContextType {
  members: TeamMember[]
  tasks: TeamTask[]
  currentUserId: string
  setCurrentUserId: (id: string) => void
  addTask: (task: TeamTask) => void
  deleteTask: (id: string) => void
  toggleTaskComplete: (id: string) => void
  swapTasks: (task1Id: string, task2Id: string) => void
  getTasksByUserAndDate: (userId: string, date: string) => TeamTask[]
  getTasksByDate: (date: string) => TeamTask[]
}

const TeamContext = createContext<TeamContextType | undefined>(undefined)

export function TeamProvider({ children }: { children: React.ReactNode }) {
  const [currentUserId, setCurrentUserId] = useState("user-1")

  const [members] = useState<TeamMember[]>([
    { id: "user-1", name: "You", role: "Project Lead", avatar: "👤" },
    { id: "user-2", name: "Alex Johnson", role: "Developer", avatar: "👨‍💼" },
    { id: "user-3", name: "Sarah Chen", role: "Designer", avatar: "👩‍💻" },
  ])

  const [tasks, setTasks] = useState<TeamTask[]>([
    // Current user tasks (Nov 2-4)
    {
      id: "task-1",
      time: "09:00",
      title: "Morning Standup",
      description: "Daily team sync with the whole department",
      completed: true,
      duration: 30,
      date: "2025-11-02",
      assignedTo: "user-1",
    },
    {
      id: "task-2",
      time: "10:00",
      title: "Project Review",
      description: "Review Q4 project deliverables and milestones",
      completed: false,
      duration: 60,
      date: "2025-11-02",
      assignedTo: "user-1",
    },
    {
      id: "task-3",
      time: "11:30",
      title: "Client Call",
      description: "Discuss project updates and next steps",
      completed: false,
      duration: 45,
      date: "2025-11-03",
      assignedTo: "user-1",
    },
    {
      id: "task-4",
      time: "14:00",
      title: "Code Review",
      description: "Review pull requests from team",
      completed: false,
      duration: 45,
      date: "2025-11-04",
      assignedTo: "user-1",
    },
    // Alex's task on Nov 5 (available to swap)
    {
      id: "task-5",
      time: "13:00",
      title: "Database Optimization",
      description: "Optimize queries for improved performance",
      completed: false,
      duration: 90,
      date: "2025-11-05",
      assignedTo: "user-2",
    },
  ])

  const addTask = (newTask: TeamTask) => {
    setTasks([...tasks, newTask])
  }

  const deleteTask = (id: string) => {
    setTasks(tasks.filter((task) => task.id !== id))
  }

  const toggleTaskComplete = (id: string) => {
    setTasks(tasks.map((task) => (task.id === id ? { ...task, completed: !task.completed } : task)))
  }

  const swapTasks = (task1Id: string, task2Id: string) => {
    setTasks(
      tasks.map((task) => {
        if (task.id === task1Id) {
          const task2 = tasks.find((t) => t.id === task2Id)
          return task2 ? { ...task, assignedTo: task2.assignedTo } : task
        }
        if (task.id === task2Id) {
          const task1 = tasks.find((t) => t.id === task1Id)
          return task1 ? { ...task, assignedTo: task1.assignedTo } : task
        }
        return task
      }),
    )
  }

  const getTasksByUserAndDate = (userId: string, date: string) => {
    return tasks.filter((task) => task.assignedTo === userId && task.date === date)
  }

  const getTasksByDate = (date: string) => {
    return tasks.filter((task) => task.date === date)
  }

  return (
    <TeamContext.Provider
      value={{
        members,
        tasks,
        currentUserId,
        setCurrentUserId,
        addTask,
        deleteTask,
        toggleTaskComplete,
        swapTasks,
        getTasksByUserAndDate,
        getTasksByDate,
      }}
    >
      {children}
    </TeamContext.Provider>
  )
}

export function useTeam() {
  const context = useContext(TeamContext)
  if (context === undefined) {
    throw new Error("useTeam must be used within a TeamProvider")
  }
  return context
}
