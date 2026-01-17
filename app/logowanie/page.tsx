"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AlertCircle } from "lucide-react";
import Image from "next/image";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsLoading(true);

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Nieprawidłowy email lub hasło");
      } else {
        router.push("/strona-glowna");
        router.refresh();
      }
    } catch (error) {
      setError("Wystąpił błąd podczas logowania");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100 px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-lg shadow-xl p-8">
          <div className="flex flex-col items-center justify-center mb-6">
            <Image 
              src="/logo-osir.png" 
              alt="OSiR Brodnica" 
              width={200} 
              height={100}
              priority
            />
            <p className="text-xs text-gray-400 mt-2 text-center">
              Autor programu: Michał Brzeziński<br />
              all rights to the program reserved 2026
            </p>
          </div>
          
          <h1 className="text-2xl font-bold text-center mb-2">Ewidencja Godzin</h1>
          <p className="text-center text-gray-600 mb-8">
            Zaloguj się do systemu
          </p>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-md flex items-start gap-2">
              <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="email">Adres email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="twoj@email.com"
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="password">Hasło</Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="mt-1"
              />
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Logowanie..." : "Zaloguj się"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Nie masz konta?{" "}
              <Link
                href="/rejestracja"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Zarejestruj się
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
