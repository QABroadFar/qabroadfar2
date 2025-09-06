"use client"

import { useEffect, useState } from "react"
import { Bar, Pie } from "react-chartjs-2"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const AnalyticsPage = () => {
  const [analyticsData, setAnalyticsData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const res = await fetch("/api/analytics")
        if (res.ok) {
          const data = await res.json()
          setAnalyticsData(data)
        }
      } catch (error) {
        console.error("Failed to fetch analytics", error)
      } finally {
        setLoading(false)
      }
    }
    fetchAnalytics()
  }, [])

  if (loading) {
    return <div>Loading analytics...</div>
  }

  if (!analyticsData) {
    return <div>Failed to load analytics data.</div>
  }

  const { ncpByMonth, statusDistribution, topSubmitters } = analyticsData;

  const ncpByMonthData = {
    labels: ncpByMonth.map((item: any) => item.month),
    datasets: [
      {
        label: 'NCPs per Month',
        data: ncpByMonth.map((item: any) => item.count),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
      },
    ],
  };

  const statusDistributionData = {
    labels: statusDistribution.map((item: any) => item.status),
    datasets: [
      {
        label: 'NCP Status Distribution',
        data: statusDistribution.map((item: any) => item.count),
        backgroundColor: [
          'rgba(255, 99, 132, 0.6)',
          'rgba(54, 162, 235, 0.6)',
          'rgba(255, 206, 86, 0.6)',
          'rgba(75, 192, 192, 0.6)',
          'rgba(153, 102, 255, 0.6)',
          'rgba(255, 159, 64, 0.6)',
        ],
      },
    ],
  };

  const topSubmittersData = {
    labels: topSubmitters.map((item: any) => item.submitted_by),
    datasets: [
      {
        label: 'Top NCP Submitters',
        data: topSubmitters.map((item: any) => item.count),
        backgroundColor: 'rgba(75, 192, 192, 0.6)',
      },
    ],
  };


  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Analytics Dashboard</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">NCPs by Month (Last 12 Months)</h2>
          <Bar data={ncpByMonthData} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h2 className="text-xl font-semibold mb-4">NCP Status Distribution</h2>
          <Pie data={statusDistributionData} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow col-span-1 md:col-span-2">
          <h2 className="text-xl font-semibold mb-4">Top 5 NCP Submitters</h2>
          <Bar data={topSubmittersData} />
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-2">Average Approval Time</h2>
            <p className="text-3xl font-bold">{analyticsData.avgApprovalTime.toFixed(2)} minutes</p>
        </div>
      </div>
    </div>
  )
}

export default AnalyticsPage
