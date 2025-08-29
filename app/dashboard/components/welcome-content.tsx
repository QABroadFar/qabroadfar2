"use client"

import { Card, CardContent } from "@/components/ui/card"
import { CheckCircle, TrendingUp, Users, FileText } from "lucide-react"

interface WelcomeContentProps {
  onNavigate?: (page: string) => void
}

export function WelcomeContent({ onNavigate }: WelcomeContentProps) {
  return (
    <div className="p-6 space-y-6">
      {/* Welcome Section */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold text-gray-800">Welcome to Quality Assurance Portal</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Manage non-conformance products, track quality processes, and maintain excellence in your operations.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
        <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-white/80 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-100 rounded-lg">
                <CheckCircle className="h-6 w-6 text-blue-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total NCPs</p>
                <p className="text-2xl font-bold text-gray-900">24</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-white/80 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-green-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">18</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-white/80 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-orange-100 rounded-lg">
                <Users className="h-6 w-6 text-orange-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">6</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50 hover:bg-white/80 transition-colors">
          <CardContent className="p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-purple-100 rounded-lg">
                <FileText className="h-6 w-6 text-purple-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Documents</p>
                <p className="text-2xl font-bold text-gray-900">142</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      {onNavigate && (
        <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
          <CardContent className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div
                className="p-4 bg-blue-50/80 rounded-lg hover:bg-blue-100/80 transition-colors cursor-pointer"
                onClick={() => onNavigate("input")}
              >
                <FileText className="h-8 w-8 text-blue-600 mb-2" />
                <h4 className="font-medium text-gray-800">Create New NCP</h4>
                <p className="text-sm text-gray-600">Start a new non-conformance report</p>
              </div>
              <div
                className="p-4 bg-green-50/80 rounded-lg hover:bg-green-100/80 transition-colors cursor-pointer"
                onClick={() => onNavigate("dashboard")}
              >
                <CheckCircle className="h-8 w-8 text-green-600 mb-2" />
                <h4 className="font-medium text-gray-800">Review Pending</h4>
                <p className="text-sm text-gray-600">Review items awaiting approval</p>
              </div>
              <div
                className="p-4 bg-purple-50/80 rounded-lg hover:bg-purple-100/80 transition-colors cursor-pointer"
                onClick={() => onNavigate("database")}
              >
                <TrendingUp className="h-8 w-8 text-purple-600 mb-2" />
                <h4 className="font-medium text-gray-800">View Reports</h4>
                <p className="text-sm text-gray-600">Access quality reports and analytics</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
