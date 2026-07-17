import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb, RepairItem } from "@/services/db";

const TECHNICIANS = [
  { name: "Nguyen Van A", rating: 4.9, reviews: 124, avatar: "N", verified: true },
  { name: "Tran Minh B", rating: 4.7, reviews: 89, avatar: "T", verified: true },
  { name: "Le Van C", rating: 4.5, reviews: 56, avatar: "L", verified: false },
  { name: "Pham Duc D", rating: 4.8, reviews: 102, avatar: "P", verified: true },
];

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { category, details, address, locationMethod } = body;

    if (!category) {
      return NextResponse.json({ error: "Category is required" }, { status: 400 });
    }

    const db = readDb();
    
    // Choose a random tech
    const tech = TECHNICIANS[Math.floor(Math.random() * TECHNICIANS.length)];
    
    // Build random order number
    const orderNumber = `GW-${Math.floor(10000 + Math.random() * 90000)}`;

    const newSos: RepairItem = {
      id: String(db.repairs.length + 1),
      orderCode: orderNumber,
      title: `Emergency rescue (${category})`,
      status: "in_progress",
      dateTime: new Date().toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" }) + ", " + new Date().toLocaleDateString("vi-VN"),
      location: address || "GPS Shared Location",
      technician: tech,
      jobs: [
        { title: `${category} emergency diagnostic`, description: details || "Standard emergency response inspection", price: "250,000đ" },
        { title: "On-site dispatch fee", description: "Distance-based emergency transport", price: "200,000đ" }
      ],
      paymentMethod: "Cash",
      total: 450000,
      images: ["/repair-photo-1.png"],
      type: "sos",
      createdAt: new Date().toISOString()
    };

    db.repairs.unshift(newSos);
    writeDb(db);

    return NextResponse.json({ success: true, data: newSos }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to trigger SOS" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = readDb();
    const sosList = db.repairs.filter(item => item.type === "sos");
    return NextResponse.json(sosList);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch SOS history" }, { status: 500 });
  }
}
