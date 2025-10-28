# Thermal Printer Integration Guide

## Overview

The Chiryani POS system now supports thermal receipt printing via Bluetooth, USB, or Serial connection. This feature allows you to print professional receipts directly to ESC/POS compatible thermal printers.

## Supported Printer Brands

### Tested and Compatible:
- **EPSON** (TM-T82, TM-T88, TM-m30 series)
- **Star Micronics** (TSP100, TSP650, TSP700 series)
- **Citizen** (CT-S310, CT-S4000 series)
- **Bixolon** (SRP-350, SRP-275 series)
- **Generic ESC/POS** compatible printers

### Connection Methods:
1. **Bluetooth** - Most common, wireless connection
2. **USB** - Direct cable connection via WebUSB
3. **Serial/COM** - Traditional serial port connection

## Setup Instructions

### 1. Hardware Setup

#### Bluetooth Connection:
1. Power on your thermal printer
2. Enable Bluetooth pairing mode (refer to your printer manual)
3. In the POS system, click "Connect Printer" → "Bluetooth"
4. Select your printer from the device list
5. Wait for connection confirmation

#### USB Connection:
1. Connect printer to computer via USB cable
2. Install printer drivers if required
3. In the POS system, click "Connect Printer" → "USB"
4. Select your printer from the device list
5. Grant permission when browser prompts

#### Serial Connection:
1. Connect printer via serial cable or USB-to-Serial adapter
2. Note the COM port number (Windows) or device path (Linux/Mac)
3. In the POS system, click "Connect Printer" → "Serial"
4. Configure port settings and connect

### 2. Software Configuration

#### Browser Requirements:
- **Chrome/Edge 89+** (Full support for Web Bluetooth, WebUSB, Web Serial)
- **Firefox 90+** (Limited support - USB and Serial only)
- **Safari** (Not supported - use Chrome/Edge)

#### Required Features:
- Web Bluetooth API (for Bluetooth connection)
- WebUSB API (for USB connection)
- Web Serial API (for Serial connection)

### 3. POS System Setup

1. **Connect Printer**: Use the printer control panel in the top bar
2. **Test Print**: Click "Test Print" to verify connection
3. **Auto-Print**: Enable in cart checkout dialog for automatic printing
4. **Settings**: Configure paper width, cut options, and other preferences

## Features

### Receipt Content:
- Restaurant name and address
- FSSAI license number
- Order number and timestamp
- Customer name (if provided)
- Order source (Dine-in, Zomato, Swiggy, Call)
- Itemized list with quantities and prices
- Total amount with tax information
- Promotional coupon code
- Thank you message

### Print Options:
- **Auto-print**: Automatically print after order confirmation
- **Manual print**: Print from receipt dialog
- **Test print**: Verify printer connection
- **Cash drawer**: Open connected cash drawer
- **Paper cut**: Automatic paper cutting
- **Feed lines**: Configurable paper feed

### ESC/POS Commands Supported:
- Text formatting (bold, underline, sizing)
- Text alignment (left, center, right)
- Paper cutting
- Cash drawer opening
- Line feeds and spacing
- Character encoding

## Usage Guide

### Creating Orders with Thermal Printing:

1. **Add items to cart** as usual
2. **Click "Proceed to Payment"**
3. **Select order source** (Dine-in, Zomato, etc.)
4. **Enter customer name** (optional)
5. **Enable "Auto-print to thermal printer"** checkbox (if printer connected)
6. **Click "Confirm Order"**
7. Receipt will print automatically if auto-print is enabled

### Manual Printing:

1. **Complete order** to see receipt dialog
2. **Click "Thermal" button** in receipt dialog
3. Receipt will print to connected thermal printer

### Printer Management:

1. **Connection Status**: View in top bar (Connected/Not Connected)
2. **Test Print**: Use to verify printer functionality
3. **Open Cash Drawer**: Manual cash drawer control
4. **Disconnect**: Safely disconnect printer when done

## Troubleshooting

### Common Issues:

#### "Printer not supported"
- Ensure your printer supports ESC/POS commands
- Try different connection methods
- Check printer compatibility list

#### "Connection failed"
- Verify printer is powered on
- Check Bluetooth pairing mode is active
- Ensure USB drivers are installed
- Try restarting browser

#### "Print failed"
- Check printer paper and ribbon
- Verify printer is not in error state
- Test with simple test print first
- Check printer manual for error codes

#### "Bluetooth not available"
- Use Chrome or Edge browser
- Enable Bluetooth in browser settings
- Ensure device Bluetooth is enabled
- Try HTTPS connection if on local network

#### "WebUSB not supported"
- Use Chrome or Edge browser
- Update browser to latest version
- Try different USB port
- Check USB cable connection

### Performance Tips:

1. **Keep printer close** to computer for Bluetooth
2. **Use quality thermal paper** for best results
3. **Regular maintenance** - clean print head
4. **Power management** - don't let printer sleep during service
5. **Network stability** - ensure stable connection for network printers

### Settings Configuration:

#### Paper Width:
- **58mm**: Compact receipts, mobile printers
- **80mm**: Standard receipts, counter printers

#### Feed Lines:
- **0-2 lines**: Minimal paper usage
- **3-5 lines**: Standard spacing
- **6+ lines**: Extra spacing for tearing

#### Auto-cut:
- **Enabled**: Automatic paper cutting after print
- **Disabled**: Manual tearing required

## API Reference

### ThermalPrinterService Methods:

```typescript
// Connection methods
await thermalPrinter.connectBluetooth()
await thermalPrinter.connectUSB()
await thermalPrinter.connectSerial()

// Printing methods
await thermalPrinter.printReceipt(printData)
await thermalPrinter.testPrint()
await thermalPrinter.openCashDrawer()

// Status methods
thermalPrinter.isDeviceConnected()
await thermalPrinter.disconnect()
```

### PrintData Interface:

```typescript
interface PrintData {
  orderNumber: string
  items: Array<{
    id: string
    name: string
    quantity: number
    price: number
  }>
  total: number
  customerName?: string
  orderSource: string
  timestamp: Date
}
```

## Security & Privacy

### Data Handling:
- No print data is stored or transmitted
- All printing happens locally
- Printer settings saved in browser localStorage
- No external services required

### Permissions:
- Browser will request permission for device access
- Permissions can be revoked in browser settings
- No personal data collected

## Support

### Getting Help:
1. Check printer manual for ESC/POS compatibility
2. Verify browser and device compatibility
3. Test with simple commands first
4. Check console for error messages

### Known Limitations:
- Safari browser not supported
- Some mobile browsers have limited support
- Network printers require additional setup
- Older printers may have command differences

### Future Enhancements:
- Network printer discovery
- Advanced receipt customization
- Multiple printer support
- Print job queuing
- Receipt templates

---

**Note**: This thermal printer integration uses modern web APIs that require HTTPS and user permissions. Ensure your POS system is accessed via HTTPS for full functionality.
