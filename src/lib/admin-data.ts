export type BookingStatus = "bevestigd" | "geannuleerd" | "voltooid";

export type Booking = {
  id: string;
  klantnaam: string;
  telefoonnummer: string;
  dienst: string;
  datum: string; // ISO date, e.g. "2026-09-18"
  tijd: string; // "13:30"
  status: BookingStatus;
};

function iso(year: number, month: number, day: number) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

const now = new Date();
const y = now.getFullYear();
const m = now.getMonth() + 1;

export const initialBookings: Booking[] = [
  {
    id: "bk-1",
    klantnaam: "Daan Willems",
    telefoonnummer: "06 12 34 56 78",
    dienst: "Knippen",
    datum: iso(y, m, 3),
    tijd: "09:30",
    status: "voltooid",
  },
  {
    id: "bk-2",
    klantnaam: "Sem de Groot",
    telefoonnummer: "06 23 45 67 89",
    dienst: "Knippen + Baard",
    datum: iso(y, m, 3),
    tijd: "11:00",
    status: "voltooid",
  },
  {
    id: "bk-3",
    klantnaam: "Milan Bakker",
    telefoonnummer: "06 34 56 78 90",
    dienst: "Baard",
    datum: iso(y, m, 8),
    tijd: "14:00",
    status: "bevestigd",
  },
  {
    id: "bk-4",
    klantnaam: "Lucas Jansen",
    telefoonnummer: "06 45 67 89 01",
    dienst: "Knippen",
    datum: iso(y, m, 8),
    tijd: "15:30",
    status: "bevestigd",
  },
  {
    id: "bk-5",
    klantnaam: "Finn Visser",
    telefoonnummer: "06 56 78 90 12",
    dienst: "Knippen + Baard",
    datum: iso(y, m, 8),
    tijd: "16:30",
    status: "geannuleerd",
  },
  {
    id: "bk-6",
    klantnaam: "Bram de Vries",
    telefoonnummer: "06 67 89 01 23",
    dienst: "Knippen",
    datum: iso(y, m, 12),
    tijd: "10:00",
    status: "bevestigd",
  },
  {
    id: "bk-7",
    klantnaam: "Noah Peters",
    telefoonnummer: "06 78 90 12 34",
    dienst: "Baard",
    datum: iso(y, m, 15),
    tijd: "12:30",
    status: "bevestigd",
  },
  {
    id: "bk-8",
    klantnaam: "Levi Smit",
    telefoonnummer: "06 89 01 23 45",
    dienst: "Knippen",
    datum: iso(y, m, 15),
    tijd: "13:00",
    status: "bevestigd",
  },
  {
    id: "bk-9",
    klantnaam: "Ties Mulder",
    telefoonnummer: "06 90 12 34 56",
    dienst: "Knippen + Baard",
    datum: iso(y, m, 15),
    tijd: "17:00",
    status: "bevestigd",
  },
  {
    id: "bk-10",
    klantnaam: "Jesse Dekker",
    telefoonnummer: "06 01 23 45 67",
    dienst: "Knippen",
    datum: iso(y, m, 21),
    tijd: "09:00",
    status: "bevestigd",
  },
  {
    id: "bk-11",
    klantnaam: "Cas Bos",
    telefoonnummer: "06 11 22 33 44",
    dienst: "Baard",
    datum: iso(y, m, 25),
    tijd: "11:30",
    status: "bevestigd",
  },
];
