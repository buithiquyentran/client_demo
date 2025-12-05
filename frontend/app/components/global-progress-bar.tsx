"use client";

import { useEffect } from "react";
import { useLoading } from "../lib/loading-context";
import { setLoadingCallbacks } from "../lib/api-client";
import ProgressBar from "./ui/progress";

export function GlobalProgressBar() {
  const { isLoading, setIsLoading, progress } = useLoading();

  useEffect(() => {
    // Kết nối axios interceptors với loading state
    setLoadingCallbacks({
      onStart: () => setIsLoading(true),
      onEnd: () => setIsLoading(false),
    });
  }, [setIsLoading]);

  return <ProgressBar isLoading={isLoading} progress={progress} />;
}
