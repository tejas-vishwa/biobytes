"use client"

import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Shield, Bell, Key, Database, Save } from "lucide-react"

export default function AdminSettingsPage() {
  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">System Settings</h1>
        <p className="text-slate-500 mt-1">Configure global application settings and security protocols.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Security Settings */}
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Shield className="h-5 w-5 text-indigo-600" />
              <CardTitle className="text-lg">Security Settings</CardTitle>
            </div>
            <CardDescription>Manage password policies and session timeouts.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Require 2FA for Admins</span>
              <div className="w-10 h-5 bg-indigo-600 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Session Timeout (Minutes)</span>
              <input type="number" defaultValue={30} className="w-16 h-8 border border-slate-200 rounded px-2 text-sm text-right focus:outline-none focus:ring-2 focus:ring-indigo-600" />
            </div>
          </CardContent>
        </Card>

        {/* API Configurations */}
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Key className="h-5 w-5 text-amber-600" />
              <CardTitle className="text-lg">API Integrations</CardTitle>
            </div>
            <CardDescription>Manage third-party API keys and limits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Medical Parsing Engine Key</label>
              <input type="password" value="************************" readOnly className="w-full h-9 border border-slate-200 rounded-lg px-3 text-sm bg-slate-50 text-slate-500" />
            </div>
            <div className="space-y-1.5">
              <label className="text-sm font-medium text-slate-700">Email Gateway Secret</label>
              <input type="password" value="****************" readOnly className="w-full h-9 border border-slate-200 rounded-lg px-3 text-sm bg-slate-50 text-slate-500" />
            </div>
          </CardContent>
        </Card>

        {/* Database Maintenance */}
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="h-5 w-5 text-emerald-600" />
              <CardTitle className="text-lg">Database Health</CardTitle>
            </div>
            <CardDescription>Monitor and trigger database maintenance.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Last Backup: <span className="font-medium text-slate-900">Today, 03:00 AM</span></span>
              <button className="px-3 py-1.5 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-md text-xs font-medium transition-colors">
                Trigger Backup
              </button>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Clear Old Logs (&gt; 30 days)</span>
              <button className="px-3 py-1.5 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-md text-xs font-medium transition-colors">
                Clear Logs
              </button>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card className="bg-white shadow-sm border-slate-200">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Bell className="h-5 w-5 text-sky-600" />
              <CardTitle className="text-lg">Notifications</CardTitle>
            </div>
            <CardDescription>Admin alert preferences.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Email on New Doctor Registration</span>
              <div className="w-10 h-5 bg-indigo-600 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium text-slate-700">Weekly System Report</span>
              <div className="w-10 h-5 bg-indigo-600 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-0.5 right-0.5 shadow-sm"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end pt-4">
        <button className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium shadow-sm transition-colors">
          <Save className="h-4 w-4" />
          Save Settings
        </button>
      </div>
    </div>
  )
}
