"use client";

import { useState } from "react";
import { Progress } from "@/components/Progress";
import { WelcomeScreen } from "@/components/screens/WelcomeScreen";
import { CareerSelectionScreen } from "@/components/screens/CareerSelectionScreen";
import { CvUploadScreen } from "@/components/screens/CvUploadScreen";
import { ExperienceSelectionScreen } from "@/components/screens/ExperienceSelectionScreen";
import { ActivityOverviewScreen } from "@/components/screens/ActivityOverviewScreen";
import { EvidenceTunnelScreen } from "@/components/screens/EvidenceTunnelScreen";
import { PrioritySelectionScreen } from "@/components/screens/PrioritySelectionScreen";
import { StartingEvidenceMapScreen } from "@/components/screens/StartingEvidenceMapScreen";
import { UncertaintyChoiceScreen } from "@/components/screens/UncertaintyChoiceScreen";
import { UncertaintyConfirmationScreen } from "@/components/screens/UncertaintyConfirmationScreen";
import { ExperimentPlaceholderScreen } from "@/components/screens/ExperimentPlaceholderScreen";
import type { CareerId } from "@/data/careers";
import { sampleCvText, sampleExperiences } from "@/data/prototype";
import { normalizeActivities } from "@/lib/evidence/normalizeActivities";
import { selectTopEvidenceActivities } from "@/lib/evidence/selectTopEvidenceActivities";
import { generateUncertaintyChoices } from "@/lib/evidence/generateUncertaintyChoices";
import { extractExperiencesFromCv } from "@/lib/extraction/extractExperiencesFromCv";
import type { ActivityEvidenceResponse, DetectedExperience, NormalizedActivity, Step, UncertaintyChoice } from "@/types/prototype";

export default function Home() {
  const [step, setStep] = useState<Step>(1);
  const [selectedCareers, setSelectedCareers] = useState<CareerId[]>([]);
  const [uploadedCvFilename, setUploadedCvFilename] = useState("");
  const [, setExtractedCvText] = useState("");
  const [detectedExperiences, setDetectedExperiences] = useState<DetectedExperience[]>([]);
  const [selectedExperienceIds, setSelectedExperienceIds] = useState<string[]>([]);
  const [normalizedActivities, setNormalizedActivities] = useState<NormalizedActivity[]>([]);
  const [topEvidenceActivities, setTopEvidenceActivities] = useState<NormalizedActivity[]>([]);
  const [evidenceResponses, setEvidenceResponses] = useState<Record<string, ActivityEvidenceResponse>>({});
  const [priorityActivityIds, setPriorityActivityIds] = useState<string[]>([]);
  const [minimizedActivityIds, setMinimizedActivityIds] = useState<string[]>([]);
  const [tunnelIndex, setTunnelIndex] = useState(0);
  const [availableUncertaintyChoices, setAvailableUncertaintyChoices] = useState<UncertaintyChoice[]>([]);
  const [selectedUncertaintyId, setSelectedUncertaintyId] = useState<string>();

  const goTo = (next: Step) => { setStep(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const resetEvidence = () => { setSelectedExperienceIds([]); setNormalizedActivities([]); setTopEvidenceActivities([]); setEvidenceResponses({}); setPriorityActivityIds([]); setMinimizedActivityIds([]); setTunnelIndex(0); setAvailableUncertaintyChoices([]); setSelectedUncertaintyId(undefined); };
  const toggleCareer = (career: CareerId) => setSelectedCareers((current) => current.includes(career) ? current.filter((item) => item !== career) : current.length < 2 ? [...current, career] : current);

  const loadCvEvidence = (filename: string, cvText: string) => {
    setUploadedCvFilename(filename);
    setExtractedCvText(cvText);
    setDetectedExperiences(extractExperiencesFromCv(cvText));
    resetEvidence();
  };

  const useSampleCv = () => {
    setUploadedCvFilename("Sample multi-role CV data");
    setExtractedCvText(sampleCvText);
    setDetectedExperiences(structuredClone(sampleExperiences));
    resetEvidence();
  };

  const combineSelectedExperiences = () => {
    const selected = detectedExperiences.filter((experience) => selectedExperienceIds.includes(experience.id));
    setNormalizedActivities(normalizeActivities(selected));
    setTopEvidenceActivities([]);
    setEvidenceResponses({});
    setPriorityActivityIds([]);
    setMinimizedActivityIds([]);
    setTunnelIndex(0);
    goTo(5);
  };

  const startEvidenceTunnel = () => {
    const selected = selectTopEvidenceActivities(normalizedActivities, selectedCareers, 10);
    setTopEvidenceActivities(selected);
    setEvidenceResponses((current) => Object.fromEntries(selected.map((activity) => [activity.id, current[activity.id] ?? {}])));
    setTunnelIndex(0);
    goTo(6);
  };

  const chooseUncertainty = () => {
    const choices = generateUncertaintyChoices(selectedCareers, normalizedActivities);
    setAvailableUncertaintyChoices(choices);
    setSelectedUncertaintyId((current) => choices.some((choice) => choice.id === current) ? current : undefined);
    goTo(9);
  };

  const selectedUncertainty = availableUncertaintyChoices.find((choice) => choice.id === selectedUncertaintyId);

  return (
    <main><div className="app-shell">
      <header className="brand"><span className="brand-mark" aria-hidden="true">CE</span><span>The Career Experiment</span></header>
      <Progress step={step} />
      {step === 1 && <WelcomeScreen onContinue={() => goTo(2)} />}
      {step === 2 && <CareerSelectionScreen selected={selectedCareers} onToggle={toggleCareer} onContinue={() => goTo(3)} onBack={() => goTo(1)} />}
      {step === 3 && <CvUploadScreen filename={uploadedCvFilename} onCvReady={loadCvEvidence} onUseSample={useSampleCv} onContinue={() => goTo(4)} onBack={() => goTo(2)} />}
      {step === 4 && <ExperienceSelectionScreen experiences={detectedExperiences} selectedIds={selectedExperienceIds} onSelectionChange={setSelectedExperienceIds} onExperiencesChange={setDetectedExperiences} onContinue={combineSelectedExperiences} onBack={() => goTo(3)} />}
      {step === 5 && <ActivityOverviewScreen activities={normalizedActivities} onChange={setNormalizedActivities} onContinue={startEvidenceTunnel} onBack={() => goTo(4)} />}
      {step === 6 && <EvidenceTunnelScreen activities={topEvidenceActivities} careers={selectedCareers} responses={evidenceResponses} currentIndex={tunnelIndex} onIndexChange={(index) => { setTunnelIndex(index); window.scrollTo({ top: 0, behavior: "smooth" }); }} onResponseChange={setEvidenceResponses} onComplete={() => goTo(7)} onBack={() => goTo(5)} />}
      {step === 7 && <PrioritySelectionScreen activities={topEvidenceActivities} responses={evidenceResponses} priorities={priorityActivityIds} minimized={minimizedActivityIds} onPrioritiesChange={setPriorityActivityIds} onMinimizedChange={setMinimizedActivityIds} onContinue={() => goTo(8)} onBack={() => { setTunnelIndex(Math.max(0, topEvidenceActivities.length - 1)); goTo(6); }} />}
      {step === 8 && <StartingEvidenceMapScreen careers={selectedCareers} allActivities={normalizedActivities} responses={evidenceResponses} priorityIds={priorityActivityIds} onBack={() => goTo(7)} onContinue={chooseUncertainty} />}
      {step === 9 && <UncertaintyChoiceScreen choices={availableUncertaintyChoices} selectedId={selectedUncertaintyId} onSelect={setSelectedUncertaintyId} onBack={() => goTo(8)} onContinue={() => selectedUncertainty && goTo(10)} />}
      {step === 10 && selectedUncertainty && <UncertaintyConfirmationScreen choice={selectedUncertainty} onBack={() => goTo(9)} onContinue={() => goTo(11)} />}
      {step === 11 && selectedUncertainty && <ExperimentPlaceholderScreen question={selectedUncertainty.question} onBack={() => goTo(10)} />}
    </div></main>
  );
}
