import { supabase } from "@/lib/supabase";

export async function generateSubscriptionId(): Promise<string> {
  const { data: config } = await supabase
    .from("config")
    .select("subscription_counter")
    .eq("id", "app")
    .maybeSingle();

  if (!config) throw new Error("Config not found");

  const next = (config.subscription_counter ?? 0) + 1;

  await supabase
    .from("config")
    .update({ subscription_counter: next })
    .eq("id", "app");

  return `SUB-${String(next).padStart(3, "0")}`;
}
