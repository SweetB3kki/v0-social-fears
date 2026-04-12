import { cn } from "@/lib/utils";

type SpiderWebIconProps = {
  className?: string;
};

export function SpiderWebIcon({ className }: SpiderWebIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={cn("h-5 w-5", className)}
      aria-hidden="true"
    >
      <path d="M12 3v18" />
      <path d="M3 12h18" />
      <path d="M5.8 5.8 18.2 18.2" />
      <path d="M18.2 5.8 5.8 18.2" />
      <path d="M12 6.2c-2.8 0-5.1 1.2-6.6 3.1" />
      <path d="M12 6.2c2.8 0 5.1 1.2 6.6 3.1" />
      <path d="M12 17.8c-2.8 0-5.1-1.2-6.6-3.1" />
      <path d="M12 17.8c2.8 0 5.1-1.2 6.6-3.1" />
      <path d="M7.2 7.2c1.2 1.4 2.9 2.2 4.8 2.2s3.6-.8 4.8-2.2" />
      <path d="M7.2 16.8c1.2-1.4 2.9-2.2 4.8-2.2s3.6.8 4.8 2.2" />
    </svg>
  );
}
