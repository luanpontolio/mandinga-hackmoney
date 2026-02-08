"use client";

import { useState } from "react";

type Step = 1 | 2;

export function useJoinFlow(_signature: string | null) {
  const [currentStep, setCurrentStep] = useState<Step>(1);

  // NOTE: do not auto-advance based on a stored signature. The join flow
  // should always present the Terms step first; callers should advance the
  // local step after an explicit sign action.

  return { currentStep, setCurrentStep };
}
