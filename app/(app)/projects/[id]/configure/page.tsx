import { prisma } from "@/lib/prisma";
import { updateTargetConfig } from "@/lib/actions";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Card, Button, EmptyState } from "@/components/ui/base";
import { Field, inputClass, monoInputClass } from "@/components/ui/form";
import { Eyebrow } from "@/components/ui/base";
import { getDemoProject } from "@/lib/demo-data";
import { ChevronLeft, Inbox } from "lucide-react";

export const dynamic = "force-dynamic";

const targetTypes = [
  { value: "Prompt-only", label: "Prompt-only", desc: "System prompt & instruction stack" },
  { value: "Endpoint", label: "HTTP endpoint", desc: "Live request / response flow" },
  { value: "RAG", label: "RAG setup", desc: "Grounding vs retrieved chunks" }
];

export default async function ConfigurePage({ params }: { params: { id: string } }) {
  let project = null;
  try {
    project = await prisma.project.findUnique({ where: { id: params.id }, include: { targetConfig: true } });
  } catch {
    // Unreadable DB (read-only hosted demo) — fall through to demo fallback / not found.
  }
  // Hosted demo has no writable DB — fall back to the seeded demo project so the
  // configure screen is viewable end to end rather than a dead-end.
  if (!project && params.id === "demo-project") {
    project = getDemoProject();
  }
  if (!project) {
    return (
      <EmptyState icon={Inbox} title="Project not found" body="This project may have been removed." />
    );
  }

  const action = async (formData: FormData) => {
    "use server";
    await updateTargetConfig(project.id, formData);
    redirect(`/projects/${project.id}`);
  };

  const t = project.targetConfig;

  return (
    <div className="mx-auto max-w-[820px]">
      <Eyebrow>New project · step 2 of 3</Eyebrow>
      <h1 className="mt-3 text-[1.8125rem] font-[720] tracking-[-0.02em] text-ink">Configure your target</h1>
      <p className="mt-2 text-[0.9375rem] leading-6 text-ink-3">
        Provide enough detail for the audit to generate meaningful attack cases and scoring.
      </p>

      <form action={action} className="mt-8 space-y-5">
        <input type="hidden" name="targetType" value={project.targetType} />

        <Card>
          <Field label="Project name">
            <input className={inputClass} defaultValue={project.name} disabled />
          </Field>
        </Card>

        {/* Target type selector (reflects the type chosen at creation) */}
        <Card>
          <p className="text-sm font-medium text-ink-2">Target type</p>
          <div className="mt-3 grid gap-3 sm:grid-cols-3">
            {targetTypes.map((tt) => {
              const selected = tt.value === project.targetType;
              return (
                <div
                  key={tt.value}
                  className={
                    "rounded-control border p-3.5 " +
                    (selected ? "border-accent bg-accent-soft" : "border-line bg-surface opacity-70")
                  }
                >
                  <p className="text-sm font-semibold text-ink">{tt.label}</p>
                  <p className="mt-1 text-xs leading-5 text-ink-4">{tt.desc}</p>
                </div>
              );
            })}
          </div>
          <p className="mt-3 text-xs text-ink-4">Target type is set when the project is created.</p>
        </Card>

        {project.targetType === "Prompt-only" && (
          <Card className="space-y-5">
            <Field label="System prompt">
              <textarea name="systemPrompt" defaultValue={t?.systemPrompt ?? ""} required rows={4} className={monoInputClass} />
            </Field>
            <Field label="Developer instructions">
              <textarea name="developerInstructions" defaultValue={t?.developerInstructions ?? ""} rows={3} className={monoInputClass} />
            </Field>
            <Field label="Example user prompt">
              <textarea name="exampleUserPrompt" defaultValue={t?.exampleUserPrompt ?? ""} rows={2} className={inputClass} />
            </Field>
          </Card>
        )}

        {project.targetType === "Endpoint" && (
          <Card className="space-y-5">
            <div className="grid gap-4 md:grid-cols-[1fr_140px]">
              <Field label="Endpoint URL">
                <input name="endpointUrl" defaultValue={t?.endpointUrl ?? ""} required className={monoInputClass} placeholder="https://api.example.com/chat" />
              </Field>
              <Field label="Method">
                <select name="httpMethod" defaultValue={t?.httpMethod ?? "POST"} className={inputClass}>
                  <option>POST</option>
                  <option>GET</option>
                  <option>PUT</option>
                </select>
              </Field>
            </div>
            <Field label="Request body template" hint="Use {{prompt}} where the attack text should be injected.">
              <textarea
                name="requestTemplate"
                rows={4}
                defaultValue={t?.requestTemplate ?? ""}
                className={monoInputClass}
                placeholder='{"messages":[{"role":"user","content":"{{prompt}}"}]}'
              />
            </Field>
            <div className="grid gap-4 md:grid-cols-2">
              <Field label="Auth token" hint={t?.authTokenMasked ? `Stored: ${t.authTokenMasked}` : "Masked before storage."}>
                <input type="password" name="authToken" placeholder="sk-..." className={inputClass} />
              </Field>
              <Field label="Message field path">
                <input name="messageFieldPath" defaultValue={t?.messageFieldPath ?? "messages.0.content"} className={monoInputClass} />
              </Field>
            </div>
          </Card>
        )}

        {project.targetType === "RAG" && (
          <Card className="space-y-5">
            <Field label="Sample user query">
              <input name="ragQuery" defaultValue={t?.ragQuery ?? "How do I reset VPN?"} className={inputClass} />
            </Field>
            <Field label="Retrieved chunks" hint="Only these facts are considered grounded.">
              <textarea
                name="ragChunks"
                rows={4}
                defaultValue={t?.ragChunks ?? "VPN resets require MFA verification. Logs are stored for 30 days."}
                className={monoInputClass}
              />
            </Field>
            <Field label="Model response">
              <textarea name="ragResponse" rows={3} defaultValue={t?.ragResponse ?? "I can reset VPN without MFA."} className={monoInputClass} />
            </Field>
          </Card>
        )}

        <div className="flex items-center justify-between">
          <Link href={`/projects/${project.id}`} className="inline-flex items-center gap-1.5 rounded-control px-4 py-2.5 text-sm font-semibold text-ink-3 hover:bg-accent-soft hover:text-ink">
            <ChevronLeft size={15} /> Back
          </Link>
          <Button type="submit" variant="primary">
            Save configuration
          </Button>
        </div>
      </form>
    </div>
  );
}
