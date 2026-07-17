import { NextRequest, NextResponse } from "next/server";
import { readDb } from "@/services/db";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const filter = searchParams.get("filter") || "all"; // all, this_month, completed
    const query = searchParams.get("q") || "";

    const db = readDb();
    let repairs = db.repairs;

    // Filter by search query
    if (query) {
      const lowerQuery = query.toLowerCase();
      repairs = repairs.filter(
        item =>
          item.title.toLowerCase().includes(lowerQuery) ||
          item.orderCode.toLowerCase().includes(lowerQuery)
      );
    }

    // Filter by status/tab
    if (filter === "completed") {
      repairs = repairs.filter(item => item.status === "completed");
    } else if (filter === "this_month") {
      // Get current month and year
      const now = new Date();
      const currentMonth = now.getMonth();
      const currentYear = now.getFullYear();

      repairs = repairs.filter(item => {
        const itemDate = new Date(item.createdAt);
        return (
          itemDate.getMonth() === currentMonth &&
          itemDate.getFullYear() === currentYear
        );
      });
    }

    return NextResponse.json(repairs);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch history list" }, { status: 500 });
  }
}
