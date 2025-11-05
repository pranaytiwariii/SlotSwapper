"use client"

interface TaskStatsProps {
  total: number
  completed: number
  pending: number
}

export default function TaskStats({ total, completed, pending }: TaskStatsProps) {
  const completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0

  return (
    <div className="grid grid-cols-3 gap-4">
      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-sm text-muted-foreground uppercase font-semibold mb-2">Total Tasks</p>
        <p className="text-3xl font-bold text-primary">{total}</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-sm text-muted-foreground uppercase font-semibold mb-2">Completed</p>
        <p className="text-3xl font-bold text-accent">{completed}</p>
      </div>

      <div className="bg-card border border-border rounded-lg p-4">
        <p className="text-sm text-muted-foreground uppercase font-semibold mb-2">Pending</p>
        <p className="text-3xl font-bold text-secondary-foreground">{pending}</p>
      </div>
    </div>
  )
}
