import { createProject } from "@/lib/actions";
import { redirect } from "next/navigation";
import { ZodError } from "zod";
import { ArrowRight } from "lucide-react";
import { Card, Button, Eyebrow, ErrorBanner } from "@/components/ui/base";
import { Field, inputClass } from "@/components/ui/form";

export default function NewProjectPage({ searchParams }: { searchParams?: { error?: string } }) {
  const action = async (formData: FormData) => {
    "use server";
    let project;
    try {
      project = await createProject(formData);
    } catch (error) {
      if (error instanceof ZodError) {
        redirect(`/projects/new?error=invalid`);
      }
      throw error;
    }
    redirect(`/projects/${project.id}/configure`);
  };

  return (
    <div className="mx-auto max-w-[720px]">
      <Eyebrow>New project · step 1 of 3</Eyebrow>
      <h1 className="mt-3 text-[1.8125rem] font-[720] tracking-[-0.02em] text-ink">Create an audit project</h1>
      <p className="mt-2 text-[0.9375rem] leading-6 text-ink-3">
        Define the surface you want to test. The next step adapts to the target type you choose.
      </p>

      <form action={action} className="mt-8 space-y-5">
        {searchParams?.error === "invalid" && (
          <ErrorBanner
            title="Could not create project"
            body="Use a name of at least 2 characters and a valid target type, then try again."
          />
        )}
        <Card className="space-y-5">
          <Field label="Project name">
            <input name="name" placeholder="e.g., Enterprise IT Assistant" required className={inputClass} />
          </Field>
          <Field label="Description">
            <textarea name="description" rows={3} placeholder="Short context about this LLM application" className={inputClass} />
          </Field>
          <Field label="Target type" hint="Prompt-only, HTTP endpoint, or RAG — each gets a tailored configuration screen next.">
            <select name="targetType" defaultValue="Prompt-only" className={inputClass}>
              <option>Prompt-only</option>
              <option>Endpoint</option>
              <option>RAG</option>
            </select>
          </Field>
        </Card>
        <div className="flex justify-end">
          <Button type="submit" variant="primary" icon={ArrowRight}>
            Continue
          </Button>
        </div>
      </form>
    </div>
  );
}
