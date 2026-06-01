import { Suspense } from "react";
import BillingComponent from "@/components/BillingComponent";

export default function BillingPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen bg-[#f8fafc]">
          <div className="w-10 h-10 border-4 border-indigo-100 border-t-indigo-600 rounded-full animate-spin" />
        </div>
      }
    >
      <BillingComponent />
    </Suspense>
  );
}
