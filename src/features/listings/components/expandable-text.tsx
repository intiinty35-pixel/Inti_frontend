"use client";

import { useEffect, useMemo, useRef, useState } from "react";

export interface ExpandableTextProps {
  text: string;
  lines?: number;
  maxWords?: number;
  className?: string;
}

export function ExpandableText({ text, lines = 4, maxWords, className }: ExpandableTextProps) {
  const ref = useRef<HTMLParagraphElement>(null);
  const [expanded, setExpanded] = useState(false);
  const [overflows, setOverflows] = useState(false);

  const normalizedText = useMemo(() => {
    return text
      .split("\n")
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n");
  }, [text]);

  const wordPreview = useMemo(() => {
    if (!maxWords) {
      return { text: normalizedText, truncated: false };
    }

    const words = normalizedText.trim().split(/\s+/).filter(Boolean);
    if (words.length <= maxWords) {
      return { text: normalizedText, truncated: false };
    }

    return {
      text: `${words.slice(0, maxWords).join(" ")}...`,
      truncated: true,
    };
  }, [maxWords, normalizedText]);

  useEffect(() => {
    if (maxWords) {
      setOverflows(false);
      return;
    }

    const el = ref.current;
    if (!el) return;

    const check = () => {
      if (!expanded) setOverflows(el.scrollHeight > el.clientHeight + 1);
    };

    check();
    window.addEventListener("resize", check);
    return () => window.removeEventListener("resize", check);
  }, [normalizedText, lines, expanded, maxWords]);

  const canToggle = maxWords ? wordPreview.truncated : overflows || expanded;
  const visibleText = expanded ? normalizedText : wordPreview.text;

  return (
    <div>
      <p
        ref={ref}
        className={className}
        style={
          expanded || maxWords
            ? undefined
            : { display: "-webkit-box", WebkitLineClamp: lines, WebkitBoxOrient: "vertical", overflow: "hidden" }
        }
      >
        {visibleText}
      </p>
      {canToggle ? (
        <button
          type="button"
          onClick={() => setExpanded((value) => !value)}
          aria-expanded={expanded}
          className="mt-2 text-sm font-bold text-brand underline-offset-4 hover:underline"
        >
          {expanded ? "Ver menos" : "Ver mas"}
        </button>
      ) : null}
    </div>
  );
}
