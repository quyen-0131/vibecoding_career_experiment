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
      <h1>Find the work you&apos;ve already tried.</h1>
      <p className="lead compact">Upload your CV and we&apos;ll suggest past experiences and activities. You&apos;ll check everything before it becomes part of your evidence map.</p>
      <p className="purpose-note"><strong>Why we&apos;re asking</strong><span>Your CV is a shortcut for finding activities you have done. It is not used to judge employability or calculate career fit.</span></p>

      <div
        className={isDragging ? "upload-zone dragging" : "upload-zone"}
        aria-busy={isReading}
        onDragEnter={(event) => { event.preventDefault(); setIsDragging(true); }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => { event.preventDefault(); setIsDragging(false); }}
        onDrop={(event) => { event.preventDefault(); setIsDragging(false); void readFile(event.dataTransfer.files[0]); }}
      >
        <div className="upload-icon" aria-hidden="true">CV</div>
        <h2>{filename || "Drop your CV here"}</h2>
        <p aria-live="polite">{filename ? "Your CV is ready. It remains in this browser session." : "PDF or Word (.docx). Your file stays in this browser session and is not stored permanently."}</p>
        <input ref={inputRef} className="visually-hidden" type="file" accept="application/pdf,.pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document,.docx" onChange={(event) => void readFile(event.target.files?.[0])} />
        <button className="button secondary" type="button" disabled={isReading} onClick={() => inputRef.current?.click()}>{isReading ? "Reading CV…" : filename ? "Choose a different CV" : "Choose a CV"}</button>
      </div>

      {error && <div className="upload-error" role="alert"><strong>That file did not work.</strong><span>{error}</span></div>}
      <button className="sample-button" type="button" onClick={onUseSample}><span aria-hidden="true">*</span><span><strong>Use sample CV data</strong><small>Try the full flow without uploading a file</small></span></button>
      <div className="actions"><button className="button ghost" type="button" onClick={onBack}>Back</button><button className="button primary" type="button" disabled={!filename || isReading} onClick={onContinue}>Find activities in my CV <span aria-hidden="true">→</span></button></div>
    </section>
  );
}
