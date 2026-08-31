import { activityCatalog, makeCustomActivityId } from "@/data/activityCatalog";
import type { DetectedActivity, DetectedExperience, ExperienceType } from "@/types/prototype";

const month = "(?:Jan(?:uary)?|Feb(?:ruary)?|Mar(?:ch)?|Apr(?:il)?|May|Jun(?:e)?|Jul(?:y)?|Aug(?:ust)?|Sep(?:t(?:ember)?)?|Oct(?:ober)?|Nov(?:ember)?|Dec(?:ember)?)";
const dateToken = `(?:(?:${month})\\s+)?(?:19|20)\\d{2}|Present|Current`;
const dateRangePattern = new RegExp(`^\\s*(${dateToken})(?:\\s*(?:-|–|—|to)\\s*(${dateToken}))?\\s*$`, "i");
const dateAnywherePattern = new RegExp(`(${dateToken})(?:\\s*(?:-|–|—|to)\\s*(${dateToken}))?\\s*$`, "i");
const roleWords = /\b(consultant|analyst|intern|co-?op|manager|researcher?|assistant|lead|coordinator|developer|designer|president|director|associate|volunteer|advisor|strategist|specialist|officer|project|administrator|producer|editor|writer|engineer)\b/i;
const bulletPrefixPattern = /^\s*[-*•▪◦‣]\s*/;
const descriptionStart = /^(?:[-*•▪◦‣]\s*)?(?:achieved|administered|advised|analysed|analyzed|assessed|assisted|audited|built|collaborated|communicated|conducted|coordinated|created|cultivated|delivered|designed|developed|documented|ensured|evaluated|facilitated|guided|handled|hosted|implemented|improved|investigated|led|liaised|maintained|managed|mentored|monitored|organised|organized|oversaw|participated|prepared|presented|processed|produced|promoted|provided|researched|responded|responsible|reviewed|scheduled|selected|supported|tracked|trained|used|verified|worked|wrote|administer(?:s)?|advise(?:s)?|analyse(?:s)?|analyze(?:s)?|assess(?:es)?|assist(?:s)?|communicate(?:s)?|conduct(?:s)?|coordinate(?:s)?|create(?:s)?|deliver(?:s)?|design(?:s)?|develop(?:s)?|document(?:s)?|ensure(?:s)?|evaluate(?:s)?|facilitate(?:s)?|handle(?:s)?|implement(?:s)?|investigate(?:s)?|maintain(?:s)?|manage(?:s)?|prepare(?:s)?|present(?:s)?|process(?:es)?|provide(?:s)?|research(?:es)?|respond(?:s)?|review(?:s)?|schedule(?:s)?|support(?:s)?|track(?:s)?|train(?:s)?|verify|verifies|write(?:s)?|(?:administrative|operational|case|policy|record|records|faculty|student|client|stakeholder|project|programme|program|research|data)\s+(?:support|management|review|coordination|analysis|processing|documentation|communication|administration))\b/i;
const excludedExperienceWords = /\b(scholarship|award|honou?r|seminar|certification|certificate|course|programme participant|program participant|education|degree|diploma)\b/i;
// The alternation must be wrapped: without the group, `^` bound only to the
// first branch, so words like "projects" or "leadership" matched anywhere in
// a line. Any short bullet mentioning them was treated as a section heading
// and silently dropped from the CV.
const includedSectionPattern = /^(?:(?:professional\s+)?(?:work\s+)?(?:experience|history)|employment|career history|professional background|internships?|projects?|leadership|volunteering|volunteer experience)\s*:?\s*$/i;
const excludedSectionPattern = /^(?:education|awards?|honou?rs?|scholarships?|certifications?|courses?|seminars?|programmes?|programs?|skills?|summary|profile|publications?|languages?|interests?)$/i;
const locationWords = /\b(remote|hybrid|on-site|canada|vietnam|singapore|united states|united kingdom|usa|uk|bc|ontario|quebec)\b/i;
const activitySentenceStart = descriptionStart;
const activityNounPhrase = /\b(analysis|assessment|communication|coordination|delivery|design|development|documentation|evaluation|implementation|investigation|liaison|management|planning|presentation|processing|research|review|support|training|writing)\b/i;

type HeaderCandidate = {
  index: number;
  /** The section heading this candidate was found under, if any. */
  section?: string;
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

function isExcludedSectionHeading(line: string) {
  return line.length <= 50 && excludedSectionPattern.test(line);
}

function findSupportingSentence(text: string, patterns: RegExp[], fallback: string) {
  const sentences = text
    .split(/\n|(?<=[.!?])\s+/)
    .map((sentence) => sentence.replace(bulletPrefixPattern, "").replace(/\s+/g, " ").trim())
    .filter(Boolean);
  return sentences.find((sentence) => patterns.some((pattern) => pattern.test(sentence))) ?? fallback;
}

export function extractActivitiesFromExperience(text: string, experienceId: string): DetectedActivity[] {
  const catalogActivities = activityCatalog
    .filter((definition) => definition.patterns.some((pattern) => pattern.test(text)))
    .map((definition, index) => ({
      id: `${experienceId}-${definition.id}-${index}`,
      canonicalId: definition.id,
      label: definition.label,
      category: definition.category,
      supportingText: findSupportingSentence(text, definition.patterns, definition.label),
    }));

  // Preserve action statements that the temporary catalogue does not yet
  // understand. This remains evidence from the CV rather than an inferred task.
  const fallbackActivities = text
    .split(/\n|(?<=[.!?])\s+/)
    .map((rawSentence) => ({
      wasBullet: bulletPrefixPattern.test(rawSentence),
      sentence: rawSentence.replace(bulletPrefixPattern, "").replace(/\s+/g, " ").trim(),
    }))
    .filter(({ sentence }) => sentence.length >= 12 && sentence.length <= 260)
    .filter(({ sentence, wasBullet }) => (
      wasBullet
      || activitySentenceStart.test(sentence)
      || (
        activityNounPhrase.test(sentence)
        && !isSectionHeading(sentence)
        && !dateRangePattern.test(sentence)
        && !looksLikeLocation(sentence)
        && !isValidExperienceTitle(sentence)
      )
    ))
    .filter(({ sentence }) => !activityCatalog.some((definition) => definition.patterns.some((pattern) => pattern.test(sentence))))
    .slice(0, 8)
    .map(({ sentence }, index) => {
      const label = sentence.replace(/[.!?]+$/, "");
      const canonicalId = makeCustomActivityId(label);
      return {
        id: `${experienceId}-${canonicalId}-${index}`,
        canonicalId,
        label,
        category: "Other" as const,
        supportingText: sentence,
      };
    });

  return [...catalogActivities, ...fallbackActivities];
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
    !bulletPrefixPattern.test(title) &&
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
    !bulletPrefixPattern.test(part) &&
    !descriptionStart.test(part) &&
    !excludedExperienceWords.test(part) &&
    !looksLikeLocation(part) &&
    !/[.!?]$/.test(part)
  ));
}

const projectSectionPattern = /^(?:projects?|leadership|volunteering)s*:?s*$/i;

function isDifferentSectionHeading(line: string, section?: string) {
  if (!isSectionHeading(line)) return false;
  return !section || line.toLowerCase() !== section.toLowerCase();
}

/**
 * A project is usually titled by its name alone - "Career Experiment" - with
 * no employer and no role word, so the normal header parsers reject it and its
 * bullets get absorbed into whichever job precedes it. Inside a projects
 * section we accept a short, non-sentence line as an entry in its own right.
 */
function parseProjectEntry(line: string, index: number, section: string): HeaderCandidate | undefined {
  if (!projectSectionPattern.test(section)) return undefined;
  const title = stripTrailingDate(line).text;
  const plausible =
    title.length >= 3 &&
    title.length <= 80 &&
    title.split(/s+/).length <= 8 &&
    !isSectionHeading(title) &&
    !dateRangePattern.test(title) &&
    !bulletPrefixPattern.test(line) &&
    !descriptionStart.test(title) &&
    !excludedExperienceWords.test(title) &&
    !/[.!?,;:]$/.test(title);
  if (!plausible) return undefined;
  return { index, headerEndIndex: index, title, section, type: "project" };
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
    section,
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

  // Dates are not part of the experience contract and should not extend a
  // header into nearby content. They can remain in the internal description;
  // activity extraction already ignores standalone date lines.
  const headerIndexes = [titleIndex, organisationIndex].filter((index): index is number => index !== undefined);

  return {
    index: Math.min(...headerIndexes),
    headerEndIndex: Math.max(...headerIndexes),
    title: titleDetails.text,
    section,
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

    const candidate = parseCombinedHeader(line, index, currentSection) ?? parseSplitHeader(lines, index, currentSection) ?? parseProjectEntry(line, index, currentSection);
    if (!candidate) return;
    const duplicate = candidates.some((existing) => existing.title === candidate.title && existing.organisation === candidate.organisation && Math.abs(existing.index - candidate.index) <= 2);
    if (!duplicate) candidates.push(candidate);
  });

  candidates.sort((a, b) => a.index - b.index);
  return candidates.slice(0, 15).map((candidate, candidateIndex) => {
    const nextCandidateIndex = candidates[candidateIndex + 1]?.index ?? lines.length;
    // CV templates often repeat "Work Experience" at the top of a new page, so
    // the same heading repeating must not cut a role off from bullets that
    // continue after the break. A *different* section heading does end it:
    // otherwise a Projects section is absorbed into the job above it and its
    // activities are attributed to the wrong employer.
    const nextSectionOffset = lines
      .slice(candidate.headerEndIndex + 1)
      .findIndex((line) => isExcludedSectionHeading(line) || isDifferentSectionHeading(line, candidate.section));
    const nextSectionIndex = nextSectionOffset >= 0 ? candidate.headerEndIndex + 1 + nextSectionOffset : lines.length;
    const nextIndex = Math.min(nextCandidateIndex, nextSectionIndex);
    const description = lines
      .slice(candidate.headerEndIndex + 1, nextIndex)
      .filter((line) => !isSectionHeading(line))
      .slice(0, 8)
      .join("\n");
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
