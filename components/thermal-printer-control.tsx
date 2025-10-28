"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Bluetooth, Usb, Wifi, Printer, TestTube, Zap, CheckCircle, XCircle, Loader2 } from "lucide-react"
import { thermalPrinter, type PrintData, type BrowserCapabilities } from "@/lib/thermal-printer"
import { toast } from "sonner"

interface ThermalPrinterControlProps {
  className?: string
}

export function ThermalPrinterControl({ className }: ThermalPrinterControlProps) {
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

  return (
    <div className={className}>
      <div className="flex items-center gap-2">
        {/* Connection Status */}
        <Badge variant={isConnected ? "default" : "secondary"} className="flex items-center gap-1">
          {getConnectionIcon()}
          {isConnected ? (
            <>
              <CheckCircle className="w-3 h-3 text-green-500" />
              Connected ({connectionType?.toUpperCase()})
            </>
          ) : (
            <>
              <XCircle className="w-3 h-3 text-red-500" />
              Not Connected
            </>
          )}
        </Badge>

        {/* Control Buttons */}
        {!isConnected ? (
          <Dialog open={showDialog} onOpenChange={setShowDialog}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm" disabled={isConnecting}>
                {isConnecting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Connecting...
                  </>
                ) : (
                  <>
                    <Printer className="w-4 h-4 mr-2" />
                    Connect Printer
                  </>
                )}
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
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
                    <AlertDescription>
                      HTTPS connection required for printer access. Please use https:// or localhost.
                    </AlertDescription>
                  </Alert>
                )}

                <Alert>
                  <Printer className="h-4 w-4" />
                  <AlertDescription>
                    Choose your connection method. Make sure your thermal printer is powered on and in pairing/discoverable mode.
                    {!capabilities.secure && " (HTTPS required for most features)"}
                  </AlertDescription>
                </Alert>

                <div className="grid gap-3">
                  {/* Bluetooth Connection */}
                  <Button
                    variant="outline"
                    className="flex items-center justify-start gap-3 h-auto p-4"
                    onClick={() => handleConnect('bluetooth')}
                    disabled={isConnecting || !capabilities.bluetooth}
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${capabilities.bluetooth ? 'bg-blue-100' : 'bg-gray-100'}`}>
                      <Bluetooth className={`w-5 h-5 ${capabilities.bluetooth ? 'text-blue-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="text-left">
                      <div className={`font-semibold ${!capabilities.bluetooth ? 'text-gray-400' : ''}`}>
                        Bluetooth
                        {!capabilities.bluetooth && " (Not Available)"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {capabilities.bluetooth ? 
                          "Connect via Bluetooth (most common)" : 
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
                    className="flex items-center justify-start gap-3 h-auto p-4"
                    onClick={() => handleConnect('usb')}
                    disabled={isConnecting || !capabilities.usb}
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${capabilities.usb ? 'bg-green-100' : 'bg-gray-100'}`}>
                      <Usb className={`w-5 h-5 ${capabilities.usb ? 'text-green-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="text-left">
                      <div className={`font-semibold ${!capabilities.usb ? 'text-gray-400' : ''}`}>
                        USB
                        {!capabilities.usb && " (Not Available)"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {capabilities.usb ? 
                          "Connect via USB cable" : 
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
                    className="flex items-center justify-start gap-3 h-auto p-4"
                    onClick={() => handleConnect('serial')}
                    disabled={isConnecting || !capabilities.serial}
                  >
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full ${capabilities.serial ? 'bg-purple-100' : 'bg-gray-100'}`}>
                      <Wifi className={`w-5 h-5 ${capabilities.serial ? 'text-purple-600' : 'text-gray-400'}`} />
                    </div>
                    <div className="text-left">
                      <div className={`font-semibold ${!capabilities.serial ? 'text-gray-400' : ''}`}>
                        Serial
                        {!capabilities.serial && " (Not Available)"}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {capabilities.serial ? 
                          "Connect via COM port/Serial" : 
                          capabilities.secure ? 
                            "Not supported in this browser" : 
                            "Requires HTTPS connection"
                        }
                      </div>
                    </div>
                  </Button>
                </div>

                <Alert>
                  <AlertDescription className="text-xs">
                    <strong>Supported Brands:</strong> EPSON, Star Micronics, Citizen, Bixolon, and other ESC/POS compatible printers.
                    <br />
                    <strong>Browser Support:</strong> Chrome/Edge 89+ recommended. Firefox has limited support.
                    <br />
                    <strong>Requirements:</strong> HTTPS connection (or localhost) required for all connection methods.
                  </AlertDescription>
                </Alert>
              </div>
            </DialogContent>
          </Dialog>
        ) : (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestPrint}
              disabled={isTesting}
            >
              {isTesting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Testing...
                </>
              ) : (
                <>
                  <TestTube className="w-4 h-4 mr-2" />
                  Test Print
                </>
              )}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleOpenDrawer}
            >
              <Zap className="w-4 h-4 mr-2" />
              Open Drawer
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleDisconnect}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Disconnect
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
