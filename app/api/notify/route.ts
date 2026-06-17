import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { Resend } from "resend";

const flavorsPath = path.join(process.cwd(), "data", "flavors.json");
const subscribersPath = path.join(process.cwd(), "data", "subscribers.json");

export async function POST(req: Request) {
  const { flavorId } = await req.json();

  const flavors = JSON.parse(fs.readFileSync(flavorsPath, "utf-8"));
  const subscribers = JSON.parse(fs.readFileSync(subscribersPath, "utf-8"));

  const flavor = flavors.find((f: { id: string }) => f.id === flavorId);
  if (!flavor) return NextResponse.json({ error: "Flavor not found" }, { status: 404 });

  const toNotify = subscribers.filter((s: { flavorIds: string[] }) =>
    s.flavorIds.includes(flavorId)
  );

  if (toNotify.length === 0) {
    return NextResponse.json({ notified: 0, flavor: flavor.name });
  }

  const apiKey = process.env.RESEND_API_KEY;
  const fromEmail = process.env.FROM_EMAIL || "Minnehaha Scoop <noreply@minnehahascoop.com>";

  if (!apiKey) {
    console.warn("[NOTIFY] RESEND_API_KEY not set — logging only");
    toNotify.forEach((s: { email: string }) => console.log(`  → Would email: ${s.email}`));
    return NextResponse.json({ notified: toNotify.length, flavor: flavor.name, emailSent: false });
  }

  const resend = new Resend(apiKey);

  const results = await Promise.allSettled(
    toNotify.map((s: { email: string }) =>
      resend.emails.send({
        from: fromEmail,
        to: s.email,
        subject: `🍦 ${flavor.name} is back at Minnehaha Scoop!`,
        html: `
          <div style="font-family: 'Nunito', Arial, sans-serif; max-width: 520px; margin: 0 auto; background: #FFF9E6; border-radius: 24px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
            <div style="background: linear-gradient(135deg, #FFD700 0%, #FFB3D9 100%); padding: 40px 32px; text-align: center;">
              <div style="font-size: 64px; margin-bottom: 8px;">${flavor.emoji}</div>
              <h1 style="font-size: 28px; color: #FF6B6B; margin: 0 0 8px;">It's back!</h1>
              <h2 style="font-size: 22px; color: #333; margin: 0;">${flavor.name}</h2>
            </div>
            <div style="padding: 32px;">
              <p style="font-size: 16px; color: #555; line-height: 1.6; margin: 0 0 16px;">
                Great news — <strong>${flavor.name}</strong> is now back in stock at Minnehaha Scoop. Come get a scoop before it's gone again!
              </p>
              <p style="font-size: 14px; color: #888; font-style: italic; margin: 0 0 24px;">${flavor.description}</p>
              <div style="text-align: center;">
                <a href="https://minnehahascoop.com" style="display: inline-block; background: #FF6B6B; color: white; font-weight: bold; font-size: 16px; padding: 14px 32px; border-radius: 50px; text-decoration: none;">
                  🍦 See Today's Flavors
                </a>
              </div>
            </div>
            <div style="background: #FFD700; padding: 16px; text-align: center; font-size: 12px; color: #666;">
              © Minnehaha Scoop &nbsp;•&nbsp; You're receiving this because you subscribed for flavor updates.
            </div>
          </div>
        `,
      })
    )
  );

  const sent = results.filter((r) => r.status === "fulfilled").length;
  const failed = results.filter((r) => r.status === "rejected").length;
  if (failed > 0) console.error(`[NOTIFY] ${failed} email(s) failed to send`);

  return NextResponse.json({ notified: toNotify.length, sent, failed, flavor: flavor.name, emailSent: true });
}
