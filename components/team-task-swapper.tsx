"use client"

import { useState } from "react"
import { useTeam } from "@/lib/team-context"
import { ArrowRightLeft } from "lucide-react"

export default function TeamTaskSwapper({ dateStr }: { dateStr: string }) {
  const { tasks, members, currentUserId, swapTasks } = useTeam()
  const [selectedSwap, setSelectedSwap] = useState<[string, string] | null>(null)
  const [showSwapModal, setShowSwapModal] = useState(false)

  const currentUserTasks = tasks.filter((task) => task.assignedTo === currentUserId && task.date === dateStr)

  const otherUsersTasks = tasks.filter((task) => task.assignedTo !== currentUserId && task.date !== dateStr)

  const handleSwap = (currentTaskId: string, otherTaskId: string) => {
    swapTasks(currentTaskId, otherTaskId)
    setSelectedSwap(null)
    setShowSwapModal(false)
  }

  if (currentUserTasks.length === 0) return null

  return (
    <>
      <div className="bg-card border border-border rounded-lg p-4 mb-6">
        <button
          onClick={() => setShowSwapModal(true)}
          className="w-full flex items-center justify-center gap-2 px-4 py-2 bg-secondary text-foreground rounded-lg hover:border-primary border border-border transition-all duration-200 font-semibold"
        >
          <ArrowRightLeft size={18} />
          Swap Task with Team Member
        </button>
      </div>

      {showSwapModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-card border border-border rounded-lg p-6 max-w-2xl w-full">
            <h2 className="text-2xl font-bold text-primary mb-6">Swap Tasks</h2>

            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                  Your Tasks ({currentUserTasks.length})
                </h3>
                <div className="space-y-2">
                  {currentUserTasks.map((task) => (
                    <div
                      key={task.id}
                      className="bg-secondary border border-border rounded-lg p-3 cursor-pointer hover:border-primary transition-all"
                      onClick={() => setSelectedSwap([task.id, ""])}
                    >
                      <div className="font-semibold text-foreground">{task.title}</div>
                      <div className="text-xs text-muted-foreground">
                        {task.time} • {task.duration}min
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-3">
                  Available Team Tasks (Other Dates)
                </h3>
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {otherUsersTasks.length > 0 ? (
                    otherUsersTasks.map((task) => {
                      const assignee = members.find((m) => m.id === task.assignedTo)
                      return (
                        <div
                          key={task.id}
                          className="bg-secondary border border-border rounded-lg p-3 cursor-pointer hover:border-accent transition-all"
                          onClick={() => {
                            if (selectedSwap && selectedSwap[0]) {
                              handleSwap(selectedSwap[0], task.id)
                            }
                          }}
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <div className="font-semibold text-foreground">{task.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {task.time} • {task.duration}min
                              </div>
                              <div className="text-xs text-accent mt-1">
                                {assignee?.avatar} {assignee?.name} • {task.date}
                              </div>
                            </div>
                            {selectedSwap && selectedSwap[0] && (
                              <button className="px-2 py-1 bg-primary text-primary-foreground rounded text-xs">
                                Swap
                              </button>
                            )}
                          </div>
                        </div>
                      )
                    })
                  ) : (
                    <p className="text-muted-foreground text-sm">No other tasks available to swap</p>
                  )}
                </div>
              </div>
            </div>

            <button
              onClick={() => setShowSwapModal(false)}
              className="w-full mt-6 px-4 py-2 bg-secondary text-foreground rounded-lg hover:border-primary border border-border transition-all"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
