"use client"

import { useTeam } from "@/lib/team-context"
import { Users } from "lucide-react"

export default function TeamSelector() {
  const { members, currentUserId, setCurrentUserId } = useTeam()

  return (
    <div className="bg-card border border-border rounded-lg p-4 mb-6">
      <div className="flex items-center gap-2 mb-3">
        <Users size={18} className="text-primary" />
        <h3 className="text-sm font-semibold text-foreground uppercase">Team Members</h3>
      </div>
      <div className="flex flex-wrap gap-2">
        {members.map((member) => (
          <button
            key={member.id}
            onClick={() => setCurrentUserId(member.id)}
            className={`px-3 py-2 rounded-lg transition-all duration-200 text-sm font-semibold flex items-center gap-2 ${
              currentUserId === member.id
                ? "bg-primary text-primary-foreground shadow-lg shadow-primary/40"
                : "bg-secondary text-foreground hover:border-primary border border-border"
            }`}
          >
            <span>{member.avatar}</span>
            {member.name}
            <span className="text-xs opacity-70">({member.role})</span>
          </button>
        ))}
      </div>
    </div>
  )
}
