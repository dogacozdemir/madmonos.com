import Image from "next/image";
import { cn } from "@/lib/utils";

/** Route-level suspense — brand mark instead of anonymous chrome. */
export default function Loading() {
  return (
    <div
      className={cn(
        "flex min-h-[40vh] flex-col items-center justify-center gap-4 px-4 py-20",
        "text-mad-highlight [transform:translate3d(0,0,0)]"
      )}
    >
      <div className="animate-pulse [animation-duration:1.75s]">
        <Image
          src="/logo-nav.webp"
          alt=""
          width={400}
          height={510}
          sizes="96px"
          className="h-12 w-auto object-contain opacity-90 md:h-14"
          priority
        />
      </div>
      <p className="text-[10px] font-bold uppercase tracking-[0.35em] text-mad-gold">Loading</p>
    </div>
  );
}
