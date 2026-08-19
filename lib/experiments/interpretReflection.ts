import type { CareerId } from "@/data/careers";

type ReflectionTheme = {
  label: string;
  patterns: RegExp[];
};

const reflectionThemes: ReflectionTheme[] = [
  {
    label: "measurement or metrics",
    patterns: [/metric/i, /measur/i, /data/i, /eviden/i],
  },
  {
    label: "methods, frameworks or unfamiliar terminology",
    patterns: [/framework/i, /memori[sz]/i, /terminolog/i, /formula/i, /method/i],
  },
  {
    label: "making trade-offs or decisions with incomplete information",
    patterns: [/trade.?off/i, /uncertain/i, /ambigu/i, /incomplete/i, /prioriti[sz]/i],
  },
  {
    label: "research and hypothesis work",
    patterns: [/research/i, /hypothes/i, /interview/i, /experiment/i],
  },
  {
    label: "stakeholder or client communication",
    patterns: [/stakeholder/i, /client/i, /team/i, /communicat/i, /present/i],
  },
];

export type ReflectionInterpretation = {
  observation: string;
  roleContext: string[];
  interpretation: string;
  nextQuestion: string;
};

export function interpretComparisonReflection(
  reflection: string,
  _careerIds: CareerId[],
): ReflectionInterpretation | undefined {
  void _careerIds;
  const text = reflection.trim();
  if (!text) return undefined;

  const themes = reflectionThemes
    .filter((theme) => theme.patterns.some((pattern) => pattern.test(text)))
    .slice(0, 2);
  const mentionsLearningBurden =
    /framework|memori[sz]|terminolog|formula|method|not know|unfamiliar|learn/i.test(text);

  if (mentionsLearningBurden) {
    return {
      observation: themes.length
        ? "Your reaction seems connected to " + themes.map((theme) => theme.label).join(" and ") + "."
        : "Part of the task felt unfamiliar.",
      roleContext: [],
      interpretation:
        "You may not dislike this kind of work itself. It may feel unappealing right now because the methods or frameworks are unfamiliar.",
      nextQuestion:
        "Try the same type of task again with more guidance, then see whether it still feels unappealing.",
    };
  }

  if (themes.length) {
    return {
      observation:
        "Your reaction seems connected to " +
        themes.map((theme) => theme.label).join(" and ") +
        ".",
      roleContext: [],
      interpretation:
        "This tells you something about how this part of the work felt in this exercise, but one short task is not enough to judge the whole role.",
      nextQuestion:
        "Try a second case that includes this kind of work and check whether your reaction stays the same.",
    };
  }

  return {
    observation: "Something about this task affected how the work felt.",
    roleContext: [],
    interpretation:
      "Your reflection is useful, but it is not specific enough to draw a broader conclusion yet.",
    nextQuestion:
      "In the next case, notice which exact activity feels energising or frustrating and write that down.",
  };
}

