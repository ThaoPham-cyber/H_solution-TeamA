export type NavChild = {
  labelVi: string;
  labelEn: string;
  path: string;
};

export type NavGroup = {
  id: string;
  labelVi: string;
  labelEn: string;
  path: string;
  icon: string;
  children?: NavChild[];
};

export const userNavGroups: NavGroup[] = [
  {
    id: "dashboard",
    labelVi: "Bảng điều khiển",
    labelEn: "Dashboard",
    path: "/home",
    icon: "dashboard",
  },
  {
    id: "repair-request",
    labelVi: "Yêu cầu sửa chữa",
    labelEn: "Repair Request",
    path: "/user/requests/new",
    icon: "add_circle",
    children: [
      { labelVi: "Loại thiết bị", labelEn: "Device Type", path: "/user/requests/new?step=device-type" },
      { labelVi: "Vấn đề", labelEn: "Problem Category", path: "/user/requests/new?step=problem" },
      { labelVi: "Tải ảnh", labelEn: "Photo Upload", path: "/user/requests/new?step=photo" },
      { labelVi: "Vị trí", labelEn: "Location", path: "/user/requests/new?step=location" },
      { labelVi: "Gửi", labelEn: "Submit Request", path: "/user/requests/new?step=submit" },
    ],
  },
  {
    id: "my-repairs",
    labelVi: "Sửa chữa của tôi",
    labelEn: "My Repairs",
    path: "/user/requests",
    icon: "build",
    children: [
      { labelVi: "Đang chờ", labelEn: "Waiting", path: "/user/requests?tab=waiting" },
      { labelVi: "Đã phân công", labelEn: "Assigned", path: "/user/requests?tab=assigned" },
      { labelVi: "Hoàn thành", labelEn: "Completed", path: "/user/requests?tab=completed" },
    ],
  },
  {
    id: "history",
    labelVi: "Lịch sử",
    labelEn: "Repair History",
    path: "/user/history",
    icon: "history",
  },
];

export const repairRequestSteps = [
  "device-type",
  "problem",
  "photo",
  "location",
  "submit",
] as const;

export type RepairRequestStep = (typeof repairRequestSteps)[number];

export function isRepairRequestStep(value: string | null): value is RepairRequestStep {
  return repairRequestSteps.includes(value as RepairRequestStep);
}
