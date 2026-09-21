import React, { createContext, useContext, useState, useEffect } from 'react';
import { useTraveler } from './TravelerContext';

const JourneyContext = createContext(null);

export const initialTimeline = [
  {
    id: "evt-1",
    timestamp: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
    type: "created",
    stage: "PREPARE",
    module: "SafePass & Chain ID",
    title: "Smart Journey Chain Created",
    description: "Generated cryptographic Journey ID TM-DEL-2026-X89K linked to tourist profile with 7-day emergency pass.",
    actionPath: "/safe-pass",
    actionLabel: "View SafePass",
    status: "Verified",
    badgeColor: "emerald"
  },
  {
    id: "evt-2",
    timestamp: new Date(Date.now() - 30 * 60 * 60 * 1000).toISOString(),
    type: "destination",
    stage: "DISCOVER",
    module: "Discover Places",
    title: "Destinations Selected for Itinerary",
    description: "Added Red Fort (Lal Qila), Qutub Minar, and Humayun's Tomb to planned heritage route.",
    actionPath: "/home",
    actionLabel: "Explore Monuments",
    status: "Saved",
    badgeColor: "cyan"
  },
  {
    id: "evt-3",
    timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
    type: "planner",
    stage: "PREPARE",
    module: "Trip Planner",
    title: "Custom 1-Day Heritage Itinerary Synced",
    description: "Optimized metro route starting from New Delhi Railway Station (NDLS) to Chandni Chowk & Red Fort.",
    actionPath: "/planner",
    actionLabel: "Open Route Plan",
    status: "Optimized",
    badgeColor: "indigo"
  },
  {
    id: "evt-4",
    timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
    type: "fare",
    stage: "PREPARE",
    module: "Fair Fare Meter",
    title: "Auto-Rickshaw Fare Calculated",
    description: "Official tariff verified: ₹123.50 for 10 km journey (Base ₹30 for 1.5 km + ₹11/km) from Connaught Place to Red Fort.",
    actionPath: "/fare-meter",
    actionLabel: "Check Fare Meter",
    status: "Tariff Verified",
    badgeColor: "amber"
  },
  {
    id: "evt-5",
    timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString(),
    type: "evidence",
    stage: "TRAVEL",
    module: "RideSafe Vault",
    title: "Vehicle Plate Logged in RideSafe Vault",
    description: "Auto-rickshaw license plate DL 1R B 4429 recorded with GPS timestamp for transit accountability.",
    actionPath: "/vault",
    actionLabel: "View Evidence Record",
    status: "Secured on Device",
    badgeColor: "teal"
  },
  {
    id: "evt-6",
    timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
    type: "translate",
    stage: "TRAVEL",
    module: "Bhashini Translator",
    title: "Voice Translation Used with Driver",
    description: 'Translated "Please take me to Red Fort ASI ticket counter and run the meter" from English to Hindi.',
    actionPath: "/phrase-helper",
    actionLabel: "Open Translator",
    status: "Voice Played",
    badgeColor: "blue"
  },
  {
    id: "evt-7",
    timestamp: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
    type: "navigation",
    stage: "TRAVEL",
    module: "Safe Journey",
    title: "Safe Transit Tracking Active",
    description: "Real-time GPS route monitoring enabled. Vehicle on expected route along Netaji Subhash Marg.",
    actionPath: "/safe-journey",
    actionLabel: "Live Transit Monitor",
    status: "Live & On Route",
    badgeColor: "emerald"
  }
];

export const defaultJourneys = [
  {
    id: "TM-DEL-2026-X89K",
    title: "Delhi Heritage & Capital Discovery",
    destination: "Delhi, National Capital Region, India",
    origin: "New Delhi Railway Station (NDLS)",
    currentLocation: "Connaught Place & Old Delhi Corridor",
    startDate: "2026-09-18",
    endDate: "2026-09-25",
    status: "active",
    stage: "TRAVEL",
    safetyStatus: "Live Tracking Active • Route Verified",
    safetyScore: 98,
    timeline: initialTimeline,
    records: {
      fareChecks: [
        {
          id: "f-1",
          from: "Connaught Place",
          to: "Red Fort",
          distance: 10,
          fare: 123.5,
          mode: "Auto-Rickshaw",
          timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
        }
      ],
      evidenceList: [
        {
          id: "ev-1",
          plateNumber: "DL 1R B 4429",
          vehicleType: "Auto-Rickshaw",
          location: "Connaught Place Circle",
          timestamp: new Date(Date.now() - 90 * 60 * 1000).toISOString()
        }
      ],
      visitedPlaces: [
        {
          id: "vp-1",
          name: "India Gate",
          category: "Monument",
          visitedAt: "2026-09-18"
        },
        {
          id: "vp-2",
          name: "Red Fort (Lal Qila)",
          category: "UNESCO World Heritage Site",
          visitedAt: "2026-09-19"
        }
      ],
      translations: [
        {
          id: "tr-1",
          fromText: "Please turn on the meter",
          toText: "कृपया मीटर चालू करें",
          lang: "hi",
          timestamp: new Date(Date.now() - 45 * 60 * 1000).toISOString()
        }
      ],
      reports: []
    }
  },
  {
    id: "TM-AGR-2026-4N2P",
    title: "Agra Golden Triangle Extension",
    destination: "Agra, Uttar Pradesh, India",
    origin: "Delhi Hazrat Nizamuddin (NZM)",
    currentLocation: "Taj Mahal East Gate",
    startDate: "2026-09-26",
    endDate: "2026-09-28",
    status: "planned",
    stage: "PREPARE",
    safetyStatus: "Planned Journey • SafePass Issued",
    safetyScore: 100,
    timeline: [
      {
        id: "evt-agr-1",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
        type: "created",
        stage: "PREPARE",
        module: "SafePass",
        title: "Upcoming Journey Registered",
        description: "Gatimaan Express schedule and Taj Mahal sunrise slot reserved with ASI foreign pass.",
        actionPath: "/planner",
        actionLabel: "View Trip",
        status: "Scheduled",
        badgeColor: "indigo"
      }
    ],
    records: {
      fareChecks: [],
      evidenceList: [],
      visitedPlaces: [],
      translations: [],
      reports: []
    }
  }
];

export const JourneyProvider = ({ children }) => {
  const travelerContext = useTraveler();
  const travelerJourney = travelerContext?.journey;

  const [allJourneys, setAllJourneys] = useState(() => {
    try {
      const saved = localStorage.getItem('tm_all_journeys');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('Failed to load journeys from localStorage:', e);
    }
    return defaultJourneys;
  });

  const [activeJourneyId, setActiveJourneyId] = useState(() => {
    try {
      const savedId = localStorage.getItem('tm_active_journey_id');
      if (savedId) return savedId;
    } catch (_) {}
    return travelerJourney?.journey_code || defaultJourneys[0].id;
  });

  // Sync with traveler context journey_code if available
  useEffect(() => {
    if (travelerJourney?.journey_code && travelerJourney.journey_code !== activeJourneyId) {
      if (!allJourneys.find(j => j.id === travelerJourney.journey_code)) {
        const customTrip = {
          id: travelerJourney.journey_code,
          title: "Custom Delhi Journey",
          destination: "Delhi, India",
          origin: "New Delhi Railway Station (NDLS)",
          currentLocation: "Central Delhi",
          startDate: new Date().toISOString().split('T')[0],
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
          status: "active",
          stage: "TRAVEL",
          safetyStatus: "Secure • Monitored",
          safetyScore: 100,
          timeline: initialTimeline,
          records: {
            fareChecks: [],
            evidenceList: [],
            visitedPlaces: [],
            translations: [],
            reports: []
          }
        };
        setAllJourneys(prev => [customTrip, ...prev]);
      }
      setActiveJourneyId(travelerJourney.journey_code);
    }
  }, [travelerJourney]);

  // Persist journeys to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tm_all_journeys', JSON.stringify(allJourneys));
    } catch (e) {
      console.warn('Failed to save journeys:', e);
    }
  }, [allJourneys]);

  // Persist activeJourneyId to localStorage
  useEffect(() => {
    try {
      localStorage.setItem('tm_active_journey_id', activeJourneyId);
    } catch (_) {}
  }, [activeJourneyId]);

  const activeJourney = allJourneys.find(j => j.id === activeJourneyId) || allJourneys[0] || defaultJourneys[0];

  const switchJourney = (id) => {
    if (allJourneys.some(j => j.id === id)) {
      setActiveJourneyId(id);
    }
  };

  const createNewJourney = ({ title, destination, origin, startDate, endDate }) => {
    const randCode = Math.random().toString(36).substring(2, 6).toUpperCase();
    const isDelhi = (destination || '').toLowerCase().includes('delhi');
    const newId = `${isDelhi ? 'TM-DEL-2026' : 'TM-IND-2026'}-${randCode}`;

    const newTrip = {
      id: newId,
      title: title || 'New Exploratory Trip',
      destination: destination || 'Delhi, India',
      origin: origin || 'Indira Gandhi International Airport (DEL)',
      currentLocation: origin || 'Transit Hub',
      startDate: startDate || new Date().toISOString().split('T')[0],
      endDate: endDate || new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      status: 'active',
      stage: 'DISCOVER',
      safetyStatus: 'New Journey • SafePass Issued',
      safetyScore: 100,
      timeline: [
        {
          id: `evt-${Date.now()}`,
          timestamp: new Date().toISOString(),
          type: 'created',
          stage: 'DISCOVER',
          module: 'SafePass',
          title: 'Smart Journey Chain Registered',
          description: `Initialized new trip to ${destination || 'Delhi'}. SafePass reference generated.`,
          actionPath: '/safe-pass',
          actionLabel: 'View SafePass',
          status: 'Active',
          badgeColor: 'emerald'
        }
      ],
      records: {
        fareChecks: [],
        evidenceList: [],
        visitedPlaces: [],
        translations: [],
        reports: []
      }
    };

    setAllJourneys(prev => [newTrip, ...prev]);
    setActiveJourneyId(newId);
    return newTrip;
  };

  const addTimelineEvent = (event) => {
    setAllJourneys(prev =>
      prev.map(j => {
        if (j.id === activeJourneyId) {
          const newEvt = {
            id: `evt-${Date.now()}-${Math.random().toString(36).substring(2, 5)}`,
            timestamp: new Date().toISOString(),
            status: 'Recorded',
            badgeColor: 'emerald',
            ...event
          };
          return {
            ...j,
            timeline: [newEvt, ...(j.timeline || [])]
          };
        }
        return j;
      })
    );
  };

  const updateJourneyStage = (stage) => {
    setAllJourneys(prev =>
      prev.map(j => {
        if (j.id === activeJourneyId) {
          return { ...j, stage };
        }
        return j;
      })
    );
  };

  const addFareCheck = (fareRecord) => {
    setAllJourneys(prev =>
      prev.map(j => {
        if (j.id === activeJourneyId) {
          const record = {
            id: `fare-${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...fareRecord
          };
          const updatedRecords = {
            ...j.records,
            fareChecks: [record, ...(j.records?.fareChecks || [])]
          };
          const evt = {
            id: `evt-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'fare',
            stage: 'PREPARE',
            module: 'Fair Fare Meter',
            title: `Fare Verified: ₹${fareRecord.fare || fareRecord.estimatedFare} (${fareRecord.mode || 'Auto'})`,
            description: `Route: ${fareRecord.from} ➔ ${fareRecord.to} (${fareRecord.distance} km). Official Delhi tariff confirmed.`,
            actionPath: '/fare-meter',
            actionLabel: 'Check Fare',
            status: 'Tariff Checked',
            badgeColor: 'amber'
          };
          return {
            ...j,
            records: updatedRecords,
            timeline: [evt, ...(j.timeline || [])]
          };
        }
        return j;
      })
    );
  };

  const addEvidence = (evidenceRecord) => {
    setAllJourneys(prev =>
      prev.map(j => {
        if (j.id === activeJourneyId) {
          const record = {
            id: `ev-${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...evidenceRecord
          };
          const updatedRecords = {
            ...j.records,
            evidenceList: [record, ...(j.records?.evidenceList || [])]
          };
          const evt = {
            id: `evt-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'evidence',
            stage: 'TRAVEL',
            module: 'RideSafe Vault',
            title: `Vehicle Plate Recorded: ${evidenceRecord.plateNumber}`,
            description: `${evidenceRecord.vehicleType || 'Vehicle'} logged with cryptographic timestamp at ${evidenceRecord.location || 'Current Location'}.`,
            actionPath: '/vault',
            actionLabel: 'Open RideSafe Vault',
            status: 'Secured on Device',
            badgeColor: 'teal'
          };
          return {
            ...j,
            records: updatedRecords,
            timeline: [evt, ...(j.timeline || [])]
          };
        }
        return j;
      })
    );
  };

  const addVisitedPlace = (placeRecord) => {
    setAllJourneys(prev =>
      prev.map(j => {
        if (j.id === activeJourneyId) {
          const record = {
            id: `vp-${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...placeRecord
          };
          const updatedRecords = {
            ...j.records,
            visitedPlaces: [record, ...(j.records?.visitedPlaces || [])]
          };
          const evt = {
            id: `evt-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'destination',
            stage: 'DISCOVER',
            module: 'Discover Places',
            title: `Checked In: ${placeRecord.name}`,
            description: `Monument visit verified with ASI QR pass. Location: ${placeRecord.location || 'Delhi ASI Zone'}.`,
            actionPath: '/home',
            actionLabel: 'Explore Places',
            status: 'Check-in Verified',
            badgeColor: 'cyan'
          };
          return {
            ...j,
            records: updatedRecords,
            timeline: [evt, ...(j.timeline || [])]
          };
        }
        return j;
      })
    );
  };

  const addReport = (reportRecord) => {
    setAllJourneys(prev =>
      prev.map(j => {
        if (j.id === activeJourneyId) {
          const record = {
            id: `rep-${Date.now()}`,
            timestamp: new Date().toISOString(),
            ...reportRecord
          };
          const updatedRecords = {
            ...j.records,
            reports: [record, ...(j.records?.reports || [])]
          };
          const evt = {
            id: `evt-${Date.now()}`,
            timestamp: new Date().toISOString(),
            type: 'incident',
            stage: 'RESOLVE',
            module: 'Incident Assistance',
            title: `Incident Filed: ${reportRecord.title || 'Official Assistance Request'}`,
            description: `${reportRecord.description || 'Report filed and forwarded to Delhi Tourist Police.'}`,
            actionPath: '/incident',
            actionLabel: 'Track Incident',
            status: 'Dispatched to PCR',
            badgeColor: 'rose'
          };
          return {
            ...j,
            records: updatedRecords,
            timeline: [evt, ...(j.timeline || [])]
          };
        }
        return j;
      })
    );
  };

  return (
    <JourneyContext.Provider
      value={{
        activeJourney,
        activeJourneyId,
        allJourneys,
        switchJourney,
        createNewJourney,
        addTimelineEvent,
        updateJourneyStage,
        addFareCheck,
        addEvidence,
        addVisitedPlace,
        addReport
      }}
    >
      {children}
    </JourneyContext.Provider>
  );
};

export const useJourney = () => {
  const context = useContext(JourneyContext);
  if (!context) {
    throw new Error('useJourney must be used within a JourneyProvider');
  }
  return context;
};
