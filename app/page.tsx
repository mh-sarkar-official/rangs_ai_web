"use client";
import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { getToken } from "@/lib/storage";

export default function Page() {
  const router = useRouter();
  useEffect(() => {
    if (getToken()) router.replace("/chats");
    else router.replace("/login");
  }, [router]);
  return null;
}
