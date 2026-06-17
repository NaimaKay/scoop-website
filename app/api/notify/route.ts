import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const flavorsPath = path.join(process.cwd(), "data", "flavors.json");
const subscribersPath = path.join(process.cwd(), "data", "subscribers.json");

export async function POST(req: Request) {
  const { flavorId } = await req.json();

  const flavors = JSON.parse(fs.readFileSync(flavorsPath, "utf-8"));
  const subscribers = JSON.parse(fs.readFileSync(subscribersPath, "utf-8"));

  const flavor = flavors.find((f: { id: string }) => f.id === flavorId);
  if (!flavor) return NextResponse.json({ error: "Flavor not found" }, { status: 404 });

  const toNotify = subscribers.filter((s: { flavorIds: string[] }) => s.flavorIds.includes(flavorId));

  // Log notifications — wire up a real email provider (Resend, Nodemailer, etc.) here
  console.log(`[NOTIFY] ${flavor.name} is back in stock!`);
  toNotify.forEach((s: { email: string; phone?: string }) => {
    console.log(`  → Email: ${s.email}`);
    if (s.phone) console.log(`  → SMS: ${s.phone}`);
  });

  return NextResponse.json({ notified: toNotify.length, flavor: flavor.name });
}
