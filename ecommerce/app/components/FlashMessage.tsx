"use client";

type FlashMessageProps = {
  type?: "error" | "success";
  message?: string | null;
};

export default function FlashMessage({ type = "error", message }: FlashMessageProps) {
  if (!message) return null;

  const baseClasses = "rounded-3xl border p-4 text-sm font-medium shadow-sm";
  const styles =
    type === "success"
      ? "bg-emerald-600/15 border-emerald-500 text-emerald-100"
      : "bg-rose-600/15 border-rose-500 text-rose-100";

  return <div className={`${baseClasses} ${styles}`}>{message}</div>;
}
