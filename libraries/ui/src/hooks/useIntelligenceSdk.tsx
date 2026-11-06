"use client"

import type {
  ExtendedCareerOsApiSdk,
  FullProductApiSdk,
  JobIntelligenceApiSdk,
} from "@careeros/core"

import { useSdk } from "./useSdk"

export function hasIntelligenceSdk(
  sdk: ExtendedCareerOsApiSdk
): sdk is FullProductApiSdk {
  return (
    typeof sdk.getUserSearchProfile === "function" &&
    typeof sdk.upsertUserSearchProfile === "function" &&
    typeof sdk.listUserFilterRules === "function" &&
    typeof sdk.upsertUserFilterRule === "function" &&
    typeof sdk.deleteUserFilterRule === "function" &&
    typeof sdk.listRankedJobs === "function" &&
    typeof sdk.getJobIntelligence === "function"
  )
}

/**
 * Access the shared SDK with the transitional extended type.
 *
 * This is useful while the inherited app and the new intelligence layer
 * coexist on the same client object.
 */
export function useExtendedSdk(): ExtendedCareerOsApiSdk {
  return useSdk() as ExtendedCareerOsApiSdk
}

/**
 * Access only the intelligence-capable surface.
 *
 * Throws a clear error until the current app shell wires an SDK that
 * includes the new intelligence methods.
 */
export function useIntelligenceSdk(): JobIntelligenceApiSdk {
  const sdk = useExtendedSdk()
  if (!hasIntelligenceSdk(sdk)) {
    throw new Error(
      "useIntelligenceSdk requires an SDK implementation with intelligence methods"
    )
  }
  return sdk
}
