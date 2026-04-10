import { createProject } from "@/lib/actions";
import { redirect } from "next/navigation";
import { ArrowRight } from "lucide-react";

export default function NewProjectPage() {
  const action = async (formData: FormData) => {
    "use server";
    const project = await createProject(formData);
    redirect(`/projects/${project.id}/configure`);
  };

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <p className="text-sm text-brand-600 font-semibold">Create</p>
        <h1 className="text-3xl font-bold">New Audit Project</h1>
        <p className="text-slate-600 mt-2">Name the project and choose how you want to audit the target system.</p>
      </div>

      <form action={action} className="card p-6 space-y-4">
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
        <button type="submit" className="button-primary">
          Continue <ArrowRight size={16} />
        </button>
      </form>
    </div>
  );
}
