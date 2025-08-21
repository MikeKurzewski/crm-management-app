import { createClient } from "@/lib/supabase/server";
import EditProfileForm from "@/components/profile/EditProfileForm";

export default async function ProfilePage() {
  const supabase = await createClient();

  // Fetch current user
  const { data: { user } = {} } = await supabase.auth.getUser();

  // Fetch profile for user
  const { data: profile } = await supabase
    .from("profiles")
    .select("id, full_name, avatar_url")
    .eq("id", user?.id)
    .single();

  return (
    <div className="p-8 max-w-lg mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Profile</h1>
      <EditProfileForm profile={profile || { id: user?.id || "" }} />
    </div>
  );
}
