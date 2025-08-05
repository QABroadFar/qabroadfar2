
"use client"

import React from "react"

interface DatabaseNCPProps {
  userInfo: {
    id: number
    username: string
    role: string
  }
}

export function DatabaseNCP({ userInfo }: DatabaseNCPProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold tracking-tight">Database NCP</h1>
      </div>
      
      <div className="rounded-lg border bg-card text-card-foreground shadow-sm p-6">
        <h2 className="text-xl font-semibold mb-4">NCP Database Management</h2>
        <p className="text-muted-foreground">
          Database NCP functionality is coming soon. This will allow you to view, search, and manage all Non-Conformance Product records.
        </p>
        <div className="mt-4 text-sm text-muted-foreground">
          Current user: <span className="font-medium">{userInfo.username}</span> ({userInfo.role})
        </div>
      </div>
    </div>
  )
}
