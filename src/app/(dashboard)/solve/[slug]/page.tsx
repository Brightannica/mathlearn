"use client";

import { useEffect } from "react";
import { useParams, useRouter } from "next/navigation";

export default function ProblemSlugPage() {
  const router = useRouter();
  const params = useParams<{ slug: string }>();

  useEffect(() => {
    router.replace(`/solve?p=${params.slug}`);
  }, [router, params.slug]);

  return null;
}
