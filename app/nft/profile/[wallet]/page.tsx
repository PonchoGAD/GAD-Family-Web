import ProfileClient from './ProfileClient';
export default async function Page({ params }:{ params: Promise<{ wallet:string }> }) {
  const { wallet } = await params;
  return <ProfileClient wallet={wallet} />;
}
