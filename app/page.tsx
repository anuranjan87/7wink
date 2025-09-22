"use client";

import { SignedIn, SignedOut, SignIn, useUser } from "@clerk/nextjs";
import { useEffect, useState } from "react";
import { usernameChecker } from "@/lib/website-actions";
import { useRouter } from "next/navigation";
import { CharacterForm } from "@/components/character-form"



export default function Home() {
  const { user } = useUser();
    const router = useRouter();
      const [usernameNotFound, setUsernameNotFound] = useState(false);



  useEffect(() => {
    if (user) {
      // Wrap async call inside a function
      const fetchUsername = async () => {
        try {
          const username = await usernameChecker(user.id);
          if (username) {
           router.push(`/edit/${username}`);
          } else {
            setUsernameNotFound(true); // show the form
          }
        } catch (error) {
          console.error("Error fetching username:", error);
        }
      };

      fetchUsername();
    }
  }, [user]);


  if (usernameNotFound) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-black to-slate-950 flex items-center justify-center">
        <div className="w-full max-w-md">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-4">
              Create Your Character
            </h2>
          </div>
          <CharacterForm />
        </div>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold">Clerk + Sonner Test</h1>

      <SignedOut>
        <SignIn routing="hash" />
      </SignedOut>

      <SignedIn>
        <p>Welcome! You're signed in ✅</p>
      </SignedIn>
    </div>
  );
}
