"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Plus,
  Trash2,
  Users as UsersIcon,
  Loader2,
  Mail,
  Calendar,
} from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";

interface User {
  id: string;
  name: string | null;
  email: string | null;
  createdAt: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [newUserName, setNewUserName] = useState("");
  const [newUserEmail, setNewUserEmail] = useState("");
  const [newUserPassword, setNewUserPassword] = useState("");

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch("/api/users");
      if (response?.ok) {
        const data = await response.json();
        setUsers(data ?? []);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleAddUser = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newUserName || !newUserEmail || !newUserPassword) {
      alert("Wszystkie pola są wymagane");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch("/api/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newUserName,
          email: newUserEmail,
          password: newUserPassword,
        }),
      });

      if (response?.ok) {
        setNewUserName("");
        setNewUserEmail("");
        setNewUserPassword("");
        setShowAddForm(false);
        fetchUsers();
      } else {
        const errorData = await response.json();
        alert(errorData?.error || "Wystąpił błąd");
      }
    } catch (error) {
      console.error("Error adding user:", error);
      alert("Wystąpił błąd podczas dodawania użytkownika");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm("Czy na pewno chcesz usunąć tego użytkownika?")) {
      return;
    }

    try {
      const response = await fetch(`/api/users/${userId}`, {
        method: "DELETE",
      });

      if (response?.ok) {
        fetchUsers();
      } else {
        const errorData = await response.json();
        alert(errorData?.error || "Wystąpił błąd");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      alert("Wystąpił błąd podczas usuwania użytkownika");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Użytkownicy</h1>
            <p className="text-gray-600 mt-1">
              Zarządzaj użytkownikami systemu
            </p>
          </div>
          <Button onClick={() => setShowAddForm(!showAddForm)}>
            <Plus className="w-4 h-4 mr-2" />
            Dodaj użytkownika
          </Button>
        </div>

        {showAddForm && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            className="mb-6 p-4 border border-gray-200 rounded-lg bg-gray-50"
          >
            <h3 className="font-semibold text-gray-900 mb-4">
              Nowy użytkownik
            </h3>
            <form onSubmit={handleAddUser} className="space-y-4">
              <div>
                <Label htmlFor="name">Imię i nazwisko</Label>
                <Input
                  id="name"
                  value={newUserName}
                  onChange={(e) => setNewUserName(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="password">Hasło</Label>
                <Input
                  id="password"
                  type="password"
                  value={newUserPassword}
                  onChange={(e) => setNewUserPassword(e.target.value)}
                  required
                  className="mt-1"
                />
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? (
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  ) : (
                    <Plus className="w-4 h-4 mr-2" />
                  )}
                  Dodaj
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                >
                  Anuluj
                </Button>
              </div>
            </form>
          </motion.div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {users?.map?.((user, index) => (
            <motion.div
              key={user?.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.05 }}
              className="bg-white border border-gray-200 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3 flex-1">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <UsersIcon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-gray-900 truncate">
                      {user?.name || "Bez nazwy"}
                    </h3>
                    <div className="flex items-center gap-1 text-sm text-gray-600 mt-1">
                      <Mail className="w-3 h-3" />
                      <span className="truncate">{user?.email}</span>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Calendar className="w-3 h-3" />
                      <span>
                        {user?.createdAt
                          ? format(new Date(user.createdAt), "dd.MM.yyyy", {
                              locale: pl,
                            })
                          : ""}
                      </span>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteUser(user?.id)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </motion.div>
          )) ?? null}
        </div>

        {users?.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            Brak użytkowników w systemie
          </div>
        )}
      </div>
    </div>
  );
}
