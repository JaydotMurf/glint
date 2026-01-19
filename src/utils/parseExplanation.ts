export interface ParsedExplanationStep {
  title: string;
  description: string;
}

export interface ParsedExplanation {
  intro: string;
  steps: ParsedExplanationStep[];
  keyTakeaway: string | null;
  remainder: string;
}

function stripMarkdown(text: string) {
  return text.replace(/\*\*/g, "").replace(/__/g, "").trim();
}

/**
 * parseExplanation(text)
 *
 * Turns an AI explanation into:
 * - intro paragraph(s)
 * - numbered steps (1–N)
 * - an optional key takeaway section
 * - any trailing remainder text
 *
 * Detects:
 * - Numbered lines: "1.", "2)", "3)" ...
 * - Ordinal starters: "First," "Second," "Finally," ...
 * - Takeaway lines/headings: "Key Takeaway:", "### Key Takeaway", "In short:" ...
 */
export function parseExplanation(raw: string): ParsedExplanation {
  const content = (raw ?? "").replace(/\r\n/g, "\n").trim();
  const lines = content.split("\n");

  const steps: ParsedExplanationStep[] = [];
  let intro = "";
  let remainder = "";
  let keyTakeaway: string | null = null;

  let inSteps = false;
  let afterSteps = false;

  const numberedStepRegex = /^(?:\*\*)?(?:step\s*)?(\d+)[.)]\s+(.+)$/i;
  const ordinalRegex = /^(?:\*\*)?(first|second|third|fourth|fifth|next|then|finally|lastly)(?:\*\*)?,?\s+(.+)$/i;

  const takeawayRegexes: RegExp[] = [
    /^(?:[-*]\s*)?(?:#{1,6}\s*)?(?:\*\*)?(key\s*takeaway|takeaway)(?:\*\*)?(?::|\s|$)/i,
    /^(?:[-*]\s*)?(?:#{1,6}\s*)?(?:\*\*)?(in\s*short|in\s*summary|to\s*summarize|bottom\s*line|tldr|tl;dr)(?:\*\*)?(?::|\s|$)/i,
    /^(?:[-*]\s*)?(?:#{1,6}\s*)?(?:\*\*)?(remember|the\s*key\s*point|most\s*importantly|now\s*you\s*can\s*say)(?:\*\*)?(?::|\s|$)/i,
  ];

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) {
      if (afterSteps && remainder) remainder += "\n";
      continue;
    }

    // Key Takeaway detection (optionally as a heading)
    const takeawayMatch = takeawayRegexes.find((r) => r.test(line));
    if (takeawayMatch) {
      // remove the first matched label/heading prefix
      const withoutPrefix = line
        .replace(/^(?:[-*]\s*)?(?:#{1,6}\s*)?/, "")
        .replace(/^(?:\*\*)?/, "")
        .replace(/^(?:key\s*takeaway|takeaway|in\s*short|in\s*summary|to\s*summarize|bottom\s*line|tldr|tl;dr|remember|the\s*key\s*point|most\s*importantly|now\s*you\s*can\s*say)(?:\*\*)?/i, "")
        .replace(/^[:\s]+/, "")
        .trim();

      const rest = lines.slice(i + 1).join(" ").trim();
      keyTakeaway = stripMarkdown(withoutPrefix || rest);
      break;
    }

    // Step detection
    const numbered = line.match(numberedStepRegex);
    const ordinal = line.match(ordinalRegex);

    if (numbered || ordinal) {
      inSteps = true;

      const stepText = stripMarkdown((numbered ? numbered[2] : ordinal![2]) ?? "");

      // split "Title — description" / "Title: description" / "Title - description"
      const split = stepText.match(/^([^–—\-:]+)[–—\-:]+\s*(.+)$/);
      if (split) {
        steps.push({ title: split[1].trim(), description: split[2].trim() });
      } else {
        steps.push({ title: stepText, description: "" });
      }

      continue;
    }

    // Intro vs remainder
    if (!inSteps) {
      intro += (intro ? " " : "") + stripMarkdown(line);
    } else {
      afterSteps = true;
      remainder += (remainder ? " " : "") + stripMarkdown(line);
    }
  }

  return { intro, steps, keyTakeaway, remainder };
}
