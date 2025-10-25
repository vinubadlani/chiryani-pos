import { LayoutGrid, Info, BarChart3, History } from "lucide-react"

interface SidebarProps {
  activeView?: 'pos' | 'dashboard' | 'history'
  onViewChange?: (view: 'pos' | 'dashboard' | 'history') => void
}

export function Sidebar({ activeView = 'pos', onViewChange }: SidebarProps) {
  return (
    <div className="w-full md:w-24 bg-linear-to-r md:bg-linear-to-b from-emerald-500 via-teal-600 to-cyan-600 flex md:flex-col items-center justify-between md:justify-start py-3 md:py-8 px-4 md:px-0 gap-4 md:gap-8 border-b md:border-b-0 md:border-r border-teal-700/30 shadow-lg">
      <div className="w-12 h-12 md:w-14 md:h-14 bg-white rounded-xl flex items-center justify-center shrink-0 shadow-lg font-bold text-lg md:text-2xl bg-linear-to-br from-emerald-500 to-teal-600 text-white">
        C
      </div>

      <nav className="flex md:flex-col gap-2 md:gap-6">
        <button 
          onClick={() => onViewChange?.('pos')}
          className={`p-2.5 md:p-3 rounded-lg transition-all duration-200 transform hover:scale-110 backdrop-blur-sm ${
            activeView === 'pos' ? 'bg-white/40' : 'bg-white/25 hover:bg-white/35'
          }`}
        >
          <LayoutGrid className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </button>
        
        <button 
          onClick={() => onViewChange?.('dashboard')}
          className={`p-2.5 md:p-3 rounded-lg transition-all duration-200 transform hover:scale-110 backdrop-blur-sm ${
            activeView === 'dashboard' ? 'bg-white/40' : 'bg-white/25 hover:bg-white/35'
          }`}
        >
          <BarChart3 className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </button>
        
        <button 
          onClick={() => onViewChange?.('history')}
          className={`p-2.5 md:p-3 rounded-lg transition-all duration-200 transform hover:scale-110 backdrop-blur-sm ${
            activeView === 'history' ? 'bg-white/40' : 'bg-white/25 hover:bg-white/35'
          }`}
        >
          <History className="w-5 h-5 md:w-6 md:h-6 text-white" />
        </button>
      </nav>

      <div className="hidden md:block mt-auto">
        <button className="p-3 hover:bg-white/25 rounded-lg transition-all duration-200 transform hover:scale-110 backdrop-blur-sm">
          <Info className="w-6 h-6 text-white" />
        </button>
      </div>
    </div>
  )
}
