// @polsia:user-owned — public Contact page for TraceGlass.
import type { Metadata } from 'next';
import { ContactForm } from '@/components/custom/contact-form';

const title = 'Contact TraceGlass';
const description =
  "Contact TraceGlass for general questions, support, security reports, press, or partnerships. Please don't paste logs or sensitive data into the form.";

export const metadata: Metadata = {
  title,
  description,
  alternates: { canonical: '/contact' },
  openGraph: {
    title,
    description,
    url: '/contact',
  },
};

export default function ContactPage() {
  return (
    <article className="site-design-page dark min-h-full bg-zinc-950 text-zinc-100">
      <header className="border-b border-zinc-800 bg-zinc-950 py-12 sm:py-16">
        <div className="container-page max-w-2xl">
          <p className="text-eyebrow font-mono text-[#3EE0D8]">CONTACT</p>
          <h1 className="mt-3 font-display text-display text-balance text-zinc-50">
            Get in touch.
          </h1>
          <p className="mt-4 max-w-xl text-body-lg text-zinc-400">
            Send a short note and we&apos;ll reply by email when we can. Prefer launch updates?{' '}
            <a
              href="/waitlist"
              className="font-medium text-[#8B7CF6] underline-offset-4 hover:underline"
            >
              Join the waitlist
            </a>
            .
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container-page mx-auto max-w-2xl">
          <div className="site-design-card rounded-md border border-[#2B3040] bg-zinc-950/80 p-5 shadow-lg shadow-black/20 sm:p-6">
            <ContactForm />
          </div>

          <p className="mt-8 text-sm leading-relaxed text-zinc-500">
            Security reports: please use this form and choose the topic{' '}
            <span className="font-medium text-zinc-300">Security report</span>. Do not paste exploit
            details that include customer logs or credentials.
          </p>
        </div>
      </section>
    </article>
  );
}
