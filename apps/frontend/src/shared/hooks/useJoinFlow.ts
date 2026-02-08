"use client";

import { useEffect, useState } from "react";

type Step = 1 | 2 | 3 | 4;

export function useJoinFlow(
  signature: string | null,
  stepStatus: "success" | "error" | null
) {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  useEffect(() => {
    if (signature && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [signature, currentStep]);

  useEffect(() => {
    if (stepStatus === "success") {
      setCurrentStep(4);
    }
  }, [stepStatus]);

  return { currentStep, setCurrentStep };
}
