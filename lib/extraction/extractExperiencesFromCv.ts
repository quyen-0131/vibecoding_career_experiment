import { activityCatalog } from "@/data/activityCatalog";
import type { DetectedActivity, DetectedExperience, ExperienceType } from "@/types/prototype";

const month = "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
const dateToken = `(?:(?:${month})\\s+)?(?:19|20)\\d{2}|Present|Current`;
const dateRangePattern = new RegExp(`^\\s*(${dateToken})(?:\\s*(?:-|–|—|to)\\s*(${dateToken}))?\\s*$`, "i");
const dateAnywherePattern = new RegExp(`(${dateToken})(?:\\s*(?:-|–|—|to)\\s*(${dateToken}))?\\s*$`, "i");
const roleWords = /\b(consultant|analyst|intern|co-?op|manager|researcher?|assistant|lead|coordinator|developer|designer|president|director|associate|volunteer|advisor|strategist|specialist|officer|project|administrator|producer|editor|writer|engineer)\b/i;
const descriptionStart = /^(designed|analysed|analyzed|created|developed|worked|managed|presented|conducted|led|supported|coordinated|delivered|responsible|selected|participated|assisted|collaborated|researched|wrote|built|used)\b/i;
const excludedExperienceWords = /\b(scholarship|award|honou?r|seminar|certification|certificate|course|programme participant|program participant|education|degree|diploma)\b/i;
const includedSectionPattern = /^(?:professional\s+)?(?:work\s+)?(?:experience|history)|employment|career history|professional background|internships?|projects?|leadership|volunteering|volunteer experience$/i;
const excludedSectionPattern = /^(?:education|awards?|honou?rs?|scholarships?|certifications?|courses?|seminars?|programmes?|programs?|skills?|summary|profile|publications?|languages?|interests?)$/i;
const locationWords = /\b(remote|hybrid|on-site|canada|vietnam|singapore|united states|united kingdom|usa|uk|bc|ontario|quebec)\b/i;

type HeaderCandidate = {
  index: number;
  headerEndIndex: number;
  title: string;
  organisation?: string;
  type: ExperienceType;
};

function cleanLines(cvText: string) {
  return cvText
    .replace(/\u00a0/g, " ")
    .split(/\r?\n/)
    .map((line) => line.replace(/\s+/g, " ").trim())
    .filter(Boolean);
}

function isSectionHeading(line: string) {
  return line.length <= 50 && (includedSectionPattern.test(line) || excludedSectionPattern.test(line));
}

function isIncludedSection(section: string) {
  return includedSectionPattern.test(section);
}

export function extractActivitiesFromExperience(text: string, experienceId: string): DetectedActivity[] {
  return activityCatalog
    .filter((definition) => definition.patterns.some((pattern) => pattern.test(text)))
    .map((definition, index) => ({
      id: `${experienceId}-${definition.id}-${index}`,
      canonicalId: definition.id,
      label: definition.label,
      category: definition.category,
      supportingText: text.match(definition.patterns.find((pattern) => pattern.test(text)) ?? /$^/)?.[0] ?? definition.label,
    }));
}

function stripTrailingDate(value: string) {
  const dateMatch = value.match(dateAnywherePattern);
  return {
    text: dateMatch ? value.slice(0, dateMatch.index).replace(/[|/·,\s–—-]+$/, "").trim() : value.trim(),
  };
}

export function isValidExperienceTitle(value: string) {
  const title = stripTrailingDate(value).text;
  return Boolean(
    title &&
    title.length <= 70 &&
    title.split(/\s+/).length <= 10 &&
    roleWords.test(title) &&
    !descriptionStart.test(title) &&
    !dateRangePattern.test(title) &&
    !excludedExperienceWords.test(title) &&
    !/selected to participate|responsible for|[:;]/i.test(title),
  );
}

function classifyExperience(title: string, section: string): ExperienceType {
  if (/intern|co-?op|placement/i.test(title)) return "internship";
  if (/volunteer/i.test(section) || /volunteer/i.test(title)) return "volunteer";
  if (/project/i.test(section) || /project|thesis|capstone/i.test(title)) return "project";
  return "work";
}

function looksLikeLocation(value: string) {
  if (/\b(university|college|institute|lab|laboratory|company|consulting|group|association|foundation|initiative|department)\b/i.test(value)) return false;
  return locationWords.test(value) || (/^[A-Z][A-Za-z .'-]+,\s*[A-Z][A-Za-z .'-]+$/.test(value) && !roleWords.test(value));
}

function getOrganisationCandidate(value: string) {
  const withoutDate = stripTrailingDate(value).text;
  const parts = withoutDate.split(/\s*(?:\||\/|·|\s[–—]\s)\s*/).map((part) => part.trim()).filter(Boolean);
  return parts.find((part) => (
    part.length >= 2 &&
    part.length <= 80 &&
    !isSectionHeading(part) &&
    !dateRangePattern.test(part) &&
    !isValidExperienceTitle(part) &&
    !descriptionStart.test(part) &&
    !excludedExperienceWords.test(part) &&
    !looksLikeLocation(part) &&
    !/[.!?]$/.test(part)
  ));
}

function parseCombinedHeader(line: string, index: number, section: string): HeaderCandidate | undefined {
  if (excludedSectionPattern.test(section) || excludedExperienceWords.test(line)) return undefined;
  const stripped = stripTrailingDate(line);
  const parts = stripped.text
    .split(/\s*(?:\||\/|·|\s[–—]\s)\s*/)
    .map((part) => part.trim())
    .filter((part) => part && !dateRangePattern.test(part));

  if (parts.length < 2 || parts.length > 5) return undefined;
  const title = parts.find(isValidExperienceTitle);
  if (!title) return undefined;
  const organisation = parts.find((part) => part !== title && getOrganisationCandidate(part));
  if (!organisation) return undefined;

  return {
    index,
    headerEndIndex: index,
    title: stripTrailingDate(title).text,
    organisation,
    type: classifyExperience(title, section),
  };
}

function parseSplitHeader(lines: string[], titleIndex: number, section: string): HeaderCandidate | undefined {
  const titleDetails = stripTrailingDate(lines[titleIndex]);
  if (!isValidExperienceTitle(titleDetails.text)) return undefined;

  const adjacentIndexes = [titleIndex - 1, titleIndex - 2, titleIndex + 1, titleIndex + 2].filter((index) => index >= 0 && index < lines.length);
  const organisationIndex = adjacentIndexes.find((index) => Boolean(getOrganisationCandidate(lines[index])));
  const organisation = organisationIndex === undefined ? undefined : getOrganisationCandidate(lines[organisationIndex]);
  if (!organisation && !isIncludedSection(section)) return undefined;

  const dateIndex = [titleIndex, titleIndex + 1, titleIndex + 2, titleIndex - 1]
    .filter((index) => index >= 0 && index < lines.length)
    .find((index) => Boolean(lines[index].match(dateAnywherePattern)));
  const headerIndexes = [titleIndex, organisationIndex, dateIndex].filter((index): index is number => index !== undefined);

  return {
    index: Math.min(...headerIndexes),
    headerEndIndex: Math.max(...headerIndexes),
    title: titleDetails.text,
    organisation,
    type: classifyExperience(titleDetails.text, section),
  };
}

export function extractExperiencesFromCv(cvText: string): DetectedExperience[] {
  // Product-discovery adapter: a future AI extractor should replace only this
  // deterministic parser and keep returning the same strict experience model.
  const lines = cleanLines(cvText);
  const candidates: HeaderCandidate[] = [];
  let currentSection = "";

  lines.forEach((line, index) => {
    if (isSectionHeading(line)) {
      currentSection = line;
      return;
    }
    if (currentSection && !isIncludedSection(currentSection)) return;

    const candidate = parseCombinedHeader(line, index, currentSection) ?? parseSplitHeader(lines, index, currentSection);
    if (!candidate) return;
    const duplicate = candidates.some((existing) => existing.title === candidate.title && existing.organisation === candidate.organisation && Math.abs(existing.index - candidate.index) <= 2);
    if (!duplicate) candidates.push(candidate);
  });

  candidates.sort((a, b) => a.index - b.index);
  return candidates.slice(0, 15).map((candidate, candidateIndex) => {
    const nextCandidateIndex = candidates[candidateIndex + 1]?.index ?? lines.length;
    const nextSectionOffset = lines.slice(candidate.headerEndIndex + 1).findIndex(isSectionHeading);
    const nextSectionIndex = nextSectionOffset >= 0 ? candidate.headerEndIndex + 1 + nextSectionOffset : lines.length;
    const nextIndex = Math.min(nextCandidateIndex, nextSectionIndex);
    const description = lines
      .slice(candidate.headerEndIndex + 1, nextIndex)
      .filter((line) => !isSectionHeading(line))
      .slice(0, 8)
      .join(" ");
    const id = `experience-${candidate.index}-${candidate.title.toLowerCase().replace(/[^a-z0-9]+/g, "-")}`;

    return {
      id,
      title: candidate.title,
      organisation: candidate.organisation,
      type: candidate.type,
      description,
      activities: extractActivitiesFromExperience(description, id),
    };
  });
}
