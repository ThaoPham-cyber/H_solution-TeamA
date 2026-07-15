import { PlaceholderPage } from "@/components/home/placeholder-page";

export default function ProfilePage() {
  return (
    <PlaceholderPage
      activeNav="profile"
      title="Profile"
      icon="person"
      description="Quản lý thông tin cá nhân, liên hệ khẩn cấp và cài đặt tài khoản."
      features={[
        "Thông tin cá nhân & liên hệ",
        "Người liên hệ khẩn cấp (SOS)",
        "Thông báo & quyền riêng tư",
      ]}
      actionLabel="Đăng xuất"
      actionHref="/login"
    />
  );
}
