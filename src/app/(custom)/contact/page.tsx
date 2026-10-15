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
    <article className="site-design-page min-h-full bg-background text-foreground">
      <header className="scroll-mt-16 border-b border-border bg-background pb-12 pt-16 sm:py-16">
        <div className="container-page max-w-2xl">
          <p className="text-eyebrow font-mono text-[color:var(--signal-accent-strong)] dark:text-[color:var(--signal-accent)]">
            CONTACT
          </p>
          <h1 className="mt-3 font-display text-display text-balance text-foreground">
            Get in touch.
          </h1>
          <p className="mt-4 max-w-xl text-body-lg text-muted-foreground">
            Send a short note and we&apos;ll reply by email when we can. Prefer launch updates?{' '}
            <a
              href="/waitlist"
              className="font-medium text-[color:var(--signal-accent-strong)] underline-offset-4 hover:underline dark:text-[color:var(--signal-accent)]"
            >
              Join the waitlist
            </a>
            .
          </p>
        </div>
      </header>

      <section className="section">
        <div className="container-page mx-auto max-w-2xl">
          <div className="site-design-card rounded-md border border-border bg-card p-5 shadow-lg shadow-black/5 dark:shadow-black/20 sm:p-6">
            <ContactForm />
          </div>

          <p className="mt-8 text-sm leading-relaxed text-muted-foreground">
            Security reports: please use this form and choose the topic{' '}
            <span className="font-medium text-foreground">Security report</span>. Do not paste
            exploit details that include customer logs or credentials.
          </p>
        </div>
      </section>
    </article>
  );
}
