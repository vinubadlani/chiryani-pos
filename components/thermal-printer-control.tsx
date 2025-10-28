"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bluetooth, Usb, Wifi, Printer, TestTube, Zap, CheckCircle, XCircle, Loader2, ChevronDown } from "lucide-react"
import { thermalPrinter, type PrintData, type BrowserCapabilities } from "@/lib/thermal-printer"
import { toast } from "sonner"

interface ThermalPrinterControlProps {
  className?: string
  isMinimized?: boolean
  onToggleMinimize?: () => void
}

export function ThermalPrinterControl({ className, isMinimized = false, onToggleMinimize }: ThermalPrinterControlProps) {
  const [isConnected, setIsConnected] = useState(false)
  const [isConnecting, setIsConnecting] = useState(false)
  const [connectionType, setConnectionType] = useState<'bluetooth' | 'usb' | 'serial' | null>(null)
  const [showDialog, setShowDialog] = useState(false)
  const [isTesting, setIsTesting] = useState(false)
  const [capabilities, setCapabilities] = useState<BrowserCapabilities>({
    bluetooth: false,
    usb: false,
    serial: false,
    secure: false
  })

  useEffect(() => {
    // Check connection status and browser capabilities on mount
    setIsConnected(thermalPrinter.isDeviceConnected())
    setConnectionType(thermalPrinter.getConnectionType() as any)
    setCapabilities(thermalPrinter.getBrowserCapabilities())
  }, [])

  const handleConnect = async (type: 'bluetooth' | 'usb' | 'serial') => {
    setIsConnecting(true)
    try {
      let success = false

      switch (type) {
        case 'bluetooth':
          success = await thermalPrinter.connectBluetooth()
          break
        case 'usb':
          success = await thermalPrinter.connectUSB()
          break
        case 'serial':
          success = await thermalPrinter.connectSerial()
          break
      }

      if (success) {
        setIsConnected(true)
        setConnectionType(type)
        setShowDialog(false)
        toast.success(`Thermal printer connected via ${type.toUpperCase()}`)
      } else {
        toast.error(`Failed to connect via ${type.toUpperCase()}`)
      }
    } catch (error) {
      console.error('Connection error:', error)
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      
      // Provide helpful error messages
      if (errorMessage.includes('HTTPS')) {
        toast.error('HTTPS Required', {
          description: 'Please access this site via HTTPS or localhost to use printer features.'
        })
      } else if (errorMessage.includes('not supported')) {
        toast.error('Browser Not Supported', {
          description: 'Please use Chrome or Edge browser for thermal printer support.'
        })
      } else {
        toast.error(`Connection failed: ${errorMessage}`)
      }
    } finally {
      setIsConnecting(false)
    }
  }

  const handleDisconnect = async () => {
    try {
      await thermalPrinter.disconnect()
      setIsConnected(false)
      setConnectionType(null)
      toast.success('Printer disconnected')
    } catch (error) {
      console.error('Disconnect error:', error)
      toast.error('Failed to disconnect printer')
    }
  }

  const handleTestPrint = async () => {
    if (!isConnected) {
      toast.error('Please connect a printer first')
      return
    }

    setIsTesting(true)
    try {
      await thermalPrinter.testPrint()
      toast.success('Test print sent successfully!')
    } catch (error) {
      console.error('Test print error:', error)
      toast.error(`Test print failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
    } finally {
      setIsTesting(false)
    }
  }

  const handleOpenDrawer = async () => {
    if (!isConnected) {
      toast.error('Please connect a printer first')
      return
    }

    try {
      await thermalPrinter.openCashDrawer()
      toast.success('Cash drawer opened')
    } catch (error) {
      console.error('Cash drawer error:', error)
      toast.error(`Failed to open cash drawer: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  const getConnectionIcon = () => {
    switch (connectionType) {
      case 'bluetooth':
        return <Bluetooth className="w-4 h-4" />
      case 'usb':
        return <Usb className="w-4 h-4" />
      case 'serial':
        return <Wifi className="w-4 h-4" />
      default:
        return <Printer className="w-4 h-4" />
    }
  }

  // Mobile minimized floating button - positioned on left to avoid cart overlap
  if (isMinimized) {
    return (
      <button
        onClick={onToggleMinimize}
        className="fixed bottom-6 left-6 lg:hidden z-40 w-14 h-14 bg-linear-to-br from-purple-500 to-indigo-600 rounded-full shadow-xl flex items-center justify-center text-white hover:shadow-2xl hover:scale-110 transition-all duration-300 border-2 border-white"
      >
        <div className="flex flex-col items-center justify-center">
          {getConnectionIcon()}
          <div className={`w-2 h-2 rounded-full mt-0.5 ${isConnected ? 'bg-green-400' : 'bg-red-400'}`} />
        </div>
      </button>
    )
  }

  return (
    <div className="fixed inset-0 bg-white z-50 lg:relative lg:inset-auto lg:z-auto lg:w-96 lg:bg-white lg:rounded-2xl lg:shadow-2xl lg:border lg:border-slate-100 flex flex-col overflow-hidden h-full lg:h-auto">
      {/* Header */}
      <div className="bg-linear-to-r from-purple-500 via-indigo-600 to-blue-600 text-white p-5 flex items-center gap-3 shadow-lg">
        <Printer className="w-6 h-6" />
        <div className="flex-1">
          <h2 className="font-bold text-lg">Thermal Printer</h2>
          <p className="text-xs text-white/80">ESC/POS Compatible</p>
        </div>
        <Badge variant={isConnected ? "default" : "secondary"} className="bg-white/25 text-white border-white/30">
          {isConnected ? (
            <>
              <CheckCircle className="w-3 h-3 text-green-300 mr-1" />
              Connected
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 text-red-300 mr-1" />
              Offline
            </>
          )}
        </Badge>
        <button onClick={onToggleMinimize} className="lg:hidden p-2 hover:bg-white/20 rounded-lg transition">
          <ChevronDown className="w-5 h-5" />
        </button>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Connection Status Card */}
        <div className={`bg-linear-to-br ${isConnected ? 'from-green-50 to-emerald-100 border-green-200' : 'from-red-50 to-rose-100 border-red-200'} rounded-xl p-4 border`}>
          <div className="flex items-center gap-3 mb-3">
            {getConnectionIcon()}
            <div className="flex-1">
              <h3 className="font-bold text-sm text-slate-800">
                {isConnected ? `Connected via ${connectionType?.toUpperCase()}` : 'Not Connected'}
              </h3>
              <p className="text-xs text-slate-600">
                {isConnected ? 'Ready to print receipts' : 'Connect to start printing'}
              </p>
            </div>
            <div className={`w-3 h-3 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
          </div>
        </div>

        {/* Connection Controls */}
        {!isConnected ? (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button 
                className="w-full bg-linear-to-r from-purple-500 via-indigo-600 to-blue-600 hover:from-purple-600 hover:via-indigo-700 hover:to-blue-700 disabled:bg-slate-300 disabled:text-slate-500 text-white font-bold py-3.5 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl disabled:shadow-none transform hover:scale-105 disabled:hover:scale-100" 
                disabled={isConnecting}
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Printer className="w-5 h-5 mr-2" />
                    Connect Printer
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Printer className="w-5 h-5" />
                  Connect Thermal Printer
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                {!capabilities.secure && (
                  <Alert variant="destructive">
                    <XCircle className="h-4 w-4" />
                    <AlertDescription className="text-sm">
                      HTTPS connection required for printer access. Please use https:// or localhost.
                    </AlertDescription>
                  </Alert>
                )}

                <Alert>
                  <Printer className="h-4 w-4" />
                  <AlertDescription className="text-sm">
                    Choose your connection method. Make sure your thermal printer is powered on and in pairing/discoverable mode.
                    {!capabilities.secure && " (HTTPS required for most features)"}
                  </AlertDescription>
                </Alert>

                <div className="grid gap-4">
                  {/* Bluetooth Connection */}
                  <Button
                    variant="outline"
                    className="flex items-center justify-start gap-4 h-auto p-4 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200 rounded-xl border-2"
                    onClick={() => handleConnect('bluetooth')}
                    disabled={isConnecting || !capabilities.bluetooth}
                  >
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full ${capabilities.bluetooth ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <Bluetooth className={`w-6 h-6 ${capabilities.bluetooth ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="text-left flex-1">
                      <div className={`font-bold text-base ${!capabilities.bluetooth ? 'text-gray-400' : 'text-slate-800'}`}>
                        Bluetooth
                        {!capabilities.bluetooth && " (Not Available)"}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {capabilities.bluetooth ? 
                          "Most common connection method" : 
                          capabilities.secure ? 
                            "Not supported in this browser" : 
                            "Requires HTTPS connection"
                        }
                      </div>
                    </div>
                  </Button>

                  {/* USB Connection */}
                  <Button
                    variant="outline"
                    className="flex items-center justify-start gap-4 h-auto p-4 hover:border-green-300 hover:bg-green-50 transition-all duration-200 rounded-xl border-2"
                    onClick={() => handleConnect('usb')}
                    disabled={isConnecting || !capabilities.usb}
                  >
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full ${capabilities.usb ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Usb className={`w-6 h-6 ${capabilities.usb ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="text-left flex-1">
                      <div className={`font-bold text-base ${!capabilities.usb ? 'text-gray-400' : 'text-slate-800'}`}>
                        USB
                        {!capabilities.usb && " (Not Available)"}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {capabilities.usb ? 
                          "Direct cable connection" : 
                          capabilities.secure ? 
                            "Not supported in this browser" : 
                            "Requires HTTPS connection"
                        }
                      </div>
                    </div>
                  </Button>

                  {/* Serial Connection */}
                  <Button
                    variant="outline"
                    className="flex items-center justify-start gap-4 h-auto p-4 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200 rounded-xl border-2"
                    onClick={() => handleConnect('serial')}
                    disabled={isConnecting || !capabilities.serial}
                  >
                    <div className={`flex items-center justify-center w-12 h-12 rounded-full ${capabilities.serial ? 'bg-purple-100' : 'bg-gray-100'}`}>
                      <Wifi className={`w-6 h-6 ${capabilities.serial ? 'text-purple-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="text-left flex-1">
                      <div className={`font-bold text-base ${!capabilities.serial ? 'text-gray-400' : 'text-slate-800'}`}>
                        Serial
                        {!capabilities.serial && " (Not Available)"}
                      </div>
                      <div className="text-sm text-muted-foreground mt-1">
                        {capabilities.serial ? 
                          "COM port/Serial connection" : 
                          capabilities.secure ? 
                            "Not supported in this browser" : 
                            "Requires HTTPS connection"
                        }
                      </div>
                    </div>
                  </Button>
                </div>

                <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
                  <div className="text-xs text-slate-600 space-y-2">
                    <div>
                      <span className="font-semibold text-slate-800">Supported Brands:</span>
                      <br />EPSON, Star Micronics, Citizen, Bixolon
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800">Browser Support:</span>
                      <br />Chrome/Edge 89+ recommended
                    </div>
                    <div>
                      <span className="font-semibold text-slate-800">Requirements:</span>
                      <br />HTTPS connection (or localhost) required
                    </div>
                  </div>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <div className="space-y-3">
            {/* Action Buttons */}
            <div className="grid grid-cols-1 gap-3">
              <Button
                onClick={handleTestPrint}
                disabled={isTesting}
                className="w-full bg-linear-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                {isTesting ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Testing...
                  </>
                ) : (
                  <>
                    <TestTube className="w-5 h-5 mr-2" />
                    Test Print
                  </>
                )}
              </Button>

              <Button
                onClick={handleOpenDrawer}
                className="w-full bg-linear-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 text-white font-bold py-3 rounded-xl transition-all duration-200 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <Zap className="w-5 h-5 mr-2" />
                Open Cash Drawer
              </Button>

              <Button
                variant="outline"
                onClick={handleDisconnect}
                className="w-full border-2 border-slate-300 hover:border-red-400 hover:bg-red-50 hover:text-red-600 font-bold py-3 rounded-xl transition-all duration-200"
              >
                <XCircle className="w-5 h-5 mr-2" />
                Disconnect
              </Button>
            </div>

            {/* Connection Info */}
            <div className="bg-slate-50 rounded-xl p-4 border border-slate-200">
              <div className="flex items-center gap-2 mb-2">
                {getConnectionIcon()}
                <span className="font-semibold text-sm text-slate-700">
                  {connectionType?.toUpperCase()} Connection
                </span>
              </div>
              <p className="text-xs text-slate-600">
                Printer is ready for receipt printing and cash drawer operations.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Mobile-friendly footer info */}
      <div className="border-t border-slate-200 p-4 bg-linear-to-b from-white to-slate-50">
        <div className="text-xs text-slate-500 text-center">
          <p className="font-medium mb-1">Supported: EPSON, Star, Citizen, Bixolon</p>
          <p>ESC/POS compatible thermal printers</p>
        </div>
      </div>
    </div>
  )
}
