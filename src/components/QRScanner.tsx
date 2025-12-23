import { useState, useEffect, useRef } from "react";
import { Html5Qrcode } from "html5-qrcode";
import { motion } from "framer-motion";
import { Camera, X, QrCode } from "lucide-react";
import { Button } from "./ui/button";

interface QRScannerProps {
  onScan: (result: string) => void;
  onClose: () => void;
}

export const QRScanner = ({ onScan, onClose }: QRScannerProps) => {
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scannerRef = useRef<Html5Qrcode | null>(null);

  useEffect(() => {
    const startScanner = async () => {
      try {
        const scanner = new Html5Qrcode("qr-reader");
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            scanner.stop();
            onScan(decodedText);
          },
          (errorMessage) => {
            // Ignore scan errors, just means no QR detected yet
          }
        );
        setIsScanning(true);
      } catch (err) {
        setError("Camera access denied or not available");
        console.error(err);
      }
    };

    startScanner();

    return () => {
      if (scannerRef.current?.isScanning) {
        scannerRef.current.stop();
      }
    };
  }, [onScan]);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 bg-foreground/80 backdrop-blur-sm flex items-center justify-center p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-card rounded-2xl shadow-xl max-w-md w-full overflow-hidden"
      >
        <div className="p-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            <h3 className="font-display font-semibold">Scan QR Code</h3>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full"
          >
            <X className="w-5 h-5" />
          </Button>
        </div>

        <div className="relative aspect-square bg-foreground/5">
          {error ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center p-6 text-center">
              <Camera className="w-12 h-12 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">{error}</p>
              <Button
                variant="outline"
                className="mt-4"
                onClick={() => window.location.reload()}
              >
                Try Again
              </Button>
            </div>
          ) : (
            <>
              <div id="qr-reader" className="w-full h-full" />
              {isScanning && (
                <div className="absolute inset-0 pointer-events-none">
                  {/* Scan line animation */}
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64">
                    <div className="absolute inset-0 border-2 border-primary rounded-lg" />
                    <div className="absolute inset-0 overflow-hidden rounded-lg">
                      <div className="h-1 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line" />
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        <div className="p-4 text-center text-sm text-muted-foreground">
          Position the QR code within the frame to scan
        </div>
      </motion.div>
    </motion.div>
  );
};
