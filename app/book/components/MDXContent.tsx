// No "use client" here — server component!

import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import type { PropsWithChildren, ReactNode } from "react";

function Intro({ children }: PropsWithChildren) {
  return <div className="rounded-2xl bg-white/5 p-4 leading-relaxed">{children}</div>;
}

function QuestLink({ href, children }: { href: string; children: ReactNode }) {
  return (
    <Link href={href} className="inline-flex items-center gap-2 underline hover:opacity-90">
      {children}
    </Link>
  );
}

const components = {
  Intro,
  QuestLink,
};

export default function MDXContent({ source }: { source: string }) {
  // In RSC mode MDXRemote can take raw MDX string
  return <MDXRemote source={source} components={components} />;
}
