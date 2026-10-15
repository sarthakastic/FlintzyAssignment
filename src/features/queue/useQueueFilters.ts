import { useEffect, useRef, useState } from "react"
import { useSearchParams } from "react-router"
import type { Platform, PostStatus } from "@/features/posts/postsTypes"
import {
  readQueueFilters,
  withoutInvalidQueueFilters,
} from "@/features/posts/postFilters"

const searchDelayMs = 300

function applyFilterChange(
  current: URLSearchParams,
  change: {
    platform?: Platform | null
    status?: PostStatus | null
    search?: string
  },
) {
  const next = new URLSearchParams(current)

  if ("platform" in change) {
    if (change.platform) {
      next.set("platform", change.platform)
    } else {
      next.delete("platform")
    }
  }

  if ("status" in change) {
    if (change.status) {
      next.set("status", change.status)
    } else {
      next.delete("status")
    }
  }

  if ("search" in change) {
    const search = change.search?.trim() ?? ""
    if (search) {
      next.set("search", search)
    } else {
      next.delete("search")
    }
  }

  return next.toString() === current.toString() ? current : next
}

export function useQueueFilters() {
  const [searchParams, setSearchParams] = useSearchParams()
  const filters = readQueueFilters(searchParams)
  const [searchText, setSearchText] = useState(filters.search)
  const timerRef = useRef<number | null>(null)
  const requestRef = useRef(0)
  const ownSearchWrite = useRef<string | null>(null)

  function clearTimer() {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current)
      timerRef.current = null
    }
  }

  useEffect(() => {
    if (ownSearchWrite.current === filters.search) {
      ownSearchWrite.current = null
      return
    }

    requestRef.current += 1
    clearTimer()
    setSearchText(filters.search)
  }, [filters.search])

  useEffect(() => {
    const cleaned = withoutInvalidQueueFilters(searchParams)
    if (cleaned.toString() === searchParams.toString()) {
      return
    }

    setSearchParams(cleaned, { replace: true })
  }, [searchParams, setSearchParams])

  useEffect(() => () => clearTimer(), [])

  function commit(
    change: {
      platform?: Platform | null
      status?: PostStatus | null
      search?: string
    },
    replace: boolean,
  ) {
    requestRef.current += 1
    clearTimer()

    if ("search" in change) {
      ownSearchWrite.current = change.search?.trim() ?? ""
    }

    setSearchParams(
      (current) => applyFilterChange(current, change),
      { replace },
    )
  }

  function updateSearch(value: string) {
    setSearchText(value)
    clearTimer()
    const request = requestRef.current

    timerRef.current = window.setTimeout(() => {
      timerRef.current = null

      if (request !== requestRef.current) {
        return
      }

      const trimmed = value.trim()
      ownSearchWrite.current = trimmed
      setSearchParams(
        (current) => {
          if (request !== requestRef.current) {
            return current
          }

          return applyFilterChange(current, { search: trimmed })
        },
        { replace: true },
      )
    }, searchDelayMs)
  }

  function clearFilters() {
    setSearchText("")
    commit({ platform: null, status: null, search: "" }, false)
  }

  const hasActiveFilters = Boolean(
    filters.platform || filters.status || searchText.trim(),
  )

  return {
    platform: filters.platform,
    status: filters.status,
    searchText,
    hasActiveFilters,
    updateSearch,
    setPlatform: (platform: Platform | null) => {
      commit({ platform, search: searchText }, false)
    },
    setStatus: (status: PostStatus | null) => {
      commit({ status, search: searchText }, false)
    },
    clearFilters,
  }
}
