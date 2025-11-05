"use client"

import Link from "next/link"
import { Calendar, Home } from "lucide-react"
import { usePathname } from "next/navigation"

export default function Header() {
  const pathname = usePathname()

  const isCalendarPage = pathname === "/"
  const isDayPage = pathname.startsWith("/day/")

  return (
    <header className="sticky top-0 z-40 bg-card border-b border-border">
      <div className="max-w-7xl mx-auto px-8 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="p-2 bg-primary rounded-lg group-hover:shadow-lg group-hover:shadow-primary/40 transition-all">
                <Calendar size={24} className="text-primary-foreground" />
              </div>
              <span className="text-2xl font-bold text-primary">Schedule</span>
            </Link>

            <nav className="hidden md:flex items-center gap-1">
              <Link
                href="/"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  isCalendarPage ? "bg-primary text-primary-foreground" : "text-foreground hover:bg-secondary"
                }`}
              >
                <Home size={18} />
                <span className="font-semibold">Calendar</span>
              </Link>
            </nav>
          </div>

          <div className="text-sm text-muted-foreground">
            {isDayPage && (
              <span className="flex items-center gap-2">
                <span className="text-primary">Today's Schedule</span>
              </span>
            )}
            {isCalendarPage && <span>Click on any date to view or manage tasks</span>}
          </div>
        </div>
      </div>
    </header>
  )
}
