import { prisma } from "@/lib/prisma";
import { updateTargetConfig } from "@/lib/actions";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

export default async function ConfigurePage({ params }: { params: { id: string } }) {
  const project = await prisma.project.findUnique({ where: { id: params.id }, include: { targetConfig: true } });
  if (!project) return <p className="text-slate-600">Project not found.</p>;

  const action = async (formData: FormData) => {
    "use server";
    await updateTargetConfig(project.id, formData);
    redirect(`/projects/${project.id}`);
  };

  const t = project.targetConfig;

  return (
    <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
      <div className="card card-strong p-7">
        <p className="eyebrow">Target</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white">Configure {project.targetType}</h1>
        <p className="mt-3 text-sm leading-7 text-slate-300">Provide enough detail for the audit simulator to generate meaningful attack cases and scoring.</p>
        <div className="mt-8 space-y-3">
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <p className="metric-kicker">Project</p>
            <p className="mt-2 text-lg font-semibold text-white">{project.name}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <p className="metric-kicker">Mode</p>
            <p className="mt-2 text-lg font-semibold text-white">{project.targetType}</p>
          </div>
          <div className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
            <p className="metric-kicker">Guidance</p>
            <p className="mt-2 text-sm leading-6 text-slate-400">Be explicit. Better target configuration produces sharper findings and more credible remediations.</p>
          </div>
        </div>
      </div>
      <form action={action} className="card p-6 md:p-8 space-y-5">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Configuration</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-white">Provide target details</p>
        </div>
        <input type="hidden" name="targetType" value={project.targetType} />
        {project.targetType === "Prompt-only" && (
          <>
            <div className="space-y-2">
              <label>System prompt</label>
              <textarea name="systemPrompt" defaultValue={t?.systemPrompt ?? ""} required rows={4} />
            </div>
            <div className="space-y-2">
              <label>Developer instructions</label>
              <textarea name="developerInstructions" defaultValue={t?.developerInstructions ?? ""} rows={3} />
            </div>
            <div className="space-y-2">
              <label>Example user prompt</label>
              <textarea name="exampleUserPrompt" defaultValue={t?.exampleUserPrompt ?? ""} rows={2} />
            </div>
          </>
        )}
        {project.targetType === "Endpoint" && (
          <>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label>Endpoint URL</label>
                <input name="endpointUrl" defaultValue={t?.endpointUrl ?? ""} required />
              </div>
              <div className="space-y-2">
                <label>HTTP method</label>
                <select name="httpMethod" defaultValue={t?.httpMethod ?? "POST"}>
                  <option>POST</option>
                  <option>GET</option>
                  <option>PUT</option>
                </select>
              </div>
            </div>
            <div className="space-y-2">
              <label>Request body template</label>
              <textarea
                name="requestTemplate"
                rows={4}
                defaultValue={t?.requestTemplate ?? ""}
                placeholder='{"messages":[{"role":"user","content":"{{prompt}}"}]}'
              />
            </div>
            <div className="grid md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label>Auth token (masked)</label>
                <input type="password" name="authToken" placeholder="sk-..." />
                {t?.authTokenMasked && <p className="text-xs text-slate-500">Stored token: {t.authTokenMasked}</p>}
              </div>
              <div className="space-y-2">
                <label>Message field path</label>
                <input name="messageFieldPath" defaultValue={t?.messageFieldPath ?? "messages.0.content"} />
              </div>
            </div>
          </>
        )}
        {project.targetType === "RAG" && (
          <>
            <div className="space-y-2">
              <label>Sample user query</label>
              <input name="ragQuery" defaultValue={t?.ragQuery ?? "How do I reset VPN?"} />
            </div>
            <div className="space-y-2">
              <label>Retrieved chunks</label>
              <textarea
                name="ragChunks"
                rows={4}
                defaultValue={t?.ragChunks ?? "VPN resets require MFA verification. Logs are stored for 30 days."}
              />
            </div>
            <div className="space-y-2">
              <label>Model response</label>
              <textarea name="ragResponse" rows={3} defaultValue={t?.ragResponse ?? "I can reset VPN without MFA."} />
            </div>
          </>
        )}

        <button type="submit" className="button-primary">
          Save configuration
        </button>
      </form>
    </div>
  );
}
