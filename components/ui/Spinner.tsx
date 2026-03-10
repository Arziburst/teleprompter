import { type FC } from "react";

export const Spinner: FC<{ className?: string }> = ({ className }) => (
  <div
    className={`h-10 w-10 animate-spin rounded-full border-2 border-slate-300 border-t-emerald-500 ${className ?? ""}`}
    aria-hidden
  />
);
