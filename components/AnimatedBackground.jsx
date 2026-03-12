import { UI_CONFIG } from "@/lib/ui-config";

export function AnimatedBackground() {
  return (
    <div
      className={`absolute inset-0 -z-10 overflow-hidden pointer-events-none ${UI_CONFIG.background.opacity}`}
    >
      <div
        className={`absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-primary/20 blur-[120px]`}
      />
      <div
        className={`absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-blue-500/20 blur-[120px]`}
      />
      <div
        className={`absolute top-[20%] right-[10%] w-[60%] h-[60%] rounded-full bg-purple-500/20 blur-[120px]`}
      />
    </div>
  );
}
