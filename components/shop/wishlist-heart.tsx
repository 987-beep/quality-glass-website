"use client";

import { useEffect, useState } from "react";
import { inWishlist, toggleWishlist } from "@/lib/wishlist";

export default function WishlistHeart({
  slug,
  className = "",
}: {
  slug: string;
  className?: string;
}) {
  const [on, setOn] = useState(false);

  useEffect(() => {
    setOn(inWishlist(slug));
    const sync = () => setOn(inWishlist(slug));
    window.addEventListener("qge-wishlist", sync);
    window.addEventListener("storage", sync);
    return () => {
      window.removeEventListener("qge-wishlist", sync);
      window.removeEventListener("storage", sync);
    };
  }, [slug]);

  return (
    <button
      type="button"
      aria-label={on ? "Remove from wishlist" : "Add to wishlist"}
      aria-pressed={on}
      data-cursor="link"
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleWishlist(slug);
      }}
      className={`flex h-9 w-9 items-center justify-center rounded-full border transition-all duration-300 ${
        on
          ? "border-[#c2402f] bg-[#c2402f]/15 text-[#ff7a66]"
          : "border-ivory/15 text-ivory/40 hover:border-[#c2402f]/60 hover:text-[#ff7a66]"
      } ${className}`}
    >
      <svg
        viewBox="0 0 24 24"
        className="h-4 w-4"
        fill={on ? "currentColor" : "none"}
        stroke="currentColor"
        strokeWidth="2"
      >
        <path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.6l-1-1a5.5 5.5 0 0 0-7.8 7.8l1 1L12 21.2l7.8-7.8 1-1a5.5 5.5 0 0 0 0-7.8z" />
      </svg>
    </button>
  );
}
