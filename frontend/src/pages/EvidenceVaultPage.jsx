import React, { useState, useEffect } from 'react';
import { Camera, ShieldCheck, CheckCircle2, AlertTriangle, Lock, Eye, Trash2, Car, Upload } from 'lucide-react';
import { useTraveler } from '../context/TravelerContext';
import { useJourney } from '../context/JourneyContext';
import { api } from '../services/api';
import StatusBadge from '../components/common/StatusBadge';

export default function EvidenceVaultPage() {
  const { journey } = useTraveler();
  const { addEvidence } = useJourney();

  const [evidenceList, setEvidenceList] = useState([]);
  const [vehicleType, setVehicleType] = useState('auto');
  const [isProcessingOCR, setIsProcessingOCR] = useState(false);
  const [ocrCandidate, setOcrCandidate] = useState(null);
  const [confirmedPlateInput, setConfirmedPlateInput] = useState('');
  const [saveSuccessMsg, setSaveSuccessMsg] = useState('');

  useEffect(() => {
    async function loadVault() {
      const res = await api.getEvidence(journey?.journey_code || 'TM-DEL-2026-X89K');
      if (res.success && res.data) {
        setEvidenceList(res.data);
      }
    }
    loadVault();
  }, [journey?.journey_code]);

  // Sample plate for hero demonstration
  const simulateCapture = (plateString = 'DL 1R BA 4829') => {
    setIsProcessingOCR(true);
    setSaveSuccessMsg('');
    setTimeout(() => {
      setOcrCandidate({
        plate: plateString,
        confidence: 0.94,
        timestamp: new Date().toLocaleTimeString(),
        preview_url: "https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?w=500&auto=format&fit=crop&q=60"
      });
      setConfirmedPlateInput(plateString);
      setIsProcessingOCR(false);
    }, 900);
  };

  const handleConfirmAndSave = async () => {
    if (!confirmedPlateInput.trim()) return;

    try {
      const res = await api.saveEvidence({
        journey_code: journey?.journey_code || 'TM-DEL-2026-X89K',
        photo_url: ocrCandidate?.preview_url || 'sample-auto.jpg',
        vehicle_type: vehicleType,
        ocr_detected_plate: ocrCandidate?.plate,
        tourist_confirmed_plate: confirmedPlateInput.trim(),
        is_confirmed_by_tourist: true, // Strict requirement!
        location: 'New Delhi Railway Station Exit'
      });

      if (res.success) {
        setEvidenceList([res.data, ...evidenceList]);
        if (addEvidence) {
          addEvidence({
            plateNumber: confirmedPlateInput.trim(),
            vehicleType: vehicleType === 'taxi' ? 'Delhi Cab (Taxi)' : 'Auto-Rickshaw',
            location: 'New Delhi Railway Station Exit'
          });
        }
        setOcrCandidate(null);
        setSaveSuccessMsg(`Vehicle ${confirmedPlateInput} confirmed & securely saved in RideSafe Vault.`);
        setTimeout(() => setSaveSuccessMsg(''), 4000);
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
            <div className="inline-flex items-center space-x-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <Lock className="w-4 h-4" />
              <span>Private Pre-Transit Verification Layer</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-white">
              RideSafe Evidence Vault & <span className="coder-text-gradient">Plate OCR</span>
            </h1>
            <p className="text-xs sm:text-sm text-slate-400 mt-1">
              Log your auto or taxi before boarding. Stored privately with mandatory human confirmation.
            </p>
          </div>

        <div className="flex items-center space-x-2">
          <StatusBadge status="Official" />
          <span className="text-xs text-slate-400 font-mono">
            Linked to: {journey?.journey_code}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Capture / Upload Panel */}
        <div className="relative group lg:col-span-6">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-all duration-700 pointer-events-none" />
          <div className="relative rounded-3xl border-2 border-[#2f323e]/70 bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] p-6 sm:p-7 shadow-2xl backdrop-blur-xl">
            <h2 className="text-lg font-bold font-display text-white mb-3 flex items-center">
              <Camera className="w-5 h-5 mr-2 text-cyan-400" />
              <span>Capture Vehicle Plate</span>
            </h2>
            <p className="text-xs text-slate-400 mb-4">
              Take a quick photo of the vehicle number plate before stepping inside.
            </p>

            {/* Vehicle Type Picker */}
            <div className="mb-4">
              <label className="block text-xs font-semibold text-slate-400 mb-1.5">Vehicle Type</label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: 'auto', label: 'Auto-Rickshaw' },
                  { id: 'taxi', label: 'Cab / Taxi' },
                  { id: 'bus', label: 'Bus / Other' }
                ].map((v) => (
                  <button
                    key={v.id}
                    id={`btn-vault-vtype-${v.id}`}
                    onClick={() => setVehicleType(v.id)}
                    className={`py-2 px-3 rounded-xl border text-xs font-bold transition-all ${
                      vehicleType === v.id
                        ? 'bg-gradient-to-r from-cyan-500/20 to-indigo-500/20 border-cyan-400 text-cyan-300 shadow-[0_0_12px_rgba(34,211,238,0.2)]'
                        : 'bg-black/30 border-white/10 text-slate-400 hover:text-white'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Capture Trigger Buttons */}
            <div className="p-6 rounded-2xl bg-black/40 border border-dashed border-white/20 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 flex items-center justify-center mx-auto">
                <Camera className="w-6 h-6" />
              </div>
              <div>
                <p className="text-xs font-semibold text-white">Click to Capture or Scan</p>
                <p className="text-[11px] text-slate-500">Camera permission active on mobile PWA</p>
              </div>
              <div className="pt-2 flex items-center justify-center gap-2">
                <button
                  id="btn-trigger-ocr-scan"
                  onClick={() => simulateCapture('DL 1R BA 4829')}
                  disabled={isProcessingOCR}
                  className="coder-btn-primary py-2.5 px-6 text-white font-bold rounded-xl text-xs flex items-center space-x-2 shadow-lg shadow-indigo-600/25 transition-all"
                >
                  <Camera className="w-4 h-4" />
                  <span>{isProcessingOCR ? 'Reading Plate...' : 'Scan Vehicle Plate'}</span>
                </button>
              </div>
            </div>

            {/* Mandatory Confirmation Step Notice */}
            <div className="mt-4 p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-[11px] text-amber-300 flex items-start space-x-2">
              <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
              <p>
                <strong>Security Protocol:</strong> To prevent false accusations or OCR distortion,
                the tourist must inspect and confirm the plate characters before it is written to the vault.
              </p>
            </div>
          </div>
        </div>

        {/* OCR Confirmation Card / Vault List */}
        <div className="lg:col-span-6 space-y-6">
          {/* Mandatory Tourist Confirmation Modal/Card */}
          {ocrCandidate && (
            <div className="relative group">
              <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 rounded-3xl opacity-25 blur-xl pointer-events-none" />
              <div className="relative rounded-3xl border-2 border-indigo-500/70 bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] p-6 shadow-2xl space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-white/10">
                  <span className="text-xs font-bold uppercase text-indigo-400 tracking-wider">
                    Step 2: Confirm Plate Characters
                  </span>
                  <span className="text-[10px] bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 px-2.5 py-0.5 rounded-full font-mono font-bold">
                    OCR Confidence: {Math.round(ocrCandidate.confidence * 100)}%
                  </span>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 mb-1">
                    Inspect & Edit if required:
                  </label>
                  <input
                    type="text"
                    id="input-confirm-plate"
                    value={confirmedPlateInput}
                    onChange={(e) => setConfirmedPlateInput(e.target.value.toUpperCase())}
                    className="w-full text-center py-3 bg-black/40 border-2 border-indigo-500/50 rounded-xl font-mono text-xl font-extrabold text-white tracking-widest focus:outline-none focus:border-cyan-400 transition-all"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <button
                    id="btn-cancel-ocr"
                    onClick={() => setOcrCandidate(null)}
                    className="flex-1 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 rounded-xl text-xs font-bold transition-all border border-white/10"
                  >
                    Discard
                  </button>
                  <button
                    id="btn-confirm-plate-save"
                    onClick={handleConfirmAndSave}
                    className="flex-2 py-2.5 px-6 coder-btn-primary text-white rounded-xl text-xs font-bold flex items-center justify-center space-x-2 shadow-lg shadow-indigo-600/30 transition-all"
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Confirm & Save to Vault</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {saveSuccessMsg && (
            <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center space-x-2 animate-in fade-in duration-200">
              <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
              <span>{saveSuccessMsg}</span>
            </div>
          )}

          {/* Archived Evidence Records */}
          <div className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 rounded-3xl opacity-20 blur-xl group-hover:opacity-30 transition-all duration-700 pointer-events-none" />
            <div className="relative rounded-3xl border-2 border-[#2f323e]/70 bg-gradient-to-br from-[#1c1d24] via-[#14161c] to-[#0c0e12] p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between pb-3 border-b border-white/10">
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300">
                  Your Vault Records ({evidenceList.length})
                </h3>
                <StatusBadge status="Official" />
              </div>

              {evidenceList.length > 0 ? (
                <div className="space-y-3">
                  {evidenceList.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 rounded-2xl bg-black/40 border border-white/10 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-300">
                          <Car className="w-5 h-5" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-mono font-bold text-sm text-white">
                              {item.tourist_confirmed_plate}
                            </span>
                            <span className="text-[10px] text-cyan-400 font-bold bg-cyan-500/10 border border-cyan-500/20 px-1.5 py-0.5 rounded">
                              Confirmed
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-400">
                            Logged at {new Date(item.created_at).toLocaleTimeString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-8 text-center text-slate-500 text-xs">
                  No vehicles logged yet. Tap "Scan Vehicle Plate" to record your first transit.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
