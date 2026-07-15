import { PlaceholderPage } from "@/components/home/placeholder-page";

const repairHistory = [
  { id: "R-1042", date: "12 May 2026", issue: "Battery replacement", status: "Completed" },
  { id: "R-0987", date: "28 Mar 2026", issue: "Wheel alignment", status: "Completed" },
  { id: "R-0811", date: "15 Jan 2026", issue: "Motor noise check", status: "Completed" },
];

export default function HistoryPage() {
  return (
    <PlaceholderPage
      activeNav="history"
      title="Repair History"
      icon="history"
      description="Xem lại các lần sửa chữa trước đây và chi tiết từng yêu cầu."
      features={repairHistory.map((item) => `${item.id} · ${item.date} · ${item.issue}`)}
      actionLabel="Đặt lịch sửa mới"
      actionHref="/home/booking"
    />
  );
}
