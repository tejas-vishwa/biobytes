"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Ban, CheckCircle, Mail, MoreHorizontal } from "lucide-react"

export const dynamic = "force-dynamic"

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")
  const [processingId, setProcessingId] = useState<string | null>(null)

  useEffect(() => {
    fetchUsers()
  }, [])

  async function fetchUsers() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/users")
      if (res.ok) {
        setUsers(await res.json())
      }
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleAction = async (userId: string, action: string) => {
    if (action === "SUSPEND" && !confirm("Are you sure you want to suspend this user?")) return
    if (action === "ACTIVATE" && !confirm("Reactivate this user?")) return
    if (action === "RESET_PASSWORD" && !confirm("Trigger a password reset email for this user?")) return

    setProcessingId(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action })
      })
      if (res.ok) {
        if (action !== "RESET_PASSWORD") {
          fetchUsers()
        } else {
          alert("Password reset email triggered successfully (simulated).")
        }
      } else {
        alert("Action failed.")
      }
    } catch (err) {
      console.error(err)
    } finally {
      setProcessingId(null)
    }
  }

  const filteredUsers = users.filter(u => 
    u.name?.toLowerCase().includes(search.toLowerCase()) || 
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.id.includes(search)
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">User Management</h1>
          <p className="text-slate-500 mt-1">View and manage all registered accounts securely.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search users..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-slate-200 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-600 transition-all text-sm shadow-sm"
          />
        </div>
      </div>

      <Card className="bg-white shadow-sm border-slate-200 overflow-hidden">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-4 font-semibold">User Details</th>
                  <th className="px-6 py-4 font-semibold">Role</th>
                  <th className="px-6 py-4 font-semibold">Registered On</th>
                  <th className="px-6 py-4 font-semibold text-center">Total Uploads</th>
                  <th className="px-6 py-4 font-semibold">Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex justify-center mb-2">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      Loading users...
                    </td>
                  </tr>
                ) : filteredUsers.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                      No users found.
                    </td>
                  </tr>
                ) : (
                  filteredUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-slate-900">{user.name || 'Unnamed User'}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{user.email}</div>
                        <div className="text-[10px] text-slate-400 mt-0.5 font-mono">ID: {user.id.substring(0,8)}...</div>
                      </td>
                      <td className="px-6 py-4">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                          user.role === 'DOCTOR' ? 'bg-sky-100 text-sky-700' :
                          user.role === 'ADMIN' ? 'bg-purple-100 text-purple-700' :
                          'bg-slate-100 text-slate-700'
                        }`}>
                          {user.role}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-center font-medium text-slate-700">
                        {user._count?.reports || 0}
                      </td>
                      <td className="px-6 py-4">
                        {user.accountStatus === 'ACTIVE' ? (
                          <span className="flex items-center text-emerald-600 text-xs font-medium">
                            <CheckCircle className="h-3.5 w-3.5 mr-1" /> Active
                          </span>
                        ) : (
                          <span className="flex items-center text-red-600 text-xs font-medium">
                            <Ban className="h-3.5 w-3.5 mr-1" /> Suspended
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button 
                            onClick={() => handleAction(user.id, "RESET_PASSWORD")}
                            disabled={processingId === user.id}
                            className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-md transition-colors"
                            title="Trigger Password Reset Email"
                          >
                            <Mail className="h-4 w-4" />
                          </button>
                          
                          {user.accountStatus === 'ACTIVE' ? (
                            <button 
                              onClick={() => handleAction(user.id, "SUSPEND")}
                              disabled={processingId === user.id}
                              className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-md transition-colors"
                              title="Suspend Account"
                            >
                              <Ban className="h-4 w-4" />
                            </button>
                          ) : (
                            <button 
                              onClick={() => handleAction(user.id, "ACTIVATE")}
                              disabled={processingId === user.id}
                              className="p-1.5 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-md transition-colors"
                              title="Reactivate Account"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
