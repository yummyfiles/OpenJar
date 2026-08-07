import type { Metadata } from "next";
import { StaticHeader } from "@/components/static-header";
import { ContactForm } from "@/components/contact-form";

export const metadata: Metadata = { title: "Contact" };

export default function ContactPage() {
  return (
    <>
      <StaticHeader
        eyebrow="contact"
        title="Get in touch"
        description="Questions, feedback, abuse reports, or just saying hi — we read everything."
      />
      <div className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <ContactForm />
        <p className="mt-6 text-center font-mono text-xs text-neutral-600">
          For content issues, use the report button on the post or page.
        </p>
      </div>
    </>
  );
}
