import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";

// markdown renderer shared by posts, project descriptions, bios
export function Markdown({ content, className }: { content: string; className?: string }) {
  return (
    <div className={`prose-openjar ${className ?? ""}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]} rehypePlugins={[rehypeHighlight]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
