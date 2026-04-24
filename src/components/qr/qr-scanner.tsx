import { useEffect, useId, useRef, useState } from 'react';

import { Html5Qrcode } from 'html5-qrcode';

export const QrScanner = ({
  enabled,
  onScan,
}: {
  enabled: boolean;
  onScan: (value: string) => void | Promise<void>;
}) => {
  const scannerId = useId().replace(/:/g, '-');
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [error, setError] = useState<string | null>(null);
  const lastValue = useRef<string | null>(null);

  useEffect(() => {
    if (!enabled) return undefined;

    const scanner = new Html5Qrcode(scannerId);
    scannerRef.current = scanner;
    let mounted = true;

    scanner
      .start(
        { facingMode: 'environment' },
        { fps: 10, qrbox: { width: 240, height: 240 } },
        async (decodedText) => {
          if (decodedText === lastValue.current) return;
          lastValue.current = decodedText;
          await onScan(decodedText);
        },
        () => undefined,
      )
      .catch((scanError) => {
        if (mounted) {
          setError(scanError instanceof Error ? scanError.message : 'Unable to access the camera.');
        }
      });

    return () => {
      mounted = false;
      const activeScanner = scannerRef.current;
      scannerRef.current = null;

      if (activeScanner?.isScanning) {
        void activeScanner.stop().then(() => activeScanner.clear()).catch(() => undefined);
      } else {
        void activeScanner?.clear();
      }
    };
  }, [enabled, onScan, scannerId]);

  return (
    <div className="space-y-3">
      <div className="overflow-hidden rounded-[28px] border border-surface-soft bg-white p-3">
        <div id={scannerId} />
      </div>
      {error ? <p className="text-sm text-danger">{error}</p> : null}
    </div>
  );
};
