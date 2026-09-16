import StoreLayout from "@/components/store/StoreLayout";

export const metadata = {
    title: "Euro GoCart - Store Dashboard",
    description: "Euro GoCart - Store Dashboard",
};

export default function RootAdminLayout({ children }) {

    return (
        <>
            <StoreLayout>
                {children}
            </StoreLayout>
        </>
    );
}
