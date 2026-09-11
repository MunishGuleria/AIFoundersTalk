import type { Metadata } from "next";
import { NewsletterForm } from "@/components/NewsletterForm";
import { Breadcrumbs } from "@/components/Breadcrumbs";

export const metadata: Metadata = {
  title: "Join the Newsletter | AI Founders Talk",
  description:
    "Get one practical, plain-English AI guide in your inbox every week. Honest tool reviews, real founder stories, and zero fluff.",
  alternates: {
    canonical: "/newsletter",
  },
};

export default async function NewsletterPage(props: {
  searchParams?: Promise<{ confirmed?: string; error?: string }>;
}) {
  const searchParams = props.searchParams ? await props.searchParams : {};
  const isConfirmed = searchParams.confirmed === "true";
  const isAlreadyConfirmed = searchParams.confirmed === "already";
  const isError = Boolean(searchParams.error);

  return (
    <div className="w-full max-w-[800px] mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <Breadcrumbs items={[{ label: "Newsletter" }]} />

      {isConfirmed && (
        <div className="my-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-900 flex items-center gap-3">
          <svg className="w-6 h-6 text-emerald-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-bold text-sm">Subscription Confirmed!</p>
            <p className="text-xs text-emerald-700">Your email has been verified. You&apos;ll receive our next weekly edition.</p>
          </div>
        </div>
      )}

      {isAlreadyConfirmed && (
        <div className="my-6 p-4 bg-blue-50 border border-blue-200 rounded-xl text-blue-900 flex items-center gap-3">
          <svg className="w-6 h-6 text-blue-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <div>
            <p className="font-bold text-sm">Already Subscribed &amp; Confirmed</p>
            <p className="text-xs text-blue-700">Your subscription is already active. No further action is required.</p>
          </div>
        </div>
      )}

      {isError && (
        <div className="my-6 p-4 bg-amber-50 border border-amber-200 rounded-xl text-amber-900 flex items-center gap-3">
          <svg className="w-6 h-6 text-amber-600 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <div>
            <p className="font-bold text-sm">Verification link expired or invalid</p>
            <p className="text-xs text-amber-700">Please enter your email below to receive a fresh verification link.</p>
          </div>
        </div>
      )}

      <header className="my-8 text-center">
        <span className="text-xs font-bold uppercase tracking-widest text-slate-900 bg-slate-100 px-3 py-1 rounded-full inline-block mb-3 border border-slate-200">
          Weekly Free Edition
        </span>
        <h1
          className="text-3xl sm:text-4xl font-bold text-slate-900 mb-4"
          style={{ fontFamily: "var(--font-serif)" }}
        >
          Make AI Work for Your Business
        </h1>
        <p className="text-base sm:text-lg text-slate-600 max-w-xl mx-auto leading-relaxed">
          Join thousands of founders, business owners, and operators getting one short, practical guide every week. No buzzwords, no code, just real tools that save you time.
        </p>
      </header>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-2xs max-w-lg mx-auto mb-12">
        <NewsletterForm source="newsletter_landing" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 text-center border-t border-slate-200 pt-8">
        <div className="p-4">
          <div className="text-2xl mb-2">⚡</div>
          <h3 className="font-bold text-sm text-slate-900 mb-1">Honest Tool Tests</h3>
          <p className="text-xs text-slate-500">We test new AI tools so you know exactly which ones are worth your money.</p>
        </div>
        <div className="p-4">
          <div className="text-2xl mb-2">💡</div>
          <h3 className="font-bold text-sm text-slate-900 mb-1">Real Founder Lessons</h3>
          <p className="text-xs text-slate-500">Learn the exact workflows and tactics other businesses use to grow faster.</p>
        </div>
        <div className="p-4">
          <div className="text-2xl mb-2">🔍</div>
          <h3 className="font-bold text-sm text-slate-900 mb-1">Search & Visibility</h3>
          <p className="text-xs text-slate-500">Simple ways to get your website recommended when people search with AI.</p>
        </div>
      </div>
    </div>
  );
}