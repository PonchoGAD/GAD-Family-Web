import NftHeader from "./NftHeader";
import NftFooter from "./NftFooter";

export default function NftShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <NftHeader />
      <main className="flex-1">{children}</main>
      <NftFooter />
    </div>
  );
}
