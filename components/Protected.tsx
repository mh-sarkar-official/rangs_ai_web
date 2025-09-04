"use client";
import { getToken } from "@/lib/storage";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function Protected({ children }: { children: React.ReactNode }){
  const router = useRouter();
  useEffect(()=>{ if(!getToken()) router.push("/login"); }, [router]);
  return <>{children}</>;
}
