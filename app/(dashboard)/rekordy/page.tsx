"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Plus,
  Trash2,
  FileDown,
  Search,
  ArrowUpDown,
  Loader2,
} from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import { Checkbox } from "@/components/ui/checkbox";

interface Record {
  id: string;
  kow?: string;
  wo?: string;
  ii_k?: string;
  nazwisko: string;
  imie: string;
  kod?: string;
  miejscowosc?: string;
  ulica?: string;
  nr_domu?: string;
  nr_lokalu?: string;
  nr_tel?: string;
  godziny_do_odrobienia?: number;
  data1?: string;
  data2?: string;
  uwagi?: string;
  suma: number;
  createdAt: string;
  updatedAt: string;
}

type SortField = keyof Record;
type SortDirection = "asc" | "desc";

export default function RecordsPage() {
  const [records, setRecords] = useState<Record[]>([]);
  const [filteredRecords, setFilteredRecords] = useState<Record[]>([]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortField, setSortField] = useState<SortField>("createdAt");
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  useEffect(() => {
    fetchRecords();
  }, []);

  useEffect(() => {
    let filtered = records?.filter?.((record) => {
      const searchLower = searchQuery?.toLowerCase() || "";
      return (
        record?.nazwisko?.toLowerCase()?.includes(searchLower) ||
        record?.imie?.toLowerCase()?.includes(searchLower) ||
        record?.kow?.toLowerCase()?.includes(searchLower) ||
        record?.wo?.toLowerCase()?.includes(searchLower) ||
        record?.ii_k?.toLowerCase()?.includes(searchLower)
      );
    }) ?? [];

    // Sort
    filtered = filtered?.sort?.((a, b) => {
      let aVal = a?.[sortField];
      let bVal = b?.[sortField];

      if (aVal === undefined || aVal === null) aVal = "";
      if (bVal === undefined || bVal === null) bVal = "";

      if (typeof aVal === "string" && typeof bVal === "string") {
        return sortDirection === "asc"
          ? aVal.localeCompare(bVal)
          : bVal.localeCompare(aVal);
      }

      if (typeof aVal === "number" && typeof bVal === "number") {
        return sortDirection === "asc" ? aVal - bVal : bVal - aVal;
      }

      return 0;
    }) ?? [];

    setFilteredRecords(filtered);
  }, [records, searchQuery, sortField, sortDirection]);

  const fetchRecords = async () => {
    try {
      const response = await fetch("/api/records");
      if (response?.ok) {
        const data = await response.json();
        setRecords(data ?? []);
      }
    } catch (error) {
      console.error("Error fetching records:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedIds(filteredRecords?.map?.((r) => r?.id) ?? []);
    } else {
      setSelectedIds([]);
    }
  };

  const handleSelectOne = (id: string, checked: boolean) => {
    if (checked) {
      setSelectedIds([...(selectedIds ?? []), id]);
    } else {
      setSelectedIds((selectedIds ?? [])?.filter?.((sid) => sid !== id) ?? []);
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds?.length === 0) return;

    if (!confirm(`Czy na pewno chcesz usunąć ${selectedIds?.length} rekordów?`)) {
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch("/api/records/bulk-delete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: selectedIds }),
      });

      if (response?.ok) {
        await fetchRecords();
        setSelectedIds([]);
      }
    } catch (error) {
      console.error("Error deleting records:", error);
    } finally {
      setIsDeleting(false);
    }
  };

  const handleGenerateDocuments = async () => {
    if (selectedIds?.length === 0) return;

    setIsGenerating(true);
    try {
      const response = await fetch("/api/records/generate-docx", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ recordIds: selectedIds }),
      });

      if (response?.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `ewidencja_${new Date().getTime()}.docx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error("Error generating documents:", error);
    } finally {
      setIsGenerating(false);
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
            <h1 className="text-2xl font-bold text-gray-900">Rekordy</h1>
            <p className="text-gray-600 mt-1">
              Zarządzaj ewidencją godzin pracy społecznej
            </p>
          </div>
          <Link href="/rekordy/nowy">
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Nowy rekord
            </Button>
          </Link>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              type="text"
              placeholder="Szukaj po nazwisku, imieniu, numerze sprawy..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
          {selectedIds?.length > 0 && (
            <div className="flex gap-2">
              <Button
                variant="destructive"
                onClick={handleBulkDelete}
                disabled={isDeleting}
              >
                {isDeleting ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Trash2 className="w-4 h-4 mr-2" />
                )}
                Usuń ({selectedIds?.length})
              </Button>
              <Button
                variant="outline"
                onClick={handleGenerateDocuments}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <FileDown className="w-4 h-4 mr-2" />
                )}
                Generuj DOCX
              </Button>
            </div>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 py-3 text-left">
                  <Checkbox
                    checked={
                      selectedIds?.length === filteredRecords?.length &&
                      filteredRecords?.length > 0
                    }
                    onCheckedChange={handleSelectAll}
                  />
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("nazwisko")}
                >
                  <div className="flex items-center gap-2">
                    Nazwisko
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("imie")}
                >
                  <div className="flex items-center gap-2">
                    Imię
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("kow")}
                >
                  <div className="flex items-center gap-2">
                    Kow
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("suma")}
                >
                  <div className="flex items-center gap-2">
                    Suma godzin
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("godziny_do_odrobienia")}
                >
                  <div className="flex items-center gap-2">
                    Do odrobienia
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>

                <th
                  className="px-4 py-3 text-left text-sm font-medium text-gray-700 cursor-pointer hover:bg-gray-100"
                  onClick={() => handleSort("createdAt")}
                >
                  <div className="flex items-center gap-2">
                    Data utworzenia
                    <ArrowUpDown className="w-4 h-4" />
                  </div>
                </th>
                <th className="px-4 py-3 text-right text-sm font-medium text-gray-700">
                  Akcje
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredRecords?.map?.((record, index) => (
                <motion.tr
                  key={record?.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: index * 0.05 }}
                  className="hover:bg-gray-50"
                >
                  <td className="px-4 py-3">
                    <Checkbox
                      checked={(selectedIds ?? [])?.includes?.(record?.id)}
                      onCheckedChange={(checked) =>
                        handleSelectOne(record?.id, checked as boolean)
                      }
                    />
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {record?.nazwisko}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900">
                    {record?.imie}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {record?.kow || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-900 font-medium">
                    {record?.suma}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {record?.godziny_do_odrobienia || "-"}
                  </td>
                  <td className="px-4 py-3 text-sm text-gray-600">
                    {record?.createdAt
                      ? format(new Date(record.createdAt), "dd.MM.yyyy", {
                          locale: pl,
                        })
                      : "-"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <Link href={`/rekordy/${record?.id}`}>
                      <Button variant="ghost" size="sm">
                        Edytuj
                      </Button>
                    </Link>
                  </td>
                </motion.tr>
              )) ?? null}
            </tbody>
          </table>
          {filteredRecords?.length === 0 && (
            <div className="text-center py-12 text-gray-500">
              Brak rekordów do wyświetlenia
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
