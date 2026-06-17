import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";

const filePath = path.join(process.cwd(), "data", "flavors.json");

function read() {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function write(data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export async function PATCH(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const body = await req.json();
  const flavors = read();
  const idx = flavors.findIndex((f: { id: string }) => f.id === id);
  if (idx === -1) return NextResponse.json({ error: "Not found" }, { status: 404 });
  flavors[idx] = { ...flavors[idx], ...body };
  write(flavors);
  return NextResponse.json(flavors[idx]);
}

export async function DELETE(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const flavors = read();
  const filtered = flavors.filter((f: { id: string }) => f.id !== id);
  write(filtered);
  return NextResponse.json({ success: true });
}
