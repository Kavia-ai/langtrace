"use client";

import { Button } from "@/components/ui/button";
import { PersonIcon } from "@radix-ui/react-icons";
import { signIn } from "next-auth/react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export default function LoginForm() {
  const searchParams = useSearchParams();
  const next = searchParams?.get("next");
  const [clickedGoogle, setClickedGoogle] = useState(false);
  const [clickedAzure, setClickedAzure] = useState(false);

  useEffect(() => {
    const error = searchParams?.get("error");
    error && toast.error(error);
  }, [searchParams]);

  return (
    <>
      <div className="flex flex-col gap-2">
          <Button
            className="bg-muted-foreground hover:bg-primary mb-6"
            onClick={() => {
              setClickedGoogle(true);
              signIn("credential", {
                ...(next && next.length > 0 ? { callbackUrl: next } : {}),
              });
            }}
            disabled={clickedGoogle}
          >
            <PersonIcon className="w-5 h-5 mr-2" />
            Admin Login
          </Button>
      </div>
    </>
  );
}
