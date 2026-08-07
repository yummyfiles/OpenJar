"use client";

import * as React from "react";
import { useTheme } from "next-themes";
import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  const { theme } = useTheme();
  return (
    <SonnerToaster
      theme={theme === "dark" ? "dark" : "light"}
      position="bottom-right"
      toastOptions={{
        style: {
          background: theme === "dark" ? "#0a0a0a" : "#ffffff",
          border: theme === "dark" ? "1px solid #262626" : "1px solid #e5e5e5",
          color: theme === "dark" ? "#ffffff" : "#0a0a0a",
          borderRadius: "0.5rem"
        }
      }}
    />
  );
}
