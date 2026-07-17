import fs from "fs";
import path from "path";

const DB_FILE = path.join(process.cwd(), "src", "services", "db.json");

export interface Technician {
  name: string;
  rating: number;
  reviews: number;
  avatar: string;
  verified: boolean;
}

export interface JobItem {
  title: string;
  description?: string;
  price: string;
  isFree?: boolean;
}

export interface RepairItem {
  id: string;
  orderCode: string;
  title: string;
  status: "completed" | "cancelled" | "in_progress";
  dateTime: string;
  location: string;
  technician: Technician;
  jobs: JobItem[];
  paymentMethod: string;
  total: number;
  images: string[];
  type: "booking" | "sos";
  createdAt: string;
}

interface DatabaseSchema {
  repairs: RepairItem[];
}

const DEFAULT_DB: DatabaseSchema = {
  repairs: [
    {
      id: "1",
      orderCode: "GW-98231",
      title: "Emergency rescue",
      status: "completed",
      dateTime: "14:30, 24/10/2023",
      location: "123 Nguyen Hue Street, District 1, Ho Chi Minh City",
      technician: {
        name: "Nguyen Van A",
        rating: 4.9,
        reviews: 124,
        avatar: "N",
        verified: true,
      },
      jobs: [
        { title: "Replaced with new battery", description: "Lithium-ion 24V 20Ah", price: "2,450,000đ" },
        { title: "Wheel maintenance", description: "Cleaning & lubricating the axle", price: "450,000đ" },
        { title: "On-site service fee", description: "Loyal customer discount", price: "FREE", isFree: true },
      ],
      paymentMethod: "Cash",
      total: 2900000,
      images: ["/repair-photo-1.png", "/repair-photo-2.png", "/repair-photo-3.png"],
      type: "sos",
      createdAt: "2023-10-24T14:30:00Z",
    },
    {
      id: "2",
      orderCode: "GW-98102",
      title: "Battery Replacement",
      status: "completed",
      dateTime: "09:15, 12/10/2023",
      location: "456 Le Loi Street, District 3, Ho Chi Minh City",
      technician: {
        name: "Tran Minh B",
        rating: 4.7,
        reviews: 89,
        avatar: "T",
        verified: true,
      },
      jobs: [
        { title: "Battery replacement", description: "Lithium-ion 24V 20Ah", price: "2,500,000đ" },
        { title: "System diagnostic", description: "Full electrical check", price: "400,000đ" },
      ],
      paymentMethod: "Bank Transfer",
      total: 2900000,
      images: ["/repair-photo-2.png", "/repair-photo-1.png"],
      type: "booking",
      createdAt: "2023-10-12T09:15:00Z",
    },
    {
      id: "3",
      orderCode: "GW-97845",
      title: "Wheel maintenance",
      status: "cancelled",
      dateTime: "16:00, 05/10/2023",
      location: "789 Hai Ba Trung, District 1, Ho Chi Minh City",
      technician: {
        name: "Le Van C",
        rating: 4.5,
        reviews: 56,
        avatar: "L",
        verified: false,
      },
      jobs: [],
      paymentMethod: "N/A",
      total: 0,
      images: [],
      type: "booking",
      createdAt: "2023-10-05T16:00:00Z",
    },
    {
      id: "4",
      orderCode: "GW-97501",
      title: "Motor inspection",
      status: "completed",
      dateTime: "10:00, 20/09/2023",
      location: "321 Pham Ngu Lao Street, District 1, Ho Chi Minh City",
      technician: {
        name: "Pham Duc D",
        rating: 4.8,
        reviews: 102,
        avatar: "P",
        verified: true,
      },
      jobs: [
        { title: "Motor bearing replacement", description: "High-speed bearings", price: "800,000đ" },
        { title: "Lubrication service", description: "Full drivetrain", price: "400,000đ" },
      ],
      paymentMethod: "E-wallet",
      total: 1200000,
      images: ["/repair-photo-3.png", "/repair-photo-1.png"],
      type: "booking",
      createdAt: "2023-09-20T10:00:00Z",
    },
    {
      id: "5",
      orderCode: "GW-97200",
      title: "Frame repair",
      status: "in_progress",
      dateTime: "08:30, 01/09/2023",
      location: "555 Vo Van Kiet, District 5, Ho Chi Minh City",
      technician: {
        name: "Hoang Van E",
        rating: 4.6,
        reviews: 67,
        avatar: "H",
        verified: true,
      },
      jobs: [
        { title: "Frame welding", description: "Aluminum frame repair", price: "2,000,000đ" },
        { title: "Paint restoration", description: "Color match & finish", price: "1,500,000đ" },
      ],
      paymentMethod: "Cash",
      total: 3500000,
      images: ["/repair-photo-1.png", "/repair-photo-2.png", "/repair-photo-3.png"],
      type: "booking",
      createdAt: "2023-09-01T08:30:00Z",
    },
  ],
};

function ensureDbExists() {
  const dir = path.dirname(DB_FILE);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  if (!fs.existsSync(DB_FILE)) {
    fs.writeFileSync(DB_FILE, JSON.stringify(DEFAULT_DB, null, 2), "utf-8");
  }
}

export function readDb(): DatabaseSchema {
  ensureDbExists();
  try {
    const data = fs.readFileSync(DB_FILE, "utf-8");
    return JSON.parse(data);
  } catch (error) {
    console.error("Failed to read JSON DB:", error);
    return DEFAULT_DB;
  }
}

export function writeDb(data: DatabaseSchema) {
  ensureDbExists();
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), "utf-8");
  } catch (error) {
    console.error("Failed to write JSON DB:", error);
  }
}
