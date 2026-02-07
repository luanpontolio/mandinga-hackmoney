"use client";

import { useEffect, useState } from "react";

type Step = 1 | 2 | 3;

export function useJoinFlow(signature: string | null) {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  useEffect(() => {
    if (signature && currentStep === 1) {
      setCurrentStep(2);
    }
  }, [signature, currentStep]);

  return { currentStep, setCurrentStep };
}
