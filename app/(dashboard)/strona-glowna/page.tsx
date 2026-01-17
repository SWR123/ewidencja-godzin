"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Users, Clock, TrendingUp } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import { Button } from "@/components/ui/button";

interface Stats {
  totalRecords: number;
  totalUsers: number;
  totalHours: number;
  recentRecords: number;
}

export default function HomePage() {
  const [stats, setStats] = useState<Stats>({
    totalRecords: 0,
    totalUsers: 0,
    totalHours: 0,
    recentRecords: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch("/api/stats");
        if (response?.ok) {
          const data = await response.json();
          setStats(data ?? {});
        }
      } catch (error) {
        console.error("Error fetching stats:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  const statCards = [
    {
      title: "Wszystkie rekordy",
      value: stats?.totalRecords ?? 0,
      icon: FileText,
      color: "bg-blue-500",
      href: "/rekordy",
    },
    {
      title: "Użytkownicy",
      value: stats?.totalUsers ?? 0,
      icon: Users,
      color: "bg-green-500",
      href: "/uzytkownicy",
    },
    {
      title: "Suma godzin",
      value: stats?.totalHours ?? 0,
      icon: Clock,
      color: "bg-purple-500",
    },
    {
      title: "Ostatnie 30 dni",
      value: stats?.recentRecords ?? 0,
      icon: TrendingUp,
      color: "bg-orange-500",
    },
  ];

  return (
    <div className="space-y-8">
      <div className="bg-white rounded-lg shadow-md p-8">
        <div className="flex items-center gap-6 mb-4">
          <div className="flex flex-col items-center">
            <Image 
              src="/logo-osir.png" 
              alt="OSiR Brodnica" 
              width={150} 
              height={75}
              priority
            />
            <p className="text-[10px] text-gray-400 mt-1 text-center">
              Autor programu: Michał Brzeziński<br />
              all rights to the program reserved 2026
            </p>
          </div>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              System Ewidencji Godzin Pracy Społecznej
            </h1>
            <p className="text-gray-600">
              Zarządzaj ewidencją godzin pracy społecznej i generuj dokumenty
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards?.map?.((stat, index) => {
          const Icon = stat?.icon;
          return (
            <motion.div
              key={stat?.title}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="bg-white rounded-lg shadow-md p-6 hover:shadow-xl transition-shadow">
                <div className="flex items-center justify-between mb-4">
                  <div className={`${stat?.color} p-3 rounded-lg`}>
                    {Icon && <Icon className="w-6 h-6 text-white" />}
                  </div>
                </div>
                <h3 className="text-sm font-medium text-gray-600 mb-1">
                  {stat?.title}
                </h3>
                <p className="text-3xl font-bold text-gray-900">
                  {isLoading ? "..." : stat?.value}
                </p>
                {stat?.href && (
                  <Link href={stat.href}>
                    <Button variant="link" className="px-0 mt-2">
                      Zobacz więcej →
                    </Button>
                  </Link>
                )}
              </div>
            </motion.div>
          );
        }) ?? null}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Zarządzanie Rekordami
          </h2>
          <p className="text-gray-600 mb-6">
            Twórz, edytuj i usuwaj rekordy ewidencji godzin. Każdy rekord
            reprezentuje jeden miesięczny raport.
          </p>
          <Link href="/rekordy/nowy">
            <Button className="w-full">
              <FileText className="w-4 h-4 mr-2" />
              Dodaj nowy rekord
            </Button>
          </Link>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.5 }}
          className="bg-white rounded-lg shadow-md p-6"
        >
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            Generowanie Dokumentów
          </h2>
          <p className="text-gray-600 mb-6">
            Generuj dokumenty DOCX zgodne z szablonem urzędowym. Możliwość
            masowego generowania wielu dokumentów.
          </p>
          <Link href="/rekordy">
            <Button variant="outline" className="w-full">
              Przejdź do rekordów
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
}
