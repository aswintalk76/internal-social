import { ProfileView } from "@/components/profile-view";

type Props = { params: Promise<{ username: string }> };

export default async function ProfilePage({ params }: Props) {
  const { username } = await params;
  return <ProfileView username={username} />;
}
