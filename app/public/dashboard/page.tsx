"use client"

import { useState, useEffect } from "react"
import { DatabaseNCP } from "@/app/dashboard/components/database-ncp"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from "recharts"

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

  // Mock user info for public access
  const userInfo = {
    id: 0,
    username: "public",
    role: "public"
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

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8']

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-800">Public NCP Dashboard</h1>
          <p className="text-gray-600 mt-2">View all Non-Conformance Product reports in real-time</p>
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-blue-100 p-3 mr-4">
                  <BarChart className="h-6 w-6 text-blue-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Total NCPs</p>
                  <p className="text-2xl font-bold text-gray-800">{filteredNCPs.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-green-100 p-3 mr-4">
                  <BarChart className="h-6 w-6 text-green-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Machines</p>
                  <p className="text-2xl font-bold text-gray-800">{machines.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-purple-100 p-3 mr-4">
                  <BarChart className="h-6 w-6 text-purple-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">SKU Codes</p>
                  <p className="text-2xl font-bold text-gray-800">{skuCodes.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardContent className="p-6">
              <div className="flex items-center">
                <div className="rounded-full bg-orange-100 p-3 mr-4">
                  <BarChart className="h-6 w-6 text-orange-600" />
                </div>
                <div>
                  <p className="text-sm text-gray-600">Status Types</p>
                  <p className="text-2xl font-bold text-gray-800">{statusData.length}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Filters */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg mb-8">
          <CardHeader>
            <CardTitle className="text-xl">Filter NCP Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Machine Code</label>
                <select
                  value={filters.machineCode}
                  onChange={(e) => handleFilterChange('machineCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All Machines</option>
                  {machines.map(machine => (
                    <option key={machine} value={machine}>{machine}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">SKU Code</label>
                <select
                  value={filters.skuCode}
                  onChange={(e) => handleFilterChange('skuCode', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">All SKUs</option>
                  {skuCodes.map(sku => (
                    <option key={sku} value={sku}>{sku}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                <input
                  type="date"
                  value={filters.startDate}
                  onChange={(e) => handleFilterChange('startDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                <input
                  type="date"
                  value={filters.endDate}
                  onChange={(e) => handleFilterChange('endDate', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-200 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
              
              <div className="flex items-end">
                <button
                  onClick={resetFilters}
                  className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition-colors"
                >
                  Reset Filters
                </button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>NCP Reports by Machine</CardTitle>
            </CardHeader>
            <CardContent className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="machine" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="count" name="Number of NCPs" fill="#8884d8" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
          
          <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
            <CardHeader>
              <CardTitle>NCP Reports by Status</CardTitle>
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
                  <Tooltip />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* NCP Database Table */}
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-lg">
          <CardHeader>
            <CardTitle>NCP Database</CardTitle>
          </CardHeader>
          <CardContent>
            <DatabaseNCP userInfo={userInfo} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}