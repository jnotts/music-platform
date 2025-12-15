import { forwardRef } from "react";

interface SocialInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  icon: React.ReactNode;
}

const SocialInput = forwardRef<HTMLInputElement, SocialInputProps>(
  ({ icon, className, ...props }, ref) => (
    <div
      className={`flex items-center gap-3 rounded-lg border px-3 py-2 transition-colors border-border bg-surface-muted dark:border-white/5 dark:bg-black/20 dark:focus-within:border-white/20 ${
        className || ""
      }`}
    >
      {icon}
      <input
        ref={ref}
        type="text"
        className="bg-transparent text-sm outline-none w-full placeholder:text-muted/30"
        {...props}
      />
    </div>
  )
);
SocialInput.displayName = "SocialInput";

export default SocialInput;
