import React, { useState } from 'react';
import { CARC_DICTIONARY, RARC_DICTIONARY } from '../data/mockData';
import { Search, BookOpen, ShieldCheck, ArrowRight, Building2 } from 'lucide-react';

export const CarcMatrixView: React.FC = () => {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');

  const filteredCarc = CARC_DICTIONARY.filter((c) => {
    if (categoryFilter !== 'ALL' && c.category !== categoryFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.code.toLowerCase().includes(q) ||
        c.name.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
        <div className="flex items-center gap-2 mb-1">
          <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
            ASC X12 & CMS Compliance Reference
          </span>
          <span className="text-xs text-slate-500 font-mono">ANSI 835 Standard</span>
        </div>
        <h2 className="text-xl font-bold text-slate-900 tracking-tight">
          Healthcare Domain Intelligence: CARC & RARC Code Matrix
        </h2>
        <p className="text-xs text-slate-600 mt-1 max-w-3xl">
          Claim Adjustment Reason Codes (CARC) and Remittance Advice Remark Codes (RARC) drive the automated intake routing engine in HUB Operations, dispatching denied line items directly to the specialized hospital workspace.
        </p>
      </div>

      {/* Search and Filters */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative flex-1 w-full">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search CARC code, category, or clinical justification..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:bg-white"
          />
        </div>

        <select
          value={categoryFilter}
          onChange={(e) => setCategoryFilter(e.target.value)}
          className="bg-slate-50 border border-slate-200 text-slate-700 text-xs rounded-lg px-3 py-2 font-medium focus:outline-hidden"
        >
          <option value="ALL">All Categories</option>
          <option value="Medical Necessity">Medical Necessity</option>
          <option value="Coding/Billing">Coding/Billing</option>
          <option value="Contractual">Contractual</option>
          <option value="Patient Demographics">Patient Demographics</option>
          <option value="Timely Filing">Timely Filing</option>
        </select>
      </div>

      {/* CARC Table */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 text-xs font-semibold text-slate-600 uppercase">
          CARC Code Automatic Routing Rules ({filteredCarc.length} rules)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-semibold">
              <tr>
                <th className="py-3 px-4">CARC Code</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Standard Description</th>
                <th className="py-3 px-4">Target Workspace Node</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {filteredCarc.map((carc) => (
                <tr key={carc.code} className="hover:bg-slate-50">
                  <td className="py-3.5 px-4">
                    <span className="px-2.5 py-1 rounded font-mono font-bold text-xs bg-blue-100 text-blue-900">
                      CARC {carc.code}
                    </span>
                    <div className="font-semibold text-slate-900 mt-1">
                      {carc.name}
                    </div>
                  </td>

                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-100 text-slate-700">
                      {carc.category}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 max-w-md text-slate-600 leading-relaxed">
                    {carc.description}
                  </td>

                  <td className="py-3.5 px-4">
                    <div className="flex items-center gap-1.5 font-semibold text-slate-800">
                      <ArrowRight className="w-3.5 h-3.5 text-blue-600" />
                      <span>{carc.recommendedWorkspace.replace(/_/g, ' ')}</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* RARC Reference */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs">
        <h3 className="text-sm font-bold text-slate-900 mb-3 flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-indigo-600" />
          Common Remittance Advice Remark Codes (RARC)
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
          {RARC_DICTIONARY.map((rarc) => (
            <div key={rarc.code} className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="font-mono font-bold text-indigo-700">{rarc.code}</div>
              <div className="text-slate-600 mt-1">{rarc.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
