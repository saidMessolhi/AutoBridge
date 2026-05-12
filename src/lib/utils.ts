import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { ImportStage } from "../types";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function canUserSeeOrder(role: string, stage: string): boolean {
  if (role === 'المدير العام' || role === 'المحاسب') return true;

  const stageRoles: Record<string, string[]> = {
    'مسؤول الصين': [
      ImportStage.NEW_REQUEST,
      ImportStage.UNDER_REVIEW,
      ImportStage.SEARCHING_CAR,
      ImportStage.CLIENT_APPROVED,
      ImportStage.DEPOSIT_PAID,
      ImportStage.PURCHASED
    ],
    'مسؤول اللوجستيك': [
      ImportStage.INLAND_TRANSPORT,
      ImportStage.SHIPPED,
      ImportStage.IN_TRANSIT
    ],
    'المخلص الجمركي': [
      ImportStage.ARRIVED_PORT,
      ImportStage.CUSTOMS_CLEARANCE
    ],
    'عون استقبال / مسؤول ملفات': [
      ImportStage.NEW_REQUEST,
      ImportStage.FINAL_PAYMENT,
      ImportStage.DELIVERED
    ]
  };

  const allowedStages = stageRoles[role];
  return allowedStages ? allowedStages.includes(stage) : true;
}
