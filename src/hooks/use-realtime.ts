"use client";

import { useEffect, useRef, useState } from "react";
import { supabase } from "@/lib/supabase";


export function useRealtime<T extends { id: string }>(
  table: string,
  filter?: string,
  options?: {
    enabled?: boolean;
    onInsert?: (record: T) => void;
    onUpdate?: (record: T) => void;
    onDelete?: (oldRecord: T) => void;
  }
) {
  const { enabled = true, onInsert, onUpdate, onDelete } = options || {};
  const [records, setRecords] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null);
  const onInsertRef = useRef(onInsert);
  const onUpdateRef = useRef(onUpdate);
  const onDeleteRef = useRef(onDelete);

  useEffect(() => {
    onInsertRef.current = onInsert;
    onUpdateRef.current = onUpdate;
    onDeleteRef.current = onDelete;
  }, [onInsert, onUpdate, onDelete]);

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;
    const channelName = `realtime:${table}:${filter || "all"}`;

    async function load() {
      try {
        let query = supabase.from(table).select("*");
        if (filter) {
          const [column, value] = filter.split("=");
          if (column && value) {
            query = query.eq(column, value);
          }
        }
        const { data, error } = await query;
        if (error) throw error;
        if (!cancelled) {
          setRecords(data || []);
          setLoading(false);
        }
      } catch (err) {
        if (!cancelled) {
          console.error(`Failed to load ${table}:`, err);
          setLoading(false);
        }
      }
    }

    load();

    const channel = supabase
      .channel(channelName)
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table, filter: filter || undefined },
        (payload) => {
          const newRecord = payload.new as T;
          onInsertRef.current?.(newRecord);
          setRecords((prev) => [...prev, newRecord]);
        }
      )
      .on(
        "postgres_changes",
        { event: "UPDATE", schema: "public", table, filter: filter || undefined },
        (payload) => {
          const updatedRecord = payload.new as T;
          onUpdateRef.current?.(updatedRecord);
          setRecords((prev) =>
            prev.map((r) => (r.id === updatedRecord.id ? updatedRecord : r))
          );
        }
      )
      .on(
        "postgres_changes",
        { event: "DELETE", schema: "public", table, filter: filter || undefined },
        (payload) => {
          const oldRecord = payload.old as T;
          onDeleteRef.current?.(oldRecord);
          setRecords((prev) => prev.filter((r) => r.id !== oldRecord.id));
        }
      )
      .subscribe();

    channelRef.current = channel;

    return () => {
      cancelled = true;
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current);
      }
    };
  }, [table, filter, enabled]);

  return { records, loading, setRecords };
}
