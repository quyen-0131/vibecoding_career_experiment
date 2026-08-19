"use client";

import { useRef, useState } from "react";
import { extractCvText } from "@/lib/cv/extractCvText";

type Props = {
  filename: string;
  onCvReady: (filename: string, text: string) => void;
  onUseSample: () => void;
  onContinue: () => void;
  onBack: () => void;
};

export function CvUploadScreen({ filename, onCvReady, onUseSample, onContinue, onBack }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState("");

  const readFile = async (file?: File) => {
    if (!file) return;
    setError("");
    setIsReading(true);
    let text: string;
    try {
      text = await extractCvText(file);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not read this CV. Please try another file.");
      setIsReading(false);
      return;
    }
    setIsReading(false);
    onCvReady(file.name, text);
  };

  return (
    <section className="screen">
      <div className="eyebrow">Your existing evidence</div>
      <h1>Let&apos;s start with what you&apos;ve already tried.</h1>
      <p className="lead compact">Upload your CV and we&apos;ll turn your past experiences into career evidence. You&apos;ll review everything before we use it.</p>

      <div
        className={isDragging ? "upload-zone dragging" : "upload-zone"}
        onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => { event.preventDefault(); setIsDragging(false); }}
        onDrop={(event) => { event.preventDefault(); setIsDragging(false); void readFile(event.dataTransfer.files[0]); }}
      >
        <div className="upload-icon" aria-hidden="true">CV</div>
        <h2>{filename || "Drop your CV here"}</h2>
        <p>{filename ? "Your CV is ready to review." : "PDF or Word (.docx). Your file stays in this browser session."}</p>
        <input ref={inputRef} className="visually-hidden" type="file" accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx,.doc" onChange={(event) => void readFile(event.target.files?.[0])} />
        <button className="button secondary" type="button" disabled={isReading} onClick={() => inputRef.current?.click()}>{isReading ? "Reading CV..." : filename ? "Choose a different CV" : "Choose CV"}</button>
      </div>

      {error && <div className="upload-error" role="alert"><strong>That file did not work.</strong><span>{error}</span></div>}
      <button className="sample-button" type="button" onClick={onUseSample}><span aria-hidden="true">*</span><span><strong>Use sample CV data</strong><small>Try the full flow without uploading a file</small></span></button>
      <div className="actions"><button className="button ghost" type="button" onClick={onBack}>Back</button><button className="button primary" type="button" disabled={!filename || isReading} onClick={onContinue}>Review detected work <span aria-hidden="true">→</span></button></div>
    </section>
  );
}
