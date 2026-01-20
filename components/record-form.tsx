"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, Plus, Trash2, Save, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { pl } from "date-fns/locale";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";

interface TimeEntry {
  date: Date | null;
  hours: string;
}

interface RecordFormProps {
  initialData?: any;
  isEdit?: boolean;
}

export function RecordForm({ initialData, isEdit = false }: RecordFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Case references
  const [kow, setKow] = useState(initialData?.kow || "");
  const [wo, setWo] = useState(initialData?.wo || "");
  const [ii_k, setIiK] = useState(initialData?.ii_k || "");

  // Personal info
  const [nazwisko, setNazwisko] = useState(initialData?.nazwisko || "");
  const [imie, setImie] = useState(initialData?.imie || "");
  const [kod, setKod] = useState(initialData?.kod || "");
  const [miejscowosc, setMiejscowosc] = useState(
    initialData?.miejscowosc || ""
  );
  const [ulica, setUlica] = useState(initialData?.ulica || "");
  const [nr_domu, setNrDomu] = useState(initialData?.nr_domu || "");
  const [nr_lokalu, setNrLokalu] = useState(initialData?.nr_lokalu || "");
  const [nr_tel, setNrTel] = useState(initialData?.nr_tel || "");
  const [miesieczny_wymiar_godzin, setMiesiecznyWymiarGodzin] = useState(
    initialData?.miesieczny_wymiar_godzin?.toString() || ""
  );
  const [ilosc_miesiecy, setIloscMiesiecy] = useState(
    initialData?.ilosc_miesiecy?.toString() || ""
  );

  // Calculate suma godzin wyroku
  const sumaGodzinWyroku = (parseInt(miesieczny_wymiar_godzin) || 0) * (parseInt(ilosc_miesiecy) || 0);

  // Dates
  const [data1, setData1] = useState<Date | null>(
    initialData?.data1 ? new Date(initialData.data1) : null
  );
  const [data2, setData2] = useState<Date | null>(
    initialData?.data2 ? new Date(initialData.data2) : null
  );

  // Comments
  const [uwagi, setUwagi] = useState(initialData?.uwagi || "");

  // Time entries
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>(() => {
    if (initialData?.timeEntries && Array.isArray(initialData.timeEntries)) {
      return initialData.timeEntries.map((entry: any) => ({
        date: entry?.date ? new Date(entry.date) : null,
        hours: entry?.hours?.toString() || "",
      }));
    }
    return [{ date: null, hours: "" }];
  });

  // Calculate sum
  const suma = timeEntries?.reduce?.(
    (total, entry) => total + (parseFloat(entry?.hours) || 0),
    0
  ) ?? 0;

  const handleAddTimeEntry = () => {
    if ((timeEntries ?? [])?.length < 14) {
      setTimeEntries([...(timeEntries ?? []), { date: null, hours: "" }]);
    }
  };

  const handleRemoveTimeEntry = (index: number) => {
    setTimeEntries((timeEntries ?? [])?.filter?.((_, i) => i !== index) ?? []);
  };

  const handleTimeEntryChange = (
    index: number,
    field: "date" | "hours",
    value: any
  ) => {
    const newEntries = [...(timeEntries ?? [])];
    if (newEntries[index]) {
      newEntries[index] = { ...newEntries[index], [field]: value };
      setTimeEntries(newEntries);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!nazwisko || !imie) {
      alert("Nazwisko i imię są wymagane");
      return;
    }

    setIsLoading(true);

    const data = {
      kow,
      wo,
      ii_k,
      nazwisko,
      imie,
      kod,
      miejscowosc,
      ulica,
      nr_domu,
      nr_lokalu,
      nr_tel,
      miesieczny_wymiar_godzin: miesieczny_wymiar_godzin ? parseInt(miesieczny_wymiar_godzin) : null,
      ilosc_miesiecy: ilosc_miesiecy ? parseInt(ilosc_miesiecy) : null,
      data1: data1 ? data1.toISOString() : null,
      data2: data2 ? data2.toISOString() : null,
      uwagi,
      timeEntries: timeEntries
        .filter((entry) => entry?.date || entry?.hours)
        .map((entry) => ({
          date: entry?.date ? entry.date.toISOString() : null,
          hours: parseFloat(entry?.hours) || 0,
        })),
    };

    try {
      const url = isEdit
        ? `/api/records/${initialData?.id}`
        : "/api/records";
      const method = isEdit ? "PUT" : "POST";

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (response?.ok) {
        router.push("/rekordy");
        router.refresh();
      } else {
        const errorData = await response.json();
        alert(errorData?.error || "Wystąpił błąd");
      }
    } catch (error) {
      console.error("Submit error:", error);
      alert("Wystąpił błąd podczas zapisywania");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8">
      {/* Case References */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Numery spraw
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="kow">Kow</Label>
            <Input
              id="kow"
              value={kow}
              onChange={(e) => setKow(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="wo">Wo</Label>
            <Input
              id="wo"
              value={wo}
              onChange={(e) => setWo(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="ii_k">II K</Label>
            <Input
              id="ii_k"
              value={ii_k}
              onChange={(e) => setIiK(e.target.value)}
              className="mt-1"
            />
          </div>
        </div>
      </div>

      {/* Personal Information */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Dane osobowe
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label htmlFor="nazwisko">
              Nazwisko <span className="text-red-500">*</span>
            </Label>
            <Input
              id="nazwisko"
              value={nazwisko}
              onChange={(e) => setNazwisko(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="imie">
              Imię <span className="text-red-500">*</span>
            </Label>
            <Input
              id="imie"
              value={imie}
              onChange={(e) => setImie(e.target.value)}
              required
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="kod">Kod pocztowy</Label>
            <Input
              id="kod"
              value={kod}
              onChange={(e) => setKod(e.target.value)}
              placeholder="00-000"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="miejscowosc">Miejscowość</Label>
            <Input
              id="miejscowosc"
              value={miejscowosc}
              onChange={(e) => setMiejscowosc(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="ulica">Ulica</Label>
            <Input
              id="ulica"
              value={ulica}
              onChange={(e) => setUlica(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="nr_domu">Numer domu</Label>
            <Input
              id="nr_domu"
              value={nr_domu}
              onChange={(e) => setNrDomu(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="nr_lokalu">Numer lokalu</Label>
            <Input
              id="nr_lokalu"
              value={nr_lokalu}
              onChange={(e) => setNrLokalu(e.target.value)}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="nr_tel">Nr tel. (+48)</Label>
            <Input
              id="nr_tel"
              value={nr_tel}
              onChange={(e) => setNrTel(e.target.value)}
              placeholder="+48"
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="miesieczny_wymiar_godzin">Miesięczny wymiar godzin wyroku</Label>
            <Input
              id="miesieczny_wymiar_godzin"
              type="number"
              value={miesieczny_wymiar_godzin}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || (parseInt(val) >= 0 && parseInt(val) <= 999)) {
                  setMiesiecznyWymiarGodzin(val.slice(0, 3));
                }
              }}
              className="mt-1"
              min="0"
              max="999"
              maxLength={3}
            />
          </div>
          <div>
            <Label htmlFor="ilosc_miesiecy">Ilość miesięcy wynikająca z wyroku</Label>
            <Input
              id="ilosc_miesiecy"
              type="number"
              value={ilosc_miesiecy}
              onChange={(e) => {
                const val = e.target.value;
                if (val === "" || (parseInt(val) >= 0 && parseInt(val) <= 99)) {
                  setIloscMiesiecy(val.slice(0, 2));
                }
              }}
              className="mt-1"
              min="0"
              max="99"
              maxLength={2}
            />
          </div>
          <div>
            <Label>Suma godzin wyroku</Label>
            <div className="mt-1 h-10 px-3 rounded-md border border-input bg-gray-100 flex items-center font-semibold text-blue-600">
              {sumaGodzinWyroku} h
            </div>
          </div>
        </div>
      </div>

      {/* Dates */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Daty</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Data rozpoczęcia prac</Label>
            <div className="mt-1 relative">
              {isMounted ? (
                <DatePicker
                  selected={data1}
                  onChange={(date: Date | null) => setData1(date)}
                  dateFormat="dd.MM.yyyy"
                  locale={pl}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  placeholderText="Wybierz datę"
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                />
              ) : (
                <div className="h-10 bg-gray-100 rounded animate-pulse" />
              )}
            </div>
          </div>
          <div>
            <Label>Data zakończenia prac</Label>
            <div className="mt-1 relative">
              {isMounted ? (
                <DatePicker
                  selected={data2}
                  onChange={(date: Date | null) => setData2(date)}
                  dateFormat="dd.MM.yyyy"
                  locale={pl}
                  className="w-full h-10 px-3 rounded-md border border-input bg-background"
                  placeholderText="Wybierz datę"
                  showYearDropdown
                  showMonthDropdown
                  dropdownMode="select"
                />
              ) : (
                <div className="h-10 bg-gray-100 rounded animate-pulse" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Time Entries */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">
            Ewidencja godzin
          </h2>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={() => {
                if (window.confirm("Uwaga! Zostaną usunięte wszystkie daty u tej osoby. OK?")) {
                  setTimeEntries([{ date: null, hours: "" }]);
                }
              }}
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Usuń wszystkie daty
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAddTimeEntry}
              disabled={(timeEntries ?? [])?.length >= 14}
            >
              <Plus className="w-4 h-4 mr-2" />
              Dodaj wpis
            </Button>
          </div>
        </div>

        <div className="space-y-3">
          {timeEntries?.map?.((entry, index) => (
            <div key={index} className="flex gap-3 items-end">
              <div className="flex-1">
                <Label className="text-sm">Data</Label>
                {isMounted ? (
                  <DatePicker
                    selected={entry?.date}
                    onChange={(date: Date | null) =>
                      handleTimeEntryChange(index, "date", date)
                    }
                    dateFormat="dd.MM.yyyy"
                    locale={pl}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background mt-1"
                    placeholderText="Wybierz datę"
                  />
                ) : (
                  <div className="h-10 bg-gray-100 rounded animate-pulse mt-1" />
                )}
              </div>
              <div className="flex-1">
                <Label className="text-sm">Liczba godzin</Label>
                <Input
                  type="number"
                  step="0.5"
                  min="0"
                  value={entry?.hours}
                  onChange={(e) =>
                    handleTimeEntryChange(index, "hours", e.target.value)
                  }
                  placeholder="0"
                  className="mt-1"
                />
              </div>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                onClick={() => handleRemoveTimeEntry(index)}
                disabled={(timeEntries ?? [])?.length === 1}
              >
                <Trash2 className="w-4 h-4 text-red-600" />
              </Button>
            </div>
          )) ?? null}
        </div>

        <div className="mt-6 pt-4 border-t border-gray-200">
          <div className="flex items-center justify-between">
            <span className="text-lg font-semibold text-gray-900">Suma:</span>
            <span className="text-2xl font-bold text-blue-600">
              {suma?.toFixed?.(1) ?? "0.0"} h
            </span>
          </div>
        </div>
      </div>

      {/* Comments */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Uwagi i ocena pracy
        </h2>
        <Textarea
          value={uwagi}
          onChange={(e) => setUwagi(e.target.value)}
          placeholder="Wprowadź uwagi dotyczące zachowania i pracy..."
          rows={4}
          className="resize-none"
        />
      </div>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading} className="flex-1">
          {isLoading ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Save className="w-4 h-4 mr-2" />
          )}
          {isEdit ? "Zapisz zmiany" : "Utwórz rekord"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/rekordy")}
          disabled={isLoading}
        >
          Anuluj
        </Button>
      </div>
    </form>
  );
}
