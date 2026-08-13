"use client";

import { useRef, useState } from "react";
import { extractPdfText } from "@/lib/pdf/extractPdfText";

type Props = {
  filename: string;
  onPdfReady: (filename: string, text: string) => void;
  onUseSample: () => void;
  onContinue: () => void;
  onBack: () => void;
};

export function CvUploadScreen({ filename, onPdfReady, onUseSample, onContinue, onBack }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isReading, setIsReading] = useState(false);
  const [error, setError] = useState("");

  const readFile = async (file?: File) => {
    if (!file) return;
    setError("");
    setIsReading(true);
    try {
      const text = await extractPdfText(file);
      onPdfReady(file.name, text);
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : "We could not read this PDF. Please try another file.");
    } finally {
      setIsReading(false);
    }
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
        <div className="upload-icon" aria-hidden="true">PDF</div>
        <h2>{filename || "Drop your CV here"}</h2>
        <p>{filename ? "Your CV is ready to review." : "PDF only. Your file stays in this browser session."}</p>
        <input ref={inputRef} className="visually-hidden" type="file" accept="application/pdf,.pdf" onChange={(event) => void readFile(event.target.files?.[0])} />
        <button className="button secondary" type="button" disabled={isReading} onClick={() => inputRef.current?.click()}>{isReading ? "Reading PDF..." : filename ? "Choose a different PDF" : "Choose PDF"}</button>
      </div>

      {error && <div className="upload-error" role="alert"><strong>That file did not work.</strong><span>{error}</span></div>}
      <button className="sample-button" type="button" onClick={onUseSample}><span aria-hidden="true">*</span><span><strong>Use sample CV data</strong><small>Try the full flow without uploading a file</small></span></button>
      <div className="actions"><button className="button ghost" type="button" onClick={onBack}>Back</button><button className="button primary" type="button" disabled={!filename || isReading} onClick={onContinue}>Review detected work <span aria-hidden="true">→</span></button></div>
    </section>
  );
}
