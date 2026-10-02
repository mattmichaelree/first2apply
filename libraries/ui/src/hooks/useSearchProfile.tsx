"use client"

import { useEffect, useState } from "react"
import type {
  UpsertUserSearchProfileInput,
  UserSearchProfile,
} from "@careeros/core"

import { useError } from "./useError"
import { useIntelligenceSdk } from "./useIntelligenceSdk"

export function useSearchProfile() {
  const sdk = useIntelligenceSdk()
  const { handleError } = useError()

  const [isLoading, setIsLoading] = useState(true)
  const [profile, setProfile] = useState<UserSearchProfile | null>(null)

  const reloadProfile = async () => {
    try {
      setIsLoading(true)
      setProfile(await sdk.getUserSearchProfile())
    } catch (error) {
      handleError({ error, title: "Failed to load search profile" })
    } finally {
      setIsLoading(false)
    }
  }

  const saveProfile = async (input: UpsertUserSearchProfileInput) => {
    try {
      const updated = await sdk.upsertUserSearchProfile(input)
      setProfile(updated)
      return updated
    } catch (error) {
      handleError({ error, title: "Failed to save search profile" })
      throw error
    }
  }

  useEffect(() => {
    reloadProfile()
  }, [])

  return {
    isLoading,
    profile,
    reloadProfile,
    saveProfile,
  }
}
