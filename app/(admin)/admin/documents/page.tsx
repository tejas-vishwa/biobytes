"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Search, FileText, CheckCircle, Clock, AlertCircle } from "lucide-react"
import Link from "next/link"
import { DeleteReportButton } from "@/components/DeleteReportButton"

export const dynamic = "force-dynamic"

export default function AdminDocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  useEffect(() => {
    async function fetchDocs() {
      try {
        const res = await fetch("/api/admin/documents")
        if (res.ok) {
          setDocuments(await res.json())
        }
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    fetchDocs()
  }, [])

  const filteredDocs = documents.filter(doc => 
    doc.fileName.toLowerCase().includes(search.toLowerCase()) || 
    doc.patient?.name?.toLowerCase().includes(search.toLowerCase()) ||
    doc.patient?.email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900">Document Ledger</h1>
          <p className="text-slate-500 mt-1">Track and review all uploaded medical reports globally.</p>
        </div>
        <div className="relative w-full md:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input 
            type="text" 
            placeholder="Search files or users..." 
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
                  <th className="px-6 py-4 font-semibold">Document Info</th>
                  <th className="px-6 py-4 font-semibold">Uploaded By</th>
                  <th className="px-6 py-4 font-semibold">Timestamp</th>
                  <th className="px-6 py-4 font-semibold">Parser Status</th>
                  <th className="px-6 py-4 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      <div className="flex justify-center mb-2">
                        <div className="w-6 h-6 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin"></div>
                      </div>
                      Loading documents...
                    </td>
                  </tr>
                ) : filteredDocs.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-slate-500">
                      No documents found.
                    </td>
                  </tr>
                ) : (
                  filteredDocs.map((doc) => (
                    <tr key={doc.id} className="hover:bg-slate-50/50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded bg-indigo-50 flex items-center justify-center flex-shrink-0">
                            <FileText className="h-4 w-4 text-indigo-600" />
                          </div>
                          <div>
                            <div className="font-medium text-slate-900 max-w-[200px] truncate" title={doc.fileName}>
                              {doc.fileName}
                            </div>
                            <div className="text-[10px] text-slate-400 font-mono mt-0.5">ID: {doc.id.substring(0,8)}...</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-slate-700">{doc.patient?.name || 'Unknown User'}</div>
                        <div className="text-xs text-slate-500">{doc.patient?.email}</div>
                      </td>
                      <td className="px-6 py-4 text-slate-500">
                        {new Date(doc.createdAt).toLocaleString()}
                      </td>
                      <td className="px-6 py-4">
                        <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium w-fit ${
                          doc.status === 'PARSED' ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' :
                          doc.status === 'FAILED' ? 'bg-red-50 text-red-700 border border-red-200' :
                          'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {doc.status === 'PARSED' && <CheckCircle className="h-3 w-3" />}
                          {doc.status === 'FAILED' && <AlertCircle className="h-3 w-3" />}
                          {(doc.status === 'UPLOADED' || doc.status === 'PROCESSING') && <Clock className="h-3 w-3" />}
                          {doc.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link 
                            href={doc.fileUrl || "#"} 
                            target="_blank"
                            className="inline-flex items-center justify-center px-3 py-1.5 text-xs font-medium text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-md transition-colors"
                          >
                            View PDF
                          </Link>
                          <DeleteReportButton reportId={doc.id} onDeleted={() => setDocuments(docs => docs.filter(d => d.id !== doc.id))} />
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
