import AdminLayout from "@/components/admin/AdminLayout";

export const metadata = {
    title: "Euro GoCart - Admin",
    description: "Euro GoCart - Admin",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <AdminLayout>
                {children}
            </AdminLayout>
        </>
    );
}
