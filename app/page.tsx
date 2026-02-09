import { redirect } from "next/navigation";

const DEFAULT_SEARCH =
  "/search?searchType=tours&departureId=27&adults=2&children=0&sortBy=rating&budgetMin=0&budgetMax=3000000";

export default function HomePage() {
  redirect(DEFAULT_SEARCH);
}
