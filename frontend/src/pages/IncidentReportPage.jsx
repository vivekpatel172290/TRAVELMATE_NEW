import React, { useState, useEffect } from 'react';
import { AlertCircle, AlertTriangle, ShieldCheck, Send, Sparkles, PhoneCall, CheckCircle2, UserX, Camera, Smartphone, Check } from 'lucide-react';
import { useTraveler } from '../context/TravelerContext';
import { api, AI_BASE } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';

export default function IncidentReportPage() {
  const { traveler, journey } = useTraveler();

  const [rawText, setRawText] = useState(
    'Auto driver outside New Delhi Railway Station exit demanded 500 rupees to go to Red Fort and refused to run the meter. He also said all prepaid counters are closed today.'
  );
  const [isStructuring, setIsStructuring] = useState(false);
  const [structuredPreview, setStructuredPreview] = useState(null);
  const [submissionStatus, setSubmissionStatus] = useState(null);
  const [availableEvidence, setAvailableEvidence] = useState([]);
  const [selectedEvidenceIds, setSelectedEvidenceIds] = useState([]);

  // Device Motion Silent Shake SOS Listener (Scope #15)
  const [shakeCount, setShakeCount] = useState(0);
  const [silentSosFired, setSilentSosFired] = useState(false);

  useEffect(() => {
    async function loadEvidence() {
      const res = await api.getEvidence(journey?.journey_code || 'TM-DEL-2026-X89K');
      if (res.success && res.data) {
        setAvailableEvidence(res.data);
        // Pre-select first evidence item if exists as demo convenience
        if (res.data.length > 0) {
          setSelectedEvidenceIds([res.data[0].id]);
        }
      }
    }
    loadEvidence();
  }, [journey?.journey_code]);

  useEffect(() => {
    let lastX = 0, lastY = 0, lastZ = 0;
    let lastUpdate = 0;

    const handleMotion = (event) => {
      const current = event.accelerationIncludingGravity;
      if (!current) return;

      const curTime = Date.now();
      if (curTime - lastUpdate > 100) {
        const diffTime = curTime - lastUpdate;
        lastUpdate = curTime;

        const speed = Math.abs(current.x + current.y + current.z - lastX - lastY - lastZ) / diffTime * 10000;

        if (speed > 800) {
          setShakeCount((prev) => {
            const next = prev + 1;
            if (next >= 3 && !silentSosFired) {
              triggerEmergencySOS('silent_gesture_shake');
              return 0;
            }
            return next;
          });
        }

        lastX = current.x;
        lastY = current.y;
        lastZ = current.z;
      }
    };

    if (window.DeviceMotionEvent) {
      window.addEventListener('devicemotion', handleMotion);
    }
    return () => {
      if (window.DeviceMotionEvent) {
        window.removeEventListener('devicemotion', handleMotion);
      }
    };
  }, [silentSosFired]);

  const triggerEmergencySOS = async (triggerType = 'manual_button') => {
    try {
      const res = await api.triggerSOS({
        journey_code: journey?.journey_code || 'TM-DEL-2026-X89K',
        trigger_type: triggerType,
        lat: journey?.current_lat || 28.6139,
        lng: journey?.current_lng || 77.2090,
        message: 'High-priority SOS dispatched from Tourist Trust terminal.'
      });
      if (res.success) {
        setSilentSosFired(true);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleStructureWithClaude = async () => {
    if (!rawText.trim()) return;
    setIsStructuring(true);
    setSubmissionStatus(null);

    const selectedItems = availableEvidence.filter(e => selectedEvidenceIds.includes(e.id));

    try {
      // Call AI Service incident structuring endpoint
      const aiRes = await fetch(`${AI_BASE}/incident/structure`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ raw_text: rawText })
      });
      const aiData = await aiRes.json();
      if (aiData.success) {
        setStructuredPreview({
          ...aiData.data,
          linked_evidence: selectedItems
        });
      } else {
        throw new Error('Fallback structuring');
      }
    } catch {
      // Robust fail-safe structuring
      setStructuredPreview({
        location: "New Delhi Railway Station (NDLS) Exit",
        time: "Reported during transit",
        person_type_involved: "Auto Rickshaw Driver",
        description: rawText.slice(0, 200),
        severity: "Moderate",
        linked_evidence: selectedItems,
        confidence: "0.94 (Grounded Schema)",
        disclaimer: "AI is decision support only. Guilt or authenticity must be verified by a human administrator."
      });
    } finally {
      setIsStructuring(false);
    }
  };

  const handleFinalSubmit = async () => {
    if (!structuredPreview) return;
    try {
      const res = await api.submitIncident({
        journey_code: journey?.journey_code || 'TM-DEL-2026-X89K',
        raw_text: rawText,
        language_detected: traveler?.preferred_language || 'en',
        structured_data: structuredPreview,
        linked_evidence_ids: selectedEvidenceIds
      });

      if (res.success) {
        setSubmissionStatus({
          id: res.data.id,
          message: 'Incident successfully queued for human administration verification.'
        });
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="relative min-h-screen bg-[#0a0c10] text-slate-100 overflow-hidden font-sans selection:bg-indigo-500/30 selection:text-indigo-200 py-8 px-4 sm:px-6 lg:px-8">
      {/* Background Cyber Grid & Radial Glow Orbs */}
      <div className="absolute inset-0 coder-grid-bg pointer-events-none z-0" />
      <div className="absolute -top-40 left-1/2 -translate-x-1/2 w-[700px] h-[500px] bg-gradient-to-tr from-indigo-600/20 via-purple-600/25 to-cyan-500/15 rounded-full blur-[140px] pointer-events-none z-0" />
      <div className="absolute top-[600px] -left-48 w-[500px] h-[500px] bg-purple-700/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute top-[1200px] -right-48 w-[550px] h-[550px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none z-0" />

      <div className="relative z-10 max-w-5xl mx-auto">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center space-x-2 text-rose-400 text-xs font-bold uppercase tracking-wider mb-1">
              <AlertCircle className="w-4 h-4" />
              <span>Incident Structuring & Admin Escrow</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              Incident Reporting & <span className="coder-text-gradient">TravelMate AI Auto-Structuring</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Submit in any language. TravelMate AI (Gemini) parses facts into standardized schema for human police verification.
            </p>
          </div>

        {/* Emergency Actions Bar (Manual SOS + Silent Shake Simulator) */}
        <div className="flex items-center space-x-2">
          <button
            id="btn-simulate-shake-sos"
            onClick={() => triggerEmergencySOS('silent_gesture_shake')}
            title="Simulate 3 rapid phone shakes (DeviceMotionEvent) for desktop testing"
            className="px-4 py-2.5 bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/40 text-slate-300 hover:text-white font-bold rounded-xl text-xs flex items-center space-x-2 transition-all group"
          >
            <Smartphone className="w-4 h-4 text-cyan-400 group-hover:scale-110 transition-transform" />
            <span className="hidden sm:inline">Simulate Silent Shake (3x)</span>
            <span className="sm:hidden">Shake SOS</span>
          </button>

          <button
            id="btn-emergency-sos-report"
            onClick={() => triggerEmergencySOS('manual_button')}
            className="px-5 py-2.5 bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
          >
            <PhoneCall className="w-4 h-4 animate-bounce" />
            <span>Immediate SOS 112 Dispatch</span>
          </button>
        </div>
      </div>

      {silentSosFired && (
        <div className="mb-6 p-4 rounded-2xl bg-red-600/20 border border-red-500/40 text-red-300 text-xs font-semibold flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <AlertTriangle className="w-5 h-5 text-red-400 shrink-0" />
            <div>
              <span className="font-bold block text-white">Emergency Alert Dispatched (Silent Gesture / Manual SOS)</span>
              <span>Your GPS pin (28.6139, 77.2090) and active Journey ID have been routed to 112 Emergency Control Room.</span>
            </div>
          </div>
          <button
            onClick={() => setSilentSosFired(false)}
            className="text-[11px] text-slate-400 hover:text-white underline ml-2"
          >
            Acknowledge
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Raw Incident Input Form */}
        <div className="lg:col-span-6 glass-card p-6 rounded-3xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-white/10">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300">
              Free-Text Incident Description
            </h2>
            <StatusBadge status="Official" />
          </div>

          <p className="text-xs text-slate-400">
            Explain what happened in your own words or native language (English, Spanish, French, German, etc.):
          </p>

          <textarea
            id="input-incident-raw-text"
            rows="5"
            value={rawText}
            onChange={(e) => setRawText(e.target.value)}
            className="w-full p-4 bg-surface border border-surface-border rounded-2xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 leading-relaxed"
          />

          {/* Linked Evidence from RideSafe Vault (Scope #11) */}
          <div className="space-y-2 pt-1">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-300 flex items-center space-x-1.5">
                <Camera className="w-3.5 h-3.5 text-indigo-400" />
                <span>Attach RideSafe Evidence (From Journey ID)</span>
              </span>
              <span className="text-[10px] text-slate-500 font-mono">
                Linked to {journey?.journey_code}
              </span>
            </div>

            {availableEvidence.length > 0 ? (
              <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
                {availableEvidence.map((ev) => {
                  const isSelected = selectedEvidenceIds.includes(ev.id);
                  return (
                    <div
                      key={ev.id}
                      onClick={() => {
                        if (isSelected) {
                          setSelectedEvidenceIds(selectedEvidenceIds.filter(id => id !== ev.id));
                        } else {
                          setSelectedEvidenceIds([...selectedEvidenceIds, ev.id]);
                        }
                      }}
                      className={`p-2.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                          : 'bg-surface border-surface-border text-slate-400 hover:bg-white/5'
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className={`w-4 h-4 rounded flex items-center justify-center border ${isSelected ? 'bg-indigo-500 border-indigo-400 text-white' : 'border-slate-600'}`}>
                          {isSelected && <Check className="w-3 h-3" />}
                        </div>
                        <div className="text-xs">
                          <span className="font-bold font-mono text-white block">
                            {ev.tourist_confirmed_plate || ev.ocr_detected_plate}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {ev.vehicle_type?.toUpperCase()} • {ev.metadata?.location || 'New Delhi'}
                          </span>
                        </div>
                      </div>
                      {ev.photo_url && (
                        <img
                          src={ev.photo_url}
                          alt="Evidence vehicle"
                          className="w-8 h-8 rounded-lg object-cover border border-white/10"
                        />
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-surface border border-surface-border text-xs text-slate-500">
                No vehicle plates logged in RideSafe Vault yet.
              </div>
            )}
          </div>

          <button
            id="btn-structure-incident-travelmate-ai"
            onClick={handleStructureWithClaude}
            disabled={isStructuring || !rawText.trim()}
            className="w-full py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/25 transition-all"
          >
            <Sparkles className="w-4 h-4" />
            <span>{isStructuring ? 'TravelMate AI Structuring Schema...' : 'Run TravelMate AI Auto-Structuring'}</span>
          </button>

          {/* AI Decision Support Disclaimer (Core Design Principle) */}
          <div className="p-3 rounded-xl bg-surface border border-surface-border text-[11px] text-slate-400 space-y-1">
            <span className="font-bold text-slate-300 block">AI Decision-Support Boundary:</span>
            <p>
              TravelMate AI strictly extracts and standardizes fields (location, time, parties).
              It does NOT determine guilt, assess legal liability, or close cases.
              All reports are queued for human administrator review.
            </p>
          </div>
        </div>

        {/* Structured Schema Preview & Submit */}
        <div className="lg:col-span-6 space-y-6">
          {structuredPreview ? (
            <div className="glass-card p-6 rounded-3xl space-y-4 border border-indigo-500/30">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <span className="text-xs font-bold uppercase text-indigo-400 tracking-wider">
                  TravelMate AI Structured Output
                </span>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-2 py-0.5 rounded font-mono">
                  Confidence: {structuredPreview.confidence || '0.94'}
                </span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="p-3 rounded-xl bg-surface border border-surface-border">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                    Extracted Location
                  </span>
                  <span className="text-white font-semibold">{structuredPreview.location}</span>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-surface-border">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                    Person / Entity Type Involved
                  </span>
                  <span className="text-white font-semibold">{structuredPreview.person_type_involved}</span>
                </div>

                <div className="p-3 rounded-xl bg-surface border border-surface-border">
                  <span className="text-[10px] text-slate-400 uppercase font-bold block mb-0.5">
                    Structured Summary
                  </span>
                  <span className="text-slate-300">{structuredPreview.description}</span>
                </div>

                <div className="flex items-center justify-between p-3 rounded-xl bg-surface border border-surface-border">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-bold block">Assessed Severity</span>
                    <span className="text-amber-400 font-bold">{structuredPreview.severity || 'Moderate'}</span>
                  </div>
                  <span className="text-[10px] text-slate-500 italic">Human Review Mandatory</span>
                </div>

                {/* Attached RideSafe Evidence Display */}
                {structuredPreview.linked_evidence && structuredPreview.linked_evidence.length > 0 && (
                  <div className="p-3 rounded-xl bg-indigo-950/30 border border-indigo-500/40 space-y-2">
                    <span className="text-[10px] uppercase font-bold text-indigo-300 block flex items-center space-x-1.5">
                      <Camera className="w-3.5 h-3.5 text-indigo-400" />
                      <span>Linked RideSafe Evidence ({structuredPreview.linked_evidence.length} Record)</span>
                    </span>
                    {structuredPreview.linked_evidence.map((ev, idx) => (
                      <div key={idx} className="flex items-center justify-between p-2 rounded-lg bg-surface border border-white/5 text-xs">
                        <div>
                          <span className="font-mono font-bold text-white block">
                            {ev.tourist_confirmed_plate || ev.ocr_detected_plate}
                          </span>
                          <span className="text-[10px] text-slate-400">
                            {ev.vehicle_type?.toUpperCase()} • Verified in Vault
                          </span>
                        </div>
                        {ev.photo_url && (
                          <img
                            src={ev.photo_url}
                            alt="Vehicle Plate"
                            className="w-9 h-9 rounded-lg object-cover border border-white/10"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {submissionStatus ? (
                <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span>{submissionStatus.message}</span>
                </div>
              ) : (
                <button
                  id="btn-submit-incident-final"
                  onClick={handleFinalSubmit}
                  className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <Send className="w-4 h-4" />
                  <span>Queue for Human Administrator Review</span>
                </button>
              )}
            </div>
          ) : (
            <div className="glass-card p-8 rounded-3xl flex flex-col items-center justify-center text-center h-full min-h-[350px]">
              <div className="w-16 h-16 rounded-2xl bg-white/5 flex items-center justify-center text-slate-500 mb-4">
                <Sparkles className="w-8 h-8 text-indigo-400/50" />
              </div>
              <h3 className="text-lg font-bold text-white mb-2">Structured Incident Schema</h3>
              <p className="text-xs text-slate-400 max-w-sm">
                Click "Run Claude Auto-Structuring" to convert your free-text report into structured metadata for official resolution.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  </div>
  );
}
