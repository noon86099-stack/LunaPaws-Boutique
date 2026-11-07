import { LoaderCircle, RefreshCw, ShoppingBag } from "lucide-react";
import { translateText, type StoreLanguage } from "@/lib/storefront-language";

type CatalogStateProps = {
  state: "loading" | "error" | "empty";
  language: StoreLanguage;
  onRetry?: () => void;
};

export function CatalogState({ state, language, onRetry }: CatalogStateProps) {
  const copy = {
    loading: ["Loading the collection...", "A little comfort is on its way."],
    error: ["We couldn't load the collection.", "Please check your connection and try again."],
    empty: ["Our collection is being prepared.", "Please check back soon for new cat comforts."],
  }[state];
  return (
    <div className="lp-empty-products lp-catalog-state" role={state === "error" ? "alert" : "status"} aria-live="polite">
      {state === "loading" ? <LoaderCircle className="lp-loading-icon" /> : <ShoppingBag />}
      <h3>{translateText(copy[0]!, language)}</h3>
      <p>{translateText(copy[1]!, language)}</p>
      {state !== "loading" && onRetry && (
        <button className="lp-button" onClick={onRetry}>
          <RefreshCw /> {translateText(state === "error" ? "Try again" : "Refresh collection", language)}
        </button>
      )}
    </div>
  );
}
