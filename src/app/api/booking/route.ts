import { NextRequest, NextResponse } from "next/server";
import { readDb, writeDb, RepairItem, JobItem } from "@/services/db";

const TECHNICIANS = [
  { name: "Nguyen Van A", rating: 4.9, reviews: 124, avatar: "N", verified: true },
  { name: "Tran Minh B", rating: 4.7, reviews: 89, avatar: "T", verified: true },
  { name: "Le Van C", rating: 4.5, reviews: 56, avatar: "L", verified: false },
  { name: "Pham Duc D", rating: 4.8, reviews: 102, avatar: "P", verified: true },
];

function getCategoryLabel(cat: string) {
  switch (cat) {
    case "pin":
      return "Battery Replacement";
    case "wheel":
      return "Wheel maintenance";
    case "motor":
      return "Motor inspection";
    case "control":
      return "Controller remote service";
    default:
      return "General wheelchair service";
  }
}

function getCategoryJobsAndCost(cat: string, notes: string): { jobs: JobItem[]; total: number } {
  switch (cat) {
    case "pin":
      return {
        jobs: [
          { title: "New battery pack replacement", description: "Lithium-ion 24V 20Ah", price: "2,500,000đ" },
          { title: "Disposal & recycling fee", description: "Old lead-acid/lithium battery safe disposal", price: "400,000đ" }
        ],
        total: 2900000
      };
    case "wheel":
      return {
        jobs: [
          { title: "Wheel maintenance & alignment", description: notes || "Cleaning & lubricating the axle", price: "450,000đ" }
        ],
        total: 450000
      };
    case "motor":
      return {
        jobs: [
          { title: "Motor inspection & maintenance", description: notes || "Brushed/brushless motor optimization", price: "1,200,000đ" }
        ],
        total: 1200000
      };
    case "control":
      return {
        jobs: [
          { title: "Joystick controller calibration", description: notes || "Tension adjustment & connector check", price: "800,000đ" }
        ],
        total: 800000
      };
    default:
      return {
        jobs: [
          { title: "General wheelchair repair check", description: notes || "Diagnostic analysis of components", price: "300,000đ" }
        ],
        total: 300000
      };
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { wheelchairId, category, notes, date, timeSlot, address } = body;

    if (!category || !address) {
      return NextResponse.json({ error: "Category and address are required fields" }, { status: 400 });
    }

    const db = readDb();
    const tech = TECHNICIANS[Math.floor(Math.random() * TECHNICIANS.length)];
    const orderNumber = `GW-${Math.floor(10000 + Math.random() * 90000)}`;
    const title = getCategoryLabel(category);
    const { jobs, total } = getCategoryJobsAndCost(category, notes);

    const formattedTime = timeSlot ? `${timeSlot}, ` : "";
    const dateTime = `${formattedTime}${date || new Date().toLocaleDateString("vi-VN")}`;

    const newBooking: RepairItem = {
      id: String(db.repairs.length + 1),
      orderCode: orderNumber,
      title: title,
      status: "in_progress",
      dateTime: dateTime,
      location: address,
      technician: tech,
      jobs: jobs,
      paymentMethod: "Cash",
      total: total,
      images: ["/repair-photo-1.png"],
      type: "booking",
      createdAt: new Date().toISOString()
    };

    db.repairs.unshift(newBooking);
    writeDb(db);

    return NextResponse.json({ success: true, data: newBooking }, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create booking" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const db = readDb();
    const bookings = db.repairs.filter(item => item.type === "booking");
    return NextResponse.json(bookings);
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch bookings" }, { status: 500 });
  }
}
