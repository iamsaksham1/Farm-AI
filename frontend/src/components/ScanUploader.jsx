import React, { useState, useRef } from 'react';
import { Camera, Image as ImageIcon, X, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import SampleLeafPicker from './SampleLeafPicker';
import MagneticButton from './MagneticButton';

export default function ScanUploader({ onScan, samples, onSampleSelect, isAnalyzing, lang, t }) {
  const [dragActive, setDragActive] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [errorMessage, setErrorMessage] = useState(null);

  const [cameraOpen, setCameraOpen] = useState(false);
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const fileInputRef = useRef(null);

  const handleFile = (file) => {
    setErrorMessage(null);
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setErrorMessage(lang === 'hi' ? 'केवल फोटो (JPEG, PNG, WEBP) समर्थित है।' : 'Please upload an image file (JPEG, PNG, WEBP).');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setErrorMessage(lang === 'hi' ? 'फाइल 5MB से कम होनी चाहिए।' : 'File size exceeds 5MB limit.');
      return;
    }

    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    onScan(file);
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  // Camera
  const openCamera = async () => {
    setErrorMessage(null);
    try {
      setCameraOpen(true);
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
    } catch (err) {
      console.error("Camera error:", err);
      setCameraOpen(false);
      setErrorMessage(lang === 'hi' ? 'कैमरा शुरू नहीं हो सका।' : 'Could not access device camera.');
    }
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    canvas.toBlob((blob) => {
      if (blob) {
        const file = new File([blob], 'camera_leaf_specimen.jpg', { type: 'image/jpeg' });
        closeCamera();
        handleFile(file);
      }
    }, 'image/jpeg', 0.95);
  };

  const closeCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setCameraOpen(false);
  };

  const customEase = [0.22, 1, 0.36, 1];

  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Calm Specimen Dropzone Card */}
      <motion.div
        layout
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`relative rounded-2xl bg-white dark:bg-[#1c1b1a] p-6 sm:p-8 transition-all border ${
          dragActive
            ? 'border-neutral-900 dark:border-neutral-100 ring-2 ring-neutral-900/10 dark:ring-neutral-100/10'
            : 'border-black/[0.08] dark:border-white/[0.08]'
        } shadow-specimen`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/jpeg,image/png,image/webp"
          className="hidden"
          onChange={(e) => {
            if (e.target.files && e.target.files[0]) {
              handleFile(e.target.files[0]);
            }
          }}
        />

        {errorMessage && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-xs text-red-600 dark:text-red-400 flex items-center gap-2"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{errorMessage}</span>
          </motion.div>
        )}

        {isAnalyzing ? (
          /* Scanning state: Soft light sweep + tightening focus frame */
          <div className="flex flex-col items-center justify-center py-12">
            <div className="relative w-48 h-48 sm:w-56 sm:h-56 rounded-xl overflow-hidden border border-black/[0.1] dark:border-white/[0.1] bg-neutral-100 dark:bg-neutral-900 shadow-sm flex items-center justify-center">
              {previewUrl && (
                <img
                  src={previewUrl}
                  alt="Analyzing specimen"
                  className="w-full h-full object-cover filter brightness-95"
                />
              )}
              {/* Tightening focus frame indicator */}
              <div className="absolute inset-4 border border-white/60 dark:border-white/30 rounded-lg pointer-events-none transition-all duration-700 animate-pulse-subtle" />
              {/* Soft light sweep */}
              <div className="absolute inset-0 scan-sweep animate-sweep pointer-events-none" />
            </div>

            <span className="font-mono text-xs uppercase tracking-widest text-neutral-600 dark:text-neutral-300 mt-6 block">
              {t.analyzingTitle}
            </span>
            <span className="text-xs text-neutral-400 dark:text-neutral-500 mt-1 block text-center">
              {t.analyzingSubtitle}
            </span>
          </div>
        ) : (
          /* Normal Idle Drop Area */
          <div>
            <div className="flex flex-col items-center justify-center text-center py-4 sm:py-6">
              <span className="label-meta mb-2">Specimen Plate</span>
              <h3 className="text-base sm:text-lg font-medium text-neutral-900 dark:text-neutral-100 mb-1">
                {t.dragDropText}
              </h3>
              <p className="text-xs text-neutral-500 dark:text-neutral-400 max-w-sm mb-7">
                {t.scannerSubtitle}
              </p>

              {/* Action Buttons with Magnetic hover */}
              <div className="flex items-center gap-3">
                <MagneticButton
                  onClick={() => fileInputRef.current?.click()}
                  className="px-5 py-2.5 rounded-lg bg-neutral-900 hover:bg-neutral-800 text-white dark:bg-neutral-100 dark:hover:bg-neutral-200 dark:text-neutral-900 text-xs font-medium tracking-tight shadow-sm"
                >
                  <span className="flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5" />
                    <span>{t.browseButton}</span>
                  </span>
                </MagneticButton>

                <MagneticButton
                  onClick={openCamera}
                  className="px-4 py-2.5 rounded-lg border border-black/[0.1] dark:border-white/[0.1] hover:border-black/[0.25] dark:hover:border-white/[0.25] text-neutral-700 dark:text-neutral-300 text-xs font-medium tracking-tight bg-transparent"
                >
                  <span className="flex items-center gap-1.5">
                    <Camera className="w-3.5 h-3.5" />
                    <span>{t.cameraButton}</span>
                  </span>
                </MagneticButton>
              </div>

              <span className="font-mono text-[10px] text-neutral-400 dark:text-neutral-500 mt-5 block">
                {t.fileLimitHint}
              </span>
            </div>

            {/* Field Reference Samples */}
            <SampleLeafPicker
              samples={samples}
              onSelectSample={onSampleSelect}
              lang={lang}
              t={t}
              isLoading={isAnalyzing}
            />
          </div>
        )}
      </motion.div>

      {/* Camera Viewfinder Modal */}
      <AnimatePresence>
        {cameraOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              transition={{ duration: 0.25, ease: customEase }}
              className="bg-white dark:bg-[#1c1b1a] border border-black/[0.1] dark:border-white/[0.1] rounded-2xl overflow-hidden max-w-md w-full p-5 shadow-2xl"
            >
              <div className="flex justify-between items-center mb-3">
                <span className="label-meta">{t.cameraModalTitle}</span>
                <button
                  onClick={closeCamera}
                  className="p-1 text-neutral-400 hover:text-neutral-700 dark:hover:text-neutral-200"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="relative aspect-video rounded-lg overflow-hidden bg-black flex items-center justify-center border border-black/[0.08] dark:border-white/[0.08]">
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-6 border border-dashed border-white/40 rounded pointer-events-none" />
              </div>

              <div className="mt-4 flex items-center justify-end gap-2">
                <button
                  onClick={closeCamera}
                  className="px-3.5 py-1.5 rounded-md text-xs font-medium text-neutral-600 dark:text-neutral-400"
                >
                  {t.closeCamera}
                </button>
                <button
                  onClick={capturePhoto}
                  className="px-4 py-1.5 rounded-md bg-neutral-900 text-white dark:bg-neutral-100 dark:text-neutral-900 text-xs font-medium"
                >
                  {t.captureSnap}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
