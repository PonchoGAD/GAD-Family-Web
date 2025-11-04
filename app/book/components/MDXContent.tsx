"use client";

import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import type { PropsWithChildren, ReactNode, ComponentType } from "react";

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

// Explicit, no-any components map
const components = {
  Intro,
  QuestLink,
} satisfies Record<string, ComponentType<unknown>>;

export default function MDXContent({ source }: { source: string }) {
  return <MDXRemote source={source} components={components} />;
}
