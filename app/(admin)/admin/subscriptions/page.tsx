"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, Search, ShieldCheck } from "lucide-react"

export default function AdminSubscriptionsPage() {
  const [pendingUsers, setPendingUsers] = useState<any[]>([])
  const [activeUsers, setActiveUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const fetchPending = async () => {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/subscriptions")
      if (res.ok) {
        const data = await res.json()
        setPendingUsers(data.users || [])
        setActiveUsers(data.activeUsers || [])
      }
    } catch (err) {
      console.error(err)
    }
    setLoading(false)
  }

  useEffect(() => {
    fetchPending()
  }, [])

  const handleApprove = async (userId: string) => {
    try {
      const res = await fetch("/api/admin/subscriptions/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId })
      })
      if (res.ok) {
        setPendingUsers(prev => prev.filter(u => u.id !== userId))
      }
    } catch (err) {
      console.error(err)
    }
  }

  const filteredPendingUsers = pendingUsers.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.name?.toLowerCase().includes(search.toLowerCase())
  )

  const filteredActiveUsers = activeUsers.filter(u => 
    u.email?.toLowerCase().includes(search.toLowerCase()) || 
    u.name?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight">Subscription Approvals</h1>
        <p className="text-muted-foreground mt-1">Manage QURIX Plus manual payment verifications.</p>
      </div>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="relative w-full md:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <input 
            type="text" 
            placeholder="Search by name or email..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full h-10 pl-9 pr-4 rounded-lg border border-input bg-background focus:outline-none focus:ring-2 focus:ring-primary shadow-sm"
          />
        </div>
        <Button onClick={fetchPending} variant="outline" size="sm" className="shadow-sm">
          Refresh List
        </Button>
      </div>

      <Card className="shadow-sm border-border/80">
        <CardHeader className="bg-muted/30 pb-4">
          <CardTitle className="text-lg flex items-center gap-2">
            <Clock className="h-5 w-5 text-amber-500" /> Pending Approvals
          </CardTitle>
          <CardDescription>
            Users who clicked "I have paid Rs 29". Verify their UPI payment before approving.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center p-12 text-muted-foreground">Loading pending requests...</div>
          ) : filteredPendingUsers.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground border-t bg-muted/10">
              <ShieldCheck className="h-10 w-10 text-emerald-500/50 mx-auto mb-3" />
              <p>All caught up! No pending subscription requests.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Requested At</th>
                    <th className="px-6 py-4 font-semibold text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredPendingUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {user.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-right space-x-2">
                        <Button 
                          onClick={() => handleApprove(user.id)}
                          size="sm" 
                          className="bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm h-8"
                        >
                          <CheckCircle2 className="h-4 w-4 mr-1.5" /> Approve Upgrade
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

      <Card className="shadow-sm border-indigo-500/30 mt-8">
        <CardHeader className="bg-indigo-500/5 pb-4">
          <CardTitle className="text-lg flex items-center gap-2 text-indigo-500">
            <CheckCircle2 className="h-5 w-5" /> Active QURIX Plus Members
          </CardTitle>
          <CardDescription>
            List of all users with an active premium subscription and their validity.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-0">
          {loading ? (
            <div className="text-center p-12 text-muted-foreground">Loading active subscribers...</div>
          ) : filteredActiveUsers.length === 0 ? (
            <div className="text-center p-12 text-muted-foreground border-t bg-muted/10">
              <p>No active subscribers found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted/50 text-muted-foreground text-xs uppercase">
                  <tr>
                    <th className="px-6 py-4 font-semibold">User</th>
                    <th className="px-6 py-4 font-semibold">Email</th>
                    <th className="px-6 py-4 font-semibold">Subscribed Date</th>
                    <th className="px-6 py-4 font-semibold">Validity</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filteredActiveUsers.map((user) => (
                    <tr key={user.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-6 py-4 font-medium text-foreground">
                        {user.name || "Unknown"}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {user.email}
                      </td>
                      <td className="px-6 py-4 text-muted-foreground">
                        {new Date(user.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center gap-1 text-[10px] font-extrabold uppercase bg-emerald-500/10 text-emerald-600 px-2 py-1 rounded-full">
                          Lifetime Demo
                        </span>
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
  )
}
