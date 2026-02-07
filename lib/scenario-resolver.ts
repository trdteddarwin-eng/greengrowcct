import { scenarios } from "@/lib/scenarios";
import { supabase } from "@/lib/supabase";
import type { Scenario, CustomScenarioData } from "@/lib/types";

export interface ResolvedScenario {
  scenario: Scenario;
  documentContext?: string;
}

/**
 * Resolves a scenario by ID. Checks hardcoded scenarios first,
 * then falls back to custom scenarios in Supabase (prefixed with "custom_").
 */
export async function resolveScenario(
  id: string
): Promise<ResolvedScenario | null> {
  // Check hardcoded scenarios first
  const hardcoded = scenarios.find((s) => s.id === id);
  if (hardcoded) {
    return { scenario: hardcoded };
  }

  // Check custom scenarios (ID format: custom_<uuid>)
  if (id.startsWith("custom_")) {
    const uuid = id.slice("custom_".length);

    const { data, error } = await supabase
      .from("custom_scenarios")
      .select("*")
      .eq("id", uuid)
      .single();

    if (error || !data) return null;

    const cs = data as CustomScenarioData;

    const scenario: Scenario = {
      id: `custom_${cs.id}`,
      name: cs.name,
      category: "custom",
      difficulty: cs.difficulty,
      industry: cs.industry || undefined,
      prospectName: cs.prospect_name,
      prospectRole: cs.prospect_role,
      prospectCompany: cs.prospect_company,
      description: cs.description,
      prospectBehavior: cs.prospect_behavior,
      hook: cs.hook || undefined,
      icon: cs.icon || "🎯",
    };

    return {
      scenario,
      documentContext: cs.document_context ?? undefined,
    };
  }

  return null;
}
