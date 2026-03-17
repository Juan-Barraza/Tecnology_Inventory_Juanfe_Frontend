export default function DashboardPage() {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white mb-2">Equipment Status</h2>
        <p className="text-slate-500 dark:text-slate-400">Monitor real-time equipment health and location.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Equipment', value: '1,248', change: '+ 12 added this week', icon: 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10' },
          { label: 'Active Equipment', value: '1,092', change: '87.5% uptime', icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z' },
          { label: 'Inactive Equipment', value: '94', change: '7.5% of total', icon: 'M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728A9 9 0 015.636 5.636m12.728 12.728L5.636 5.636' },
          { label: 'Maintenance Required', value: '62', change: '5 critical issues', icon: 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z' },
        ].map((card, i) => (
          <div key={i} className="card flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-slate-400 tracking-widest">{card.label}</span>
              <div className="w-10 h-10 rounded-xl bg-slate-50 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                   <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={card.icon} />
                </svg>
              </div>
            </div>
            <div>
              <div className="text-3xl font-extrabold text-slate-900 dark:text-white">{card.value}</div>
              <p className="text-xs font-bold text-accent mt-1">{card.change}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="card h-96 flex flex-col items-center justify-center text-slate-400 border-dashed border-2">
        <svg className="w-12 h-12 mb-4 opacity-20" fill="none" viewBox="0 0 24 24" stroke="currentColor">
           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
        </svg>
        <p className="font-bold uppercase tracking-widest text-xs">Gráficos de Monitoreo</p>
        <p className="text-sm mt-1">Próximamente: Visualización de datos en tiempo real</p>
      </div>
    </div>
  )
}
