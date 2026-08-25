import {
  activityCatalog,
  getActivityDefinition,
  makeCustomActivityId,
  type ActivityCategory,
} from "@/data/activityCatalog";
import {
  getCareerModel,
  type CareerActivity,
  type CareerId,
} from "@/data/careers";
import type {
  CareerTransfer,
  NormalizedActivity,
  SemanticActivityComponent,
  SemanticConfidence,
} from "@/types/prototype";

type ComponentDraft = Omit<SemanticActivityComponent, "label"> & { label?: string };
type SemanticResult = {
  normalizedLabel: string;
  category: ActivityCategory;
  components: SemanticActivityComponent[];
  mappingStatus: "mapped" | "unknown";
};
type SemanticRule = {
  matches: RegExp[];
  normalizedLabel: string;
  category: ActivityCategory;
  components: ComponentDraft[];
};

const component = (
  canonicalActivityId: string,
  evidenceType: "explicit" | "inferred",
  confidence: SemanticConfidence,
  rationale: string,
): ComponentDraft => ({ canonicalActivityId, evidenceType, confidence, rationale });

/**
 * Reusable semantic rules for translating CV/manual sentences into work
 * activities. They deliberately describe work, not employers or particular CVs.
 */
const semanticRules: SemanticRule[] = [
  {
    matches: [/writ(?:e|ing|ten).*strategic report/i, /strategic report/i],
    normalizedLabel: "Strategic report and recommendation development",
    category: "Product & Strategy",
    components: [
      component("report-writing", "explicit", "high", "The evidence explicitly describes writing a strategic report."),
      component("strategic-recommendations", "inferred", "medium", "A strategic report normally turns evidence into a recommended direction."),
      component("insight-synthesis", "inferred", "medium", "Producing the report requires selecting and synthesising relevant evidence."),
    ],
  },
  {
    matches: [/liais(?:e|ed|ing).*government/i, /liais(?:e|ed|ing).*authorit/i, /coordinat(?:e|ed|ing).*government/i],
    normalizedLabel: "Government and stakeholder coordination",
    category: "Communication",
    components: [
      component("stakeholder-communication", "explicit", "high", "The activity explicitly involves communicating with an external stakeholder."),
      component("stakeholder-alignment", "inferred", "medium", "Implementation liaison normally requires aligning expectations and actions."),
    ],
  },
  {
    matches: [/product launch.*toolkit/i, /launch toolkit/i],
    normalizedLabel: "Product launch research and recommendation development",
    category: "Product & Strategy",
    components: [
      component("product-launch-planning", "explicit", "high", "The evidence explicitly concerns preparing a product launch."),
      component("enablement-materials", "explicit", "high", "A toolkit is an enablement output used by people carrying out a launch."),
      component("research-design", "inferred", "medium", "The stated survey implies a structured way of gathering evidence."),
      component("strategic-recommendations", "inferred", "medium", "A recommendation converts launch evidence into an advised direction."),
    ],
  },
  {
    matches: [
      /program(?:me)?\s+(?:implementation|delivery)\s+and\s+evaluation/i,
      /(?:implement(?:ed|ing)?|deliver(?:ed|ing)?)\s+.*program(?:me)?.*evaluat(?:e|ed|ing|ion)/i,
    ],
    normalizedLabel: "Programme implementation and evaluation",
    category: "Execution",
    components: [
      component("programme-implementation", "explicit", "high", "The activity explicitly includes putting a programme into practice."),
      component("programme-evaluation", "explicit", "high", "The activity explicitly includes evaluating the programme."),
    ],
  },
  {
    matches: [
      /program(?:me)?\s+(?:implementation|delivery)/i,
      /(?:implement(?:ed|ing)?|deliver(?:ed|ing)?)\s+.*program(?:me)?/i,
    ],
    normalizedLabel: "Programme implementation",
    category: "Execution",
    components: [
      component("programme-implementation", "explicit", "high", "The activity explicitly describes putting a programme into practice."),
    ],
  },
  {
    matches: [/program(?:me)? development and evaluation/i],
    normalizedLabel: "Programme design and evaluation",
    category: "Planning & Design",
    components: [
      component("programme-design", "explicit", "high", "The evidence explicitly includes developing a programme."),
      component("programme-evaluation", "explicit", "high", "The evidence explicitly includes evaluating a programme."),
    ],
  },
  {
    matches: [/design(?:ed|ing)? and launch.*onboarding course/i, /onboarding course/i, /learning and onboarding design/i],
    normalizedLabel: "Learning and onboarding design",
    category: "Planning & Design",
    components: [
      component("learning-design", "explicit", "high", "The evidence describes designing a learning or onboarding experience."),
      component("programme-design", "explicit", "high", "An onboarding course is a structured programme with a sequence and intended outcome."),
      component("product-delivery", "inferred", "medium", "Launching the experience requires coordinating it through delivery."),
    ],
  },
  {
    matches: [/research(?:ed|ing)?.*marketing.*partnership/i, /marketing and partnership/i],
    normalizedLabel: "Market research and partnership development",
    category: "Research",
    components: [
      component("market-research", "explicit", "high", "The evidence explicitly describes research for a market-facing purpose."),
      component("partnership-development", "explicit", "high", "The evidence explicitly concerns developing partnerships."),
      component("strategy-development", "inferred", "medium", "Research and partnership choices normally support a wider strategic direction."),
    ],
  },
  {
    matches: [/quantitative.*qualitative.*(?:data\s+)?analys/i, /qualitative.*quantitative.*(?:data\s+)?analys/i],
    normalizedLabel: "Quantitative and qualitative data analysis",
    category: "Analysis",
    components: [
      component("quantitative-data-analysis", "explicit", "high", "The evidence explicitly identifies quantitative analysis."),
      component("qualitative-analysis", "explicit", "high", "The evidence explicitly identifies qualitative analysis."),
    ],
  },
  {
    matches: [/qualitative research/i, /in-depth interview/i, /\bidi\b/i],
    normalizedLabel: "Qualitative research and interviewing",
    category: "Research",
    components: [
      component("qualitative-research", "explicit", "high", "The evidence explicitly describes qualitative research."),
      component("interviewing", "explicit", "high", "In-depth interviews are a direct form of interviewing."),
    ],
  },
  {
    matches: [/proposals?/i, /grant application/i],
    normalizedLabel: "Proposal and recommendation development",
    category: "Product & Strategy",
    components: [
      component("proposal-development", "explicit", "high", "The evidence explicitly describes developing a proposal or application."),
      component("strategic-recommendations", "inferred", "medium", "A proposal recommends a course of action supported by a rationale."),
      component("persuasive-writing", "inferred", "medium", "A proposal must communicate a case persuasively to a decision-maker."),
    ],
  },
  {
    matches: [
      /(?:customer|user)(?:s['’]|['’]s|s)?\s+(?:needs?|problems?|pain points?)\s+(?:identification|discovery|assessment)/i,
      /(?:identify|identifying|understand|understanding|discover|discovering)\s+.*(?:customer|user)(?:s['’]|['’]s|s)?\s+(?:needs?|problems?|pain points?)/i,
    ],
    normalizedLabel: "User needs and problem identification",
    category: "Product & Strategy",
    components: [
      component("problem-framing", "explicit", "high", "The activity explicitly concerns identifying a user problem."),
      component("needs-assessment", "explicit", "high", "The activity explicitly concerns understanding user needs."),
    ],
  },
  {
    matches: [/understand(?:ing)?\s+.*(?:community|customer|user|organisation|organization)(?:s['’]|['’]s|s)?\s+needs/i, /needs assessment/i],
    normalizedLabel: "Needs assessment and proposal development",
    category: "Research",
    components: [
      component("needs-assessment", "explicit", "high", "The evidence explicitly describes understanding the needs of a group."),
      component("insight-synthesis", "inferred", "medium", "Turning varied needs into an actionable view requires synthesis."),
    ],
  },
  {
    matches: [/learning strategy roadmap/i, /strategy roadmap/i, /creat(?:e|ed|ing)\s+.*roadmap/i, /design(?:ed|ing)?\s+.*learning strategy/i, /strategy development/i],
    normalizedLabel: "Strategy and roadmap planning",
    category: "Planning & Design",
    components: [
      component("strategy-development", "explicit", "high", "The evidence explicitly describes developing a strategy."),
      component("roadmap-planning", "explicit", "high", "The evidence explicitly describes turning that direction into a roadmap."),
      component("process-design", "inferred", "medium", "A roadmap for a system or programme usually requires structuring how work will happen."),
    ],
  },
  {
    matches: [/user stor(?:y|ies).*requirements?/i, /creat(?:e|ed|ing)\s+user stor/i],
    normalizedLabel: "Translating requirements into user stories",
    category: "Planning & Design",
    components: [
      component("requirements-clarification", "explicit", "high", "The evidence explicitly concerns clarifying requirements."),
      component("user-story-development", "explicit", "high", "The evidence explicitly describes creating user stories."),
    ],
  },
  {
    matches: [/structured framework.*organi[sz]ational problem/i, /framework\s+to\s+diagnos/i],
    normalizedLabel: "Structured organisational problem-solving",
    category: "Analysis",
    components: [
      component("structured-problem-solving", "explicit", "high", "The evidence describes applying a structured approach to a problem."),
      component("organisational-analysis", "explicit", "high", "The problem being analysed is organisational."),
    ],
  },
];

const bridgeByComponent: Record<string, Partial<Record<CareerId, string>>> = {
  "needs-assessment": {
    "product-manager": "user-research",
    "management-consultant": "qualitative-research",
    "service-designer": "user-research",
    "policy-analyst": "market-research",
    "organisational-development-consultant": "research-design",
  },
  "persuasive-writing": {
    "product-manager": "proposal-development",
    "management-consultant": "proposal-development",
    "policy-analyst": "report-writing",
    "marketing-strategist": "strategic-recommendations",
  },
  "strategy-development": {
    "product-manager": "product-strategy",
    "behavioural-science-consultant": "strategic-recommendations",
    "management-consultant": "strategic-recommendations",
    "marketing-strategist": "strategic-recommendations",
    "organisational-development-consultant": "strategic-recommendations",
  },
  "product-strategy": {
    "management-consultant": "strategic-recommendations",
  },
  "roadmap-planning": {
    "product-manager": "roadmap-planning",
    "behavioural-science-consultant": "intervention-design",
    "management-consultant": "process-design",
    "business-analyst": "project-coordination",
    "service-designer": "process-improvement",
  },
  "process-design": {
    "product-manager": "product-delivery",
    "behavioural-science-consultant": "intervention-design",
    "management-consultant": "process-design",
    "business-analyst": "process-improvement",
    "service-designer": "process-improvement",
  },
  "structured-problem-solving": {
    "product-manager": "problem-framing",
    "management-consultant": "structured-problem-solving",
    "business-analyst": "problem-framing",
    "policy-analyst": "insight-synthesis",
  },
  "organisational-analysis": {
    "management-consultant": "problem-framing",
    "organisational-development-consultant": "behavioural-analysis",
    "business-analyst": "problem-framing",
  },
  "qualitative-research": {
    "product-manager": "user-research",
    "behavioural-science-consultant": "research-design",
    "management-consultant": "qualitative-research",
    "ux-researcher": "qualitative-analysis",
    "consumer-insights-researcher": "qualitative-analysis",
    "service-designer": "user-research",
  },
  "qualitative-analysis": {
    "product-manager": "insight-synthesis",
    "behavioural-science-consultant": "behavioural-analysis",
    "management-consultant": "qualitative-research",
  },
  interviewing: {
    "product-manager": "user-research",
    "behavioural-science-consultant": "research-design",
    "management-consultant": "interviewing",
    "ux-researcher": "user-research",
    "consumer-insights-researcher": "user-research",
  },
  "proposal-development": {
    "product-manager": "proposal-development",
    "management-consultant": "proposal-development",
    "policy-analyst": "strategic-recommendations",
    "marketing-strategist": "strategic-recommendations",
  },
  "stakeholder-alignment": {
    "product-manager": "stakeholder-communication",
    "management-consultant": "stakeholder-communication",
    "business-analyst": "stakeholder-communication",
    "policy-analyst": "stakeholder-communication",
  },
  "product-launch-planning": {
    "product-manager": "product-launch-planning",
    "management-consultant": "process-design",
    "marketing-strategist": "strategic-recommendations",
  },
  "enablement-materials": {
    "product-manager": "enablement-materials",
    "management-consultant": "enablement-materials",
    "marketing-strategist": "client-presentation",
  },
  "programme-design": {
    "product-manager": "product-delivery",
    "behavioural-science-consultant": "intervention-design",
    "management-consultant": "programme-design",
    "business-analyst": "project-coordination",
    "organisational-development-consultant": "intervention-design",
  },
  "programme-implementation": {
    "product-manager": "product-delivery",
    "behavioural-science-consultant": "intervention-design",
    "management-consultant": "process-design",
    "business-analyst": "project-coordination",
    "service-designer": "process-improvement",
    "policy-analyst": "stakeholder-communication",
  },
  "programme-evaluation": {
    "product-manager": "experimentation",
    "behavioural-science-consultant": "causal-evaluation",
    "management-consultant": "programme-evaluation",
    "policy-analyst": "causal-evaluation",
    "organisational-development-consultant": "behavioural-analysis",
  },
  "learning-design": {
    "product-manager": "product-delivery",
    "behavioural-science-consultant": "intervention-design",
    "management-consultant": "process-design",
    "service-designer": "process-improvement",
    "organisational-development-consultant": "intervention-design",
  },
  "report-writing": {
    "product-manager": "enablement-materials",
    "behavioural-science-consultant": "strategic-recommendations",
    "management-consultant": "report-writing",
    "policy-analyst": "report-writing",
  },
  facilitation: {
    "product-manager": "stakeholder-communication",
    "behavioural-science-consultant": "stakeholder-communication",
    "management-consultant": "stakeholder-communication",
    "organisational-development-consultant": "facilitation",
  },
  "project-coordination": {
    "product-manager": "product-delivery",
    "management-consultant": "process-design",
    "business-analyst": "project-coordination",
    "service-designer": "process-improvement",
  },
  "process-improvement": {
    "product-manager": "product-delivery",
    "behavioural-science-consultant": "intervention-design",
    "management-consultant": "process-design",
    "business-analyst": "process-improvement",
    "service-designer": "process-improvement",
  },
  "partnership-development": {
    "product-manager": "stakeholder-communication",
    "management-consultant": "stakeholder-communication",
    "marketing-strategist": "stakeholder-communication",
  },
};

const tailoredTransferDescriptions: Record<string, Partial<Record<CareerId, string>>> = {
  "learning-design": {
    "product-manager": "This experience transfers to Product Management through designing an onboarding journey that helps users understand a product, reach an early outcome and continue using it.",
    "behavioural-science-consultant": "This experience transfers to Behavioural Science Consulting through designing guidance and touchpoints that reduce barriers and support a desired behaviour.",
    "management-consultant": "This experience transfers to Management Consulting when a recommendation requires training, onboarding or change-support materials that help people adopt a new process.",
  },
  "programme-design": {
    "product-manager": "Designing a programme transfers to Product Management through defining a user outcome, structuring the journey and sequencing what must be delivered.",
    "behavioural-science-consultant": "Designing a programme transfers to Behavioural Science Consulting through translating a behavioural objective into an intervention with deliberate participant touchpoints.",
  },
  "programme-implementation": {
    "product-manager": "This experience transfers to Product Management through coordinating owners, dependencies and feedback while delivering and improving an initiative.",
    "behavioural-science-consultant": "This experience transfers to Behavioural Science Consulting through delivering behavioural interventions consistently enough for their use and effects to be observed.",
    "management-consultant": "This experience transfers to Management Consulting when recommendations must become a practical implementation plan with owners, milestones, dependencies and progress checks.",
  },
  "programme-evaluation": {
    "product-manager": "Programme evaluation transfers to Product Management through checking whether a shipped change altered the intended user outcome and deciding what to improve next.",
    "behavioural-science-consultant": "Programme evaluation transfers to Behavioural Science Consulting through testing whether an intervention caused the intended behavioural change and updating the underlying explanation.",
  },
  "strategy-development": {
    "product-manager": "Strategy development transfers to Product Management by connecting user needs, evidence and business goals into a product strategy that identifies which outcomes to pursue.",
    "behavioural-science-consultant": "Strategy development transfers to Behavioural Science Consulting by connecting a behavioural diagnosis to a practical client direction while making assumptions and constraints explicit.",
  },
  "roadmap-planning": {
    "product-manager": "Roadmap planning translates product strategy into sequenced outcomes, dependencies and explicit trade-offs over time.",
    "behavioural-science-consultant": "Roadmap planning transfers to Behavioural Science Consulting when recommendations must become a staged intervention and learning plan for a client.",
  },
  "process-design": {
    "product-manager": "Process design transfers to Product Management through shaping how a user journey or delivery workflow should operate and improve over time.",
    "behavioural-science-consultant": "Process design transfers to Behavioural Science Consulting when behavioural barriers are converted into concrete changes to a service or intervention journey.",
  },
  "report-writing": {
    "product-manager": "Strategic report writing transfers to Product Management through synthesising evidence into a concise decision narrative that aligns a team around a product direction.",
    "behavioural-science-consultant": "Strategic report writing transfers to Behavioural Science Consulting through connecting research findings, behavioural interpretation and practical client recommendations.",
  },
  "qualitative-research": {
    "product-manager": "Qualitative research transfers to Product Management by revealing user needs, behaviours and pain points that inform problem framing and product decisions.",
    "behavioural-science-consultant": "Qualitative research transfers to Behavioural Science Consulting by uncovering context and possible behavioural mechanisms that can become testable hypotheses.",
  },
  "qualitative-analysis": {
    "product-manager": "Qualitative analysis transfers to Product Management by turning user evidence into patterns that shape priorities and product decisions.",
    "behavioural-science-consultant": "Qualitative analysis transfers to Behavioural Science Consulting by identifying behavioural patterns and context that sharpen a diagnosis or intervention hypothesis.",
  },
  "needs-assessment": {
    "product-manager": "Needs assessment transfers to Product Management by revealing unmet user needs and barriers that can be framed as product problems or opportunities.",
    "behavioural-science-consultant": "Needs assessment transfers to Behavioural Science Consulting by clarifying whose behaviour matters, the context around it and the barriers an intervention may need to address.",
  },
  "product-launch-planning": {
    "product-manager": "This experience transfers directly to Product Management through planning how a product or feature reaches users, coordinating readiness across teams and defining what a successful launch should achieve.",
    "management-consultant": "This experience transfers to Management Consulting when a strategy or recommendation must become a coordinated launch plan with stakeholders, dependencies and clear measures of progress.",
  },
  "product-strategy": {
    "management-consultant": "Product strategy transfers to Management Consulting through evaluating evidence, choices and trade-offs to develop a defensible strategic recommendation.",
  },
};

const confidenceValue: Record<SemanticConfidence, number> = { low: 1, medium: 2, high: 3 };
const importanceValue: Record<CareerActivity["importance"], number> = {
  Limited: 0,
  Supporting: 1,
  Important: 2,
  Core: 3,
};

const hydrateComponent = (draft: ComponentDraft): SemanticActivityComponent => {
  const definition = getActivityDefinition(draft.canonicalActivityId);
  return {
    canonicalActivityId: draft.canonicalActivityId,
    label: draft.label ?? definition?.label ?? draft.canonicalActivityId,
    evidenceType: draft.evidenceType,
    confidence: draft.confidence,
    rationale: draft.rationale,
    confirmedByUser: draft.confirmedByUser,
  };
};

const uniqueComponents = (components: SemanticActivityComponent[]) => {
  const byId = new Map<string, SemanticActivityComponent>();
  components.forEach((item) => {
    const current = byId.get(item.canonicalActivityId);
    if (!current || confidenceValue[item.confidence] > confidenceValue[current.confidence]) {
      byId.set(item.canonicalActivityId, item);
    }
  });
  return [...byId.values()];
};

export function mapActivityToSemanticComponents(label: string): SemanticResult {
  const cleanLabel = label.trim();
  const matchingRules = semanticRules.filter((rule) =>
    rule.matches.some((pattern) => pattern.test(cleanLabel)),
  );

  // The broad catalogue is a second layer: it recognises normal phrases that do
  // not need a bespoke rewrite while still preserving multiple supported parts.
  const catalogMatches = activityCatalog.filter((definition) =>
    definition.patterns.some((pattern) => pattern.test(cleanLabel)),
  );

  if (!matchingRules.length && !catalogMatches.length) {
    return {
      normalizedLabel: cleanLabel,
      category: "Other",
      components: [],
      mappingStatus: "unknown",
    };
  }

  const primaryRule = matchingRules[0];
  const components = uniqueComponents(
    matchingRules.length
      ? matchingRules.flatMap((rule) => rule.components.map(hydrateComponent))
      : catalogMatches.map((definition) =>
          hydrateComponent(
            component(
              definition.id,
              "explicit",
              "high",
              "The wording directly supports this transferable activity.",
            ),
          ),
        ),
  );

  const primaryDefinition = catalogMatches[0];
  return {
    normalizedLabel: primaryRule?.normalizedLabel ?? primaryDefinition.label,
    category: primaryRule?.category ?? primaryDefinition.category,
    components,
    mappingStatus: "mapped",
  };
}

const findCareerActivity = (
  careerId: CareerId,
  componentId: string,
): { activity?: CareerActivity; bridged: boolean } => {
  const career = getCareerModel(careerId);
  const direct = career?.activities.find((item) => item.id === componentId);
  if (direct) return { activity: direct, bridged: false };
  const bridgeId = bridgeByComponent[componentId]?.[careerId];
  return {
    activity: career?.activities.find((item) => item.id === bridgeId),
    bridged: Boolean(bridgeId),
  };
};

const firstSentence = (value: string) => {
  const clean = value.trim();
  const match = clean.match(/^.*?[.!?](?:\s|$)/);
  return (match?.[0] ?? clean).trim();
};

const describeTransfer = (
  source: SemanticActivityComponent,
  careerId: CareerId,
  target: CareerActivity,
  bridged: boolean,
) => {
  if (!bridged) return firstSentence(target.description);
  const tailored = tailoredTransferDescriptions[source.canonicalActivityId]?.[careerId];
  if (tailored) return firstSentence(tailored);

  const careerTitle = getCareerModel(careerId)?.title ?? "this role";
  return (
    source.label +
    " transfers to " +
    careerTitle +
    " through " +
    target.label.toLowerCase() +
    ". " +
    firstSentence(target.description)
  );
};

export function mapActivityToCareers(
  components: SemanticActivityComponent[],
  careerIds: CareerId[],
): Partial<Record<CareerId, CareerTransfer>> {
  const transfers: Partial<Record<CareerId, CareerTransfer>> = {};

  careerIds.forEach((careerId) => {
    const candidates = components
      .map((source) => {
        const match = findCareerActivity(careerId, source.canonicalActivityId);
        return match.activity
          ? { source, activity: match.activity, bridged: match.bridged }
          : undefined;
      })
      .filter(
        (
          candidate,
        ): candidate is {
          source: SemanticActivityComponent;
          activity: CareerActivity;
          bridged: boolean;
        } => Boolean(candidate),
      )
      .sort((a, b) => {
        const byImportance =
          importanceValue[b.activity.importance] - importanceValue[a.activity.importance];
        return byImportance || confidenceValue[b.source.confidence] - confidenceValue[a.source.confidence];
      });

    if (!candidates.length) {
      transfers[careerId] = {
        careerId,
        careerActivityId: "",
        relationship: "unknown",
        importance: "Limited",
        confidence: "low",
        rationale:
          "No confident transfer to " +
          (getCareerModel(careerId)?.title ?? "this role") +
          " was identified from the available evidence.",
      };
      return;
    }

    const strongest = candidates[0];
    // Explain the source activity in the order its components were detected.
    // Importance still determines the badge and primary career activity, but it
    // must not replace a roadmap explanation with a generic higher-ranked task.
    const distinctTargets = components
      .map((source) => {
        const match = findCareerActivity(careerId, source.canonicalActivityId);
        return match.activity
          ? { source, activity: match.activity, bridged: match.bridged }
          : undefined;
      })
      .filter(
        (
          candidate,
        ): candidate is {
          source: SemanticActivityComponent;
          activity: CareerActivity;
          bridged: boolean;
        } => Boolean(candidate),
      )
      .filter(
        (candidate, index, all) =>
          all.findIndex((item) => item.activity.id === candidate.activity.id) === index,
      );
    const rationale = distinctTargets
      .slice(0, 2)
      .map((candidate) =>
        describeTransfer(candidate.source, careerId, candidate.activity, candidate.bridged),
      )
      .join(" ");

    transfers[careerId] = {
      careerId,
      careerActivityId: strongest.activity.id,
      relationship: strongest.bridged ? "transferable" : "direct",
      importance: strongest.activity.importance,
      confidence: strongest.source.confidence,
      rationale,
    };
  });

  return transfers;
}

export function makeUnmappedComponent(label: string): SemanticActivityComponent {
  return {
    canonicalActivityId: makeCustomActivityId(label),
    label: label.trim(),
    evidenceType: "explicit",
    confidence: "high",
    rationale: "Added or confirmed by the user.",
    confirmedByUser: true,
  };
}

export function mapNormalizedActivity(
  activity: Pick<NormalizedActivity, "canonicalId" | "originalLabel" | "sources">,
  careerIds: CareerId[],
) {
  const knownDefinition = getActivityDefinition(activity.canonicalId);
  const semantic = mapActivityToSemanticComponents(activity.originalLabel);

  // A CV sentence can support several activities. Once extraction has assigned
  // a canonical identity, map this record using only that identity. Re-using
  // every component from the full sentence here caused duplicate labels and
  // explanations from neighbouring activities to leak into one another.
  const components = knownDefinition
    ? [
        hydrateComponent(
          component(
            knownDefinition.id,
            "explicit",
            "high",
            "This activity type was identified from the supporting CV evidence.",
          ),
        ),
      ]
    : semantic.components;
  const careerTransfers = mapActivityToCareers(components, careerIds);
  const hasMapped = careerIds.some(
    (careerId) => careerTransfers[careerId]?.relationship !== "unknown",
  );
  const hasUnknown = careerIds.some(
    (careerId) => careerTransfers[careerId]?.relationship === "unknown",
  );

  return {
    normalizedLabel: knownDefinition?.label ?? semantic.normalizedLabel,
    category: knownDefinition?.category ?? semantic.category,
    components,
    careerTransfers,
    mappingStatus: hasMapped ? (hasUnknown ? "partial" : "mapped") : "unknown",
  } as const;
}