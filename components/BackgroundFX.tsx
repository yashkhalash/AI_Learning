"use client";

export default function BackgroundFX() {
  return (
    <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
      <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-accent/20 rounded-full blur-[120px] animate-float" />
      <div
        className="absolute top-1/3 -right-40 w-[500px] h-[500px] bg-accent2/20 rounded-full blur-[120px] animate-float"
        style={{ animationDelay: "2s" }}
      />
      <div
        className="absolute bottom-0 left-1/3 w-[400px] h-[400px] bg-good/10 rounded-full blur-[120px] animate-float"
        style={{ animationDelay: "4s" }}
      />
    </div>
  );
}
