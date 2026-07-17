import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/services/db";

type Context = {
  params: Promise<{ id: string }>;
};

export async function GET(req: NextRequest, context: Context) {
  try {
    const { id } = await context.params;
    const db = readDb();
    const repair = db.repairs.find(item => item.id === id);

    if (!repair) {
      return NextResponse.json({ error: "Repair record not found" }, { status: 404 });
    }

    return NextResponse.json(repair);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch repair details" }, { status: 500 });
  }
}
