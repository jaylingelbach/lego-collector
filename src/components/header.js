"use client";

import { UserButton, SignInButton, useUser } from "@clerk/nextjs";
import Link from "next/link";

export default function Header() {
  const { isSignedIn, user } = useUser();

  return (
    <header className="flex items-center justify-between p-4 bg-gray-800 text-white">
      <Link href="/" className="text-xl font-bold">
        LEGO Collector
      </Link>

      <nav>
        {isSignedIn ? (
          <div className="flex items-center gap-4">
            <span>Welcome, {user?.firstName}!</span>
            <UserButton />
          </div>
        ) : (
          <SignInButton>
            <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded">
              Sign In
            </button>
          </SignInButton>
        )}
      </nav>
    </header>
  );
}
