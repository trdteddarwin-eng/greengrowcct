import AdminSidebar from "@/components/admin/AdminSidebar";

export const metadata = {
  title: "Admin — GreenGrow CCT",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="-mx-4 sm:-mx-6 lg:-mx-8 -my-6 lg:-my-8">
      <div className="flex min-h-screen">
        {/* Admin Sidebar */}
        <AdminSidebar />

        {/* Main content area */}
        <div className="flex-1 w-full">
          <div className="p-6 lg:p-8 max-w-7xl">
            {children}
          </div>
        </div>
      </div>
    </div>
  );
}
