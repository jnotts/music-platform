import { forwardRef } from "react";

interface SocialInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
}

const SocialInput = forwardRef<HTMLInputElement, SocialInputProps>(
  ({ icon, className, ...props }, ref) => (
    <div
      className={`flex items-center gap-3 rounded-lg border border-border bg-surface-muted px-3 py-2 transition-colors dark:border-white/5 dark:bg-black/20 dark:focus-within:border-white/20 ${
        className || ""
      }`}
    >
      {icon}
      <input
        ref={ref}
        type="text"
        className="w-full bg-transparent text-sm outline-none placeholder:text-muted/30"
        {...props}
      />
    </div>
  ),
);
SocialInput.displayName = "SocialInput";

export default SocialInput;
