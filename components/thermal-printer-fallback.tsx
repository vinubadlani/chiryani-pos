"use client"

import { AlertTriangle, ExternalLink, Download } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export function ThermalPrinterFallback() {
  const isHTTPS = typeof window !== 'undefined' && window.location.protocol === 'https:'
  const isLocalhost = typeof window !== 'undefined' && (
    window.location.hostname === 'localhost' || 
    window.location.hostname === '127.0.0.1' ||
    window.location.hostname === '::1'
  )

  const openChromeDownload = () => {
    window.open('https://www.google.com/chrome/', '_blank')
  }

  const openEdgeDownload = () => {
    window.open('https://www.microsoft.com/edge/', '_blank')
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-500" />
          Thermal Printer Not Available
        </CardTitle>
        <CardDescription>
          Your current browser or connection doesn't support thermal printer features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {!isHTTPS && !isLocalhost && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>HTTPS Required</AlertTitle>
            <AlertDescription>
              Thermal printer features require a secure HTTPS connection. Please access this site via:
              <ul className="list-disc list-inside mt-2 ml-4">
                <li><strong>https://</strong> instead of http://</li>
                <li><strong>localhost</strong> for local development</li>
              </ul>
            </AlertDescription>
          </Alert>
        )}

        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Browser Compatibility</AlertTitle>
          <AlertDescription>
            Thermal printer support requires modern web APIs available in:
            <ul className="list-disc list-inside mt-2 ml-4">
              <li><strong>Google Chrome 89+</strong> (Full support)</li>
              <li><strong>Microsoft Edge 89+</strong> (Full support)</li>
              <li><strong>Firefox 90+</strong> (Limited support)</li>
            </ul>
          </AlertDescription>
        </Alert>

        <div className="grid md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Quick Solutions:</h3>
            <div className="space-y-2">
              <Button
                variant="outline"
                size="sm"
                onClick={openChromeDownload}
                className="w-full justify-start"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Download Google Chrome
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={openEdgeDownload}
                className="w-full justify-start"
              >
                <ExternalLink className="w-4 h-4 mr-2" />
                Download Microsoft Edge
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-sm">Alternative Options:</h3>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Use regular browser printing (Ctrl+P)</li>
              <li>• Export receipts as PDF</li>
              <li>• Print via connected computer</li>
              <li>• Use mobile app with printer support</li>
            </ul>
          </div>
        </div>

        <Alert>
          <AlertDescription className="text-xs">
            <strong>Note:</strong> Even with a compatible browser, you'll need:
            <br />• ESC/POS compatible thermal printer
            <br />• Bluetooth, USB, or Serial connection
            <br />• Proper printer drivers (for USB)
            <br />• HTTPS connection for security
          </AlertDescription>
        </Alert>

        <div className="pt-4 border-t">
          <p className="text-xs text-muted-foreground">
            For technical support or questions about printer compatibility, 
            please refer to the thermal printer documentation or contact support.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
