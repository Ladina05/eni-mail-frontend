import { createContext } from "react";

export type ConfirmOptions = {
  title?: string;
  confirmLabel?: string;
  destructive?: boolean;
};
export const ConfirmContext = createContext<
  ((message: string, options?: ConfirmOptions) => Promise<boolean>) | null
>(null);
