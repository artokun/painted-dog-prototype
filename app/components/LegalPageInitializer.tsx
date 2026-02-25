"use client";

import { useEffect } from "react";
import { legalStore } from "@/app/store/legalStore";

interface Policy {
  id: string;
  navTitle: string;
  title: string;
  content: string;
}

interface LegalPageData {
  title: string;
  slug?: string;
  policies: Policy[];
}

export function LegalPageInitializer({ data }: { data: LegalPageData }) {
  useEffect(() => {
    legalStore.setLegalPage(data);
  }, [data]);

  return null;
}