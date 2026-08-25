"use client";

import { useState } from "react";
import { Progress } from "@/components/Progress";
import { WelcomeScreen } from "@/components/screens/WelcomeScreen";
import { CareerSelectionScreen } from "@/components/screens/CareerSelectionScreen";
import { CvUploadScreen } from "@/components/screens/CvUploadScreen";
import { ExperienceSelectionScreen } from "@/components/screens/ExperienceSelectionScreen";
import { ActivityOverviewScreen } from "@/components/screens/ActivityOverviewScreen";
import { EvidenceTunnelScreen } from "@/components/screens/EvidenceTunnelScreen";
import { StartingEvidenceMapScreen } from "@/components/screens/StartingEvidenceMapScreen";
import { CareerExperimentScreen } from "@/components/screens/CareerExperimentScreen";
import type { CareerId } from "@/data/careers";
import { sampleCvText, sampleExperiences } from "@/data/prototype";
import { normalizeActivities } from "@/lib/evidence/normalizeActivities";
import { getEvidenceActivityGroups, selectTopEvidenceActivities, sortActivitiesForGroupedReview } from "@/lib/evidence/selectTopEvidenceActivities";
import { extractExperiencesFromCv } from "@/lib/extraction/extractExperiencesFromCv";
import type { ActivityEvidenceResponse, DetectedExperience, NormalizedActivity, Step } from "@/types/prototype";

type EvidenceStage = "tunnel" | "map";

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
  const [tunnelIndex, setTunnelIndex] = useState(0);
  const [evidenceStage, setEvidenceStage] = useState<EvidenceStage>("tunnel");
  const [isGuidedDemo, setIsGuidedDemo] = useState(false);


  const goTo = (next: Step) => { setStep(next); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const showEvidenceStage = (stage: EvidenceStage) => { setEvidenceStage(stage); setStep(6); window.scrollTo({ top: 0, behavior: "smooth" }); };
  const resetEvidence = () => { setSelectedExperienceIds([]); setNormalizedActivities([]); setTopEvidenceActivities([]); setEvidenceResponses({}); setTunnelIndex(0); setEvidenceStage("tunnel"); };
  const toggleCareer = (career: CareerId) => setSelectedCareers((current) => current.includes(career) ? current.filter((item) => item !== career) : current.length < 2 ? [...current, career] : current);

  const loadCvEvidence = (filename: string, cvText: string) => {
    setIsGuidedDemo(false);
    setUploadedCvFilename(filename);
    setExtractedCvText(cvText);
    try {
      setDetectedExperiences(extractExperiencesFromCv(cvText));
    } catch (error) {
      setDetectedExperiences([]);
      if (process.env.NODE_ENV === "development") console.error("[CV experience parsing]", error);
    }
    resetEvidence();
  };

  const useSampleCv = () => {
    setIsGuidedDemo(false);
    setUploadedCvFilename("Sample multi-role CV data");
    setExtractedCvText(sampleCvText);
    setDetectedExperiences(structuredClone(sampleExperiences));
    resetEvidence();
  };

  const startGuidedDemo = () => {
    const demoExperiences = structuredClone(sampleExperiences);
    setIsGuidedDemo(true);
    setSelectedCareers(["product-manager", "management-consultant"]);
    setUploadedCvFilename("Guided demo · fictional sample CV");
    setExtractedCvText(sampleCvText);
    setDetectedExperiences(demoExperiences);
    resetEvidence();
    setSelectedExperienceIds(demoExperiences.slice(0, 3).map((experience) => experience.id));
    goTo(4);
  };

  const resetPrototype = () => {
    setStep(1);
    setSelectedCareers([]);
    setUploadedCvFilename("");
    setExtractedCvText("");
    setDetectedExperiences([]);
    setSelectedExperienceIds([]);
    setNormalizedActivities([]);
    setTopEvidenceActivities([]);
    setEvidenceResponses({});
    setTunnelIndex(0);
    setEvidenceStage("tunnel");
    setIsGuidedDemo(false);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const combineSelectedExperiences = (currentExperiences: DetectedExperience[]) => {
    const selected = currentExperiences.filter((experience) => selectedExperienceIds.includes(experience.id));
    setNormalizedActivities(normalizeActivities(selected, selectedCareers));
    setTopEvidenceActivities([]);
    setEvidenceResponses({});
    setTunnelIndex(0);
    goTo(5);
  };

  const startEvidenceTunnel = () => {
    const selected = sortActivitiesForGroupedReview(selectTopEvidenceActivities(normalizedActivities, selectedCareers, 10));
    setTopEvidenceActivities(selected);
    setEvidenceResponses((current) => Object.fromEntries(selected.map((activity) => [activity.id, current[activity.id] ?? {}])));
    setTunnelIndex(0);
    showEvidenceStage("tunnel");
  };

  return (
    <main><div className="app-shell">
      <header className="brand-bar">
        <div className="brand"><span className="brand-mark" aria-hidden="true">CE</span><span>The Career Experiment</span>{isGuidedDemo && <span className="demo-badge">Guided demo</span>}</div>
        {step > 1 && <button className="text-button" type="button" onClick={resetPrototype}>Start over</button>}
      </header>
      <Progress step={step} />
      {isGuidedDemo && step > 1 && <p className="portfolio-demo-banner" role="status">You are using fictional sample data. Edit any choice, or select Start over to use your own CV.</p>}
      {step === 1 && <WelcomeScreen onContinue={() => goTo(2)} onStartDemo={startGuidedDemo} />}
      {step === 2 && <CareerSelectionScreen selected={selectedCareers} onToggle={toggleCareer} onContinue={() => goTo(3)} onBack={() => goTo(1)} />}
      {step === 3 && <CvUploadScreen filename={uploadedCvFilename} onCvReady={loadCvEvidence} onUseSample={useSampleCv} onContinue={() => goTo(4)} onBack={() => goTo(2)} />}
      {step === 4 && <ExperienceSelectionScreen experiences={detectedExperiences} selectedIds={selectedExperienceIds} onSelectionChange={setSelectedExperienceIds} onExperiencesChange={setDetectedExperiences} onContinue={combineSelectedExperiences} onBack={() => goTo(3)} />}
      {step === 5 && <ActivityOverviewScreen activities={normalizedActivities} careers={selectedCareers} onChange={setNormalizedActivities} onContinue={startEvidenceTunnel} onBack={() => goTo(4)} />}
      {step === 6 && evidenceStage === "tunnel" && <EvidenceTunnelScreen activities={topEvidenceActivities} careers={selectedCareers} responses={evidenceResponses} currentIndex={tunnelIndex} onIndexChange={(index) => { setTunnelIndex(index); window.scrollTo({ top: 0, behavior: "smooth" }); }} onResponseChange={setEvidenceResponses} onComplete={() => showEvidenceStage("map")} onBack={() => goTo(5)} />}
      {step === 6 && evidenceStage === "map" && <StartingEvidenceMapScreen careers={selectedCareers} allActivities={topEvidenceActivities} responses={evidenceResponses} onBack={() => { setTunnelIndex(Math.max(0, getEvidenceActivityGroups(topEvidenceActivities).length - 1)); showEvidenceStage("tunnel"); }} onContinue={() => goTo(7)} />}
      {step === 7 && <CareerExperimentScreen careers={selectedCareers} isGuidedDemo={isGuidedDemo} onBackToEvidenceMap={() => showEvidenceStage("map")} />}
    </div></main>
  );
}
