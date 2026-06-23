"use client";
import { Toaster } from "react-hot-toast";

/** Toaster cu identitatea BUILT — card negru, accent roșu, ridicat peste bottom-nav-ul de mobil. */
export function BrandToaster() {
  return (
    <Toaster
      position="bottom-center"
      containerStyle={{ bottom: 84 }}
      toastOptions={{
        duration: 3200,
        style: {
          background: "#111111",
          color: "#F5F5F5",
          border: "1px solid rgba(255,255,255,0.10)",
          borderRadius: "12px",
          fontSize: "13px",
          fontFamily: "var(--font-barlow), system-ui, sans-serif",
          padding: "11px 15px",
          maxWidth: "380px",
          boxShadow: "0 12px 40px -14px rgba(0,0,0,0.7)",
        },
        success: { iconTheme: { primary: "#C0392B", secondary: "#F5F5F5" } },
        error: { iconTheme: { primary: "#C0392B", secondary: "#F5F5F5" } },
      }}
    />
  );
}
