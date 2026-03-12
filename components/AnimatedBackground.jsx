export function AnimatedBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none opacity-25">
      <div className="absolute top-[-10%] left-[-10%] w-[70%] h-[70%] rounded-full bg-primary/30 blur-[120px] animate-blob" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[70%] h-[70%] rounded-full bg-blue-500/30 blur-[120px] animate-blob animation-delay-2000" />
      <div className="absolute top-[20%] right-[10%] w-[60%] h-[60%] rounded-full bg-purple-500/30 blur-[120px] animate-blob animation-delay-4000" />
    </div>
  );
}
