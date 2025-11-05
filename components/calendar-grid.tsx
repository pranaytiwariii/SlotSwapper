"use client"

import { useState } from "react"
import Link from "next/link"
import { ChevronLeft, ChevronRight, Dot } from "lucide-react"

interface CalendarEvent {
  date: string
  title: string
  color: "primary" | "accent" | "secondary"
}

export default function CalendarGrid() {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState<CalendarEvent[]>([
    { date: "2025-11-15", title: "Team Meeting", color: "primary" },
    { date: "2025-11-20", title: "Project Deadline", color: "accent" },
    { date: "2025-11-28", title: "Review Session", color: "secondary" },
  ])

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ]

  const daysInMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate()
  }

  const firstDayOfMonth = (date: Date) => {
    return new Date(date.getFullYear(), date.getMonth(), 1).getDay()
  }

  const today = new Date()
  const isCurrentMonth =
    currentDate.getMonth() === today.getMonth() && currentDate.getFullYear() === today.getFullYear()

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))
  }

  const days = []
  const totalCells = firstDayOfMonth(currentDate) + daysInMonth(currentDate)

  for (let i = 0; i < totalCells; i++) {
    if (i < firstDayOfMonth(currentDate)) {
      days.push(null)
    } else {
      days.push(i - firstDayOfMonth(currentDate) + 1)
    }
  }

  const formatDateForUrl = (day: number) => {
    const date = new Date(currentDate.getFullYear(), currentDate.getMonth(), day)
    return date.toISOString().split("T")[0]
  }

  const isToday = (day: number | null) => {
    if (!day || !isCurrentMonth) return false
    return day === today.getDate()
  }

  const getEventsForDay = (day: number | null) => {
    if (!day) return []
    const dateStr = formatDateForUrl(day)
    return events.filter((event) => event.date === dateStr)
  }

  const getColorClass = (color: string) => {
    switch (color) {
      case "accent":
        return "bg-accent/20"
      case "secondary":
        return "bg-secondary/40"
      default:
        return "bg-primary/20"
    }
  }

  return (
    <div className="w-full">
      {/* Month Navigation */}
      <div className="flex items-center justify-between mb-12 pb-8 border-b border-border">
        <button
          onClick={previousMonth}
          className="p-2 hover:bg-secondary rounded-lg transition-colors text-primary hover:text-accent"
          aria-label="Previous month"
        >
          <ChevronLeft size={24} />
        </button>

        <h2 className="text-3xl font-bold text-primary">
          {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
        </h2>

        <button
          onClick={nextMonth}
          className="p-2 hover:bg-secondary rounded-lg transition-colors text-primary hover:text-accent"
          aria-label="Next month"
        >
          <ChevronRight size={24} />
        </button>
      </div>

      {/* Day Headers */}
      <div className="grid grid-cols-7 gap-4 mb-6">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((day) => (
          <div key={day} className="text-center font-semibold text-muted-foreground uppercase text-sm">
            {day}
          </div>
        ))}
      </div>

      {/* Calendar Days */}
      <div className="grid grid-cols-7 gap-4">
        {days.map((day, index) => {
          const dayEvents = getEventsForDay(day)
          const hasEvents = dayEvents.length > 0

          return (
            <div key={index}>
              {day ? (
                <Link href={`/day/${formatDateForUrl(day)}`}>
                  <div
                    className={`
                      relative aspect-square flex flex-col items-center justify-center rounded-lg font-semibold
                      transition-all duration-200 cursor-pointer p-2
                      ${
                        isToday(day)
                          ? "bg-primary text-primary-foreground border-2 border-primary shadow-lg shadow-primary/40"
                          : hasEvents
                            ? "bg-card border border-primary/50 text-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/20"
                            : "bg-card border border-border text-foreground hover:border-primary hover:shadow-lg hover:shadow-primary/20"
                      }
                    `}
                  >
                    <span className="text-lg">{day}</span>
                    {hasEvents && (
                      <div className="flex gap-0.5 mt-1">
                        {dayEvents.slice(0, 3).map((event, idx) => (
                          <Dot
                            key={idx}
                            size={6}
                            className={`fill-current ${
                              event.color === "accent"
                                ? "text-accent"
                                : event.color === "secondary"
                                  ? "text-muted-foreground"
                                  : "text-primary"
                            }`}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                </Link>
              ) : (
                <div className="aspect-square" />
              )}
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div className="mt-12 pt-8 border-t border-border">
        <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-4">Legend</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-primary" />
            <span className="text-sm text-muted-foreground">Today / Primary</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent" />
            <span className="text-sm text-muted-foreground">Accent Event</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-muted-foreground" />
            <span className="text-sm text-muted-foreground">Secondary Event</span>
          </div>
        </div>
      </div>
    </div>
  )
}
