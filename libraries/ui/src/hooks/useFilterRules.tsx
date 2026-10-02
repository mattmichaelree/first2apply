"use client"

import { useEffect, useState } from "react"
import type {
  UpsertUserFilterRuleInput,
  UserFilterRule,
} from "@first2apply/core"

import { useError } from "./useError"
import { useIntelligenceSdk } from "./useIntelligenceSdk"

export function useFilterRules() {
  const sdk = useIntelligenceSdk()
  const { handleError } = useError()

  const [isLoading, setIsLoading] = useState(true)
  const [rules, setRules] = useState<UserFilterRule[]>([])

  const reloadRules = async () => {
    try {
      setIsLoading(true)
      setRules(await sdk.listUserFilterRules())
    } catch (error) {
      handleError({ error, title: "Failed to load filter rules" })
    } finally {
      setIsLoading(false)
    }
  }

  const saveRule = async (input: UpsertUserFilterRuleInput) => {
    try {
      const saved = await sdk.upsertUserFilterRule(input)
      setRules((current) => {
        const exists = current.some((rule) => rule.id === saved.id)
        if (exists) {
          return current.map((rule) => (rule.id === saved.id ? saved : rule))
        }
        return [...current, saved].sort((a, b) => a.id - b.id)
      })
      return saved
    } catch (error) {
      handleError({ error, title: "Failed to save filter rule" })
      throw error
    }
  }

  const deleteRule = async (ruleId: number) => {
    try {
      await sdk.deleteUserFilterRule(ruleId)
      setRules((current) => current.filter((rule) => rule.id !== ruleId))
    } catch (error) {
      handleError({ error, title: "Failed to delete filter rule" })
      throw error
    }
  }

  useEffect(() => {
    reloadRules()
  }, [])

  return {
    isLoading,
    rules,
    reloadRules,
    saveRule,
    deleteRule,
  }
}
