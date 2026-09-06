import type { Metadata } from "next";
import GalleryClient from "@/components/gallery/gallery-client";

export const metadata: Metadata = {
  title: "Our Recent Work — Photo Framing Gallery | Quality Framing Emporium, Raebareli",
  description:
    "Browse a few of the frames, god frames, albums and art pieces we've crafted for families across Raebareli. See the finish, then order your own or visit the shop at PNT Colony.",
};

export default function GalleryPage() {
  return <GalleryClient />;
}
