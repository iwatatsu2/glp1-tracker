"use client"

import { useState, useEffect } from "react"
import { getSupabase } from "@/lib/supabase"
import type { User } from "@supabase/supabase-js"

const GLP1_TRACKER_APP_ID = "dd76f4e0-b77b-417f-9ad6-3531fbcc7662"
const PLATFORM_OWNER_ID = "435575ca-4166-4025-994c-c081b8f38609"

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [profileId, setProfileId] = useState<string | null>(null)
  const [purchased, setPurchased] = useState<boolean | null>(null)

  useEffect(() => {
    const supabase = getSupabase()

    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
      if (data.user) {
        ensureProfile(data.user.id)
        checkPurchase(data.user.id)
      }
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      const newUser = session?.user ?? null
      setUser(newUser)
      if (newUser) {
        ensureProfile(newUser.id)
        checkPurchase(newUser.id)
      } else {
        setProfileId(null)
        setPurchased(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  async function ensureProfile(authUserId: string) {
    const supabase = getSupabase()
    const { data } = await supabase
      .from("tracker_profiles")
      .select("id")
      .eq("auth_user_id", authUserId)
      .single()

    if (data) {
      setProfileId(data.id)
    } else {
      const { data: newProfile } = await supabase
        .from("tracker_profiles")
        .insert({ auth_user_id: authUserId })
        .select("id")
        .single()
      if (newProfile) {
        setProfileId(newProfile.id)
      }
    }
  }

  async function checkPurchase(authUserId: string) {
    // Platform owner always has access
    if (authUserId === PLATFORM_OWNER_ID) {
      setPurchased(true)
      return
    }

    const supabase = getSupabase()
    const { data } = await supabase
      .from("purchases")
      .select("id")
      .eq("user_id", authUserId)
      .eq("app_id", GLP1_TRACKER_APP_ID)
      .single()

    setPurchased(!!data)
  }

  async function signOut() {
    const supabase = getSupabase()
    await supabase.auth.signOut()
  }

  return { user, profileId, loading, purchased, signOut }
}
