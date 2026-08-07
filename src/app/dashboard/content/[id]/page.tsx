import { getCurrentUser } from "@/lib/session";
import { redirect } from "next/navigation";
import PostEditor from "@/components/dashboard/post-editor";

export const dynamic = "force-dynamic";

export default async function EditPostPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/dashboard/content");
  return <PostEditor />;
}
