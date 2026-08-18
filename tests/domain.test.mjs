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
const { extractActivitiesFromExperience, extractExperiencesFromCv, isValidExperienceTitle } = loadTypeScriptModule("lib/extraction/extractExperiencesFromCv.ts");
const { joinPdfPageTexts, reconstructPdfPageText } = loadTypeScriptModule("lib/pdf/reconstructPdfPageText.ts");
const { createManualActivity, parsePastedActivities } = loadTypeScriptModule("lib/extraction/parseManualActivities.ts");
const { normalizeActivities } = loadTypeScriptModule("lib/evidence/normalizeActivities.ts");
const { mapActivityToSemanticComponents, mapActivityToCareers, mapNormalizedActivity } = loadTypeScriptModule("lib/evidence/semanticActivityMapping.ts");
const { selectTopEvidenceActivities } = loadTypeScriptModule("lib/evidence/selectTopEvidenceActivities.ts");
const { buildCareerEvidenceMatrix } = loadTypeScriptModule("lib/evidence/buildCareerEvidenceMatrix.ts");
const { buildStartingEvidence } = loadTypeScriptModule("lib/evidence/buildStartingEvidence.ts");
const { generateUncertaintyChoices } = loadTypeScriptModule("lib/evidence/generateUncertaintyChoices.ts");
const { careers, careerModels, getCareerActivity, getRemainingEvidenceGaps } = loadTypeScriptModule("data/careers.ts");
const { behaviouralScienceTrial, createExperimentQuestions, experimentActivities, experimentScenarios, getExperimentScenario, learnLoopScenario, productManagementTrial, roleTrials } = loadTypeScriptModule("data/experiments.ts");
const { createInitialExperimentState, createNextScenarioState, createPostEvaluationPreviewState, getExperimentQuestionText, getTaskSequence, hasCompletedRoleTrial, isInitialAttemptReady, isSupportedExperimentPair, usesSharedScenario } = loadTypeScriptModule("lib/experiments/experimentState.ts");
const { createInitialEvaluationJsonSchema, createRevisionEvaluationJsonSchema, parseAttemptEvaluation, parseRevisionEvaluation } = loadTypeScriptModule("lib/experiments/evaluationSchema.ts");
const { interpretComparisonReflection } = loadTypeScriptModule("lib/experiments/interpretReflection.ts");

test("career catalogue contains an expanded set of peer-level job titles", () => {
  assert.deepEqual(careers.map((career) => career.title), [
    "Product Manager",
    "Behavioural Science Consultant",
    "Data Scientist",
    "Product Analyst",
    "UX Researcher",
    "Management Consultant",
    "Consumer Insights Researcher",
    "Business Analyst",
    "Service Designer",
    "Policy Analyst",
    "Organisational Development Consultant",
    "Marketing Strategist",
  ]);
  assert.ok(careers.every((career) => !/Growth|AI Product|Data Product/.test(career.title)));
  assert.ok(careerModels.every((career) => career.activities.length >= 8));
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

test("keeps CV bullet activities attached to their experience instead of treating them as role headers", () => {
  const cv = `WORK EXPERIENCE
University Canada West
Academic Integrity Operations Assistant
Aug 2022 – Apr 2023
• Provided administrative support to the Academic Integrity Manager and reviewed student cases
• Responded to faculty enquiries and maintained confidential records
University of British Columbia
Senior Collegia Advisor
Aug 2021 – Apr 2022
• Promoted student engagement across residence communities
• Hosted peer programmes and supported student wellbeing referrals`;
  const detected = extractExperiencesFromCv(cv);
  assert.deepEqual(detected.map(({ title }) => title), ["Academic Integrity Operations Assistant", "Senior Collegia Advisor"]);
  assert.ok(detected.every((experience) => experience.activities.length >= 2), detected.map((experience) => `${experience.title}: ${experience.activities.length}`).join(", "));
  assert.match(detected[0].description, /Provided administrative support/);
  assert.match(detected[1].description, /Promoted student engagement/);
});
test("a repeated work-experience heading across a PDF page break does not erase role activities", () => {
  const cv = [
    "WORK EXPERIENCE",
    "University Canada West",
    "Academic Integrity Operations Assistant",
    "Aug 2022 – Apr 2023",
    "WORK EXPERIENCE",
    "• Reviewed student cases against academic policy",
    "• Maintained documentation for faculty review panels",
    "University of British Columbia",
    "Senior Collegia Advisor",
    "Aug 2021 – Apr 2022",
    "• Implemented peer programmes for student communities",
  ].join("\n");
  const detected = extractExperiencesFromCv(cv);
  const academicIntegrity = detected.find(({ title }) => title === "Academic Integrity Operations Assistant");
  assert.ok(academicIntegrity);
  assert.match(academicIntegrity.description, /Reviewed student cases/);
  assert.ok(academicIntegrity.activities.length >= 2);
});
test("present-tense role bullets are activities rather than false experience headers", () => {
  const cv = [
    "WORK EXPERIENCE",
    "University Canada West",
    "Academic Integrity Operations Assistant",
    "Aug 2022 – Apr 2023",
    "Provide administrative support to the Academic Integrity Manager",
    "Review student cases and maintain confidential documentation",
    "Respond to faculty enquiries about academic policy",
    "University of British Columbia",
    "Senior Collegia Advisor",
    "Aug 2021 – Apr 2022",
    "Implement peer programmes for student communities",
  ].join("\n");
  const detected = extractExperiencesFromCv(cv);
  const academicIntegrity = detected.find(({ title }) => title === "Academic Integrity Operations Assistant");
  assert.ok(academicIntegrity);
  assert.match(academicIntegrity.description, /Provide administrative support/);
  assert.ok(academicIntegrity.activities.length >= 3);
  assert.equal(isValidExperienceTitle("Provide administrative support to the Academic Integrity Manager"), false);
});
test("reconstructs PDF lines before experience extraction", () => {
  const text = reconstructPdfPageText([
    { str: "Sep 2025 – Present", transform: [10, 0, 0, 10, 390, 700.8], width: 110 },
    { str: "Decision Lab", transform: [10, 0, 0, 10, 40, 700], width: 70 },
    { str: "Consultant", transform: [10, 0, 0, 10, 40, 680], width: 60 },
    { str: "Designed behavioural research", transform: [10, 0, 0, 10, 40, 660], width: 180 },
  ]);
  assert.equal(text, "Decision Lab Sep 2025 – Present\nConsultant\nDesigned behavioural research");
  const [experience] = extractExperiencesFromCv(`WORK EXPERIENCE\n${text}`);
  assert.equal(experience.title, "Consultant");
  assert.equal(experience.organisation, "Decision Lab");
});

test("reconstructed PDF text keeps fragment spacing, punctuation and page boundaries readable", () => {
  const firstPage = reconstructPdfPageText([
    { str: "Analysed", transform: [10, 0, 0, 10, 40, 700], width: 44 },
    { str: " customer data", transform: [10, 0, 0, 10, 86, 700.5], width: 80 },
    { str: ".", transform: [10, 0, 0, 10, 166, 700], width: 3 },
    { str: "Presented findings", transform: [10, 0, 0, 10, 40, 680], width: 90 },
  ]);
  assert.equal(firstPage, "Analysed customer data.\nPresented findings");
  assert.equal(joinPdfPageTexts([firstPage, "Second page heading\nAnother line"]), "Analysed customer data.\nPresented findings\n\nSecond page heading\nAnother line");
});

test("raw PDF text diagnostics stay in the development console and out of the consumer UI", () => {
  const diagnosticSource = readFileSync(resolve(root, "lib/pdf/debugExtractedPdfText.ts"), "utf8");
  const uploadSource = readFileSync(resolve(root, "components/screens/CvUploadScreen.tsx"), "utf8");
  assert.match(diagnosticSource, /process\.env\.NODE_ENV !== "development"/);
  assert.match(diagnosticSource, /console\.debug\(text\)/);
  assert.doesNotMatch(uploadSource, /extracted CV text|raw CV text/i);
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

test("preserves supported CV action sentences when the catalogue has no matching activity", () => {
  const activities = extractActivitiesFromExperience(
    "Reviewed student cases against academic policy.\nMaintained records for faculty review panels.",
    "academic-integrity-assistant",
  );
  assert.deepEqual(activities.map(({ label, category }) => ({ label, category })), [
    { label: "Reviewed student cases against academic policy", category: "Other" },
    { label: "Maintained records for faculty review panels", category: "Other" },
  ]);
  assert.ok(activities.every((activity) => activity.supportingText));
});

test("preserves noun-led CV activities when PDF extraction loses bullet markers", () => {
  const activities = extractActivitiesFromExperience(
    "Case review and documentation for academic integrity matters\nFaculty and student enquiry support across active cases",
    "academic-integrity-assistant",
  );
  assert.deepEqual(activities.map(({ label }) => label), [
    "Case review and documentation for academic integrity matters",
    "Faculty and student enquiry support across active cases",
  ]);
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

test("manual activity drafts preserve spaces until the experience is saved", () => {
  const draft = createManualActivity("Led ", "manual-experience", "manual-activity");
  assert.equal(draft.label, "Led ");
  assert.equal(draft.supportingText, "Led ");
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
  assert.equal(product.importance, "Important");
  assert.equal(behavioural.importance, "Important");
});


test("semantic transfer mapping rewrites supported evidence without losing meaning", () => {
  const examples = [
    ["Qualitative research (IDI)", "Qualitative research and interviewing", "Research", ["qualitative-research", "interviewing"]],
    ["Quantitative and qualitative data analysis", "Quantitative and qualitative data analysis", "Analysis", ["quantitative-data-analysis", "qualitative-analysis"]],
    ["Creating proposals", "Proposal and recommendation development", "Product & Strategy", ["proposal-development", "strategic-recommendations"]],
    ["Writing grant applications by understanding the community's needs", "Proposal and recommendation development", "Product & Strategy", ["proposal-development", "needs-assessment"]],
    ["Creating a learning strategy roadmap", "Strategy and roadmap planning", "Planning & Design", ["strategy-development", "roadmap-planning"]],
    ["Liaise with government authorities to implement the programme", "Government and stakeholder coordination", "Communication", ["stakeholder-communication"]],
    ["Creating the product launch toolkit including the survey and the 1-pager recommendation", "Product launch research and recommendation development", "Product & Strategy", ["product-launch-planning", "research-design"]],
    ["Program implementation and evaluation", "Programme implementation and evaluation", "Execution", ["programme-implementation", "programme-evaluation"]],
    ["Users' problem identification (e.g. understanding their needs and barriers)", "User needs and problem identification", "Product & Strategy", ["problem-framing", "needs-assessment"]],
  ];
  for (const [original, normalizedLabel, category, componentIds] of examples) {
    const mapped = mapActivityToSemanticComponents(original);
    assert.equal(mapped.normalizedLabel, normalizedLabel);
    assert.equal(mapped.category, category);
    assert.ok(componentIds.every((id) => mapped.components.some((component) => component.canonicalActivityId === id)), `${original}: ${mapped.components.map((component) => component.canonicalActivityId).join(", ")}`);
    if (original !== normalizedLabel) assert.notEqual(mapped.normalizedLabel, original);
  }
  const vague = mapActivityToSemanticComponents("Helped the team");
  assert.equal(vague.mappingStatus, "unknown");
  assert.equal(vague.components.length, 0);
});

test("career transfer uses underlying work rather than exact activity IDs", () => {
  const proposal = mapActivityToSemanticComponents("Creating proposals");
  const proposalTransfers = mapActivityToCareers(proposal.components, ["product-manager", "management-consultant"]);
  assert.equal(proposalTransfers["product-manager"].importance, "Important");
  assert.equal(proposalTransfers["management-consultant"].importance, "Core");
  assert.notEqual(proposalTransfers["product-manager"].rationale, proposalTransfers["management-consultant"].rationale);

  const analysis = mapActivityToSemanticComponents("Quantitative data analysis");
  const analysisTransfers = mapActivityToCareers(analysis.components, ["product-manager", "management-consultant"]);
  assert.equal(analysisTransfers["product-manager"].importance, "Important");
assert.notEqual(analysisTransfers["product-manager"].relationship, "unknown");
  const mixedAnalysis = mapActivityToSemanticComponents("Quantitative and qualitative data analysis");
  const mixedTransfers = mapActivityToCareers(mixedAnalysis.components, ["product-manager", "management-consultant"]);
  assert.doesNotMatch(mixedTransfers["product-manager"].rationale, /directly supports quantitative data analysis/i);
  assert.ok(mixedTransfers["product-manager"].rationale.split(/[.!?]+/).filter(Boolean).length <= 2);

  const strategy = mapActivityToSemanticComponents("Strategy development");
  const strategyTransfers = mapActivityToCareers(strategy.components, ["product-manager", "management-consultant"]);
  assert.equal(strategyTransfers["product-manager"].importance, "Core");
  assert.equal(strategyTransfers["management-consultant"].importance, "Core");

  const programme = mapActivityToSemanticComponents("Program implementation and evaluation");
  const programmeTransfers = mapActivityToCareers(programme.components, ["product-manager", "management-consultant"]);
  assert.equal(programme.category, "Execution");
  assert.notEqual(programmeTransfers["product-manager"].relationship, "unknown");
  assert.notEqual(programmeTransfers["management-consultant"].relationship, "unknown");

  const userProblem = mapActivityToSemanticComponents("Users' problem identification (e.g. understanding their needs and barriers)");
  const userProblemTransfers = mapActivityToCareers(userProblem.components, ["product-manager", "management-consultant"]);
  assert.equal(userProblem.category, "Product & Strategy");
  assert.equal(userProblemTransfers["product-manager"].careerActivityId, "problem-framing");
  assert.notEqual(userProblemTransfers["management-consultant"].relationship, "unknown");
  const report = mapActivityToSemanticComponents("Writing strategic reports");
  const reportTransfers = mapActivityToCareers(report.components, ["product-manager", "management-consultant"]);
  assert.equal(report.normalizedLabel, "Strategic report and recommendation development");
  assert.equal(reportTransfers["product-manager"].importance, "Important");
  assert.equal(reportTransfers["management-consultant"].importance, "Core");
  assert.ok(reportTransfers["product-manager"].rationale.split(/[.!?]+/).filter(Boolean).length <= 2);
  assert.ok(reportTransfers["management-consultant"].rationale.split(/[.!?]+/).filter(Boolean).length <= 2);
});

test("known canonical activities remain available to semantic career transfer", () => {
  const mapped = mapNormalizedActivity({
    canonicalId: "learning-design",
    originalLabel: "Learning and onboarding design",
    sources: [{ experienceId: "learning-role", title: "Learning Designer", organisation: "Example" }],
  }, ["product-manager", "behavioural-science-consultant"]);
  assert.ok(mapped.components.some((component) => component.canonicalActivityId === "learning-design"));
  assert.equal(mapped.careerTransfers["product-manager"].careerActivityId, "product-delivery");
  assert.equal(mapped.careerTransfers["behavioural-science-consultant"].careerActivityId, "intervention-design");
  assert.notEqual(mapped.mappingStatus, "unknown");
});

test("transfer explanations adapt the source skill to each selected role", () => {
  const learning = mapNormalizedActivity({
    canonicalId: "learning-design",
    originalLabel: "Learning and onboarding design",
    sources: [{ experienceId: "learning-role", title: "Learning Designer", organisation: "Example" }],
  }, ["product-manager", "behavioural-science-consultant"]);
  assert.match(learning.careerTransfers["product-manager"].rationale, /onboarding journeys/i);
  assert.match(learning.careerTransfers["behavioural-science-consultant"].rationale, /behavioural hypothesis/i);
  assert.notEqual(learning.careerTransfers["product-manager"].rationale, learning.careerTransfers["behavioural-science-consultant"].rationale);

  const roadmap = mapActivityToSemanticComponents("Creating a learning strategy roadmap");
  const roadmapTransfers = mapActivityToCareers(roadmap.components, ["product-manager", "behavioural-science-consultant"]);
  assert.match(roadmapTransfers["product-manager"].rationale, /product strategy/i);
  assert.match(roadmapTransfers["behavioural-science-consultant"].rationale, /staged intervention/i);
});
test("optional experiment reflection gives one simple interpretation and next action", () => {
  const interpretation = interpretComparisonReflection(
    "I liked it less because I had to think of metrics and frameworks, which felt like memorisation.",
    ["product-manager", "behavioural-science-consultant"],
  );
  assert.ok(interpretation);
  assert.match(interpretation.interpretation, /may not dislike this kind of work itself/i);
  assert.match(interpretation.interpretation, /methods or frameworks are unfamiliar/i);
  assert.match(interpretation.nextQuestion, /try the same type of task again with more guidance/i);
  assert.equal(interpretation.roleContext.length, 0);
  assert.doesNotMatch(interpretation.interpretation, /poor fit/i);
});
test("starting evidence and gaps are generated independently for both roles", () => {
  const activities = normalizeActivities(sampleExperiences.slice(0, 4));
  const product = buildStartingEvidence("product-manager", activities, {});
  const behavioural = buildStartingEvidence("behavioural-science-consultant", activities, {});
  assert.ok(product.transfers.length > 0 && behavioural.transfers.length > 0);
  assert.notDeepEqual(product.gaps.map((gap) => gap.id), behavioural.gaps.map((gap) => gap.id));
  assert.doesNotMatch(`${product.interpretation} ${behavioural.interpretation}`, /better|best|should choose|fit percentage/i);
  const pageSource = readFileSync(resolve(root, "app/page.tsx"), "utf8");
  const mapSource = readFileSync(resolve(root, "components/screens/StartingEvidenceMapScreen.tsx"), "utf8");
  assert.doesNotMatch(pageSource, /PrioritySelectionScreen|priorityActivityIds/);
  assert.doesNotMatch(mapSource, />Priority|Role importance:|Your preference:|Your confidence:/);
  assert.match(mapSource, /Core to this role/);
  assert.match(mapSource, /Important in this role/);
  assert.match(mapSource, /evidenceMeaning/);
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

  assert.doesNotMatch(experienceSource, /Dates not detected|startDate|endDate/);
  assert.doesNotMatch(provenanceSource, /Where did this come from|<details>/);
  assert.match(overviewSource, /"Other"/);
  assert.match(overviewSource, /not core career values or fit criteria/);
  assert.match(overviewSource, /remapEditedLabel\(activity, event\.currentTarget\.value\)/);
  assert.match(overviewSource, /Original wording, mapping and category/);
  assert.match(tunnelSource, /confidenceOptions = \["high", "medium", "low"\]/);
});

test("manual activity entry provides one-sentence text areas and career search", () => {
  const experienceSource = readFileSync(resolve(root, "components/screens/ExperienceSelectionScreen.tsx"), "utf8");
  const careerSource = readFileSync(resolve(root, "components/screens/CareerSelectionScreen.tsx"), "utf8");
  assert.match(experienceSource, /Keep one sentence for each activity/);
  assert.match(experienceSource, /<textarea rows=\{3\} value=\{activity\.label\}/);
  assert.match(experienceSource, /does not mean the role is irrelevant/);
  assert.match(experienceSource, /onExperiencesChange\(\(current\)/);
  assert.match(experienceSource, /onContinue\(experiences\)/);
  assert.match(careerSource, /Search the prototype role catalogue/);
});

test("experience edits are passed directly into activity normalisation when continuing", () => {
  const pageSource = readFileSync(resolve(root, "app/page.tsx"), "utf8");
  assert.match(pageSource, /combineSelectedExperiences = \(currentExperiences: DetectedExperience\[\]\)/);
  assert.match(pageSource, /currentExperiences\.filter/);
});
test("global progress keeps the experiment inside step seven", () => {
  const progressSource = readFileSync(resolve(root, "components/Progress.tsx"), "utf8");
  assert.match(progressSource, /"Evidence", "Experiment"/);
  assert.match(progressSource, /Step \$\{step\} of 7/);
  assert.doesNotMatch(progressSource, /Next prototype|Choose uncertainty|Confirm question/);
});

test("experiment questions adapt to the two selected roles", () => {
  const questions = createExperimentQuestions(["product-manager", "management-consultant"]);
  assert.deepEqual(questions.map(({ id, mode }) => ({ id, mode })), [
    { id: "career-a", mode: "careerA" },
    { id: "career-b", mode: "careerB" },
    { id: "direct-comparison", mode: "comparison" },
    { id: "guided", mode: undefined },
  ]);
  assert.match(questions[0].title, /product decisions/i);
  assert.match(questions[1].title, /ambiguous client problems/i);
  assert.equal(questions[2].featured, true);
});

test("every catalogue role has a supported work-trial profile", () => {
  assert.deepEqual(Object.keys(roleTrials).sort(), careerModels.map((career) => career.id).sort());
  for (const career of careerModels) {
    const trial = roleTrials[career.id];
    assert.equal(trial.roleTitle, career.title);
    assert.equal(trial.scenarioId, learnLoopScenario.id);
    assert.ok(trial.primer.steps.length >= 4);
    assert.ok(trial.fields.length >= 4);
    assert.ok(trial.rubric.length >= 4);
    assert.equal(trial.activities.length, 4);
  }
});

test("every pair of distinct catalogue roles is supported without substitution", () => {
  for (let first = 0; first < careerModels.length; first += 1) {
    for (let second = first + 1; second < careerModels.length; second += 1) {
      const pair = [careerModels[first].id, careerModels[second].id];
      assert.equal(isSupportedExperimentPair(pair), true);
      assert.deepEqual(getTaskSequence("comparison", pair), pair);
      assert.deepEqual(getTaskSequence("careerA", pair), [pair[0]]);
      assert.deepEqual(getTaskSequence("careerB", pair), [pair[1]]);
    }
  }
  assert.equal(isSupportedExperimentPair(["product-manager"]), false);
  assert.equal(isSupportedExperimentPair(["product-manager", "product-manager"]), false);
});

test("both selected career tasks use the exact same LearnLoop scenario", () => {
  assert.equal(productManagementTrial.scenarioId, learnLoopScenario.id);
  assert.equal(behaviouralScienceTrial.scenarioId, learnLoopScenario.id);
  assert.ok(learnLoopScenario.currentFeatures.length >= 4);
  const careers = ["data-scientist", "ux-researcher"];
  const state = { ...createInitialExperimentState(careers), mode: "comparison", scenarioId: learnLoopScenario.id };
  assert.equal(usesSharedScenario(state), true);
});

test("development preview skips both AI evaluations with clearly labelled sample state", () => {
  const preview = createPostEvaluationPreviewState(["product-manager", "behavioural-science-consultant"]);
  assert.equal(preview.stage, "revision-result");
  assert.equal(preview.mode, "comparison");
  assert.equal(preview.isDevelopmentPreview, true);
  for (const role of preview.selectedCareers) {
    assert.equal(preview.roleTrials[role].initialEvaluationStatus, "success");
    assert.equal(preview.roleTrials[role].revisionEvaluationStatus, "success");
    assert.ok(preview.roleTrials[role].initialEvaluation);
    assert.ok(preview.roleTrials[role].revisionEvaluation);
  }
  const screen = readFileSync(resolve(root, "components/screens/CareerExperimentScreenV2.tsx"), "utf8");
  assert.match(screen, /Skip past both evaluations/);
  assert.match(screen, /without using API credit/);
  assert.match(screen, /process\.env\.NODE_ENV === "development"/);
});
test("supported trials keep first attempt, revision, preference and work reaction separate", () => {
  const completeResponses = Object.fromEntries(productManagementTrial.fields.map((field) => [field.id, "I do not know this concept yet."]));
  assert.equal(isInitialAttemptReady("product-manager", completeResponses), true);
  assert.equal(isInitialAttemptReady("product-manager", { ...completeResponses, "task-4": "" }), false);
  const state = createInitialExperimentState(["product-manager", "management-consultant"]);
  const trial = state.roleTrials["product-manager"];
  assert.deepEqual(trial.initialResponses, {});
  assert.equal(trial.revisionResponse, "");
  assert.equal(trial.preferenceEvidence, undefined);
  assert.deepEqual(trial.workReactions, []);
  assert.equal(trial.evidenceSufficiency, undefined);
  assert.equal(hasCompletedRoleTrial(trial), false);
});
test("evaluator schema preserves knowledge gaps without converting them into poor performance", () => {
  const evaluation = parseAttemptEvaluation({
    criteria: [{ criterion: "Experimental reasoning", rating: "not_enough_evidence", gapType: "knowledge", evidence: "The user said they have never learned how to test causality.", feedback: "Learn what makes a comparison credible before revising." }],
    strongestEvidence: null,
    revisionTarget: "Experimental reasoning",
    instruction: "A credible comparison changes one condition while keeping other important conditions similar.",
    revisionPrompt: "Describe a comparison that would help isolate the intervention effect.",
  });
  assert.equal(evaluation.criteria[0].gapType, "knowledge");
  assert.equal(evaluation.criteria[0].rating, "not_enough_evidence");
  assert.throws(() => parseAttemptEvaluation({ ...evaluation, criteria: [{ ...evaluation.criteria[0], rating: "poor" }] }));
});

test("revision evaluation stores cautious response-to-feedback evidence", () => {
  const evaluation = parseRevisionEvaluation({
    criterion: { criterion: "Measurement reasoning", rating: "developing", gapType: "reasoning", evidence: "The revision moved from overall retention to recovery after a missed session.", feedback: "The measure is now closer to the chosen problem." },
    learningResponse: { category: "some_improvement", explanation: "The revision incorporated part of the feedback without resolving every measurement question." },
  });
  assert.equal(evaluation.learningResponse.category, "some_improvement");
  assert.equal(evaluation.criterion.gapType, "reasoning");
});

test("evaluation schemas constrain revision targets to the selected rubric criterion", () => {
  const initialSchema = createInitialEvaluationJsonSchema(["Problem framing", "Evidence use"]);
  assert.deepEqual(initialSchema.properties.revisionTarget.enum, ["Problem framing", "Evidence use"]);
  const revisionSchema = createRevisionEvaluationJsonSchema("Problem framing");
  assert.deepEqual(revisionSchema.properties.criterion.properties.criterion.enum, ["Problem framing"]);
});
test("direct comparison collects activity-level reactions across both roles", () => {
  assert.equal(experimentActivities.length, careerModels.length * 4);
  assert.equal(experimentActivities.filter((activity) => activity.role === "product-manager").length, 4);
  assert.equal(experimentActivities.filter((activity) => activity.role === "management-consultant").length, 4);
});

test("supported experiment UI sequences primer, evaluation, revision and preference", () => {
  const screen = readFileSync(resolve(root, "components/screens/CareerExperimentScreenV2.tsx"), "utf8");
  const endpoint = readFileSync(resolve(root, "app/api/evaluate-experiment/route.ts"), "utf8");
  assert.match(screen, /role-primer/);
  assert.match(screen, /initial-attempt/);
  assert.match(screen, /revision-result/);
  assert.match(screen, /Now that you better understand how this work is approached/);
  assert.match(screen, /Which kinds of work would you want more or less of/);
  assert.match(screen, /Select all that apply/);
  assert.match(screen, /Do you have enough evidence to judge how this work feels/);
  assert.match(endpoint, /process\.env\.OPENAI_API_KEY/);
  assert.match(endpoint, /type: "json_schema"/);
  assert.match(endpoint, /store: false/);
  assert.doesNotMatch(endpoint, /\b\d+%|fitScore|careerScore/i);
});

test("experiment synthesis remains evidence-oriented and not a recommendation", () => {
  const state = {
    ...createInitialExperimentState(["product-manager", "management-consultant"]),
    selectedQuestionId: "direct-comparison",
    mode: "comparison",
    scenarioId: learnLoopScenario.id,
  };
  assert.match(getExperimentQuestionText(state), /same underlying problem/);
  const screen = readFileSync(resolve(root, "components/screens/CareerExperimentScreenV2.tsx"), "utf8");
  assert.match(screen, /not a career recommendation/i);
  assert.match(screen, /What your preference evidence points to/);
  assert.match(screen, /preference signal leaned toward/);
  assert.doesNotMatch(screen, /Try another question/);
  assert.doesNotMatch(screen, /you should become|best career|career.?fit percentage|\d+% suited/i);
});


test("experiment offers three original scenarios with enough shared evidence", () => {
  assert.equal(experimentScenarios.length, 3);
  assert.equal(new Set(experimentScenarios.map((scenario) => scenario.id)).size, 3);
  for (const scenario of experimentScenarios) {
    assert.equal(getExperimentScenario(scenario.id), scenario);
    assert.ok(scenario.industry);
    assert.ok(scenario.question);
    assert.ok(scenario.currentFeatures.length >= 5);
    assert.ok(scenario.metrics.length >= 4);
    assert.ok(scenario.userFeedback.length >= 3);
  }
});

test("trying another case preserves the learning question and resets task evidence", () => {
  const preview = createPostEvaluationPreviewState(
    ["product-manager", "behavioural-science-consultant"],
    "freshroute",
  );
  const next = createNextScenarioState(preview);
  assert.equal(next.stage, "scenario-choice");
  assert.equal(next.mode, "comparison");
  assert.equal(next.selectedQuestionId, "direct-comparison");
  assert.deepEqual(next.completedScenarioIds, ["freshroute"]);
  assert.equal(next.scenarioId, undefined);
  assert.deepEqual(next.completedCareerTasks, []);
  assert.equal(next.roleTrials["product-manager"].initialEvaluation, undefined);
});

test("selected case is passed into attempts, evaluations and revision reminders", () => {
  const screen = readFileSync(resolve(root, "components/screens/CareerExperimentScreenV2.tsx"), "utf8");
  assert.match(screen, /ScenarioChoiceScreen/);
  assert.match(screen, /getExperimentScenario\(state\.scenarioId\)/);
  assert.match(screen, /scenario,\s*taskQuestions/);
  assert.match(screen, /getScenarioFields\(role, scenario\)/);
  assert.match(screen, /getScenarioContext\(role, scenario\)/);
  assert.match(screen, /Try another case/);
  assert.match(screen, /Skip both evaluations for this case/);
});




test("outcome-led resume language is summarised as process optimisation", () => {
  const sentence = "Enhanced case-processing efficiency by 30% across 2,000+ cases by optimising academic integrity audit and reporting workflows.";
  const activities = extractActivitiesFromExperience(sentence, "academic-integrity-role");
  const processActivity = activities.find((activity) => activity.canonicalId === "process-improvement");

  assert.ok(processActivity);
  assert.equal(processActivity.label, "Process optimisation");
  assert.equal(processActivity.supportingText, sentence);

  const mapped = mapActivityToSemanticComponents(sentence);
  assert.equal(mapped.normalizedLabel, "Process optimisation");
  assert.equal(mapped.category, "Execution");
  assert.ok(mapped.components.some((component) => component.canonicalActivityId === "process-improvement"));

  const normalized = normalizeActivities([
    {
      id: "academic-integrity-role",
      title: "Academic Integrity Operation Assistant",
      organisation: "University Canada West",
      type: "work",
      description: sentence,
      activities,
    },
  ], ["product-manager", "management-consultant"]);

  const skill = normalized.find((activity) => activity.canonicalId === "process-improvement");
  assert.ok(skill);
  assert.equal(skill.label, "Process optimisation");
  assert.equal(skill.originalLabel, sentence);
  assert.equal(skill.sources[0].title, "Academic Integrity Operation Assistant");
});

test("process optimisation recognises varied resume phrasing without employer-specific rules", () => {
  const examples = [
    "Streamlined the customer-support workflow and reduced response time by 20%.",
    "Automated monthly reporting procedures to shorten turnaround time.",
    "Improved operational efficiency by simplifying the intake process.",
    "Optimized case processing across regional service teams.",
  ];

  for (const example of examples) {
    const mapped = mapActivityToSemanticComponents(example);
    assert.equal(mapped.normalizedLabel, "Process optimisation", example);
    assert.ok(mapped.components.some((component) => component.canonicalActivityId === "process-improvement"), example);
  }
});
