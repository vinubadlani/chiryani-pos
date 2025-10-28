// Type declarations for Web APIs
declare global {
  interface Navigator {
    bluetooth?: {
      requestDevice(options: any): Promise<BluetoothDevice>;
    };
    usb?: {
      requestDevice(options: any): Promise<USBDevice>;
    };
    serial?: {
      requestPort(): Promise<SerialPort>;
    };
  }
}

interface BluetoothDevice {
  gatt?: {
    connect(): Promise<BluetoothRemoteGATTServer>;
    connected: boolean;
    disconnect(): void;
  };
}

interface BluetoothRemoteGATTServer {
  getPrimaryService(service: string): Promise<BluetoothRemoteGATTService>;
}

interface BluetoothRemoteGATTService {
  getCharacteristic(characteristic: string): Promise<BluetoothRemoteGATTCharacteristic>;
}

interface BluetoothRemoteGATTCharacteristic {
  writeValue(value: BufferSource): Promise<void>;
}

interface USBDevice {
  open(): Promise<void>;
  close(): Promise<void>;
  selectConfiguration(configurationValue: number): Promise<void>;
  claimInterface(interfaceNumber: number): Promise<void>;
  transferOut(endpointNumber: number, data: BufferSource): Promise<USBOutTransferResult>;
}

interface USBOutTransferResult {
  bytesWritten: number;
  status: 'ok' | 'stall' | 'babble';
}

interface SerialPort {
  open(options: { baudRate: number }): Promise<void>;
  writable: WritableStream;
}

export interface ThermalPrinterOptions {
  type: 'bluetooth' | 'usb' | 'network';
  deviceId?: string;
  address?: string;
  port?: number;
}

// Browser capability detection
export interface BrowserCapabilities {
  bluetooth: boolean;
  usb: boolean;
  serial: boolean;
  secure: boolean; // HTTPS required for most APIs
}

export interface PrintData {
  orderNumber: string;
  items: Array<{
    id: string;
    name: string;
    quantity: number;
    price: number;
  }>;
  total: number;
  customerName?: string;
  orderSource: string;
  timestamp: Date;
}

const RESTAURANT_DETAILS = {
  name: "Chiryani",
  address: "20, Ground Floor, Padmavati Colony, Near St Paul School, Geeta Bhavan, Indore",
  fssaiLicense: "21425850010639",
  billName: "Chiryani",
}

const COUPON_CODE = "OLDUSER"
const COUPON_MESSAGE = "Get additional offer on your next bill on Zomato/Swiggy or Call us!"

class ThermalPrinterService {
  private device: BluetoothDevice | USBDevice | null = null;
  private writer: WritableStreamDefaultWriter | null = null;
  private isConnected = false;
  private connectionType: 'bluetooth' | 'usb' | 'serial' | null = null;

  // ESC/POS Commands
  private readonly ESC = '\x1B';
  private readonly GS = '\x1D';
  private readonly commands = {
    INIT: '\x1B\x40',           // Initialize printer
    ALIGN_CENTER: '\x1B\x61\x01',  // Center alignment
    ALIGN_LEFT: '\x1B\x61\x00',    // Left alignment
    ALIGN_RIGHT: '\x1B\x61\x02',   // Right alignment
    BOLD_ON: '\x1B\x45\x01',       // Bold on
    BOLD_OFF: '\x1B\x45\x00',      // Bold off
    UNDERLINE_ON: '\x1B\x2D\x01',  // Underline on
    UNDERLINE_OFF: '\x1B\x2D\x00', // Underline off
    SIZE_NORMAL: '\x1D\x21\x00',   // Normal size
    SIZE_DOUBLE: '\x1D\x21\x11',   // Double size
    SIZE_LARGE: '\x1D\x21\x22',    // Large size
    CUT_PAPER: '\x1D\x56\x00',     // Cut paper
    LINE_FEED: '\x0A',             // Line feed
    FEED_LINES: (n: number) => '\x1B\x64' + String.fromCharCode(n), // Feed n lines
    DRAWER_OPEN: '\x1B\x70\x00\x19\xFA', // Open cash drawer
  };

  // Check browser capabilities
  getBrowserCapabilities(): BrowserCapabilities {
    const isSecure = location.protocol === 'https:' || location.hostname === 'localhost';
    return {
      bluetooth: !!(navigator.bluetooth && isSecure),
      usb: !!(navigator.usb && isSecure),
      serial: !!((navigator as any).serial && isSecure),
      secure: isSecure
    };
  }

  async connectBluetooth(): Promise<boolean> {
    try {
      const capabilities = this.getBrowserCapabilities();
      
      if (!capabilities.bluetooth) {
        if (!capabilities.secure) {
          throw new Error('HTTPS connection required for Bluetooth access. Please use https:// or localhost.');
        }
        throw new Error('Bluetooth not supported in this browser. Please use Chrome or Edge 89+.');
      }

      // Request Bluetooth device with broader filter options
      this.device = await navigator.bluetooth!.requestDevice({
        filters: [
          { namePrefix: 'POS' },
          { namePrefix: 'Thermal' },
          { namePrefix: 'Printer' },
          { namePrefix: 'Receipt' },
          { namePrefix: 'EPSON' },
          { namePrefix: 'Star' },
          { namePrefix: 'Citizen' },
          { namePrefix: 'Bixolon' },
          { namePrefix: 'TSP' },
          { namePrefix: 'TM-' },
          { namePrefix: 'CT-' },
          { namePrefix: 'SRP' },
        ],
        optionalServices: [
          '000018f0-0000-1000-8000-00805f9b34fb', // Generic printer service
          '49535343-fe7d-4ae5-8fa9-9fafd205e455', // Serial service
          '0000ff00-0000-1000-8000-00805f9b34fb', // Custom service
        ]
      });

      if (!this.device.gatt) {
        throw new Error('GATT not supported on this device');
      }

      const server = await this.device.gatt.connect();
      
      // Try multiple service UUIDs for different printer brands
      let service;
      const serviceUUIDs = [
        '000018f0-0000-1000-8000-00805f9b34fb',
        '49535343-fe7d-4ae5-8fa9-9fafd205e455',
        '0000ff00-0000-1000-8000-00805f9b34fb'
      ];

      for (const serviceUUID of serviceUUIDs) {
        try {
          service = await server.getPrimaryService(serviceUUID);
          break;
        } catch (e) {
          continue;
        }
      }

      if (!service) {
        throw new Error('No compatible printer service found');
      }

      this.connectionType = 'bluetooth';
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Bluetooth connection failed:', error);
      this.connectionType = null;
      this.isConnected = false;
      return false;
    }
  }

  async connectUSB(): Promise<boolean> {
    try {
      const capabilities = this.getBrowserCapabilities();
      
      if (!capabilities.usb) {
        if (!capabilities.secure) {
          throw new Error('HTTPS connection required for USB access. Please use https:// or localhost.');
        }
        throw new Error('WebUSB not supported in this browser. Please use Chrome or Edge 61+.');
      }

      // Request USB device with expanded vendor list
      this.device = await navigator.usb!.requestDevice({
        filters: [
          { vendorId: 0x04b8 }, // Epson
          { vendorId: 0x0519 }, // Star Micronics
          { vendorId: 0x0fe6 }, // ICS Advent (Bixolon)
          { vendorId: 0x2730 }, // Citizen
          { vendorId: 0x154f }, // Wincor Nixdorf
          { vendorId: 0x0483 }, // STMicroelectronics (some generic printers)
          { vendorId: 0x0416 }, // Winbond (some thermal printers)
        ]
      });

      if (!this.device) {
        throw new Error('No USB device selected');
      }

      await this.device.open();
      
      // Try different configuration numbers
      try {
        await this.device.selectConfiguration(1);
      } catch (e) {
        try {
          await this.device.selectConfiguration(0);
        } catch (e2) {
          console.warn('Could not select USB configuration, continuing...');
        }
      }

      // Try different interface numbers
      try {
        await this.device.claimInterface(0);
      } catch (e) {
        try {
          await this.device.claimInterface(1);
        } catch (e2) {
          console.warn('Could not claim USB interface, continuing...');
        }
      }

      this.connectionType = 'usb';
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('USB connection failed:', error);
      this.connectionType = null;
      this.isConnected = false;
      return false;
    }
  }

  async connectSerial(): Promise<boolean> {
    try {
      const capabilities = this.getBrowserCapabilities();
      
      if (!capabilities.serial) {
        if (!capabilities.secure) {
          throw new Error('HTTPS connection required for Serial access. Please use https:// or localhost.');
        }
        throw new Error('Web Serial API not supported in this browser. Please use Chrome or Edge 89+.');
      }

      const port = await (navigator as any).serial.requestPort();
      
      // Try different baud rates for compatibility
      const baudRates = [9600, 115200, 19200, 38400];
      let connected = false;

      for (const baudRate of baudRates) {
        try {
          await port.open({ baudRate });
          connected = true;
          break;
        } catch (e) {
          console.warn(`Failed to open serial port at ${baudRate} baud`);
          continue;
        }
      }

      if (!connected) {
        throw new Error('Could not open serial port at any supported baud rate');
      }

      this.writer = port.writable.getWriter();
      this.connectionType = 'serial';
      this.isConnected = true;
      return true;
    } catch (error) {
      console.error('Serial connection failed:', error);
      this.connectionType = null;
      this.isConnected = false;
      return false;
    }
  }

  private async sendCommand(command: string | Uint8Array): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Printer not connected');
    }

    try {
      const data = typeof command === 'string' 
        ? new TextEncoder().encode(command)
        : command;

      if (this.connectionType === 'serial' && this.writer) {
        // Serial connection
        await this.writer.write(data);
      } else if (this.connectionType === 'usb' && this.device && 'transferOut' in this.device) {
        // USB connection - try different endpoints
        try {
          await (this.device as USBDevice).transferOut(1, data);
        } catch (e) {
          try {
            await (this.device as USBDevice).transferOut(2, data);
          } catch (e2) {
            await (this.device as USBDevice).transferOut(3, data);
          }
        }
      } else if (this.connectionType === 'bluetooth' && this.device && 'gatt' in this.device) {
        // Bluetooth connection - try multiple service/characteristic combinations
        const server = await (this.device as BluetoothDevice).gatt!.connect();
        
        const serviceCharacteristicPairs = [
          ['000018f0-0000-1000-8000-00805f9b34fb', '00002af1-0000-1000-8000-00805f9b34fb'],
          ['49535343-fe7d-4ae5-8fa9-9fafd205e455', '49535343-1e4d-4bd9-ba61-23c647249616'],
          ['0000ff00-0000-1000-8000-00805f9b34fb', '0000ff01-0000-1000-8000-00805f9b34fb'],
        ];

        let success = false;
        for (const [serviceUUID, characteristicUUID] of serviceCharacteristicPairs) {
          try {
            const service = await server.getPrimaryService(serviceUUID);
            const characteristic = await service.getCharacteristic(characteristicUUID);
            await characteristic.writeValue(data);
            success = true;
            break;
          } catch (e) {
            continue;
          }
        }

        if (!success) {
          throw new Error('Could not find writable characteristic');
        }
      } else {
        throw new Error('No valid connection method available');
      }
    } catch (error) {
      console.error('Failed to send command:', error);
      throw error;
    }
  }

  private formatLine(left: string, right: string, width: number = 32): string {
    const leftLen = left.length;
    const rightLen = right.length;
    const spaces = width - leftLen - rightLen;
    return left + ' '.repeat(Math.max(0, spaces)) + right;
  }

  private centerText(text: string, width: number = 32): string {
    const padding = Math.max(0, Math.floor((width - text.length) / 2));
    return ' '.repeat(padding) + text;
  }

  async printReceipt(data: PrintData): Promise<void> {
    try {
      if (!this.isConnected) {
        throw new Error('Printer not connected');
      }

      // Initialize printer
      await this.sendCommand(this.commands.INIT);

      // Header
      await this.sendCommand(this.commands.ALIGN_CENTER);
      await this.sendCommand(this.commands.SIZE_LARGE);
      await this.sendCommand(this.commands.BOLD_ON);
      await this.sendCommand(RESTAURANT_DETAILS.billName + '\n');
      await this.sendCommand(this.commands.BOLD_OFF);
      await this.sendCommand(this.commands.SIZE_NORMAL);
      
      // Restaurant details
      await this.sendCommand(RESTAURANT_DETAILS.address + '\n');
      await this.sendCommand(`FSSAI License: ${RESTAURANT_DETAILS.fssaiLicense}\n`);
      await this.sendCommand('--------------------------------\n');
      
      // Order details
      await this.sendCommand(this.commands.BOLD_ON);
      await this.sendCommand(`Order: ${data.orderNumber}\n`);
      await this.sendCommand(this.commands.BOLD_OFF);
      await this.sendCommand(`Date: ${data.timestamp.toLocaleString()}\n`);
      
      if (data.customerName) {
        await this.sendCommand(`Customer: ${data.customerName}\n`);
      }
      
      await this.sendCommand(`Source: ${data.orderSource.toUpperCase()}\n`);
      await this.sendCommand('--------------------------------\n');

      // Items header
      await this.sendCommand(this.commands.ALIGN_LEFT);
      await this.sendCommand(this.commands.BOLD_ON);
      await this.sendCommand(this.formatLine('Item', 'Qty  Total') + '\n');
      await this.sendCommand(this.commands.BOLD_OFF);
      await this.sendCommand('--------------------------------\n');

      // Items
      for (const item of data.items) {
        const itemName = item.name.length > 20 ? item.name.substring(0, 17) + '...' : item.name;
        const qtyTotal = `${item.quantity}  ₹${item.price * item.quantity}`;
        await this.sendCommand(this.formatLine(itemName, qtyTotal) + '\n');
        
        if (item.name.length > 20) {
          await this.sendCommand(item.name.substring(17) + '\n');
        }
      }

      await this.sendCommand('--------------------------------\n');

      // Total
      await this.sendCommand(this.commands.BOLD_ON);
      await this.sendCommand(this.commands.SIZE_DOUBLE);
      await this.sendCommand(this.formatLine('TOTAL:', `₹${data.total}`) + '\n');
      await this.sendCommand(this.commands.SIZE_NORMAL);
      await this.sendCommand(this.commands.BOLD_OFF);
      
      await this.sendCommand(this.commands.ALIGN_CENTER);
      await this.sendCommand('(Tax Included in Price)\n');
      await this.sendCommand('--------------------------------\n');

      // Coupon section
      await this.sendCommand('SPECIAL OFFER FOR YOU\n');
      await this.sendCommand(this.commands.BOLD_ON);
      await this.sendCommand(this.commands.SIZE_LARGE);
      await this.sendCommand(`${COUPON_CODE}\n`);
      await this.sendCommand(this.commands.SIZE_NORMAL);
      await this.sendCommand(this.commands.BOLD_OFF);
      await this.sendCommand(COUPON_MESSAGE + '\n');
      await this.sendCommand('--------------------------------\n');

      // Footer
      await this.sendCommand(this.commands.BOLD_ON);
      await this.sendCommand('Thank you for your order!\n');
      await this.sendCommand(this.commands.BOLD_OFF);
      await this.sendCommand('Please collect your order from the counter\n');
      await this.sendCommand('\n');
      await this.sendCommand('Powered by Chiryani POS\n');

      // Feed and cut
      await this.sendCommand(this.commands.FEED_LINES(3));
      await this.sendCommand(this.commands.CUT_PAPER);

    } catch (error) {
      console.error('Print failed:', error);
      throw error;
    }
  }

  async openCashDrawer(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Printer not connected');
    }
    
    try {
      await this.sendCommand(this.commands.DRAWER_OPEN);
    } catch (error) {
      console.error('Failed to open cash drawer:', error);
      throw error;
    }
  }

  async disconnect(): Promise<void> {
    try {
      if (this.writer) {
        await this.writer.close();
        this.writer = null;
      }
      
      if (this.device) {
        if (this.connectionType === 'bluetooth' && 'gatt' in this.device && this.device.gatt?.connected) {
          await this.device.gatt.disconnect();
        } else if (this.connectionType === 'usb' && 'close' in this.device) {
          await (this.device as USBDevice).close();
        }
        this.device = null;
      }
      
      this.connectionType = null;
      this.isConnected = false;
    } catch (error) {
      console.error('Disconnect failed:', error);
      // Still reset the connection state even if disconnect fails
      this.connectionType = null;
      this.isConnected = false;
      this.device = null;
      this.writer = null;
    }
  }

  getConnectionType(): string | null {
    return this.connectionType;
  }

  isDeviceConnected(): boolean {
    return this.isConnected;
  }

  // Test print function
  async testPrint(): Promise<void> {
    if (!this.isConnected) {
      throw new Error('Printer not connected');
    }

    try {
      await this.sendCommand(this.commands.INIT);
      await this.sendCommand(this.commands.ALIGN_CENTER);
      await this.sendCommand(this.commands.SIZE_LARGE);
      await this.sendCommand(this.commands.BOLD_ON);
      await this.sendCommand('TEST PRINT\n');
      await this.sendCommand(this.commands.BOLD_OFF);
      await this.sendCommand(this.commands.SIZE_NORMAL);
      await this.sendCommand('--------------------------------\n');
      await this.sendCommand('Chiryani POS System\n');
      await this.sendCommand('Thermal Printer Connected\n');
      await this.sendCommand(new Date().toLocaleString() + '\n');
      await this.sendCommand('--------------------------------\n');
      await this.sendCommand('Print test successful!\n');
      await this.sendCommand(this.commands.FEED_LINES(3));
      await this.sendCommand(this.commands.CUT_PAPER);
    } catch (error) {
      console.error('Test print failed:', error);
      throw error;
    }
  }
}

export const thermalPrinter = new ThermalPrinterService();
