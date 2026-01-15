
// Barcode generation utilities using Code128 format
// Generates a simple barcode pattern for order IDs

export interface BarcodeData {
  orderId: string;
  barcode: string;
  timestamp: string;
}

// Code128 character set B start, checksum, and stop patterns
const CODE128_START_B = '11010010000';
const CODE128_STOP = '1100011101011';

const CODE128_PATTERNS: Record<string, string> = {
  ' ': '11011001100', '!': '11001101100', '"': '11001100110', '#': '10010011000',
  '$': '10010001100', '%': '10001001100', '&': '10011001000', "'": '10011000100',
  '(': '10001100100', ')': '11001001000', '*': '11001000100', '+': '11000100100',
  ',': '10110011100', '-': '10011011100', '.': '10011001110', '/': '10111001100',
  '0': '10011101100', '1': '10011100110', '2': '11001110010', '3': '11001011100',
  '4': '11001001110', '5': '11011100100', '6': '11001110100', '7': '11101101110',
  '8': '11101001100', '9': '11100101100', ':': '11100100110', ';': '11101100100',
  '<': '11100110100', '=': '11100110010', '>': '11011011000', '?': '11011000110',
  '@': '11000110110', 'A': '10100011000', 'B': '10001011000', 'C': '10001000110',
  'D': '10110001000', 'E': '10001101000', 'F': '10001100010', 'G': '11010001000',
  'H': '11000101000', 'I': '11000100010', 'J': '10110111000', 'K': '10110001110',
  'L': '10001101110', 'M': '10111011000', 'N': '10111000110', 'O': '10001110110',
  'P': '11101110110', 'Q': '11010001110', 'R': '11000101110', 'S': '11011101000',
  'T': '11011100010', 'U': '11011101110', 'V': '11101011000', 'W': '11101000110',
  'X': '11100010110', 'Y': '11101101000', 'Z': '11101100010', '[': '11100011010',
  '\\': '11101111010', ']': '11001000010', '^': '11110001010', '_': '10100110000',
  '`': '10100001100', 'a': '10010110000', 'b': '10010000110', 'c': '10000101100',
  'd': '10000100110', 'e': '10110010000', 'f': '10110000100', 'g': '10011010000',
  'h': '10011000010', 'i': '10000110100', 'j': '10000110010', 'k': '11000010010',
  'l': '11001010000', 'm': '11110111010', 'n': '11000010100', 'o': '10001111010',
  'p': '10100111100', 'q': '10010111100', 'r': '10010011110', 's': '10111100100',
  't': '10011110100', 'u': '10011110010', 'v': '11110100100', 'w': '11110010100',
  'x': '11110010010', 'y': '11011011110', 'z': '11011110110', '{': '11110110110',
  '|': '10101111000', '}': '10100011110', '~': '10001011110'
};

// Generate a short unique barcode from order ID
export const generateOrderBarcode = (orderId: string): string => {
  // Use first 8 characters of UUID and add timestamp suffix
  const shortId = orderId.replace(/-/g, '').substring(0, 8).toUpperCase();
  const timestamp = Date.now().toString(36).toUpperCase().slice(-4);
  return `ORD${shortId}${timestamp}`;
};

// Generate SVG barcode pattern
export const generateBarcodeSVG = (text: string, width: number = 300, height: number = 80): string => {
  let binary = CODE128_START_B;
  let checksum = 104; // Start B value
  
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    if (CODE128_PATTERNS[char]) {
      binary += CODE128_PATTERNS[char];
      checksum += (text.charCodeAt(i) - 32) * (i + 1);
    }
  }
  
  // Add checksum character
  const checksumChar = String.fromCharCode((checksum % 103) + 32);
  if (CODE128_PATTERNS[checksumChar]) {
    binary += CODE128_PATTERNS[checksumChar];
  }
  
  binary += CODE128_STOP;
  
  const barWidth = width / binary.length;
  let svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">`;
  svg += `<rect width="${width}" height="${height}" fill="white"/>`;
  
  let x = 0;
  for (const bit of binary) {
    if (bit === '1') {
      svg += `<rect x="${x}" y="5" width="${barWidth}" height="${height - 25}" fill="black"/>`;
    }
    x += barWidth;
  }
  
  // Add text below barcode
  svg += `<text x="${width / 2}" y="${height - 5}" text-anchor="middle" font-family="monospace" font-size="12" fill="black">${text}</text>`;
  svg += '</svg>';
  
  return svg;
};

// Convert SVG to data URL for printing
export const svgToDataUrl = (svg: string): string => {
  return `data:image/svg+xml;base64,${btoa(svg)}`;
};

// Generate printable delivery sticker HTML
export const generateDeliverySticker = (
  barcode: string,
  customerName: string,
  customerPhone: string,
  address: {
    street: string;
    city: string;
    postalCode?: string;
    location?: { lat: number; lng: number };
  },
  orderId: string,
  deliveryMethod: string,
  orderDate: string
): string => {
  const barcodeSvg = generateBarcodeSVG(barcode, 280, 70);
  
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <title>Delivery Sticker - ${barcode}</title>
      <style>
        @media print {
          body { margin: 0; padding: 0; }
          .no-print { display: none !important; }
        }
        body {
          font-family: 'Segoe UI', sans-serif;
          margin: 0;
          padding: 20px;
        }
        .sticker {
          width: 4in;
          height: 6in;
          border: 2px dashed #ccc;
          padding: 15px;
          box-sizing: border-box;
          background: white;
        }
        .header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          border-bottom: 2px solid #000;
          padding-bottom: 10px;
          margin-bottom: 10px;
        }
        .logo {
          font-weight: bold;
          font-size: 20px;
        }
        .delivery-type {
          background: ${deliveryMethod.toLowerCase().includes('express') ? '#ef4444' : '#22c55e'};
          color: white;
          padding: 5px 12px;
          border-radius: 4px;
          font-weight: bold;
          font-size: 12px;
          text-transform: uppercase;
        }
        .barcode-section {
          text-align: center;
          margin: 15px 0;
          padding: 10px;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }
        .barcode-section img {
          max-width: 100%;
        }
        .info-section {
          margin: 10px 0;
        }
        .info-label {
          font-size: 10px;
          color: #666;
          text-transform: uppercase;
          margin-bottom: 2px;
        }
        .info-value {
          font-size: 14px;
          font-weight: 500;
          margin-bottom: 8px;
        }
        .address-box {
          background: #f3f4f6;
          padding: 10px;
          border-radius: 6px;
          margin: 10px 0;
        }
        .order-id {
          font-family: monospace;
          font-size: 11px;
          color: #666;
          margin-top: 10px;
          text-align: center;
        }
        .footer {
          border-top: 1px dashed #ccc;
          margin-top: 15px;
          padding-top: 10px;
          font-size: 10px;
          color: #666;
          text-align: center;
        }
        .scan-instruction {
          background: #fef3c7;
          border: 1px solid #f59e0b;
          padding: 8px;
          border-radius: 4px;
          font-size: 11px;
          text-align: center;
          margin-top: 10px;
        }
      </style>
    </head>
    <body>
      <div class="sticker">
        <div class="header">
          <div class="logo">🛒 FreshMart</div>
          <div class="delivery-type">${deliveryMethod}</div>
        </div>
        
        <div class="barcode-section">
          <img src="${svgToDataUrl(barcodeSvg)}" alt="Barcode" />
        </div>
        
        <div class="info-section">
          <div class="info-label">Customer</div>
          <div class="info-value">${customerName}</div>
          
          <div class="info-label">Phone</div>
          <div class="info-value">${customerPhone}</div>
        </div>
        
        <div class="address-box">
          <div class="info-label">Delivery Address</div>
          <div class="info-value">${address.street}</div>
          <div class="info-value">${address.city}${address.postalCode ? `, ${address.postalCode}` : ''}</div>
          ${address.location ? `<div style="font-size: 10px; color: #666;">GPS: ${address.location.lat.toFixed(4)}, ${address.location.lng.toFixed(4)}</div>` : ''}
        </div>
        
        <div class="scan-instruction">
          📱 Scan barcode after packing & at delivery to confirm
        </div>
        
        <div class="order-id">Order: #${orderId.slice(0, 8)} | ${new Date(orderDate).toLocaleDateString()}</div>
        
        <div class="footer">
          Handle with care • Keep dry • Deliver promptly
        </div>
      </div>
      
      <div class="no-print" style="margin-top: 20px; text-align: center;">
        <button onclick="window.print()" style="padding: 10px 20px; font-size: 16px; cursor: pointer;">
          🖨️ Print Sticker
        </button>
      </div>
    </body>
    </html>
  `;
};

// Open print dialog with sticker
export const printDeliverySticker = (
  barcode: string,
  customerName: string,
  customerPhone: string,
  address: any,
  orderId: string,
  deliveryMethod: string,
  orderDate: string
): void => {
  const stickerHtml = generateDeliverySticker(
    barcode,
    customerName,
    customerPhone,
    address,
    orderId,
    deliveryMethod,
    orderDate
  );
  
  const printWindow = window.open('', '_blank');
  if (printWindow) {
    printWindow.document.write(stickerHtml);
    printWindow.document.close();
  }
};
