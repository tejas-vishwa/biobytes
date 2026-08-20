"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, FileText, Database, Activity, Calendar } from "lucide-react"

export const dynamic = "force-dynamic"

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [pendingLabs, setPendingLabs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [approvingLab, setApprovingLab] = useState<string | null>(null)

  useEffect(() => {
    async function fetchData() {
      try {
        const [statsRes, actRes, labsRes] = await Promise.all([
          fetch("/api/admin/stats"),
          fetch("/api/admin/activity"),
          fetch("/api/admin/labs")
        ])
        
        if (statsRes.ok) setStats(await statsRes.json())
        if (actRes.ok) setActivities(await actRes.json())
        if (labsRes.ok) {
          const labsData = await labsRes.json()
          setPendingLabs(labsData.pendingLabs || [])
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  const handleApproveLab = async (labId: string) => {
    setApprovingLab(labId)
    try {
      const res = await fetch(`/api/admin/labs/${labId}/approve`, { method: "PUT" })
      if (res.ok) {
        setPendingLabs(prev => prev.filter(lab => lab.id !== labId))
        // Optionally show a toast here
      } else {
        console.error("Failed to approve lab")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setApprovingLab(null)
    }
  }

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-500 mt-1">High-level analytics and real-time system activity.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Users</CardTitle>
            <Users className="h-4 w-4 text-indigo-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats?.totalUsers || 0}</div>
            <p className="text-xs text-slate-500 mt-1">
              {stats?.totalPatients || 0} Patients, {stats?.totalDoctors || 0} Doctors
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Total Documents</CardTitle>
            <FileText className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats?.totalDocs || 0}</div>
            <p className="text-xs text-slate-500 mt-1">
              Across all users
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Recent Uploads</CardTitle>
            <Calendar className="h-4 w-4 text-sky-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{stats?.docsThisWeek || 0}</div>
            <p className="text-xs text-slate-500 mt-1">
              {stats?.docsToday || 0} today
            </p>
          </CardContent>
        </Card>

        <Card className="bg-white/60 backdrop-blur-xl border-white/40 shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-slate-500">Storage Used</CardTitle>
            <Database className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{((stats?.totalDocs || 0) * 1.2).toFixed(1)} MB</div>
            <p className="text-xs text-slate-500 mt-1">
              Estimated 1.2MB per file
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <Card className="bg-white shadow-sm border-slate-200 col-span-1 lg:col-span-2">
          <CardHeader className="border-b border-slate-100 pb-4">
            <div className="flex items-center gap-2">
              <Activity className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-lg">System Activity Log</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {activities.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No recent activity.</div>
            ) : (
              <div className="max-h-[400px] overflow-y-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 bg-slate-50 sticky top-0">
                    <tr>
                      <th className="px-6 py-3 font-medium">Timestamp</th>
                      <th className="px-6 py-3 font-medium">Action</th>
                      <th className="px-6 py-3 font-medium">Details</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {activities.map((act) => (
                      <tr key={act.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4 whitespace-nowrap text-slate-500">
                          {new Date(act.createdAt).toLocaleString()}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                            act.action.includes('FAILED') || act.action.includes('SUSPEND') 
                              ? 'bg-red-100 text-red-700' 
                              : act.action.includes('SUCCESS') 
                                ? 'bg-emerald-100 text-emerald-700' 
                                : 'bg-indigo-100 text-indigo-700'
                          }`}>
                            {act.action}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-slate-700">
                          {act.details}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Pending Lab Approvals Section */}
        <Card className="bg-white shadow-sm border-slate-200 col-span-1 lg:col-span-2 mt-8">
          <CardHeader className="border-b border-slate-100 pb-4 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-lg">Pending Lab Approvals</CardTitle>
            </div>
            <div className="bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">
              {pendingLabs.length} Pending
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {pendingLabs.length === 0 ? (
              <div className="p-8 text-center text-slate-500">No pending lab applications.</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm text-left">
                  <thead className="text-xs text-slate-500 bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 font-medium">Lab Details</th>
                      <th className="px-6 py-3 font-medium">Contact</th>
                      <th className="px-6 py-3 font-medium">Scope & Reg No</th>
                      <th className="px-6 py-3 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {pendingLabs.map((lab) => (
                      <tr key={lab.id} className="hover:bg-slate-50/50 transition-colors">
                        <td className="px-6 py-4">
                          <p className="font-semibold text-slate-900">{lab.name}</p>
                          <p className="text-xs text-slate-500">Est. {lab.yearEstablished}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-slate-700">{lab.contactPerson}</p>
                          <p className="text-xs text-slate-500">{lab.email}</p>
                        </td>
                        <td className="px-6 py-4">
                          <p className="text-xs text-slate-600 capitalize truncate max-w-[200px]" title={lab.operationalScope}>
                            {lab.operationalScope}
                          </p>
                          <p className="text-xs font-mono text-slate-400 mt-1">{lab.registrationNo}</p>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <button
                            onClick={() => handleApproveLab(lab.id)}
                            disabled={approvingLab === lab.id}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md text-xs font-medium disabled:opacity-50 transition-colors"
                          >
                            {approvingLab === lab.id ? "Approving..." : "Approve"}
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
