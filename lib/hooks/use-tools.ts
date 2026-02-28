"use client";

import { useCallback, useEffect, useState } from "react";
import { Tool } from "../types";
import { defaultTools } from "../mock-data";

const STORAGE_KEY = "toolvault-tools";

function loadTools(): Tool[] {
  if (typeof window === "undefined") return defaultTools;
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      const parsed = JSON.parse(stored) as Tool[];
      return parsed.length > 0 ? parsed : defaultTools;
    }
  } catch {
    // ignore parse errors
  }
  return defaultTools;
}

function saveTools(tools: Tool[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tools));
}

export function useTools() {
  const [tools, setTools] = useState<Tool[]>(defaultTools);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setTools(loadTools());
    setLoaded(true);
  }, []);

  const addTool = useCallback((tool: Tool) => {
    setTools((prev) => {
      const next = [tool, ...prev];
      saveTools(next);
      return next;
    });
  }, []);

  const deleteTool = useCallback((id: string) => {
    setTools((prev) => {
      const next = prev.filter((t) => t.id !== id);
      saveTools(next);
      return next;
    });
  }, []);

  const updateTool = useCallback((id: string, updates: Partial<Tool>) => {
    setTools((prev) => {
      const next = prev.map((t) => (t.id === id ? { ...t, ...updates } : t));
      saveTools(next);
      return next;
    });
  }, []);

  const getToolById = useCallback(
    (id: string): Tool | undefined => {
      return tools.find((t) => t.id === id);
    },
    [tools]
  );

  const resetToDefaults = useCallback(() => {
    if (typeof window !== "undefined") {
      localStorage.removeItem(STORAGE_KEY);
    }
    setTools(defaultTools);
  }, []);

  return { tools, loaded, addTool, deleteTool, updateTool, getToolById, resetToDefaults };
}
