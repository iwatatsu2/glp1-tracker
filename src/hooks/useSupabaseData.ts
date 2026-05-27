"use client"

import { useState, useEffect, useCallback } from "react"
import { getSupabase } from "@/lib/supabase"
import type {
  WeightRecord,
  InjectionRecord,
  SideEffectRecord,
  InjectionSite,
  Symptom,
  Medication,
} from "@/lib/data"

// ── Profile ──
export interface Profile {
  id: string
  display_name: string | null
  height: number | null
  medication: Medication
  current_dose: string | null
  injection_weekday: number | null
}

export function useProfile(profileId: string | null) {
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!profileId) return
    const supabase = getSupabase()
    const { data } = await supabase
      .from("tracker_profiles")
      .select("*")
      .eq("id", profileId)
      .single()
    if (data) {
      setProfile({
        id: data.id,
        display_name: data.display_name,
        height: data.height ? Number(data.height) : null,
        medication: (data.medication || "wegovy") as Medication,
        current_dose: data.current_dose,
        injection_weekday: data.injection_weekday,
      })
    }
    setLoading(false)
  }, [profileId])

  useEffect(() => { fetch() }, [fetch])

  async function updateProfile(updates: Partial<Omit<Profile, "id">>) {
    if (!profileId) return
    const supabase = getSupabase()
    await supabase
      .from("tracker_profiles")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", profileId)
    await fetch()
  }

  return { profile, loading, updateProfile, refetch: fetch }
}

// ── Weight Logs ──
export function useWeightLogs(profileId: string | null) {
  const [records, setRecords] = useState<WeightRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!profileId) return
    const supabase = getSupabase()
    const { data } = await supabase
      .from("tracker_weight_logs")
      .select("*")
      .eq("user_id", profileId)
      .order("recorded_date", { ascending: true })

    if (data) {
      setRecords(data.map(r => ({
        id: r.id,
        date: new Date(r.recorded_date),
        weight: Number(r.weight),
        dosage: r.dosage ? Number(r.dosage) : 0,
      })))
    }
    setLoading(false)
  }, [profileId])

  useEffect(() => { fetch() }, [fetch])

  async function addWeight(weight: number, dosage: number) {
    if (!profileId) return
    const supabase = getSupabase()
    const today = new Date().toISOString().split("T")[0]
    await supabase.from("tracker_weight_logs").upsert(
      { user_id: profileId, recorded_date: today, weight, dosage },
      { onConflict: "user_id,recorded_date" }
    )
    await fetch()
  }

  return { records, loading, addWeight, refetch: fetch }
}

// ── Injection Logs ──
export function useInjectionLogs(profileId: string | null) {
  const [records, setRecords] = useState<InjectionRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!profileId) return
    const supabase = getSupabase()
    const { data } = await supabase
      .from("tracker_injection_logs")
      .select("*")
      .eq("user_id", profileId)
      .order("injected_at", { ascending: false })

    if (data) {
      setRecords(data.map(r => ({
        id: r.id,
        date: new Date(r.injected_at),
        site: r.site as InjectionSite,
        dosage: Number(r.dosage),
        notes: r.notes || undefined,
      })))
    }
    setLoading(false)
  }, [profileId])

  useEffect(() => { fetch() }, [fetch])

  async function addInjection(site: InjectionSite, dosage: number, notes?: string) {
    if (!profileId) return
    const supabase = getSupabase()
    await supabase.from("tracker_injection_logs").insert({
      user_id: profileId,
      injected_at: new Date().toISOString(),
      site,
      dosage,
      notes,
    })
    await fetch()
  }

  return { records, loading, addInjection, refetch: fetch }
}

// ── Side Effects ──
export function useSideEffects(profileId: string | null) {
  const [records, setRecords] = useState<SideEffectRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetch = useCallback(async () => {
    if (!profileId) return
    const supabase = getSupabase()
    const { data } = await supabase
      .from("tracker_side_effects")
      .select("*")
      .eq("user_id", profileId)
      .order("recorded_at", { ascending: false })

    if (data) {
      // Group by date for SideEffectRecord format
      const grouped = new Map<string, SideEffectRecord>()
      for (const r of data) {
        const dateKey = r.recorded_at.split("T")[0]
        if (!grouped.has(dateKey)) {
          grouped.set(dateKey, {
            id: r.id,
            date: new Date(r.recorded_at),
            daysAfterInjection: r.days_after_injection || 0,
            symptoms: [],
            notes: r.notes || undefined,
          })
        }
        grouped.get(dateKey)!.symptoms.push({
          symptom: r.symptom as Symptom,
          severity: r.severity,
        })
      }
      setRecords(Array.from(grouped.values()))
    }
    setLoading(false)
  }, [profileId])

  useEffect(() => { fetch() }, [fetch])

  async function addSideEffect(
    symptom: Symptom,
    severity: number,
    daysAfterInjection: number,
    notes?: string
  ) {
    if (!profileId) return
    const supabase = getSupabase()
    await supabase.from("tracker_side_effects").insert({
      user_id: profileId,
      symptom,
      severity,
      days_after_injection: daysAfterInjection,
      notes,
    })
    await fetch()
  }

  return { records, loading, addSideEffect, refetch: fetch }
}
