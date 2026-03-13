import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(amount);
}

export function getStatusColor(status: string): string {
  switch (status) {
    case "active":
      return "text-success bg-success/10 border-success/20";
    case "ended":
      return "text-muted-foreground bg-muted border-muted-foreground/20";
    case "cancelled":
      return "text-destructive bg-destructive/10 border-destructive/20";
    default:
      return "text-secondary bg-secondary/10 border-secondary/20";
  }
}
