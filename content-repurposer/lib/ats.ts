const STOPWORDS = new Set([
  "the","and","for","with","that","this","from","your","you","are","our","their","they","will","have","has","had","was","were","been",
  "role","team","work","working","ability","skills","skill","experience","years","year","strong","good","great","excellent",
  "looking","seeking","required","preferred","responsibilities","responsibility","include","including","must","should","nice",
  "using","use","used","within","across","into","about","per","via","etc","etc."
]);

export const extractKeywords = (text: string) => {
  if (!text?.trim()) return [];
  return Array.from(
    new Set(
      text
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, " ")
        .split(/\s+/)
        .filter((w) => w.length >= 3 && !STOPWORDS.has(w))
    )
  );
};

export const scoreResumeAgainstJD = (resumeText: string, jobDescription: string) => {
  const jdKeywords = extractKeywords(jobDescription);
  const resumeKeywords = extractKeywords(resumeText);
  if (jdKeywords.length === 0) {
    return { score: 0, status: "Add JD", missing: [] as string[], matched: [] as string[] };
  }
  const resumeSet = new Set(resumeKeywords);
  const matched = jdKeywords.filter((k) => resumeSet.has(k));
  const missing = jdKeywords.filter((k) => !resumeSet.has(k));
  const score = Math.round((matched.length / jdKeywords.length) * 100);
  const status = score >= 70 ? "Apply" : score >= 45 ? "Wait" : "Fix";
  return { score, status, missing, matched };
};
