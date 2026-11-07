import { useEffect, useRef, useState } from "react";
import { Plus } from "lucide-react";
import { translateText, type StoreLanguage } from "@/lib/storefront-language";

type AddToBagButtonProps = {
  productId: string;
  productName: string;
  language: StoreLanguage;
  onAdd: () => void;
};

/** Each product owns its feedback timer, including repeated, quick additions. */
export function AddToBagButton({ productId, productName, language, onAdd }: AddToBagButtonProps) {
  const [added, setAdded] = useState(false);
  const timeout = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timeout.current), []);

  const handleAdd = () => {
    onAdd();
    setAdded(true);
    window.clearTimeout(timeout.current);
    timeout.current = window.setTimeout(() => setAdded(false), 2000);
  };

  return (
    <div className="lp-add-action">
      <button
        type="button"
        className="lp-add-small lp-card-add"
        data-testid={`add-to-bag-${productId}`}
        aria-label={translateText(`Add ${productName} to bag`, language)}
        onClick={handleAdd}
      >
        <Plus /> {translateText("Add to Bag", language)}
      </button>
      <span className="lp-add-feedback" role="status" aria-live="polite" aria-atomic="true">
        {added ? translateText("Added 🐾", language) : ""}
      </span>
    </div>
  );
}
