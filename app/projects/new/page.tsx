import { createProject } from "@/lib/actions";
import { redirect } from "next/navigation";
import { ArrowRight, Layers3, ShieldAlert, Workflow } from "lucide-react";

export default function NewProjectPage() {
  const action = async (formData: FormData) => {
    "use server";
    const project = await createProject(formData);
    redirect(`/projects/${project.id}/configure`);
  };

  return (
    <div className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr]">
      <div className="card card-strong p-7">
        <p className="eyebrow">Create</p>
        <h1 className="mt-5 text-4xl font-semibold tracking-tight text-white">New Audit Project</h1>
        <p className="mt-3 max-w-md text-sm leading-7 text-slate-300">
          Define the surface you want to test, then move into target configuration and run setup with a more controlled flow.
        </p>
        <div className="mt-8 space-y-3">
          {[
            { icon: Layers3, title: "Prompt-only", body: "Use for system prompts and instruction stacks without a live endpoint." },
            { icon: Workflow, title: "Endpoint", body: "Simulate request and response flows against your production interface." },
            { icon: ShieldAlert, title: "RAG", body: "Check grounding fidelity between retrieved chunks and final answers." }
          ].map(({ icon: Icon, title, body }) => (
            <div key={title} className="rounded-[24px] border border-white/10 bg-white/[0.03] p-4">
              <div className="flex items-center gap-3">
                <div className="grid h-10 w-10 place-items-center rounded-2xl border border-white/10 bg-white/5 text-violet-200">
                  <Icon size={18} />
                </div>
                <p className="font-semibold text-white">{title}</p>
              </div>
              <p className="mt-3 text-sm leading-6 text-slate-400">{body}</p>
            </div>
          ))}
        </div>
      </div>

      <form action={action} className="card p-6 md:p-8 space-y-5">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Project details</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-white">Set the audit context</p>
        </div>
        <div className="space-y-2">
          <label>Project name</label>
          <input name="name" placeholder="e.g., Enterprise IT Assistant" required />
        </div>
        <div className="space-y-2">
          <label>Description</label>
          <textarea name="description" rows={3} placeholder="Short context about this LLM application" />
        </div>
        <div className="space-y-2">
          <label>Target mode</label>
          <select name="targetType" defaultValue="Prompt-only">
            <option>Prompt-only</option>
            <option>Endpoint</option>
            <option>RAG</option>
          </select>
        </div>
        <div className="rounded-[24px] border border-white/10 bg-black/20 p-4 text-sm text-slate-400">
          The next step adapts to your chosen mode, so prompt-only, endpoint, and RAG targets each get a tailored configuration screen.
        </div>
        <button type="submit" className="button-primary">
          Continue <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}
