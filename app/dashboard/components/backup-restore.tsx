"use client"

import React, { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { 
  Database, 
  Download, 
  Upload, 
  AlertCircle, 
  CheckCircle, 
  Loader2,
  Clock,
  HardDrive
} from "lucide-react"
import { toast } from "sonner"

export function BackupRestore() {
  const [backupLoading, setBackupLoading] = useState(false)
  const [restoreLoading, setRestoreLoading] = useState(false)
  const [backupHistory, setBackupHistory] = useState([
    {
      id: 1,
      filename: "backup_2023-05-15_14-30-00.db",
      size: "125 MB",
      created_at: "2023-05-15T14:30:00Z",
      status: "completed"
    },
    {
      id: 2,
      filename: "backup_2023-05-14_14-30-00.db",
      size: "122 MB",
      created_at: "2023-05-14T14:30:00Z",
      status: "completed"
    },
    {
      id: 3,
      filename: "backup_2023-05-13_14-30-00.db",
      size: "118 MB",
      created_at: "2023-05-13T14:30:00Z",
      status: "completed"
    }
  ])

  const handleCreateBackup = () => {
    setBackupLoading(true)
    toast.info("Creating database backup...")
    
    // Simulate backup process
    setTimeout(() => {
      const newBackup = {
        id: backupHistory.length + 1,
        filename: `backup_${new Date().toISOString().slice(0, 19).replace(/:/g, '-')}.db`,
        size: `${Math.floor(Math.random() * 20) + 120} MB`,
        created_at: new Date().toISOString(),
        status: "completed"
      }
      
      setBackupHistory([newBackup, ...backupHistory])
      setBackupLoading(false)
      toast.success("Database backup created successfully")
    }, 3000)
  }

  const handleRestoreBackup = (filename: string) => {
    setRestoreLoading(true)
    toast.info(`Restoring database from ${filename}...`)
    
    // Simulate restore process
    setTimeout(() => {
      setRestoreLoading(false)
      toast.success("Database restored successfully")
    }, 5000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    })
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-800">Backup & Restore</h1>
        <p className="text-gray-600 mt-1">Manage database backups and restore from previous versions</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Create Backup Card */}
        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Create Backup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Create a complete backup of the database including all NCP reports, users, and system settings.
              </p>
              
              <div className="p-4 bg-blue-50 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-blue-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-blue-800">Important Notice</h3>
                    <p className="text-sm text-blue-700 mt-1">
                      The backup process will temporarily lock the database. It is recommended to perform backups during low-usage periods.
                    </p>
                  </div>
                </div>
              </div>
              
              <Button 
                onClick={handleCreateBackup} 
                disabled={backupLoading}
                className="w-full"
              >
                {backupLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Creating Backup...
                  </>
                ) : (
                  <>
                    <Download className="h-4 w-4 mr-2" />
                    Create Database Backup
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Restore Backup Card */}
        <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="h-5 w-5" />
              Restore Backup
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-gray-600">
                Restore the database from a previously created backup file. This will overwrite all current data.
              </p>
              
              <div className="p-4 bg-red-50 rounded-lg">
                <div className="flex items-start">
                  <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 mr-2 flex-shrink-0" />
                  <div>
                    <h3 className="font-medium text-red-800">Warning</h3>
                    <p className="text-sm text-red-700 mt-1">
                      Restoring a backup will permanently delete all current data. This action cannot be undone.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="space-y-3">
                <label className="block">
                  <span className="text-gray-700">Upload Backup File</span>
                  <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed border-gray-300 rounded-md">
                    <div className="space-y-1 text-center">
                      <Upload className="mx-auto h-12 w-12 text-gray-400" />
                      <div className="flex text-sm text-gray-600">
                        <label className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500">
                          <span>Upload a file</span>
                          <input 
                            type="file" 
                            className="sr-only" 
                            accept=".db,.sqlite,.backup"
                          />
                        </label>
                        <p className="pl-1">or drag and drop</p>
                      </div>
                      <p className="text-xs text-gray-500">
                        Database backup files only
                      </p>
                    </div>
                  </div>
                </label>
                
                <Button 
                  disabled={restoreLoading}
                  className="w-full"
                >
                  {restoreLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Restoring Backup...
                    </>
                  ) : (
                    <>
                      <Upload className="h-4 w-4 mr-2" />
                      Restore from Uploaded File
                    </>
                  )}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Backup History */}
      <Card className="bg-white/90 backdrop-blur-md border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-5 w-5" />
            Backup History
          </CardTitle>
        </CardHeader>
        <CardContent>
          {backupHistory.length === 0 ? (
            <div className="text-center py-8">
              <Database className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No backups found</h3>
              <p className="text-gray-500">Create your first backup to get started.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Filename</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Size</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Created</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Status</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-700">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {backupHistory.map((backup) => (
                    <tr key={backup.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4 font-mono text-sm">{backup.filename}</td>
                      <td className="py-3 px-4">{backup.size}</td>
                      <td className="py-3 px-4">{formatDate(backup.created_at)}</td>
                      <td className="py-3 px-4">
                        <div className="flex items-center">
                          <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                          <span className="text-green-700">Completed</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleRestoreBackup(backup.filename)}
                          disabled={restoreLoading}
                        >
                          <Upload className="h-4 w-4 mr-1" />
                          Restore
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Backup Settings */}
      <Card className="bg-white/90 backdrop-blur-md border-0 shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Backup Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Automatic Backups</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Daily Backups</p>
                    <p className="text-sm text-gray-600">Create a backup every day at 2:00 AM</p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Weekly Backups</p>
                    <p className="text-sm text-gray-600">Create a backup every Sunday at 3:00 AM</p>
                  </div>
                  <Button variant="outline">Enable</Button>
                </div>
              </div>
            </div>
            
            <div>
              <h3 className="font-medium text-gray-800 mb-3">Retention Policy</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Keep backups for
                  </label>
                  <select className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500">
                    <option>30 days</option>
                    <option>60 days</option>
                    <option>90 days</option>
                    <option>1 year</option>
                  </select>
                  <p className="text-xs text-gray-500 mt-1">
                    Older backups will be automatically deleted
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}