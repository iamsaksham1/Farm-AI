import React from 'react';
import { Volume2, RotateCcw, Activity, ShieldCheck } from 'lucide-react';
import ConfidenceGauge from './ConfidenceGauge';
import TreatmentTabs from './TreatmentTabs';
import GradCAMViewer from './GradCAMViewer';
import AlternativePredictions from './AlternativePredictions';
import LowConfidenceWarning from './LowConfidenceWarning';
import AgriBotChat from './AgriBotChat';
import { speechService } from '../services/speech';

export default function ResultCard({ result, originalImageUrl, onReset, lang, t }) {
  if (!result) return null;

  const isHindi = lang === 'hi';
  const crop = isHindi ? result.crop_hi || result.crop : result.crop;
  const disease = isHindi ? result.disease_name_hi || result.disease_name : result.disease_name;
  const severity = isHindi ? result.severity_hi || result.severity : result.severity;
  const symptoms = isHindi ? result.advisory.symptoms_hi || result.advisory.symptoms : result.advisory.symptoms;
  const cause = isHindi ? result.advisory.cause_hi || result.advisory.cause : result.advisory.cause;

  const [isPlayingAudio, setIsPlayingAudio] = React.useState(false);

  const speechNarrationText = isHindi
    ? `फसल: ${crop}। रोग: ${disease}। गंभीरता: ${severity}। लक्षण: ${symptoms}। मुख्य जैविक उपाय: ${result.advisory.organic_treatment_hi || result.advisory.organic_treatment}। जेनेरिक दवा: ${result.advisory.chemical_treatment_hi || result.advisory.chemical_treatment}। अनुमानित लागत: ${result.advisory.cost_estimate_inr_hi || result.advisory.cost_estimate_inr}।`
    : `Crop: ${crop}. Diagnosis: ${disease}. Severity: ${severity}. Observed symptoms: ${symptoms}. Organic remedy: ${result.advisory.organic_treatment}. Chemical formulation: ${result.advisory.chemical_treatment}. Estimated cost: ${result.advisory.cost_estimate_inr}.`;

  const handleAudio = () => {
    if (isPlayingAudio) {
      speechService.stop();
      setIsPlayingAudio(false);
    } else {
      speechService.speak(
        speechNarrationText,
        lang,
        () => setIsPlayingAudio(true),
        () => setIsPlayingAudio(false),
        () => setIsPlayingAudio(false)
      );
    }
  };

  // Severity color indicator dot
  const getSeverityDot = () => {
    if (result.is_healthy) return 'bg-emerald-600';
    const s = (result.severity || '').toLowerCase();
    if (s === 'critical') return 'bg-rose-600';
    if (s === 'high') return 'bg-orange-600';
    return 'bg-amber-600';
  };

  return (
    <div className="w-full max-w-4xl mx-auto">
      {result.is_low_confidence && (
        <LowConfidenceWarning t={t} onRetake={onReset} />
      )}

      {/* Main Specimen Card (Atmos Editorial Layout) */}
      <div className="specimen-card rounded-2xl p-6 sm:p-8">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          {/* Left Column: Specimen Image Plate & Match Gauge */}
          <div className="md:col-span-5 space-y-4">
            <div className="aspect-square w-full rounded-xl overflow-hidden border border-black/[0.08] dark:border-white/[0.08] bg-neutral-100 dark:bg-neutral-900 flex items-center justify-center relative">
              <img
                src={originalImageUrl}
                alt="Analyzed specimen"
                className="w-full h-full object-cover"
              />
            </div>

            {/* Specimen Metadata Box */}
            <div className="p-3.5 rounded-xl border border-black/[0.06] dark:border-white/[0.06] bg-black/[0.02] dark:bg-white/[0.02] flex items-center justify-between">
              <div className="space-y-0.5">
                <span className="label-meta block">Specimen Match</span>
                <span className="font-mono text-sm font-semibold text-neutral-900 dark:text-neutral-100">
                  {result.confidence}% Confidence
                </span>
                <span className="font-mono text-[10px] text-neutral-400 block">
                  Latency: {result.inference_time_ms}ms
                </span>
              </div>
              <ConfidenceGauge
                confidence={result.confidence}
                isHealthy={result.is_healthy}
                size={72}
              />
            </div>

            {/* Listen Audio Button */}
            <button
              onClick={handleAudio}
              className={`w-full py-2.5 px-4 rounded-lg text-xs font-medium border transition-all flex items-center justify-center gap-2 ${
                isPlayingAudio
                  ? 'border-neutral-900 bg-neutral-900 text-white dark:border-neutral-100 dark:bg-neutral-100 dark:text-neutral-900'
                  : 'border-black/[0.1] dark:border-white/[0.1] hover:border-black/[0.2] dark:hover:border-white/[0.2] text-neutral-700 dark:text-neutral-300'
              }`}
            >
              <Volume2 className="w-4 h-4 stroke-[1.5]" />
              <span>{isPlayingAudio ? t.stopAudioButton : t.listenButton}</span>
            </button>
          </div>

          {/* Right Column: Diagnosis, Severity, Symptoms, Treatment */}
          <div className="md:col-span-7 flex flex-col justify-between">
            <div>
              {/* Header metadata */}
              <div className="flex items-center justify-between gap-3 mb-2">
                <span className="label-meta">{crop}</span>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 text-xs font-medium text-neutral-700 dark:text-neutral-300">
                    <span className={`w-2 h-2 rounded-full ${getSeverityDot()}`} />
                    <span>{severity}</span>
                  </span>
                </div>
              </div>

              {/* Disease Title */}
              <h2 className="text-2xl sm:text-3xl font-medium tracking-tight text-neutral-900 dark:text-neutral-100 mb-6">
                {disease}
              </h2>

              {/* Symptoms & Cause */}
              <div className="space-y-4 text-xs sm:text-sm">
                <div>
                  <span className="label-meta block mb-1">{t.symptomsTitle}</span>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {symptoms}
                  </p>
                </div>

                <div>
                  <span className="label-meta block mb-1">{t.causeTitle}</span>
                  <p className="text-neutral-600 dark:text-neutral-400 leading-relaxed">
                    {cause}
                  </p>
                </div>
              </div>

              {/* Treatment Tabs */}
              <TreatmentTabs
                advisory={result.advisory}
                lang={lang}
                t={t}
              />

              {/* Alternative Top-3 Candidates */}
              <AlternativePredictions
                top3={result.top_3}
                lang={lang}
                t={t}
              />
            </div>

            {/* Scan Another Reset */}
            <div className="mt-8 pt-4 border-t border-black/[0.06] dark:border-white/[0.06] flex justify-end">
              <button
                onClick={onReset}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-xs font-medium text-neutral-600 dark:text-neutral-400 hover:text-neutral-900 dark:hover:text-neutral-100 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>{t.scanAnotherButton}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Grad-CAM Viewer */}
        <GradCAMViewer
          originalImage={originalImageUrl}
          gradcamImage={result.gradcam_image}
          t={t}
        />

        {/* Ask AgriBot Panel */}
        <AgriBotChat
          diagnosticResult={result}
          lang={lang}
          t={t}
        />
      </div>
    </div>
  );
}
