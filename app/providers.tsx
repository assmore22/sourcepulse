"use client";

import "@rainbow-me/rainbowkit/styles.css";
import { useState, type ReactNode } from "react";
import { RainbowKitProvider, connectorsForWallets, darkTheme } from "@rainbow-me/rainbowkit";
import { injectedWallet } from "@rainbow-me/rainbowkit/wallets";
import { WagmiProvider, createConfig, http } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { studionetChain } from "@/lib/studionet";

export const WALLETCONNECT_PROJECT_ID = (process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? "").trim();
const APP_NAME = "SourcePulse";

const connectors = connectorsForWallets([{
  groupName: "Installed",
  wallets: [injectedWallet],
}], {
  appName: APP_NAME,
  projectId: WALLETCONNECT_PROJECT_ID || "sourcepulse-local-dev",
});

const config = createConfig({
  chains: [studionetChain],
  connectors,
  transports: { [studionetChain.id]: http(studionetChain.rpcUrls.default.http[0]) },
  ssr: true,
});

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient());
  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          initialChain={studionetChain}
          theme={darkTheme({ accentColor: "#4ADE80", accentColorForeground: "#070A0D", borderRadius: "small", overlayBlur: "small" })}
        >
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
