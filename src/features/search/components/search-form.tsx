"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Button, Select } from "@/shared/ui";
import type { SearchOperation, SearchPropertyType } from "@/features/search/types/search";
import { SEARCH_OPERATIONS, SEARCH_PROPERTY_TYPES } from "@/features/search/types/search";

export function SearchForm() {
  const router = useRouter();
  const [operation, setOperation] = useState<SearchOperation>("buy");
  const [type, setType] = useState<SearchPropertyType>("houses");

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    router.push(`/${operation}/${type}`);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="flex flex-col gap-3 rounded-card border border-edge bg-surface p-4 shadow-[var(--shadow-card)] sm:flex-row sm:items-end"
    >
      <Select
        label="Operation"
        value={operation}
        onChange={(event) => setOperation(event.target.value as SearchOperation)}
      >
        {SEARCH_OPERATIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <Select
        label="Property type"
        value={type}
        onChange={(event) => setType(event.target.value as SearchPropertyType)}
      >
        {SEARCH_PROPERTY_TYPES.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </Select>
      <Button type="submit">Search</Button>
    </form>
  );
}