import { NextResponse } from "next/server";
import fs from "fs";
import path from "path";
import { v4 as uuidv4 } from "uuid";

const filePath = path.join(process.cwd(), "data", "flavors.json");

function read() {
  return JSON.parse(fs.readFileSync(filePath, "utf-8"));
}

function write(data: unknown) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json(read());
}

export async function POST(req: Request) {
  const body = await req.json();
  const flavors = read();
  const newFlavor = { id: uuidv4(), ...body };
  flavors.push(newFlavor);
  write(flavors);
  return NextResponse.json(newFlavor, { status: 201 });
}
