"use client";

import { useMemo, useState } from "react";
import { Progress } from "@/components/Progress";
import { WelcomeScreen } from "@/components/screens/WelcomeScreen";
import { CareerSelectionScreen } from "@/components/screens/CareerSelectionScreen";
import { CvUploadScreen } from "@/components/screens/CvUploadScreen";
import { CvReviewScreen } from "@/components/screens/CvReviewScreen";
import { EvidenceReviewScreen } from "@/components/screens/EvidenceReviewScreen";
import { EvidenceMapScreen } from "@/components/screens/EvidenceMapScreen";
import { ExperimentPlaceholderScreen } from "@/components/screens/ExperimentPlaceholderScreen";
import { getCareerActivity, type CareerId } from "@/data/careers";
import { sampleCvText, sampleExperiences } from "@/data/prototype";
import { extractExperiencesFromCv } from "@/lib/extraction/extractExperiencesFromCv";
import type { ActivityPreference, CareerRelevanceByActivity, DetectedExperience, Step } from "@/types/prototype";

export default function Home() {
  const [step, setStep] = useState<Step>(1);
  const [selectedCareers, setSelectedCareers] = useState<CareerId[]>([]);
  const [uploadedCvFilename, setUploadedCvFilename] = useState("");
  const [extractedCvText, setExtractedCvText] = useState("");
  const [experiences, setExperiences] = useState<DetectedExperience[]>([]);
  const [preferences, setPreferences] = useState<Record<string, ActivityPreference>>({});

  const confirmedActivities = useMemo(
    () => experiences.flatMap((experience) => experience.activities).filter((activity) => activity.confirmed),
    [experiences],
  );

  const careerRelevance = useMemo<CareerRelevanceByActivity>(() => Object.fromEntries(
    confirmedActivities.map((activity) => [
      activity.id,
      Object.fromEntries(selectedCareers.map((careerId) => {
        const mapping = getCareerActivity(careerId, activity.activityId);
        return [careerId, { importance: mapping.importance, description: mapping.description }];
      })),
    ]),
  ), [confirmedActivities, selectedCareers]);

  const goTo = (next: Step) => {
    setStep(next);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const toggleCareer = (career: CareerId) => setSelectedCareers((current) => (
    current.includes(career)
      ? current.filter((item) => item !== career)
      : current.length < 2 ? [...current, career] : current
  ));

  const loadPdfEvidence = (filename: string, cvText: string) => {
    setUploadedCvFilename(filename);
    setExtractedCvText(cvText);
    setExperiences(extractExperiencesFromCv(cvText));
    setPreferences({});
  };

  const useSampleCv = () => {
    setUploadedCvFilename("Sample CV data");
    setExtractedCvText(sampleCvText);
    setExperiences(structuredClone(sampleExperiences));
    setPreferences({});
  };

  return (
    <main>
      <div className="app-shell">
        <header className="brand"><span className="brand-mark" aria-hidden="true">CE</span><span>The Career Experiment</span></header>
        <Progress step={step} />
        {step === 1 && <WelcomeScreen onContinue={() => goTo(2)} />}
        {step === 2 && <CareerSelectionScreen selected={selectedCareers} onToggle={toggleCareer} onContinue={() => goTo(3)} onBack={() => goTo(1)} />}
        {step === 3 && <CvUploadScreen filename={uploadedCvFilename} onPdfReady={loadPdfEvidence} onUseSample={useSampleCv} onContinue={() => goTo(4)} onBack={() => goTo(2)} />}
        {step === 4 && <CvReviewScreen experiences={experiences} onChange={setExperiences} onContinue={() => goTo(5)} onBack={() => goTo(3)} />}
        {step === 5 && <EvidenceReviewScreen activities={confirmedActivities} careers={selectedCareers} preferences={preferences} careerRelevance={careerRelevance} onChange={setPreferences} onContinue={() => goTo(6)} onBack={() => goTo(4)} />}
        {step === 6 && <EvidenceMapScreen careers={selectedCareers} activities={confirmedActivities} preferences={preferences} onBack={() => goTo(5)} onContinue={() => goTo(7)} />}
        {step === 7 && <ExperimentPlaceholderScreen onBack={() => goTo(6)} />}
      </div>
      <span className="session-data-note" aria-hidden="true">{extractedCvText.length > 0 ? "CV loaded" : ""}</span>
    </main>
  );
}
