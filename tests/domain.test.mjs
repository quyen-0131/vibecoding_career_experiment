import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { dirname, resolve } from "node:path";
import { createRequire } from "node:module";
import test from "node:test";
import ts from "typescript";

const root = resolve(import.meta.dirname, "..");
const cache = new Map();
const nodeRequire = createRequire(import.meta.url);

function loadTypeScriptModule(relativePath) {
  const filename = resolve(root, relativePath);
  if (cache.has(filename)) return cache.get(filename).exports;
  const loadedModule = { exports: {} };
  cache.set(filename, loadedModule);
  const source = readFileSync(filename, "utf8");
  const output = ts.transpileModule(source, {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020, esModuleInterop: true },
    fileName: filename,
  }).outputText;
  const localRequire = (specifier) => {
    if (specifier.startsWith("@/")) return loadTypeScriptModule(`${specifier.slice(2)}.ts`);
    if (specifier.startsWith(".")) return loadTypeScriptModule(`${resolve(dirname(filename), specifier)}.ts`);
    return nodeRequire(specifier);
  };
  new Function("require", "module", "exports", output)(localRequire, loadedModule, loadedModule.exports);
  return loadedModule.exports;
}

const { sampleCvText, sampleExperiences } = loadTypeScriptModule("data/prototype.ts");
const { extractExperiencesFromCv, isValidExperienceTitle } = loadTypeScriptModule("lib/extraction/extractExperiencesFromCv.ts");
const { reconstructPdfPageText } = loadTypeScriptModule("lib/pdf/reconstructPdfPageText.ts");
const { createManualActivity, parsePastedActivities } = loadTypeScriptModule("lib/extraction/parseManualActivities.ts");
const { normalizeActivities } = loadTypeScriptModule("lib/evidence/normalizeActivities.ts");
const { selectTopEvidenceActivities } = loadTypeScriptModule("lib/evidence/selectTopEvidenceActivities.ts");
const { buildCareerEvidenceMatrix } = loadTypeScriptModule("lib/evidence/buildCareerEvidenceMatrix.ts");
const { buildStartingEvidence } = loadTypeScriptModule("lib/evidence/buildStartingEvidence.ts");
const { generateUncertaintyChoices } = loadTypeScriptModule("lib/evidence/generateUncertaintyChoices.ts");
const { needsForcedPriorityChoice, canContinuePrioritySelection } = loadTypeScriptModule("lib/evidence/priorities.ts");
const { careers, getCareerActivity, getRemainingEvidenceGaps } = loadTypeScriptModule("data/careers.ts");

test("career catalogue contains seven peer-level job titles", () => {
  assert.deepEqual(careers.map((career) => career.title), [
    "Product Manager",
    "Behavioural Science Consultant",
    "Data Scientist",
    "Product Analyst",
    "UX Researcher",
    "Management Consultant",
    "Consumer Insights Researcher",
  ]);
  assert.ok(careers.every((career) => !/Growth|AI Product|Data Product/.test(career.title)));
});

test("detects multiple meaningful experiences and excludes awards and programmes", () => {
  const detected = extractExperiencesFromCv(sampleCvText);
  assert.ok(detected.length >= 3, `expected at least 3 experiences, received ${detected.length}`);
  assert.ok(detected.every((experience) => experience.title && experience.type && !/scholarship|seminar/i.test(experience.title)));
  assert.ok(detected.every((experience) => isValidExperienceTitle(experience.title)));
});

test("separates role and organisation without adding dates to the experience model", () => {
  const cv = `WORK EXPERIENCE\nDecision Lab / Consultant / Ho Chi Minh, Vietnam / Sep 2025 – Present\nDesigned research and advised clients.\nUniversity Canada West | Academic Integrity Assistant | Jul 2022 - Mar 2023\nReviewed cases and communicated with stakeholders.\nAWARDS\nFuture Leaders Scholarship | Jul 2022\nPROGRAMMES\nMar 2025): Selected to participate in a short seminar.`;
  const detected = extractExperiencesFromCv(cv);
  assert.equal(detected.length, 2);
  assert.deepEqual({ title: detected[0].title, organisation: detected[0].organisation }, { title: "Consultant", organisation: "Decision Lab" });
  assert.ok(detected.every((experience) => !("startDate" in experience) && !("endDate" in experience)));
  assert.equal(detected[1].title, "Academic Integrity Assistant");
  assert.ok(detected.every((experience) => !/^(Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec|\d{4})/i.test(experience.title)));
});

test("detects experiences when organisation, role and dates are on separate lines", () => {
  const cv = `WORK EXPERIENCE\nDecision Lab\nConsultant\nSep 2025 – Present\nDesigned behavioural research and presented recommendations.\nTrulioo\nLearning & Development Co-op\nMay 2024 – Aug 2024\nCreated reports and worked with stakeholders.\nAWARDS\nFuture Leaders Scholarship\n2024`;
  const detected = extractExperiencesFromCv(cv);
  assert.equal(detected.length, 2);
  assert.deepEqual(detected.map(({ title, organisation }) => ({ title, organisation })), [
    { title: "Consultant", organisation: "Decision Lab" },
    { title: "Learning & Development Co-op", organisation: "Trulioo" },
  ]);
  assert.ok(detected.every((experience) => !("startDate" in experience) && !("endDate" in experience)));
});

test("reconstructs PDF lines before experience extraction", () => {
  const text = reconstructPdfPageText([
    { str: "Decision Lab", transform: [1, 0, 0, 1, 40, 700], width: 70 },
    { str: "Sep 2025 – Present", transform: [1, 0, 0, 1, 390, 700], width: 110 },
    { str: "Consultant", transform: [1, 0, 0, 1, 40, 680], width: 60 },
    { str: "Designed behavioural research", transform: [1, 0, 0, 1, 40, 660], width: 180 },
  ]);
  assert.equal(text, "Decision Lab | Sep 2025 – Present\nConsultant\nDesigned behavioural research");
  const [experience] = extractExperiencesFromCv(`WORK EXPERIENCE\n${text}`);
  assert.equal(experience.title, "Consultant");
  assert.equal(experience.organisation, "Decision Lab");
});

test("CV upload accepts PDF and Word docx through the same local pipeline", () => {
  const uploadSource = readFileSync(resolve(root, "components/screens/CvUploadScreen.tsx"), "utf8");
  const dispatcherSource = readFileSync(resolve(root, "lib/cv/extractCvText.ts"), "utf8");
  const wordSource = readFileSync(resolve(root, "lib/word/extractWordText.ts"), "utf8");
  assert.match(uploadSource, /\.pdf/);
  assert.match(uploadSource, /\.docx/);
  assert.match(dispatcherSource, /extractPdfText/);
  assert.match(dispatcherSource, /extractWordText/);
  assert.match(wordSource, /mammoth/);
});

test("returns no invented experience when parsing is uncertain", () => {
  assert.deepEqual(extractExperiencesFromCv("EDUCATION\nBachelor of Arts\nAWARDS\nDean's List"), []);
});

test("one manual experience stores four separately editable activities", () => {
  const experienceId = "manual-market-research";
  const labels = ["Create reports", "Analyse data using R", "Work with vendors and clients", "Design research proposals"];
  const experience = {
    id: experienceId,
    title: "Market Research Consultant",
    organisation: "Decision Lab",
    type: "work",
    activities: labels.map((label, index) => createManualActivity(label, experienceId, `manual-activity-${index + 1}`)),
  };
  assert.equal(experience.activities.length, 4);
  assert.deepEqual(experience.activities.map((activity) => activity.canonicalId), ["report-writing", "quantitative-data-analysis", "client-communication", "research-design"]);

  const normalized = normalizeActivities([experience]);
  assert.equal(normalized.length, 4);
  assert.ok(normalized.every((activity) => activity.sources[0].experienceId === experienceId));
  assert.ok(normalized.every((activity) => activity.sources[0].title === "Market Research Consultant"));

  const tunnelActivities = selectTopEvidenceActivities(normalized, ["product-manager", "behavioural-science-consultant"], 10);
  assert.equal(tunnelActivities.length, 4);
  assert.equal(new Set(tunnelActivities.map((activity) => activity.id)).size, 4);
});

test("fast paste separates lines, bullets and semicolons but not natural sentences", () => {
  const pasted = `- Designed quantitative and qualitative research\n• Analysed customer behaviour data\n3. Created strategic reports; Presented recommendations to clients\nWorked with external stakeholders`;
  assert.deepEqual(parsePastedActivities(pasted), [
    "Designed quantitative and qualitative research",
    "Analysed customer behaviour data",
    "Created strategic reports",
    "Presented recommendations to clients",
    "Worked with external stakeholders",
  ]);
  assert.deepEqual(parsePastedActivities("Analysed survey data using R"), ["Analysed survey data using R"]);
  assert.deepEqual(parsePastedActivities("Create reports, analyse data, communicate with stakeholders"), ["Create reports, analyse data, communicate with stakeholders"]);
});

test("equivalent manual activities merge across experiences without losing provenance", () => {
  const first = { id: "experience-a", title: "Analyst", organisation: "Alpha", type: "work", activities: [createManualActivity("Analyse data using R", "experience-a", "activity-a")] };
  const second = { id: "experience-b", title: "Researcher", organisation: "Beta", type: "project", activities: [createManualActivity("Analysed customer data", "experience-b", "activity-b")] };
  const normalized = normalizeActivities([first, second]);
  assert.equal(normalized.length, 1);
  assert.equal(normalized[0].canonicalId, "quantitative-data-analysis");
  assert.equal(normalized[0].recurrenceCount, 2);
  assert.deepEqual(normalized[0].sources.map((source) => source.experienceId), ["experience-a", "experience-b"]);
});

test("normalises duplicate activities and preserves clean provenance", () => {
  const merged = normalizeActivities(sampleExperiences.slice(0, 4));
  const analysis = merged.find((activity) => activity.canonicalId === "quantitative-data-analysis");
  assert.ok(analysis);
  assert.equal(analysis.recurrenceCount, 3);
  assert.deepEqual(analysis.sources.map((source) => source.experienceId), ["sample-decision-lab", "sample-trulioo", "sample-ubc"]);
  assert.deepEqual(analysis.sources[0], { experienceId: "sample-decision-lab", title: "Consultant", organisation: "Decision Lab" });
  assert.equal(merged.filter((activity) => activity.canonicalId === "quantitative-data-analysis").length, 1);
});

test("selects no more than ten credible comparison activities", () => {
  const merged = normalizeActivities(sampleExperiences.slice(0, 4));
  const selected = selectTopEvidenceActivities(merged, ["product-manager", "behavioural-science-consultant"]);
  assert.ok(selected.length > 0);
  assert.ok(selected.length <= 10);
  assert.equal(new Set(selected.map((activity) => activity.canonicalId)).size, selected.length);
  const importance = { Core: 4, Important: 3, Supporting: 2, Limited: 0 };
  const productLeaning = selected.filter((activity) => importance[getCareerActivity("product-manager", activity.canonicalId).importance] > importance[getCareerActivity("behavioural-science-consultant", activity.canonicalId).importance]);
  const behaviouralLeaning = selected.filter((activity) => importance[getCareerActivity("behavioural-science-consultant", activity.canonicalId).importance] > importance[getCareerActivity("product-manager", activity.canonicalId).importance]);
  assert.ok(productLeaning.length > 0);
  assert.ok(behaviouralLeaning.length > 0);
});

test("career evidence matrix keeps preference and confidence separate", () => {
  const activities = normalizeActivities(sampleExperiences.slice(0, 2));
  const responses = { [activities[0].id]: { preference: "more", confidence: "low" } };
  const rows = buildCareerEvidenceMatrix(activities, ["product-manager", "behavioural-science-consultant"], responses);
  assert.equal(rows[0].preference, "more");
  assert.equal(rows[0].confidence, "low");
  assert.equal(rows[0].pastEvidence.recurrenceCount, activities[0].recurrenceCount);
  assert.ok(rows[0].careerRelevance["product-manager"]);
  assert.ok(rows[0].careerRelevance["behavioural-science-consultant"]);
});

test("the same activity has distinct role relevance descriptions", () => {
  const product = getCareerActivity("product-manager", "quantitative-data-analysis");
  const behavioural = getCareerActivity("behavioural-science-consultant", "quantitative-data-analysis");
  assert.notEqual(product.description, behavioural.description);
  assert.notEqual(product.importance, behavioural.importance);
});

test("more than three More responses forces exactly three priorities", () => {
  const activities = normalizeActivities(sampleExperiences.slice(0, 4)).slice(0, 5);
  const responses = Object.fromEntries(activities.map((activity) => [activity.id, { preference: "more", confidence: "medium" }]));
  assert.equal(needsForcedPriorityChoice(activities, responses), true);
  assert.equal(canContinuePrioritySelection(activities, responses, activities.slice(0, 2).map((activity) => activity.id)), false);
  assert.equal(canContinuePrioritySelection(activities, responses, [activities[0].id, activities[1].id, "stale-activity"]), false);
  assert.equal(canContinuePrioritySelection(activities, responses, activities.slice(0, 3).map((activity) => activity.id)), true);
});

test("starting evidence and gaps are generated independently for both roles", () => {
  const activities = normalizeActivities(sampleExperiences.slice(0, 4));
  const product = buildStartingEvidence("product-manager", activities, {}, []);
  const behavioural = buildStartingEvidence("behavioural-science-consultant", activities, {}, []);
  assert.ok(product.transfers.length > 0 && behavioural.transfers.length > 0);
  assert.notDeepEqual(product.gaps.map((gap) => gap.id), behavioural.gaps.map((gap) => gap.id));
  assert.doesNotMatch(`${product.interpretation} ${behavioural.interpretation}`, /better|best|should choose|fit percentage/i);
  const existing = ["user-research", "stakeholder-communication"];
  assert.ok(getRemainingEvidenceGaps("product-manager", existing).every((gap) => !existing.includes(gap.id)));
});

test("uncertainty choices cover both roles, direct comparison and guided help", () => {
  const activities = normalizeActivities(sampleExperiences.slice(0, 4));
  const choices = generateUncertaintyChoices(["product-manager", "behavioural-science-consultant"], activities);
  assert.deepEqual(choices.map((choice) => choice.type), ["careerA", "careerB", "comparison", "guided"]);
  assert.ok(choices.every((choice) => choice.question && choice.whyInformative));
  assert.match(choices.find((choice) => choice.type === "comparison").question, /Product Manager.*Behavioural Science Consultant/);
});

test("raw CV text is not rendered by normal application screens", () => {
  const page = readFileSync(resolve(root, "app/page.tsx"), "utf8");
  const screenSources = ["ExperienceSelectionScreen.tsx", "ActivityOverviewScreen.tsx", "EvidenceTunnelScreen.tsx", "StartingEvidenceMapScreen.tsx"].map((file) => readFileSync(resolve(root, "components/screens", file), "utf8")).join("\n");
  assert.doesNotMatch(page, /\{extractedCvText\}/);
  assert.doesNotMatch(screenSources, /sampleCvText|extractedCvText/);
});

test("evidence UI keeps dates optional, provenance concise and response order consistent", () => {
  const experienceSource = readFileSync(resolve(root, "components/screens/ExperienceSelectionScreen.tsx"), "utf8");
  const provenanceSource = readFileSync(resolve(root, "components/EvidenceProvenance.tsx"), "utf8");
  const overviewSource = readFileSync(resolve(root, "components/screens/ActivityOverviewScreen.tsx"), "utf8");
  const tunnelSource = readFileSync(resolve(root, "components/screens/EvidenceTunnelScreen.tsx"), "utf8");
  const prioritySource = readFileSync(resolve(root, "components/screens/PrioritySelectionScreen.tsx"), "utf8");

  assert.doesNotMatch(experienceSource, /Dates not detected|startDate|endDate/);
  assert.doesNotMatch(provenanceSource, /Where did this come from|<details>/);
  assert.match(overviewSource, /"Other"/);
  assert.match(overviewSource, /not core career values or fit criteria/);
  assert.match(tunnelSource, /confidenceOptions = \["high", "medium", "low"\]/);
  assert.match(prioritySource, /confidenceLabels\[confidence\].*confidence/);
});
