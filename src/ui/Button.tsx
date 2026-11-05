import type { ButtonHTMLAttributes } from "react";
import styles from "./Button.module.css";

export type ButtonVariant = "primary" | "secondary";

/** Class names for anything that should look like a button (e.g. a router `Link`). */
export function buttonClassName(variant: ButtonVariant = "secondary", extra?: string): string {
  return [styles.button, styles[variant], extra].filter(Boolean).join(" ");
}

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
}

export function Button({ variant, className, type, ...props }: ButtonProps) {
  // `type ?? "button"` instead of a destructuring default: React Compiler can't compile those.
  return (
    <button type={type ?? "button"} className={buttonClassName(variant, className)} {...props} />
  );
}
