"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { DatabaseNCP } from "@/app/dashboard/components/database-ncp"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"
import { ArrowLeft, Filter, Search, Database, BarChart3, PieChartIcon, Eye } from "lucide-react"

interface NCPReport {
  id: number
  ncp_id: string
  sku_code: string
  machine_code: string
  date: string
  time_incident: string
  hold_quantity: number
  hold_quantity_uom: string
  problem_description: string
  photo_attachment: string | null
  qa_leader: string
  status: string
  submitted_by: string
  submitted_at: string
  qa_approved_by: string | null
  qa_approved_at: string | null
  disposisi: string | null
  jumlah_sortir: string
  jumlah_release: string
  jumlah_reject: string
  assigned_team_leader: string | null
  qa_rejection_reason: string | null
  tl_processed_by: string | null
  tl_processed_at: string | null
  root_cause_analysis: string | null
  corrective_action: string | null
  preventive_action: string | null
  process_approved_by: string | null
  process_approved_at: string | null
  process_rejection_reason: string | null
  process_comment: string | null
  manager_approved_by: string | null
  manager_approved_at: string | null
  manager_rejection_reason: string | null
  manager_comment: string | null
  archived_at: string | null
}

interface FilterOptions {
  machineCode: string
  skuCode: string
  startDate: string
  endDate: string
}

export default function PublicDashboard() {
  const [ncps, setNCPs] = useState<NCPReport[]>([])
  const [filteredNCPs, setFilteredNCPs] = useState<NCPReport[]>([])
  const [filters, setFilters] = useState<FilterOptions>({
    machineCode: "",
    skuCode: "",
    startDate: "",
    endDate: ""
  })
  const [machines, setMachines] = useState<string[]>([])
  const [skuCodes, setSkuCodes] = useState<string[]>([])
  const [chartData, setChartData] = useState<any[]>([])
  const [statusData, setStatusData] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<"overview" | "database">("overview")

  // Mock user info for public access
  const userInfo = {
    id: 0,
    username: "public",
    role: "public"
  }

  const router = useRouter()

  const handleBackToHome = () => {
    router.push("/")
  }

  useEffect(() => {
    fetchAllNCPs()
  }, [])

  useEffect(() => {
    applyFilters()
    generateChartData()
  }, [ncps, filters])

  const fetchAllNCPs = async () => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/public/ncps")
      if (response.ok) {
        const data = await response.json()
        setNCPs(data)
        extractFilterOptions(data)
      } else {
        console.error("Failed to fetch NCPs")
      }
    } catch (error) {
      console.error("Error fetching NCPs:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const extractFilterOptions = (data: NCPReport[]) => {
    const uniqueMachines = Array.from(new Set(data.map(item => item.machine_code)))
    const uniqueSkus = Array.from(new Set(data.map(item => item.sku_code)))
    setMachines(uniqueMachines)
    setSkuCodes(uniqueSkus)
  }

  const applyFilters = () => {
    let result = [...ncps]
    
    if (filters.machineCode) {
      result = result.filter(ncp => ncp.machine_code === filters.machineCode)
    }
    
    if (filters.skuCode) {
      result = result.filter(ncp => ncp.sku_code === filters.skuCode)
    }
    
    if (filters.startDate) {
      result = result.filter(ncp => new Date(ncp.date) >= new Date(filters.startDate))
    }
    
    if (filters.endDate) {
      result = result.filter(ncp => new Date(ncp.date) <= new Date(filters.endDate))
    }
    
    setFilteredNCPs(result)
  }

  const generateChartData = () => {
    // Generate data for bar chart (NCPs by machine)
    const machineCounts: Record<string, number> = {}
    filteredNCPs.forEach(ncp => {
      machineCounts[ncp.machine_code] = (machineCounts[ncp.machine_code] || 0) + 1
    })
    
    const chartData = Object.entries(machineCounts).map(([machine, count]) => ({
      machine,
      count
    }))
    setChartData(chartData)
    
    // Generate data for status pie chart
    const statusCounts: Record<string, number> = {}
    filteredNCPs.forEach(ncp => {
      statusCounts[ncp.status] = (statusCounts[ncp.status] || 0) + 1
    })
    
    const statusData = Object.entries(statusCounts).map(([status, count]) => ({
      name: status,
      value: count
    }))
    setStatusData(statusData)
  }

  const handleFilterChange = (field: keyof FilterOptions, value: string) => {
    setFilters(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const resetFilters = () => {
    setFilters({
      machineCode: "",
      skuCode: "",
      startDate: "",
      endDate: ""
    })
  }

  const COLORS = ['#3b82f6', '#8b5cf6', '#06b6d4', '#10b981', '#f59e0b', '#ef4444', '#ec4899']

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-blue-900 to-indigo-900 p-4 md:p-6">
      {/* Animated background elements */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute -top-1/2 -left-1/2 w-[200%] h-[200%]">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-blue-500/5 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-3/4 right-1/4 w-96 h-96 bg-indigo-500/5 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto z-10 relative">
        {/* Header */}
        <div className="mb-8 animate-fade-in-down">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">Public NCP Dashboard</h1>
              <p className="text-blue-200 mt-2">View all Non-Conformance Product reports in real-time</p>
            </div>
            <div className="flex items-center gap-3">
              <Button 
                onClick={handleBackToHome}
                variant="outline"
                className="flex items-center gap-2 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Home
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 animate-fade-in-up">
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">Total NCPs</p>
                  <p className="text-3xl font-bold text-white mt-1">{filteredNCPs.length}</p>
                </div>
                <div className="p-3 bg-blue-500/20 rounded-xl">
                  <Database className="h-8 w-8 text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">Machines</p>
                  <p className="text-3xl font-bold text-white mt-1">{machines.length}</p>
                </div>
                <div className="p-3 bg-purple-500/20 rounded-xl">
                  <BarChart3 className="h-8 w-8 text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">SKU Codes</p>
                  <p className="text-3xl font-bold text-white mt-1">{skuCodes.length}</p>
                </div>
                <div className="p-3 bg-indigo-500/20 rounded-xl">
                  <PieChartIcon className="h-8 w-8 text-indigo-400" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-blue-200">Status Types</p>
                  <p className="text-3xl font-bold text-white mt-1">{statusData.length}</p>
                </div>
                <div className="p-3 bg-cyan-500/20 rounded-xl">
                  <Eye className="h-8 w-8 text-cyan-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs */}
        <div className="flex space-x-1 bg-white/10 p-1 rounded-xl mb-8 animate-fade-in-up delay-100">
          <button
            onClick={() => setActiveTab("overview")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300 ${
              activeTab === "overview"
                ? "bg-white/20 text-white shadow-lg"
                : "text-blue-200 hover:text-white hover:bg-white/10"
            }`}
          >
            <BarChart3 className="h-5 w-5" />
            <span className="font-medium">Overview</span>
          </button>
          <button
            onClick={() => setActiveTab("database")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-xl transition-all duration-300 ${
              activeTab === "database"
                ? "bg-white/20 text-white shadow-lg"
                : "text-blue-200 hover:text-white hover:bg-white/10"
            }`}
          >
            <Database className="h-5 w-5" />
            <span className="font-medium">Database</span>
          </button>
        </div>

        {activeTab === "overview" ? (
          <>
            {/* Filters */}
            <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-xl mb-8 animate-fade-in-up delay-200">
              <CardHeader>
                <CardTitle className="text-xl text-white flex items-center gap-2">
                  <Filter className="h-5 w-5" />
                  Filter NCP Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">Machine Code</label>
                    <select
                      value={filters.machineCode}
                      onChange={(e) => handleFilterChange('machineCode', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-blue-200/70 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300"
                    >
                      <option value="">All Machines</option>
                      {machines.map(machine => (
                        <option key={machine} value={machine} className="bg-gray-800">{machine}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">SKU Code</label>
                    <select
                      value={filters.skuCode}
                      onChange={(e) => handleFilterChange('skuCode', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder:text-blue-200/70 focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300"
                    >
                      <option value="">All SKUs</option>
                      {skuCodes.map(sku => (
                        <option key={sku} value={sku} className="bg-gray-800">{sku}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">Start Date</label>
                    <input
                      type="date"
                      value={filters.startDate}
                      onChange={(e) => handleFilterChange('startDate', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300"
                    />
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-blue-200 mb-2">End Date</label>
                    <input
                      type="date"
                      value={filters.endDate}
                      onChange={(e) => handleFilterChange('endDate', e.target.value)}
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white focus:border-blue-400 focus:ring-2 focus:ring-blue-400/30 transition-all duration-300"
                    />
                  </div>
                  
                  <div className="flex items-end">
                    <Button
                      onClick={resetFilters}
                      variant="outline"
                      className="w-full px-4 py-3 bg-white/10 border-white/20 text-white hover:bg-white/20 hover:border-white/30 transition-all duration-300"
                    >
                      Reset Filters
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8 animate-fade-in-up delay-300">
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <BarChart3 className="h-5 w-5" />
                    NCP Reports by Machine
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#334155" />
                      <XAxis dataKey="machine" stroke="#94a3b8" />
                      <YAxis stroke="#94a3b8" />
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '12px',
                          backdropFilter: 'blur(10px)'
                        }} 
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                      />
                      <Legend />
                      <Bar dataKey="count" name="Number of NCPs" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
              
              <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-xl">
                <CardHeader>
                  <CardTitle className="text-xl text-white flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    NCP Reports by Status
                  </CardTitle>
                </CardHeader>
                <CardContent className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                      >
                        {statusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ 
                          backgroundColor: 'rgba(15, 23, 42, 0.8)', 
                          borderColor: 'rgba(255, 255, 255, 0.2)',
                          borderRadius: '12px',
                          backdropFilter: 'blur(10px)'
                        }} 
                        itemStyle={{ color: '#fff' }}
                        labelStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          /* Database View */
          <Card className="bg-white/10 backdrop-blur-xl border-white/20 rounded-2xl shadow-xl animate-fade-in-up delay-200">
            <CardHeader>
              <CardTitle className="text-xl text-white flex items-center gap-2">
                <Database className="h-5 w-5" />
                NCP Database
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DatabaseNCP userInfo={userInfo} />
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}