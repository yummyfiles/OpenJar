import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import PostEditor from "@/components/dashboard/post-editor";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/login?next=/dashboard/content/new");
  return <PostEditor />;
}
