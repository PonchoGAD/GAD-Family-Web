"use client";

const CONTACT_EMAIL = "info@gad-family.com";

function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export default function EmailDraftForm() {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/30 p-6">
      <div className="text-sm font-semibold text-white">Contact form</div>
      <p className="mt-2 text-sm text-white/70">
        This form creates a pre-filled email (no backend required).
      </p>

      <form
        className="mt-6 space-y-4"
        onSubmit={(e) => {
          e.preventDefault();
          const form = e.currentTarget;
          const data = new FormData(form);

          const name = String(data.get("name") || "").trim();
          const email = String(data.get("email") || "").trim();
          const org = String(data.get("org") || "").trim();
          const message = String(data.get("message") || "").trim();

          const subject = encodeURIComponent("GAD Family — Investor Inquiry");
          const body = encodeURIComponent(
            `Hello GAD Family team,\n\n` +
              `My name: ${name}\n` +
              (org ? `Organization: ${org}\n` : "") +
              (email ? `Email: ${email}\n` : "") +
              `\nMessage:\n${message}\n\n` +
              `Best regards,\n${name || "[Name]"}`
          );

          window.location.href = `mailto:${CONTACT_EMAIL}?subject=${subject}&body=${body}`;
        }}
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="text-xs font-medium text-white/70">Your name</label>
            <input
              name="name"
              required
              placeholder="John Doe"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-amber-200/40"
            />
          </div>

          <div>
            <label className="text-xs font-medium text-white/70">Email</label>
            <input
              name="email"
              type="email"
              placeholder="john@fund.com"
              className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-amber-200/40"
            />
          </div>
        </div>

        <div>
          <label className="text-xs font-medium text-white/70">Organization</label>
          <input
            name="org"
            placeholder="Fund / Angel / Launchpad"
            className="mt-2 w-full rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-amber-200/40"
          />
        </div>

        <div>
          <label className="text-xs font-medium text-white/70">Message</label>
          <textarea
            name="message"
            required
            rows={5}
            placeholder="Tell us what you need (pitch deck, tokenomics, contracts, partnership, etc.)"
            className="mt-2 w-full resize-none rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder:text-white/35 outline-none focus:border-amber-200/40"
          />
        </div>

        <button
          type="submit"
          className={cn(
            "inline-flex w-full items-center justify-center gap-2 rounded-2xl px-5 py-3",
            "border border-amber-300/25 bg-gradient-to-b from-amber-200/15 to-amber-400/5",
            "text-sm font-semibold text-amber-100",
            "hover:from-amber-200/20 hover:to-amber-400/10 hover:border-amber-200/40",
            "transition"
          )}
        >
          Generate email →
        </button>

        <p className="text-xs text-white/45">
          Emails open via your local mail client (mailto).
        </p>
      </form>
    </div>
  );
}
