"use client";

import { type FC } from "react";
import { Spinner } from "./Spinner";

type LoadingScreenProps = {
  message?: string;
};

export const LoadingScreen: FC<LoadingScreenProps> = ({
  message = "Loading teleprompter…"
}) => (
  <div className="flex min-h-screen flex-col bg-white text-slate-900">
    <main className="mx-auto flex w-full max-w-5xl flex-1 items-center justify-center px-4 py-10">
      <div className="flex flex-col items-center gap-3">
        <Spinner />
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
          {message}
        </p>
      </div>
    </main>
  </div>
);
