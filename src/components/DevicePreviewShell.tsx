import { useState, useEffect, useRef, type ReactNode } from 'react'
import {
  Smartphone,
  Laptop,
  Maximize2,
  RotateCw,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Wifi,
  BatteryCharging,
} from 'lucide-react'

export type PreviewMode = 'responsive' | 'phone' | 'laptop'
export type Orientation = 'portrait' | 'landscape'

interface DevicePreviewShellProps {
  children: ReactNode
}

const PHONE_PORTRAIT = { width: 390, height: 844 }
const PHONE_LANDSCAPE = { width: 844, height: 390 }
const LAPTOP_DIMS = { width: 1280, height: 800 }

export function DevicePreviewShell({ children }: DevicePreviewShellProps) {
  // Check if we are inside an iframe embed or preview query param
  const isEmbed = typeof window !== 'undefined' && (
    window.self !== window.top ||
    new URLSearchParams(window.location.search).get('embed') === '1'
  )

  // If inside embed iframe, simply render the application directly
  if (isEmbed) {
    return <>{children}</>
  }

  return <DevicePreviewManager>{children}</DevicePreviewManager>
}

function DevicePreviewManager({ children }: { children: ReactNode }) {
  const [mode, setMode] = useState<PreviewMode>(() => {
    if (typeof window !== 'undefined') {
      const saved = window.sessionStorage.getItem('satquery.preview_mode')
      if (saved === 'phone' || saved === 'laptop' || saved === 'responsive') {
        return saved as PreviewMode
      }
      // On real mobile screens, default to responsive (native)
      if (window.innerWidth < 768) return 'responsive'
    }
    return 'responsive'
  })

  const [orientation, setOrientation] = useState<Orientation>('portrait')
  const [fitToScreen, setFitToScreen] = useState(true)
  const [isCollapsed, setIsCollapsed] = useState(false)
  const [currentHash, setCurrentHash] = useState(() => (typeof window !== 'undefined' ? window.location.hash : ''))
  const [refreshKey, setRefreshKey] = useState(0)
  const [currentTime, setCurrentTime] = useState('9:41')
  const [calculatedScale, setCalculatedScale] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)
  const iframeRef = useRef<HTMLIFrameElement>(null)

  // Keep live time in status bar
  useEffect(() => {
    const updateTime = () => {
      const now = new Date()
      const hours = now.getHours()
      const minutes = now.getMinutes()
      const formatted = `${hours % 12 || 12}:${minutes.toString().padStart(2, '0')}`
      setCurrentTime(formatted)
    }
    updateTime()
    const timer = setInterval(updateTime, 30000)
    return () => clearInterval(timer)
  }, [])

  // Save mode preference
  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.sessionStorage.setItem('satquery.preview_mode', mode)
    }
  }, [mode])

  // Listen for parent hash changes and sync to iframe
  useEffect(() => {
    const handleHash = () => {
      const nextHash = window.location.hash
      setCurrentHash(nextHash)
      if (iframeRef.current?.contentWindow) {
        try {
          if (iframeRef.current.contentWindow.location.hash !== nextHash) {
            iframeRef.current.contentWindow.location.hash = nextHash
          }
        } catch {
          // Cross-origin fallback (not expected since same origin)
        }
      }
    }
    window.addEventListener('hashchange', handleHash)
    return () => window.removeEventListener('hashchange', handleHash)
  }, [])

  // Listen for messages from iframe (e.g. hash changes from inside preview)
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SATQUERY_HASH_CHANGE' && typeof event.data.hash === 'string') {
        setCurrentHash(event.data.hash)
        if (window.location.hash !== event.data.hash) {
          window.location.hash = event.data.hash
        }
      }
    }
    window.addEventListener('message', handleMessage)
    return () => window.removeEventListener('message', handleMessage)
  }, [])

  // Calculate auto-fit scale
  useEffect(() => {
    const updateScale = () => {
      if (!fitToScreen || mode === 'responsive') {
        setCalculatedScale(1)
        return
      }

      const availableHeight = window.innerHeight - (isCollapsed ? 80 : 130)
      const availableWidth = window.innerWidth - 48

      let targetWidth = 390
      let targetHeight = 844

      if (mode === 'phone') {
        if (orientation === 'landscape') {
          targetWidth = PHONE_LANDSCAPE.width + 36
          targetHeight = PHONE_LANDSCAPE.height + 36
        } else {
          targetWidth = PHONE_PORTRAIT.width + 28
          targetHeight = PHONE_PORTRAIT.height + 28
        }
      } else if (mode === 'laptop') {
        targetWidth = LAPTOP_DIMS.width + 36
        targetHeight = LAPTOP_DIMS.height + 60
      }

      const scaleH = availableHeight / targetHeight
      const scaleW = availableWidth / targetWidth
      const optimalScale = Math.min(1, Math.min(scaleH, scaleW))
      setCalculatedScale(Math.max(0.4, Number(optimalScale.toFixed(2))))
    }

    updateScale()
    window.addEventListener('resize', updateScale)
    return () => window.removeEventListener('resize', updateScale)
  }, [mode, orientation, fitToScreen, isCollapsed])

  const iframeSrc = typeof window !== 'undefined'
    ? `${window.location.pathname}?embed=1${currentHash}`
    : ''

  const reloadIframe = () => {
    setRefreshKey((prev) => prev + 1)
  }

  const openInNewTab = () => {
    if (typeof window !== 'undefined') {
      window.open(window.location.href, '_blank')
    }
  }

  // Active target dimensions
  const activeDims = mode === 'phone'
    ? (orientation === 'portrait' ? PHONE_PORTRAIT : PHONE_LANDSCAPE)
    : (mode === 'laptop' ? LAPTOP_DIMS : null)

  return (
    <div className="relative min-h-screen">
      {/* Floating Device Preview Control Bar */}
      <div className="fixed top-3 left-1/2 -translate-x-1/2 z-[9999] transition-all duration-300">
        {isCollapsed ? (
          <button
            type="button"
            onClick={() => setIsCollapsed(false)}
            className="flex items-center gap-2.5 rounded-full border border-amber-400/40 bg-slate-900/95 px-4 py-2 text-xs font-semibold text-amber-300 shadow-[0_12px_32px_rgba(0,0,0,0.5)] backdrop-blur-xl transition hover:border-amber-400 hover:bg-slate-900"
            title="Expand Device Preview Controls"
          >
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            {mode === 'phone' ? (
              <span className="flex items-center gap-1.5"><Smartphone size={14} className="text-amber-400" /> Phone Preview</span>
            ) : mode === 'laptop' ? (
              <span className="flex items-center gap-1.5"><Laptop size={14} className="text-amber-400" /> Laptop Preview</span>
            ) : (
              <span className="flex items-center gap-1.5"><Maximize2 size={14} className="text-amber-400" /> Responsive Mode</span>
            )}
            <ChevronDown size={14} className="text-slate-400" />
          </button>
        ) : (
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2 rounded-2xl border border-amber-300/30 bg-slate-900/95 p-1.5 sm:p-2 text-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.55),0_0_0_1px_rgba(212,175,55,0.15)] backdrop-blur-xl">
            {/* Mode Switcher Group */}
            <div className="flex items-center rounded-xl bg-slate-950/80 p-1 border border-slate-800">
              <button
                type="button"
                onClick={() => setMode('phone')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-medium transition ${
                  mode === 'phone'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-semibold shadow-md shadow-amber-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
                title="Preview as Mobile Phone"
              >
                <Smartphone size={14} />
                <span>Phone</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('laptop')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-medium transition ${
                  mode === 'laptop'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-semibold shadow-md shadow-amber-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
                title="Preview as Laptop"
              >
                <Laptop size={14} />
                <span>Laptop</span>
              </button>

              <button
                type="button"
                onClick={() => setMode('responsive')}
                className={`flex items-center gap-1.5 rounded-lg px-2.5 sm:px-3 py-1.5 text-xs font-medium transition ${
                  mode === 'responsive'
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-white font-semibold shadow-md shadow-amber-500/30'
                    : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                }`}
                title="Full Responsive View"
              >
                <Maximize2 size={14} />
                <span className="hidden sm:inline">Responsive</span>
              </button>
            </div>

            {/* Phone Specific Controls */}
            {mode === 'phone' && (
              <div className="flex items-center gap-1 border-l border-slate-800 pl-1.5">
                <button
                  type="button"
                  onClick={() => setOrientation((current) => (current === 'portrait' ? 'landscape' : 'portrait'))}
                  className="flex items-center gap-1 rounded-lg border border-slate-700/80 bg-slate-800/80 px-2 sm:px-2.5 py-1.5 text-xs text-slate-200 transition hover:border-amber-400 hover:text-amber-300"
                  title={`Rotate to ${orientation === 'portrait' ? 'Landscape' : 'Portrait'}`}
                >
                  <RotateCw size={13} className={orientation === 'landscape' ? 'text-amber-400' : ''} />
                  <span className="hidden md:inline">{orientation === 'portrait' ? 'Portrait' : 'Landscape'}</span>
                </button>
              </div>
            )}

            {/* Scale & Dimensions Controls */}
            {mode !== 'responsive' && (
              <div className="hidden sm:flex items-center gap-1.5 border-l border-slate-800 pl-1.5">
                <button
                  type="button"
                  onClick={() => setFitToScreen((prev) => !prev)}
                  className={`rounded-lg border px-2 py-1.5 text-[11px] font-medium transition ${
                    fitToScreen
                      ? 'border-teal-500/40 bg-teal-500/10 text-teal-300'
                      : 'border-slate-700 bg-slate-800 text-slate-300 hover:text-white'
                  }`}
                  title={fitToScreen ? 'Scale: Fit to Screen' : 'Scale: 100%'}
                >
                  {fitToScreen ? `Fit (${Math.round(calculatedScale * 100)}%)` : '100%'}
                </button>

                <div className="rounded-lg bg-slate-950 px-2 py-1 text-[11px] font-mono text-slate-400 border border-slate-800">
                  {activeDims?.width} × {activeDims?.height}
                </div>
              </div>
            )}

            {/* Action Tools */}
            <div className="flex items-center gap-1 border-l border-slate-800 pl-1.5">
              {mode !== 'responsive' && (
                <button
                  type="button"
                  onClick={reloadIframe}
                  className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 transition hover:border-amber-400 hover:text-amber-300"
                  title="Reload Preview"
                >
                  <RefreshCw size={13} />
                </button>
              )}

              <button
                type="button"
                onClick={openInNewTab}
                className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-300 transition hover:border-amber-400 hover:text-amber-300"
                title="Open in New Tab"
              >
                <ExternalLink size={13} />
              </button>

              <button
                type="button"
                onClick={() => setIsCollapsed(true)}
                className="rounded-lg border border-slate-700 bg-slate-800 p-1.5 text-slate-400 transition hover:text-slate-200"
                title="Minimize Preview Toolbar"
              >
                <ChevronUp size={14} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* RENDER VIEWPORT */}
      {mode === 'responsive' ? (
        // Native full-screen responsive mode: direct render without iframe
        <div className="w-full min-h-screen pt-12 sm:pt-0">
          {children}
        </div>
      ) : (
        // Simulated Device Studio Canvas (Phone or Laptop frame)
        <div
          ref={containerRef}
          className="relative flex min-h-screen w-full items-center justify-center overflow-x-hidden overflow-y-auto bg-slate-950 pt-20 pb-12 px-4"
          style={{
            backgroundImage: `radial-gradient(circle at 50% 20%, rgba(212, 175, 55, 0.08), transparent 45%), radial-gradient(circle at 80% 80%, rgba(56, 189, 248, 0.05), transparent 40%)`,
          }}
        >
          {/* Subtle Grid Ambient Pattern */}
          <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(to_right,#1e293b0f_1px,transparent_1px),linear-gradient(to_bottom,#1e293b0f_1px,transparent_1px)] bg-[size:32px_32px]" />

          {/* Device Container with Scale Transformation */}
          <div
            className="relative transition-transform duration-300 origin-center"
            style={{
              transform: `scale(${calculatedScale})`,
            }}
          >
            {mode === 'phone' ? (
              /* REALISTIC SMARTPHONE FRAME (iPhone style) */
              <div
                className="relative select-none rounded-[50px] bg-slate-900 p-3 shadow-[0_30px_90px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.12),inset_0_0_0_2px_#334155]"
                style={{
                  width: activeDims ? activeDims.width + 24 : 414,
                  height: activeDims ? activeDims.height + 24 : 868,
                }}
              >
                {/* Volume Rocker & Power Button hints on frame edge */}
                <div className="absolute -left-[5px] top-28 h-10 w-[4px] rounded-l bg-slate-700" />
                <div className="absolute -left-[5px] top-42 h-10 w-[4px] rounded-l bg-slate-700" />
                <div className="absolute -right-[5px] top-32 h-14 w-[4px] rounded-r bg-slate-700" />

                {/* Inner Screen Display */}
                <div className="relative h-full w-full overflow-hidden rounded-[38px] bg-black">
                  {/* Top Status Bar (Portrait Only) */}
                  {orientation === 'portrait' && (
                    <div className="absolute top-0 left-0 right-0 z-30 flex h-11 items-center justify-between px-7 text-white pointer-events-none">
                      <span className="text-xs font-semibold tracking-tight">{currentTime}</span>

                      {/* Dynamic Island Cutout */}
                      <div className="flex items-center justify-center gap-2 rounded-full bg-black px-3 py-1 shadow-[0_2px_8px_rgba(0,0,0,0.8)] border border-slate-800">
                        <div className="h-2.5 w-2.5 rounded-full bg-slate-900 border border-slate-700" />
                        <div className="h-2 w-2 rounded-full bg-teal-950 border border-teal-500/60" />
                      </div>

                      <div className="flex items-center gap-1.5 text-xs">
                        <span className="text-[10px] font-bold">5G</span>
                        <Wifi size={12} />
                        <div className="flex items-center gap-0.5">
                          <BatteryCharging size={13} className="text-emerald-400" />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Active Live Web App Viewport inside Iframe */}
                  <iframe
                    key={`phone-preview-${refreshKey}`}
                    ref={iframeRef}
                    src={iframeSrc}
                    title="SatQuery Mobile Preview"
                    className="h-full w-full border-0 bg-[#f8f5ef]"
                    style={{
                      paddingTop: orientation === 'portrait' ? '44px' : '0px',
                      paddingBottom: orientation === 'portrait' ? '20px' : '0px',
                    }}
                  />

                  {/* Bottom Home Swipe Bar Indicator */}
                  {orientation === 'portrait' && (
                    <div className="pointer-events-none absolute bottom-1.5 left-1/2 -translate-x-1/2 z-30">
                      <div className="h-1 w-32 rounded-full bg-slate-400/60" />
                    </div>
                  )}
                </div>
              </div>
            ) : (
              /* REALISTIC LAPTOP FRAME (MacBook style) */
              <div
                className="relative select-none"
                style={{
                  width: LAPTOP_DIMS.width + 24,
                }}
              >
                {/* Laptop Display Lid */}
                <div
                  className="relative rounded-2xl bg-slate-900 p-3 shadow-[0_35px_100px_rgba(0,0,0,0.85),0_0_0_1px_rgba(255,255,255,0.12),inset_0_0_0_1px_#334155]"
                  style={{
                    height: LAPTOP_DIMS.height + 24,
                  }}
                >
                  {/* Top Display Bezel with FaceTime Camera & LED */}
                  <div className="absolute top-1 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2">
                    <div className="h-2 w-2 rounded-full bg-black border border-slate-700 flex items-center justify-center">
                      <div className="h-0.5 w-0.5 rounded-full bg-emerald-500 animate-pulse" />
                    </div>
                  </div>

                  {/* Laptop Screen Content */}
                  <div className="relative h-full w-full overflow-hidden rounded-lg bg-black">
                    <iframe
                      key={`laptop-preview-${refreshKey}`}
                      ref={iframeRef}
                      src={iframeSrc}
                      title="SatQuery Laptop Preview"
                      className="h-full w-full border-0 bg-[#f8f5ef]"
                    />
                  </div>
                </div>

                {/* Laptop Keyboard Deck Hinge */}
                <div className="relative mx-auto -mt-1 h-3.5 w-[96%] rounded-b-xl bg-gradient-to-b from-slate-700 via-slate-800 to-slate-900 shadow-[0_12px_24px_rgba(0,0,0,0.6)]">
                  {/* Centered Notch for opening lid */}
                  <div className="absolute left-1/2 top-0 h-1.5 w-16 -translate-x-1/2 rounded-b-md bg-slate-950/70" />
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
