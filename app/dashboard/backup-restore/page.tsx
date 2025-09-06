"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const BackupRestorePage = () => {
  const [backups, setBackups] = useState<any[]>([])
  const [selectedBackup, setSelectedBackup] = useState("")
  const [message, setMessage] = useState("")

  useEffect(() => {
    fetchBackups()
  }, [])

  const fetchBackups = async () => {
    try {
      const res = await fetch("/api/database/backup")
      if (res.ok) {
        const data = await res.json()
        setBackups(data)
      }
    } catch (error) {
      console.error("Failed to fetch backups", error)
    }
  }

  const handleCreateBackup = async () => {
    try {
      const response = await fetch('/api/database/backup', { method: 'POST' });
      const data = await response.json();
      setMessage(data.message || data.error);
      fetchBackups(); // Refresh backup list
    } catch (error) {
      console.error("Error creating backup:", error);
      setMessage("Error creating backup");
    }
  }

  const handleRestoreBackup = async () => {
    if (!selectedBackup) {
      setMessage("Please select a backup to restore.");
      return;
    }
    try {
      const response = await fetch('/api/database/restore', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: selectedBackup }),
      });
      const data = await response.json();
      setMessage(data.message || data.error);
    } catch (error) {
      console.error("Error restoring backup:", error);
      setMessage("Error restoring backup");
    }
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Database Backup & Restore</h1>

      {message && <div className="bg-blue-100 text-blue-800 p-4 rounded-md mb-6">{message}</div>}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Create Backup</h2>
          <p className="text-gray-600 mb-4">
            Create a new backup of the current database.
          </p>
          <Button onClick={handleCreateBackup}>Create Backup</Button>
        </div>

        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">Restore from Backup</h2>
          <p className="text-gray-600 mb-4">
            Select a backup file to restore the database from. This will overwrite the current database.
          </p>
          <div className="flex gap-2">
            <Select onValueChange={setSelectedBackup}>
              <SelectTrigger>
                <SelectValue placeholder="Select a backup file" />
              </SelectTrigger>
              <SelectContent>
                {backups.map((backup) => (
                  <SelectItem key={backup.path} value={backup.path}>
                    {backup.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleRestoreBackup} variant="destructive">Restore</Button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BackupRestorePage
