import { getCareerModel, getRemainingEvidenceGaps, type CareerId } from "@/data/careers";
import type { NormalizedActivity, UncertaintyChoice } from "@/types/prototype";

export function generateUncertaintyChoices(careers: CareerId[], activities: NormalizedActivity[]): UncertaintyChoice[] {
  if (careers.length !== 2) return [];
  const existingIds = activities.map((activity) => activity.canonicalId);
  const firstCareer = getCareerModel(careers[0]);
  const secondCareer = getCareerModel(careers[1]);
  if (!firstCareer || !secondCareer) return [];
  const models = [firstCareer, secondCareer];

  const roleChoices = models.map((career, index): UncertaintyChoice => {
    const gaps = getRemainingEvidenceGaps(career.id, existingIds, 6);
    const exploredGaps = gaps.filter((gap) => career.uncertainty.explores.includes(gap.id));
    const explores = (exploredGaps.length ? exploredGaps : gaps.slice(0, 3)).map((gap) => gap.label);
    return {
      id: `uncertainty-${career.id}`,
      type: index === 0 ? "careerA" : "careerB",
      careerId: career.id,
      label: career.title,
      title: career.uncertainty.title,
      question: career.uncertainty.question,
      supportingText: explores.length ? `This would explore: ${explores.join(", ")}.` : "This would explore the depth and day-to-day shape of this role.",
      explores,
      whyInformative: explores.length
        ? `Your CV provides limited evidence about ${explores.join(", ").toLowerCase()}, even though these activities help define ${career.title}.`
        : `Your CV contains adjacent experience, but not enough evidence about how the defining work of ${career.title} feels in practice.`,
    };
  });

  const [careerA, careerB] = models;
  return [
    ...roleChoices,
    {
      id: "uncertainty-comparison",
      type: "comparison",
      label: "Compare both roles",
      title: "I want to experience both types of work on the same problem",
      question: `How does it feel to approach the same problem as a ${careerA.title} and as a ${careerB.title}?`,
      supportingText: "Use one scenario and approach it from both career perspectives so you can compare the kinds of work more directly.",
      explores: [careerA.title, careerB.title],
      whyInformative: "A shared scenario can make the contrast between the two roles easier to notice without treating either path as the default.",
    },
    {
      id: "uncertainty-guided",
      type: "guided",
      label: "Help me choose",
      title: "I’m not sure what would be most useful to test",
      question: `Which uncertainty could meaningfully change how I think about ${careerA.title} and ${careerB.title}?`,
      supportingText: "Help me identify an uncertainty that could meaningfully change how I think about these two paths.",
      explores: [],
      whyInformative: "The app can later rank useful uncertainties, but you will still confirm the question before an experiment is created.",
    },
  ];
}
