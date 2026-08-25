import onet from "@/data/generated/onet-occupations.json";
import roleMap from "@/data/custom/role-occupation-map.json";
import { getCareerModel, type CareerId } from "@/data/careers";
import type { OnetOccupation, RoleResolution } from "@/types/skillEvidence";

const occupations = onet.occupations as OnetOccupation[];
const byId = new Map(occupations.map((occupation) => [occupation.id, occupation]));

const tokens = (value: string) =>
  new Set(
    value
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, " ")
      .split(" ")
      .filter((token) => token.length > 2 && !["and", "the", "all", "other"].includes(token)),
  );

const similarity = (query: string, occupation: OnetOccupation) => {
  const queryTokens = tokens(query);
  const titleTokens = tokens(occupation.title);
  const descriptionTokens = tokens(occupation.description);
  let score = 0;
  queryTokens.forEach((token) => {
    if (titleTokens.has(token)) score += 4;
    else if (descriptionTokens.has(token)) score += 1;
  });
  return queryTokens.size ? score / (queryTokens.size * 4) : 0;
};

export function resolveRole(role: { id?: string; title: string }): RoleResolution {
  const curated = role.id
    ? (roleMap.roles as Record<string, { occupationIds: string[]; note: string }>)[role.id]
    : undefined;
  if (curated) {
    return {
      requestedId: role.id,
      requestedTitle: role.title,
      status: "curated",
      confidence: "high",
      occupations: curated.occupationIds.map((id) => byId.get(id)).filter(Boolean) as OnetOccupation[],
      reason: curated.note,
    };
  }

  const exact = occupations.find((occupation) =>
    occupation.title.toLowerCase() === role.title.trim().toLowerCase(),
  );
  if (exact) {
    return {
      requestedId: role.id,
      requestedTitle: role.title,
      status: "exact",
      confidence: "high",
      occupations: [exact],
      reason: `Exact O*NET occupation title match: ${exact.title}.`,
    };
  }

  const ranked = occupations
    .map((occupation) => ({ occupation, score: similarity(role.title, occupation) }))
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);
  const best = ranked[0]?.score ?? 0;

  return {
    requestedId: role.id,
    requestedTitle: role.title,
    status: best >= 0.5 ? "related" : "provisional",
    confidence: best >= 0.5 ? "medium" : "low",
    occupations: ranked.map((item) => item.occupation),
    reason: ranked.length
      ? `Closest O*NET title signals: ${ranked.map((item) => item.occupation.title).join(", ")}. The user's role label is preserved.`
      : "No responsible O*NET title match was found. The role remains provisional.",
  };
}

export function resolveCareerId(careerId: CareerId) {
  const career = getCareerModel(careerId);
  return resolveRole({ id: careerId, title: career?.title ?? careerId });
}
