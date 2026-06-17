import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const filePath = path.join(process.cwd(), "data", "subscribers.json");

function read() {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function write(data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export async function POST(req: Request) {
  const { email, phone, flavorIds } = await req.json();

  if (!email || !flavorIds || flavorIds.length === 0) {
    return NextResponse.json({ error: "Email and at least one flavor required." }, { status: 400 });
  }

  const subscribers = read();

  // Update existing subscriber if email already exists
  const existing = subscribers.findIndex((s: { email: string }) => s.email === email);
  if (existing !== -1) {
    const merged = Array.from(new Set([...subscribers[existing].flavorIds, ...flavorIds]));
    subscribers[existing].flavorIds = merged;
    if (phone) subscribers[existing].phone = phone;
    write(subscribers);
    return NextResponse.json(subscribers[existing]);
  }

  const newSub = { id: uuidv4(), email, phone: phone || null, flavorIds, createdAt: new Date().toISOString() };
  subscribers.push(newSub);
  write(subscribers);
  return NextResponse.json(newSub, { status: 201 });
}
