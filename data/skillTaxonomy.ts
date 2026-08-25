import enrichment from "@/data/custom/skill-enrichment.json";
import type { CanonicalSkill } from "@/types/skillEvidence";

const rawSkills = enrichment.skills as CanonicalSkill[];
const clientCommunication = rawSkills.find((skill) => skill.id === "client-communication");

export const canonicalSkills = rawSkills
  .filter((skill) => skill.id !== "client-communication")
  .map((skill) => skill.id === "stakeholder-communication" && clientCommunication
    ? {
        ...skill,
        label: "Stakeholder and client communication",
        aliases: [...new Set([...skill.aliases, clientCommunication.label, ...clientCommunication.aliases])],
        signals: {
          actions: [...new Set([...skill.signals.actions, ...clientCommunication.signals.actions])],
          objects: [...new Set([...skill.signals.objects, ...clientCommunication.signals.objects])],
          outcomes: [...new Set([...skill.signals.outcomes, ...clientCommunication.signals.outcomes])],
          contexts: [...new Set([...(skill.signals.contexts ?? []), ...(clientCommunication.signals.contexts ?? [])])],
        },
        onetTerms: [...new Set([...skill.onetTerms, ...clientCommunication.onetTerms])],
      }
    : skill);

export function getCanonicalSkill(id: string) {
  const canonicalId = id === "client-communication" ? "stakeholder-communication" : id;
  return canonicalSkills.find((skill) => skill.id === canonicalId);
}
