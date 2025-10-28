"use client"

import { useState, useEffect } from "react"
import { Settings, Printer, TestTube, Zap, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Separator } from "@/components/ui/separator"
import { toast } from "sonner"

interface ThermalPrinterSettings {
  autoPrint: boolean
  paperWidth: '58mm' | '80mm'
  feedLines: number
  cutPaper: boolean
  openDrawer: boolean
  printCoupon: boolean
}

const defaultSettings: ThermalPrinterSettings = {
  autoPrint: false,
  paperWidth: '80mm',
  feedLines: 3,
  cutPaper: true,
  openDrawer: false,
  printCoupon: true,
}

export function ThermalPrinterSettings() {
  const [settings, setSettings] = useState<ThermalPrinterSettings>(defaultSettings)
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    // Load settings from localStorage
    const savedSettings = localStorage.getItem('thermalPrinterSettings')
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings))
      } catch (error) {
        console.error('Failed to load thermal printer settings:', error)
      }
    }
  }, [])

  const saveSettings = () => {
    setIsLoading(true)
    try {
      localStorage.setItem('thermalPrinterSettings', JSON.stringify(settings))
      toast.success('Thermal printer settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      toast.error('Failed to save settings')
    } finally {
      setIsLoading(false)
    }
  }

  const resetSettings = () => {
    setSettings(defaultSettings)
    localStorage.removeItem('thermalPrinterSettings')
    toast.success('Settings reset to defaults')
  }

  return (
    <Card className="w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Settings className="w-5 h-5" />
          Thermal Printer Settings
        </CardTitle>
        <CardDescription>
          Configure your thermal printer preferences and print options
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Print Behavior */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Printer className="w-4 h-4" />
            Print Behavior
          </h3>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="autoPrint">Auto-print receipts</Label>
              <div className="text-sm text-muted-foreground">
                Automatically print receipt after order confirmation
              </div>
            </div>
            <Switch
              id="autoPrint"
              checked={settings.autoPrint}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, autoPrint: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="openDrawer">Open cash drawer</Label>
              <div className="text-sm text-muted-foreground">
                Open cash drawer after printing receipt
              </div>
            </div>
            <Switch
              id="openDrawer"
              checked={settings.openDrawer}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, openDrawer: checked }))
              }
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="printCoupon">Print coupon</Label>
              <div className="text-sm text-muted-foreground">
                Include promotional coupon on receipts
              </div>
            </div>
            <Switch
              id="printCoupon"
              checked={settings.printCoupon}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, printCoupon: checked }))
              }
            />
          </div>
        </div>

        <Separator />

        {/* Paper Settings */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold">Paper Settings</h3>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="paperWidth">Paper Width</Label>
              <Select
                value={settings.paperWidth}
                onValueChange={(value: '58mm' | '80mm') => 
                  setSettings(prev => ({ ...prev, paperWidth: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="58mm">58mm (2.3 inches)</SelectItem>
                  <SelectItem value="80mm">80mm (3.1 inches)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="feedLines">Feed Lines</Label>
              <Input
                id="feedLines"
                type="number"
                min="0"
                max="10"
                value={settings.feedLines}
                onChange={(e) => 
                  setSettings(prev => ({ 
                    ...prev, 
                    feedLines: Math.max(0, Math.min(10, parseInt(e.target.value) || 0))
                  }))
                }
              />
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="cutPaper">Auto-cut paper</Label>
              <div className="text-sm text-muted-foreground">
                Automatically cut paper after printing
              </div>
            </div>
            <Switch
              id="cutPaper"
              checked={settings.cutPaper}
              onCheckedChange={(checked) => 
                setSettings(prev => ({ ...prev, cutPaper: checked }))
              }
            />
          </div>
        </div>

        <Separator />

        {/* Actions */}
        <div className="flex items-center gap-3">
          <Button 
            onClick={saveSettings}
            disabled={isLoading}
            className="flex items-center gap-2"
          >
            <Save className="w-4 h-4" />
            {isLoading ? 'Saving...' : 'Save Settings'}
          </Button>
          
          <Button 
            variant="outline" 
            onClick={resetSettings}
          >
            Reset to Defaults
          </Button>
        </div>

        {/* Info */}
        <div className="text-sm text-muted-foreground bg-muted p-3 rounded-lg">
          <strong>Supported Brands:</strong> EPSON, Star Micronics, Citizen, Bixolon, and other ESC/POS compatible thermal printers.
          <br />
          <strong>Connection Methods:</strong> Bluetooth, USB, or Serial/COM port.
        </div>
      </CardContent>
    </Card>
  )
}

// Export settings getter for use in other components
export const getThermalPrinterSettings = (): ThermalPrinterSettings => {
  if (typeof window === 'undefined') return defaultSettings
  
  const savedSettings = localStorage.getItem('thermalPrinterSettings')
  if (savedSettings) {
    try {
      return { ...defaultSettings, ...JSON.parse(savedSettings) }
    } catch (error) {
      console.error('Failed to load thermal printer settings:', error)
    }
  }
  return defaultSettings
}
