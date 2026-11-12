"use client"

import { createContext, useContext } from "react"
import type { CareerOsApiSdk } from "@careeros/core"

const SdkContext = createContext<CareerOsApiSdk | null>(null)

/**
 * Provider component to inject the SDK into the React tree.
 * Each app (desktop/webapp) must wrap its root with this provider
 * and pass its own SDK implementation.
 */
export function SdkProvider({
  sdk,
  children,
}: {
  sdk: CareerOsApiSdk
  children: React.ReactNode
}) {
  return <SdkContext.Provider value={sdk}>{children}</SdkContext.Provider>
}

/**
 * Hook to access the CareerOS SDK from any component.
 * Must be used within a SdkProvider.
 */
export function useSdk(): CareerOsApiSdk {
  const sdk = useContext(SdkContext)
  if (!sdk) {
    throw new Error("useSdk must be used within a SdkProvider")
  }
  return sdk
}
