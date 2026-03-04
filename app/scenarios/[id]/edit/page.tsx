"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import ScenarioWizard from "@/components/ScenarioWizard";
import type { ScenarioInitialData } from "@/components/ScenarioWizard";
import type { Difficulty } from "@/lib/types";

export default function EditScenarioPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const [initialData, setInitialData] = useState<ScenarioInitialData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        const res = await fetch(`/api/scenarios/${params.id}`);
        if (!res.ok) {
          router.push("/scenarios");
          return;
        }
        const { scenario } = await res.json();
        setInitialData({
          name: scenario.name,
          difficulty: scenario.difficulty as Difficulty,
          industry: scenario.industry,
          persona: {
            name: scenario.prospect_name,
            role: scenario.prospect_role,
            company: scenario.prospect_company,
            description: scenario.description,
            behavior: scenario.prospect_behavior,
            hook: scenario.hook,
            icon: scenario.icon,
          },
          documentText: scenario.document_context ?? "",
          documentName: scenario.document_name ?? "",
        });
      } catch {
        router.push("/scenarios");
      } finally {
        setLoading(false);
      }
    }
    load();
  }, [params.id, router]);

  if (loading) {
    return (
      <div className="flex justify-center py-16">
        <div className="w-8 h-8 border-2 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!initialData) return null;

  return (
    <div className="py-8">
      <h1 className="text-3xl font-bold tracking-tight text-white mb-8">
        Edit Scenario
      </h1>
      <ScenarioWizard editId={params.id} initialData={initialData} />
    </div>
  );
}
