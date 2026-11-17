'use client';
import React, { useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Printer, Copy, ExternalLink } from 'lucide-react';

interface QRDisplayProps {
  token: string;
  locationName: string;
  size?: number;
}

export function QRCode({ token, locationName, size = 200 }: QRDisplayProps) {
  return (
    <div className="inline-block">
      <QRCodeSVG value={token} size={size} level="M" marginSize={2} bgColor="#ffffff" fgColor="#11151b" aria-label={`QR code for ${locationName}`} />
    </div>
  );
}

export function QRPreview({ token, locationName }: QRDisplayProps) {
  const scanUrl = `/scan/${token}`;
  const fullUrl = typeof window !== 'undefined' ? `${window.location.origin}${scanUrl}` : scanUrl;
  const previewRef = useRef<HTMLDivElement>(null);

  const escapeHtml = (value: string) => value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character] ?? character);

  const copyToClipboard = () => {
    navigator.clipboard.writeText(fullUrl).then(() => {
      alert('QR link copied to clipboard!');
    });
  };

  const printQR = () => {
    const printWindow = window.open('', '_blank');
    if (printWindow) {
      const qrSvg = previewRef.current?.querySelector('svg')?.outerHTML ?? '';
      printWindow.document.write(`
        <html><body style="display:flex;flex-direction:column;align-items:center;justify-content:center;padding:40px;font-family:sans-serif;">
          <h2>${escapeHtml(locationName)}</h2>
          <p style="color:#666;">Scan to Pay & Park</p>
          <div style="border:2px solid #000;padding:16px;margin:20px 0;background:#fff;">${qrSvg}</div>
          <p style="font-size:12px;color:#666;font-family:monospace;">${escapeHtml(token)}</p>
          <p style="font-size:12px;color:#999;">${escapeHtml(fullUrl)}</p>
          <script>window.print();<\/script>
        </body></html>
      `);
      printWindow.document.close();
    }
  };

  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm text-center">
      <div className="flex justify-center mb-4">
        <div ref={previewRef} className="p-4 bg-gray-50 rounded-xl border border-gray-100">
          <QRCode token={fullUrl} locationName={locationName} size={160} />
        </div>
      </div>

      <h3 className="font-semibold text-gray-900 mb-1">{locationName}</h3>
      <p className="text-xs text-gray-500 mb-1">QR Token:</p>
      <p className="text-xs font-mono text-gray-700 bg-gray-50 px-3 py-1 rounded-lg mb-4 break-all">{token}</p>
      
      <div className="flex gap-2 justify-center flex-wrap">
        <a
          href={scanUrl}
          className="flex items-center gap-1.5 px-3 py-2 bg-blue-600 text-white text-xs font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          <ExternalLink className="w-3 h-3" /> Open Link
        </a>
        <button
          onClick={copyToClipboard}
          className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Copy className="w-3 h-3" /> Copy Link
        </button>
        <button
          onClick={printQR}
          className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 text-gray-700 text-xs font-medium rounded-lg hover:bg-gray-200 transition-colors"
        >
          <Printer className="w-3 h-3" /> Print
        </button>
      </div>
    </div>
  );
}
