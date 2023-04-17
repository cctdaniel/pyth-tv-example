import useSystemTheme from "@/hooks/useSystemTheme";
import React, { useEffect, useRef } from "react";

let tvScriptLoadingPromise: Promise<void> | undefined;

interface TradingViewWidgetProps {
  symbol: string;
  resolution: string;
}

function getCurrentTimezoneName() {
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  return timeZone;
}

const TradingViewWidget: React.FC<TradingViewWidgetProps> = ({
  symbol,
  resolution,
}) => {
  const systemTheme = useSystemTheme();
  const onLoadScriptRef = useRef<(() => void) | null>(null);
  const widgetRef = useRef<any>(null);

  useEffect(() => {
    onLoadScriptRef.current = createWidget;

    if (!tvScriptLoadingPromise) {
      tvScriptLoadingPromise = new Promise((resolve) => {
        const script = document.createElement("script");
        script.id = "tradingview-widget-loading-script";
        script.src = "https://s3.tradingview.com/tv.js";
        script.type = "text/javascript";
        script.onload = () => resolve();

        document.head.appendChild(script);
      });
    }

    tvScriptLoadingPromise.then(
      () => onLoadScriptRef.current && onLoadScriptRef.current()
    );

    return () => {
      onLoadScriptRef.current = null;
    };

    function createWidget() {
      if (document.getElementById("tradingview") && "TradingView" in window) {
        // Remove the existing widget if it exists
        if (widgetRef.current) {
          widgetRef.current.remove();
          widgetRef.current = null;
        }

        widgetRef.current = new (window as any).TradingView.widget({
          container_id: "tradingview",
          autosize: true,
          symbol: `PYTH:${symbol}`,
          interval: resolution,
          timezone: getCurrentTimezoneName(),
          theme: systemTheme,
          style: "1",
          locale: "en",
          toolbar_bg: "#f1f3f6",
          enable_publishing: false,
          allow_symbol_change: true,
        });
      }
    }
  }, [symbol, resolution, systemTheme]);

  return <div id="tradingview" className="w-screen h-screen" />;
};

export default TradingViewWidget;
