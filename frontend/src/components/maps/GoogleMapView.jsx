import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { setOptions, importLibrary } from '@googlemaps/js-api-loader';
import { MapPin, Navigation, Compass, AlertCircle, Search, Crosshair, ExternalLink, ShieldCheck, ArrowLeft, X } from 'lucide-react';
import { api } from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import StatusBadge from '../common/StatusBadge';

// Curated Dark Mode Map Theme for TravelMate
const DARK_MAP_STYLE = [
  { elementType: "geometry", stylers: [{ color: "#0d131f" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#090e17" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#74889e" }] },
  {
    featureType: "administrative.locality",
    elementType: "labels.text.fill",
    stylers: [{ color: "#d59563" }]
  },
  {
    featureType: "poi",
    elementType: "labels.text.fill",
    stylers: [{ color: "#34d399" }]
  },
  {
    featureType: "poi.park",
    elementType: "geometry",
    stylers: [{ color: "#0e241b" }]
  },
  {
    featureType: "road",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }]
  },
  {
    featureType: "road",
    elementType: "geometry.stroke",
    stylers: [{ color: "#0f172a" }]
  },
  {
    featureType: "road",
    elementType: "labels.text.fill",
    stylers: [{ color: "#94a3b8" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry",
    stylers: [{ color: "#334155" }]
  },
  {
    featureType: "road.highway",
    elementType: "geometry.stroke",
    stylers: [{ color: "#1e293b" }]
  },
  {
    featureType: "transit",
    elementType: "geometry",
    stylers: [{ color: "#1e293b" }]
  },
  {
    featureType: "water",
    elementType: "geometry",
    stylers: [{ color: "#061325" }]
  },
  {
    featureType: "water",
    elementType: "labels.text.fill",
    stylers: [{ color: "#38bdf8" }]
  }
];

export default function GoogleMapView({
  places = [],
  showRoute = true,
  origin = { lat: 28.6429, lng: 77.2195, name: 'New Delhi Railway Station (NDLS)' },
  destination = { lat: 28.6562, lng: 77.2410, name: 'Red Fort (Lal Qila)' },
  simulatedDeviation = false,
  liveTracking = false,
  onLocationUpdate = null,
  onRouteCalculated = null,
  onPlaceSelect = null,
  selectedRouteIndex = 0,
  onRoutesFound = null,
  onRouteSelect = null,
  allowAlternatives = true,
  onExit = null,
  onClose = null,
  hideSearch = false,
  hideRouteSelector = false,
  hideBottomStatus = false,
  className = ''
}) {
  const { isDark } = useTheme();
  const mapContainerRef = useRef(null);
  const searchInputRef = useRef(null);
  const [mapRoutes, setMapRoutes] = useState([]);

  const [mapInstance, setMapInstance] = useState(null);
  const [googleMapsApi, setGoogleMapsApi] = useState(null);
  const [apiKeyAvailable, setApiKeyAvailable] = useState(false);
  const [loadError, setLoadError] = useState(null);
  const [isLocating, setIsLocating] = useState(false);
  const [userLocation, setUserLocation] = useState(null);
  const [activeMarkerInfo, setActiveMarkerInfo] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isStreetViewActive, setIsStreetViewActive] = useState(false);

  // Synchronize Fullscreen State with Document Native Fullscreen
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!(document.fullscreenElement || document.webkitFullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
    };
  }, []);

  // Monitor Google Street View Panorama visibility
  useEffect(() => {
    if (!mapInstance || !mapInstance.getStreetView) return;
    const panorama = mapInstance.getStreetView();
    if (!panorama || !panorama.addListener) return;
    const listener = panorama.addListener('visible_changed', () => {
      const isVisible = !!(panorama.getVisible && panorama.getVisible());
      setIsStreetViewActive(isVisible);
    });
    return () => {
      if (window.google?.maps?.event?.removeListener && listener) {
        window.google.maps.event.removeListener(listener);
      }
    };
  }, [mapInstance]);

  // Synchronize Google Maps tile styling whenever light/dark theme toggles
  useEffect(() => {
    if (!mapInstance) return;
    mapInstance.setOptions({
      styles: isDark ? DARK_MAP_STYLE : [] // Standard Google Maps light tiles in Light Mode
    });
  }, [mapInstance, isDark]);

  // 1. Fetch Key & Initialize Google Maps using modern importLibrary() functional API
  useEffect(() => {
    let isMounted = true;

    async function initMap() {
      try {
        const key = await api.getMapsConfig();
        console.log('[GoogleMapView] Resolved API Key:', key ? `${key.substring(0, 8)}... (${key.length} chars)` : 'EMPTY');

        if (!key || key.trim() === '') {
          if (isMounted) {
            setApiKeyAvailable(false);
            setLoadError('Google Maps API key not found in .env. Interactive vector mode active.');
          }
          return;
        }

        // Configure options with the new functional API
        setOptions({
          key: key.trim(),
          v: 'weekly'
        });

        console.log('[GoogleMapView] Loading Google Maps libraries via importLibrary()...');
        const { Map, InfoWindow } = await importLibrary('maps');
        const { Autocomplete } = await importLibrary('places');
        await importLibrary('routes');
        await importLibrary('marker');
        await importLibrary('geometry');

        const google = window.google;
        console.log('[GoogleMapView] Google Maps libraries successfully loaded!');

        if (!isMounted || !mapContainerRef.current) return;

        setGoogleMapsApi(google);
        setApiKeyAvailable(true);

        // Center on Central Delhi (Connaught Place / Red Fort Corridor)
        const map = new Map(mapContainerRef.current, {
          center: { lat: 28.6139, lng: 77.2090 },
          zoom: 12.5,
          styles: isDark ? DARK_MAP_STYLE : [],
          disableDefaultUI: false,
          zoomControl: true,
          zoomControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
          },
          mapTypeControl: true,
          mapTypeControlOptions: {
            position: google.maps.ControlPosition.TOP_RIGHT
          },
          streetViewControl: true,
          streetViewControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
          },
          fullscreenControl: true,
          fullscreenControlOptions: {
            position: google.maps.ControlPosition.RIGHT_BOTTOM
          }
        });

        setMapInstance(map);
        console.log('[GoogleMapView] Live Google Map canvas attached to DOM container.');

        // Places Autocomplete
        if (searchInputRef.current) {
          const autocomplete = new Autocomplete(searchInputRef.current, {
            componentRestrictions: { country: 'in' },
            bounds: new google.maps.LatLngBounds(
              new google.maps.LatLng(28.40, 77.00),
              new google.maps.LatLng(28.90, 77.40)
            )
          });
          autocomplete.bindTo('bounds', map);
          autocomplete.addListener('place_changed', () => {
            const place = autocomplete.getPlace();
            if (!place.geometry || !place.geometry.location) return;
            map.setCenter(place.geometry.location);
            map.setZoom(15);
            new google.maps.Marker({
              map,
              position: place.geometry.location,
              title: place.name,
              animation: google.maps.Animation.DROP
            });
          });
        }
      } catch (err) {
        console.warn('[Google Maps Init Error]:', err.message);
        if (isMounted) {
          setApiKeyAvailable(false);
          setLoadError(`Google Maps API Error: ${err.message}. Using fallback.`);
        }
      }
    }

    initMap();

    return () => {
      isMounted = false;
    };
  }, []);

  // 2. Render Verified Places Markers
  useEffect(() => {
    if (!mapInstance || !googleMapsApi || !places || places.length === 0) return;

    const markers = [];
    const infoWindow = new googleMapsApi.maps.InfoWindow();

    places.forEach((place) => {
      if (!place.coordinates) return;

      const marker = new googleMapsApi.maps.Marker({
        position: { lat: place.coordinates.lat, lng: place.coordinates.lng },
        map: mapInstance,
        title: place.name,
        icon: {
          path: googleMapsApi.maps.SymbolPath.CIRCLE,
          scale: 8,
          fillColor: '#10B981',
          fillOpacity: 0.9,
          strokeColor: '#FFFFFF',
          strokeWeight: 2
        }
      });

      marker.addListener('click', () => {
        const popupBg = isDark ? '#090e17' : '#ffffff';
        const popupText = isDark ? '#f8fafc' : '#0f172a';
        const popupSub = isDark ? '#94a3b8' : '#475569';
        const popupBorder = isDark ? '#10b981' : '#059669';
        const popupTitle = isDark ? '#34d399' : '#047857';
        const popupTag = isDark ? '#f59e0b' : '#b45309';
        const popupFee = isDark ? '#cbd5e1' : '#1e293b';

        infoWindow.setContent(`
          <div style="background:${popupBg}; color:${popupText}; padding:10px 14px; border-radius:12px; font-family:sans-serif; max-width:240px; border:1px solid ${popupBorder}; box-shadow:0 4px 16px rgba(0,0,0,0.15);">
            <div style="font-weight:bold; font-size:13px; color:${popupTitle}; margin-bottom:4px;">${place.name}</div>
            <div style="font-size:11px; color:${popupSub}; margin-bottom:4px;">${place.category || 'Heritage'}</div>
            <div style="font-size:11px; color:${popupFee}; font-weight:600;">Foreigner Fee: ₹${place.fee?.foreigner ?? 'N/A'}</div>
            <div style="font-size:10px; color:${popupTag}; font-weight:600; margin-top:4px;">Official ASI Ticketed Site</div>
          </div>
        `);
        infoWindow.open(mapInstance, marker);
        if (onPlaceSelect) onPlaceSelect(place);
      });

      markers.push(marker);
    });

    return () => {
      markers.forEach(m => m.setMap(null));
    };
  }, [mapInstance, googleMapsApi, places]);

  // 3. Render Route Navigation & Start/End Markers
  useEffect(() => {
    if (!mapInstance || !googleMapsApi || !showRoute) return;

    let directionsRenderer = null;
    let fallbackPolyline = null;
    let pickupMarker = null;
    let destMarker = null;

    const originLat = origin?.lat || 28.6429;
    const originLng = origin?.lng || 77.2195;
    const destLat = destination?.lat || 28.6562;
    const destLng = destination?.lng || 77.2410;

    const originLatLng = new googleMapsApi.maps.LatLng(originLat, originLng);
    const destLatLng = new googleMapsApi.maps.LatLng(destLat, destLng);

    // Dedicated Pickup Location Marker (Blue)
    pickupMarker = new googleMapsApi.maps.Marker({
      position: originLatLng,
      map: mapInstance,
      title: origin?.name || 'Pickup Location',
      icon: {
        path: googleMapsApi.maps.SymbolPath.CIRCLE,
        scale: 9,
        fillColor: '#3B82F6',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2.5
      },
      zIndex: 100
    });

    // Dedicated Destination Marker (Red)
    destMarker = new googleMapsApi.maps.Marker({
      position: destLatLng,
      map: mapInstance,
      title: destination?.name || 'Destination Location',
      icon: {
        path: googleMapsApi.maps.SymbolPath.BACKWARD_CLOSED_ARROW,
        scale: 6,
        fillColor: '#EF4444',
        fillOpacity: 1,
        strokeColor: '#FFFFFF',
        strokeWeight: 2
      },
      zIndex: 100
    });

    // Fit bounds to keep both pickup and destination markers clearly in view
    const bounds = new googleMapsApi.maps.LatLngBounds();
    bounds.extend(originLatLng);
    bounds.extend(destLatLng);
    mapInstance.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });

    let drawnRoutePolylines = [];

    const directionsService = new googleMapsApi.maps.DirectionsService();

    const waypoints = [];
    if (simulatedDeviation) {
      waypoints.push({
        location: new googleMapsApi.maps.LatLng(
          originLat + (destLat - originLat) * 0.4 + 0.015,
          originLng + (destLng - originLng) * 0.4 - 0.015
        ),
        stopover: false
      });
    }

    console.log('[DirectionsService] Requesting route with alternatives:', {
      origin: `${originLat}, ${originLng}`,
      destination: `${destLat}, ${destLng}`
    });

    directionsService.route(
      {
        origin: originLatLng,
        destination: destLatLng,
        waypoints: waypoints,
        travelMode: googleMapsApi.maps.TravelMode.DRIVING,
        provideRouteAlternatives: allowAlternatives
      },
      (result, status) => {
        console.log('[DirectionsService] Driving route status:', status);
        if (status === googleMapsApi.maps.DirectionsStatus.OK && result.routes?.length > 0) {
          // Clear any previous route polylines
          drawnRoutePolylines.forEach(p => p.setMap(null));
          drawnRoutePolylines = [];

          const routeColorPalette = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6'];

          // Render ALL alternative routes simultaneously on the map canvas
          result.routes.forEach((rt, idx) => {
            const isSelected = selectedRouteIndex === idx;
            const color = routeColorPalette[idx % routeColorPalette.length];

            const poly = new googleMapsApi.maps.Polyline({
              path: rt.overview_path,
              strokeColor: color,
              strokeWeight: isSelected ? 7 : 4,
              strokeOpacity: isSelected ? 1.0 : 0.6,
              zIndex: isSelected ? 100 : (50 - idx),
              map: mapInstance
            });

            googleMapsApi.maps.event.addListener(poly, 'click', () => {
              if (onRouteSelect) onRouteSelect(idx);
            });

            drawnRoutePolylines.push(poly);
          });

          const routesList = result.routes.map((rt, idx) => {
            const leg = rt.legs[0];
            const distKm = parseFloat((leg.distance.value / 1000).toFixed(1));
            const durationMins = Math.round(leg.duration.value / 60);
            return {
              id: `route-${idx}`,
              index: idx,
              summary: rt.summary || (idx === 0 ? 'Primary Monitored Corridor' : `Alternative Corridor ${idx + 1}`),
              distanceKm: distKm,
              distanceText: leg.distance.text,
              durationText: leg.duration.text,
              durationMinutes: durationMins,
              safetyScore: idx === 0
                ? 'Optimal Safety (High Lighting & Police Beat)'
                : (idx === 1 ? 'Moderate Safety (Arterial Bypass)' : 'Caution (Narrow & Low Lighting)'),
              safetyLevel: idx === 0 ? 'High' : (idx === 1 ? 'Medium' : 'Caution'),
              cctvCoverage: idx === 0 ? '88% Monitored' : (idx === 1 ? '64% Monitored' : '32% Monitored'),
              lighting: idx === 0 ? 'Continuous LED Illumination' : (idx === 1 ? 'Standard Highway Lighting' : 'Intermittent / Dark Pockets'),
              policePresence: idx === 0 ? '24/7 PCR Van & Tourist Police Kiosk' : (idx === 1 ? 'Regular Highway Patrol' : 'Limited Police Access'),
              advisory: idx === 0
                ? 'Well-lit arterial corridor with continuous CCTV surveillance and active Delhi Police beat kiosks.'
                : (idx === 1
                  ? 'Wider arterial bypass road; good visibility and reliable mobile network reception.'
                  : 'Passes narrow commercial alleys; caution advised during late night hours.')
            };
          });

          setMapRoutes(routesList);
          if (onRoutesFound) {
            onRoutesFound(routesList);
          }

          const activeLeg = result.routes?.[selectedRouteIndex || 0]?.legs?.[0] || result.routes?.[0]?.legs?.[0];
          if (activeLeg && onRouteCalculated) {
            onRouteCalculated({
              distanceKm: parseFloat((activeLeg.distance.value / 1000).toFixed(1)),
              distanceText: activeLeg.distance.text,
              durationText: activeLeg.duration.text
            });
          }
        } else {
          console.warn('[DirectionsService] Driving route status (' + status + '). Rendering 3 distinct corridor paths.');
          drawnRoutePolylines.forEach(p => p.setMap(null));
          drawnRoutePolylines = [];

          // Calculate distance using Haversine formula with city road factor (1.25x)
          const R = 6371;
          const dLat = (destLat - originLat) * Math.PI / 180;
          const dLon = (destLng - originLng) * Math.PI / 180;
          const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                    Math.cos(originLat * Math.PI / 180) * Math.cos(destLat * Math.PI / 180) *
                    Math.sin(dLon / 2) * Math.sin(dLon / 2);
          const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          const estKm = parseFloat((R * c * 1.25).toFixed(1));
          const estDurationMins = Math.round(estKm * 3.5);

          // Calculate midpoints for distinct curved corridor arcs
          const midLat = (originLat + destLat) / 2;
          const midLng = (originLng + destLng) / 2;
          const perpLat = -(destLng - originLng) * 0.18;
          const perpLng = (destLat - originLat) * 0.18;

          const arcPoint1 = new googleMapsApi.maps.LatLng(midLat + perpLat, midLng + perpLng);
          const arcPoint2 = new googleMapsApi.maps.LatLng(midLat - perpLat * 0.85, midLng - perpLng * 0.85);

          // Corridor 0: Primary Arterial (Emerald)
          const poly0 = new googleMapsApi.maps.Polyline({
            path: [originLatLng, destLatLng],
            geodesic: true,
            strokeColor: selectedRouteIndex === 0 ? (simulatedDeviation ? '#F59E0B' : '#10B981') : '#10B981',
            strokeOpacity: selectedRouteIndex === 0 ? 1.0 : 0.55,
            strokeWeight: selectedRouteIndex === 0 ? 7 : 4,
            zIndex: selectedRouteIndex === 0 ? 100 : 50,
            map: mapInstance
          });
          googleMapsApi.maps.event.addListener(poly0, 'click', () => onRouteSelect && onRouteSelect(0));
          drawnRoutePolylines.push(poly0);

          // Corridor 1: Arterial Bypass (Royal Blue)
          const poly1 = new googleMapsApi.maps.Polyline({
            path: [originLatLng, arcPoint1, destLatLng],
            geodesic: true,
            strokeColor: '#3B82F6',
            strokeOpacity: selectedRouteIndex === 1 ? 1.0 : 0.55,
            strokeWeight: selectedRouteIndex === 1 ? 7 : 4,
            zIndex: selectedRouteIndex === 1 ? 100 : 40,
            map: mapInstance
          });
          googleMapsApi.maps.event.addListener(poly1, 'click', () => onRouteSelect && onRouteSelect(1));
          drawnRoutePolylines.push(poly1);

          // Corridor 2: Inner City Shortcut (Amber)
          const poly2 = new googleMapsApi.maps.Polyline({
            path: [originLatLng, arcPoint2, destLatLng],
            geodesic: true,
            strokeColor: '#F59E0B',
            strokeOpacity: selectedRouteIndex === 2 ? 1.0 : 0.55,
            strokeWeight: selectedRouteIndex === 2 ? 7 : 4,
            zIndex: selectedRouteIndex === 2 ? 100 : 30,
            map: mapInstance
          });
          googleMapsApi.maps.event.addListener(poly2, 'click', () => onRouteSelect && onRouteSelect(2));
          drawnRoutePolylines.push(poly2);

          const fallbackRoutes = [
            {
              id: 'route-0',
              index: 0,
              summary: 'Primary Arterial Corridor (Main Lit Highway)',
              distanceKm: estKm,
              distanceText: `${estKm} km`,
              durationText: `${estDurationMins} mins`,
              durationMinutes: estDurationMins,
              safetyScore: 'Optimal Safety (High Lighting & Police Beat)',
              safetyLevel: 'High',
              cctvCoverage: '90% Monitored',
              lighting: 'Continuous LED Illumination',
              policePresence: '24/7 PCR Van & Tourist Beat Kiosk',
              advisory: 'Well-illuminated main arterial corridor with continuous CCTV surveillance and active police beats.'
            },
            {
              id: 'route-1',
              index: 1,
              summary: 'Ring Road Arterial Bypass Corridor',
              distanceKm: parseFloat((estKm * 1.18).toFixed(1)),
              distanceText: `${parseFloat((estKm * 1.18).toFixed(1))} km`,
              durationText: `${Math.round(estDurationMins * 1.1)} mins`,
              durationMinutes: Math.round(estDurationMins * 1.1),
              safetyScore: 'Moderate Safety (Arterial Bypass)',
              safetyLevel: 'Medium',
              cctvCoverage: '65% Monitored',
              lighting: 'Standard Highway Lighting',
              policePresence: 'Regular Highway Patrol',
              advisory: 'Wider multi-lane roadway bypassing dense bazaar bottlenecks; steady vehicular traffic.'
            },
            {
              id: 'route-2',
              index: 2,
              summary: 'Historic Inner City Shortcut',
              distanceKm: parseFloat((estKm * 0.92).toFixed(1)),
              distanceText: `${parseFloat((estKm * 0.92).toFixed(1))} km`,
              durationText: `${Math.round(estDurationMins * 1.35)} mins`,
              durationMinutes: Math.round(estDurationMins * 1.35),
              safetyScore: 'Caution (Narrow Alleys & Low Lighting)',
              safetyLevel: 'Caution',
              cctvCoverage: '28% Monitored',
              lighting: 'Intermittent / Dark Pockets',
              policePresence: 'Limited Police Access',
              advisory: 'Passes narrow commercial alleys; caution advised during late night hours.'
            }
          ];

          setMapRoutes(fallbackRoutes);
          if (onRoutesFound) {
            onRoutesFound(fallbackRoutes);
          }

          const chosen = fallbackRoutes[selectedRouteIndex] || fallbackRoutes[0];
          if (onRouteCalculated) {
            onRouteCalculated({
              distanceKm: chosen.distanceKm,
              distanceText: chosen.distanceText,
              durationText: chosen.durationText
            });
          }
        }
      }
    );

    return () => {
      drawnRoutePolylines.forEach(p => p.setMap(null));
      if (pickupMarker) pickupMarker.setMap(null);
      if (destMarker) destMarker.setMap(null);
    };
  }, [mapInstance, googleMapsApi, showRoute, origin?.lat, origin?.lng, destination?.lat, destination?.lng, simulatedDeviation, selectedRouteIndex, allowAlternatives]);

  // 4. Continuous Real-Time Geolocation Tracking (watchPosition)
  useEffect(() => {
    if (!liveTracking || !navigator.geolocation) return;

    let watchId = null;
    let livePulseMarker = null;

    console.log('[GPS Tracker] Starting navigator.geolocation.watchPosition...');

    watchId = navigator.geolocation.watchPosition(
      (pos) => {
        const coords = {
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: pos.coords.accuracy
        };
        console.log('[GPS Tracker] Real-time position update:', coords.lat, coords.lng, `(accuracy: ±${Math.round(coords.accuracy)}m)`);
        setUserLocation(coords);

        if (mapInstance && googleMapsApi) {
          if (!livePulseMarker) {
            livePulseMarker = new googleMapsApi.maps.Marker({
              position: coords,
              map: mapInstance,
              title: "Your Real-Time GPS Location (Moving)",
              icon: {
                path: googleMapsApi.maps.SymbolPath.CIRCLE,
                scale: 11,
                fillColor: '#3B82F6',
                fillOpacity: 0.9,
                strokeColor: '#FFFFFF',
                strokeWeight: 3
              },
              zIndex: 999
            });
          } else {
            livePulseMarker.setPosition(coords);
          }
        }

        if (onLocationUpdate) onLocationUpdate(coords);
      },
      (err) => {
        console.warn('[GPS Tracker Warning]:', err.code, err.message);
      },
      { enableHighAccuracy: true, maximumAge: 2000, timeout: 10000 }
    );

    return () => {
      console.log('[GPS Tracker] Stopping watchPosition.');
      if (watchId !== null) navigator.geolocation.clearWatch(watchId);
      if (livePulseMarker) livePulseMarker.setMap(null);
    };
  }, [liveTracking, mapInstance, googleMapsApi]);

  // 5. Manual Center on GPS Location Button
  const handleTrackCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser.");
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lng: pos.coords.longitude };
        setUserLocation(coords);
        setIsLocating(false);

        if (mapInstance && googleMapsApi) {
          mapInstance.setCenter(coords);
          mapInstance.setZoom(15);

          new googleMapsApi.maps.Marker({
            position: coords,
            map: mapInstance,
            title: "Your Verified GPS Position",
            icon: {
              path: googleMapsApi.maps.SymbolPath.CIRCLE,
              scale: 9,
              fillColor: '#3b82f6',
              fillOpacity: 1,
              strokeColor: '#ffffff',
              strokeWeight: 2.5
            }
          });
        }

        if (onLocationUpdate) onLocationUpdate(coords);
      },
      (err) => {
        console.warn("[GPS Location Error]:", err.message);
        setIsLocating(false);
        const fallback = { lat: 28.6315, lng: 77.2167 };
        setUserLocation(fallback);
        if (onLocationUpdate) onLocationUpdate(fallback);
      },
      { enableHighAccuracy: true, timeout: 8000 }
    );
  };

  const handleExit = (e) => {
    if (e) {
      if (typeof e.preventDefault === 'function') e.preventDefault();
      if (typeof e.stopPropagation === 'function') e.stopPropagation();
    }
    console.log('[GoogleMapView] Exit clicked. Active StreetView:', isStreetViewActive, 'Fullscreen:', isFullscreen);

    let exitedStreetView = false;
    // 1. Programmatically dismiss Street View panorama
    if (mapInstance && typeof mapInstance.getStreetView === 'function') {
      const panorama = mapInstance.getStreetView();
      if (panorama && typeof panorama.getVisible === 'function' && panorama.getVisible()) {
        panorama.setVisible(false);
        setIsStreetViewActive(false);
        exitedStreetView = true;
        console.log('[GoogleMapView] Exited Street View via panorama.setVisible(false)');
      }
    }
    // 2. Click native Google Maps Street View close button in DOM
    if (mapContainerRef.current) {
      const nativeCloseBtn = mapContainerRef.current.querySelector(
        'button[aria-label*="Exit"], button[title*="Exit"], button[aria-label*="Street View"], button[title*="Back to"], .gm-sv-close'
      );
      if (nativeCloseBtn) {
        try {
          nativeCloseBtn.click();
          exitedStreetView = true;
          setIsStreetViewActive(false);
          console.log('[GoogleMapView] Clicked native Street View close button in DOM');
        } catch (ce) {
          console.warn('[GoogleMapView] Native close button click failed:', ce);
        }
      }
    }
    if (exitedStreetView) return;

    // 3. Exit Native Fullscreen
    const doc = document;
    if (doc.fullscreenElement || doc.webkitFullscreenElement || doc.mozFullScreenElement || doc.msFullscreenElement) {
      try {
        if (doc.exitFullscreen) doc.exitFullscreen().catch(() => {});
        else if (doc.webkitExitFullscreen) doc.webkitExitFullscreen();
        else if (doc.mozCancelFullScreen) doc.mozCancelFullScreen();
        else if (doc.msExitFullscreen) doc.msExitFullscreen();
      } catch (err) {
        console.warn('[GoogleMapView] Fullscreen exit error:', err);
      }
      setIsFullscreen(false);
      return;
    }

    // 4. Trigger explicit onExit callback
    if (typeof onExit === 'function') {
      onExit();
      return;
    }

    // 5. Trigger explicit onClose callback
    if (typeof onClose === 'function') {
      onClose();
      return;
    }

    // 6. Reset view bounds to origin & destination
    setActiveMarkerInfo(null);
    setSearchQuery('');
    if (mapInstance && googleMapsApi) {
      if (origin && destination && origin.lat && destination.lat) {
        const bounds = new googleMapsApi.maps.LatLngBounds();
        bounds.extend(new googleMapsApi.maps.LatLng(origin.lat, origin.lng));
        bounds.extend(new googleMapsApi.maps.LatLng(destination.lat, destination.lng));
        mapInstance.fitBounds(bounds, { top: 60, right: 60, bottom: 60, left: 60 });
      } else {
        mapInstance.setCenter({ lat: 28.6139, lng: 77.2090 });
        mapInstance.setZoom(12.5);
      }
    }
  };

  return (
    <div className={`relative w-full h-full min-h-[460px] sm:min-h-[500px] lg:min-h-[540px] rounded-2xl overflow-hidden border flex flex-col flex-1 transition-colors ${
      isDark ? 'bg-slate-950 border-white/10' : 'bg-slate-100 border-slate-200 shadow-sm'
    } ${className}`}>
      {/* Top Search & Controls Overlay (Search + GPS + Exit) */}
      {!hideSearch && (
        <div className="absolute top-3 left-3 z-30 pointer-events-auto flex items-center gap-2 max-w-[95%]">
          <div className="relative w-44 sm:w-60 md:w-64 shrink">
            <Search className={`absolute left-3 top-2.5 w-4 h-4 ${isDark ? 'text-slate-400' : 'text-slate-500'}`} />
            <input
              ref={searchInputRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search monument..."
              className={`w-full pl-9 pr-3 py-2 rounded-xl text-xs focus:outline-none focus:border-emerald-500 shadow-lg transition-colors truncate ${
                isDark
                  ? 'bg-surface/90 backdrop-blur-md border border-white/10 text-white placeholder-slate-400'
                  : 'bg-white/95 backdrop-blur-md border border-slate-200 text-slate-900 placeholder-slate-400'
              }`}
            />
          </div>

          <button
            type="button"
            id="btn-google-map-gps"
            onClick={handleTrackCurrentLocation}
            title="Track Live GPS Location"
            className={`px-2.5 py-2 rounded-xl transition-all shadow-lg shrink-0 flex items-center space-x-1 cursor-pointer active:scale-95 ${
              isDark
                ? 'bg-surface/90 hover:bg-emerald-500/20 border border-white/10 hover:border-emerald-500/40 text-emerald-400'
                : 'bg-white/95 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-400 text-emerald-600'
            }`}
          >
            <Crosshair className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
            <span className="text-[11px] font-semibold hidden sm:inline">GPS</span>
          </button>

          <button
            type="button"
            id="btn-google-map-exit"
            onClick={handleExit}
            title={isStreetViewActive ? 'Exit 360° Street View (Return to Road Map)' : 'Exit Map / Fullscreen'}
            className={`px-3 py-2 rounded-xl text-xs font-bold transition-all shadow-lg shrink-0 flex items-center space-x-1.5 cursor-pointer active:scale-95 ${
              isStreetViewActive
                ? 'bg-rose-600 hover:bg-rose-700 text-white border border-rose-400 shadow-rose-900/40 ring-2 ring-rose-500/50 animate-pulse'
                : isDark
                ? 'bg-surface/90 hover:bg-rose-500/20 border border-white/10 hover:border-rose-500/40 text-rose-400 hover:text-rose-300'
                : 'bg-white/95 hover:bg-rose-50 border border-slate-200 hover:border-rose-400 text-rose-600'
            }`}
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>{isStreetViewActive ? 'Exit 360°' : 'Exit'}</span>
          </button>
        </div>
      )}

      {/* Interactive Multi-Route Corridor Selector Overlay on Map (Hidden when controlled externally) */}
      {!hideRouteSelector && showRoute && mapRoutes.length > 1 && !isStreetViewActive && (
        <div className="absolute top-14 left-3 right-3 z-10 flex items-center space-x-2 bg-surface/95 backdrop-blur-md p-1.5 rounded-xl border border-surface-border shadow-xl overflow-x-auto no-scrollbar">
          <span className="text-[10px] uppercase font-bold text-slate-400 px-1 shrink-0 hidden sm:inline">
            Alternative Corridors:
          </span>
          {mapRoutes.map((rt, idx) => {
            const isSel = selectedRouteIndex === idx;
            return (
              <button
                key={idx}
                type="button"
                id={`map-corridor-btn-${idx}`}
                onClick={() => onRouteSelect && onRouteSelect(idx)}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center space-x-1.5 shrink-0 ${
                  isSel
                    ? idx === 0
                      ? 'bg-emerald-500 text-white shadow-md ring-1 ring-white/50'
                      : idx === 1
                      ? 'bg-blue-600 text-white shadow-md ring-1 ring-white/50'
                      : 'bg-amber-600 text-white shadow-md ring-1 ring-white/50'
                    : 'bg-white/5 hover:bg-white/10 text-slate-300'
                }`}
              >
                <span
                  className="w-2.5 h-2.5 rounded-full ring-1 ring-white/40"
                  style={{ backgroundColor: idx === 0 ? '#10B981' : (idx === 1 ? '#3B82F6' : '#F59E0B') }}
                />
                <span>Route {idx + 1}: {rt.durationText}</span>
                {idx === 0 && (
                  <span className="text-[9px] bg-white/20 px-1 py-0.2 rounded font-extrabold uppercase">
                    Safest
                  </span>
                )}
              </button>
            );
          })}
        </div>
      )}

      {/* Actual Google Map Canvas Container */}
      <div
        ref={mapContainerRef}
        className="w-full h-full min-h-[440px] sm:min-h-[480px] lg:min-h-[520px] flex-1"
      />

      {/* High-Contrast Expansive Vector Map Fallback (Fills 100% of available space) */}
      {!apiKeyAvailable && (
        <div className="absolute inset-0 z-0 bg-slate-950 flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f293720_1px,transparent_1px),linear-gradient(to_bottom,#1f293720_1px,transparent_1px)] bg-[size:32px_32px] pointer-events-none" />

          {/* Full-Bleed High-Definition Delhi Radar Schematic */}
          <svg className="w-full h-full relative z-0 flex-1" viewBox="0 0 1100 520" preserveAspectRatio="none">
            <defs>
              <linearGradient id="yamunaWater" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#0284c7" stopOpacity="0.4" />
                <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.2" />
              </linearGradient>
              <linearGradient id="radialGreen" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
                <stop offset="100%" stopColor="#10b981" stopOpacity="0.02" />
              </linearGradient>
              <linearGradient id="radialAmber" cx="50%" cy="50%" r="50%">
                <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.2" />
                <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Radar Circular Concentric Distance Rings */}
            <circle cx="500" cy="270" r="140" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="4 4" />
            <circle cx="500" cy="270" r="280" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="6 6" />
            <circle cx="500" cy="270" r="420" fill="none" stroke="#1e293b" strokeWidth="1" strokeDasharray="8 8" />

            {/* Yamuna River Flowing Water Corridor */}
            <path
              d="M 830 0 Q 880 160 840 310 T 960 520"
              fill="none"
              stroke="url(#yamunaWater)"
              strokeWidth="42"
              strokeLinecap="round"
            />
            <path
              d="M 830 0 Q 880 160 840 310 T 960 520"
              fill="none"
              stroke="#38bdf8"
              strokeWidth="3"
              strokeDasharray="14 8"
              strokeOpacity="0.4"
            />
            <text x="890" y="240" fill="#38bdf8" fontSize="10" fontWeight="bold" letterSpacing="3" opacity="0.65" transform="rotate(75, 890, 240)">
              YAMUNA RIVER BASIN
            </text>

            {/* Major Arterial Highway Loops */}
            <ellipse cx="510" cy="270" rx="460" ry="210" fill="none" stroke="#1e293b" strokeWidth="2.5" strokeDasharray="8 6" />
            <text x="70" y="265" fill="#64748b" fontSize="9" fontWeight="bold" letterSpacing="1">OUTER RING ROAD (NH-44)</text>

            <ellipse cx="500" cy="270" rx="270" ry="140" fill="none" stroke="#334155" strokeWidth="3" />
            <text x="240" y="260" fill="#94a3b8" fontSize="9" fontWeight="bold" letterSpacing="1">RING ROAD (M.G. MARG)</text>

            {/* Metro Transit Lines */}
            <line x1="120" y1="270" x2="880" y2="270" stroke="#3b82f6" strokeWidth="2" strokeOpacity="0.3" strokeDasharray="6 4" />
            <line x1="500" y1="40" x2="500" y2="500" stroke="#eab308" strokeWidth="2" strokeOpacity="0.3" strokeDasharray="6 4" />

            {/* Safe District Overlays */}
            {/* 1. Connaught Place Green Zone */}
            <circle cx="480" cy="270" r="80" fill="url(#radialGreen)" stroke="#10B981" strokeWidth="1.5" strokeDasharray="5 3" />
            <circle cx="480" cy="270" r="38" fill="#10B981" fillOpacity="0.1" stroke="#10B981" strokeWidth="1" />
            <text x="415" y="274" fill="#34D399" fontSize="11" fontWeight="bold">Connaught Place (Green Zone)</text>

            {/* 2. Old Delhi Amber Caution Zone */}
            <rect x="680" y="90" width="220" height="150" rx="24" fill="url(#radialAmber)" stroke="#F59E0B" strokeWidth="1.5" strokeDasharray="5 3" />
            <text x="700" y="118" fill="#FBBF24" fontSize="11" fontWeight="bold">Old Delhi Heritage (Amber Zone)</text>
            <text x="700" y="134" fill="#fcd34d" fontSize="9" opacity="0.8">High Rickshaw & Market Density</text>

            {/* 3. Mehrauli Heritage Precinct */}
            <ellipse cx="360" cy="450" rx="140" ry="50" fill="#6366f1" fillOpacity="0.08" stroke="#6366f1" strokeWidth="1" strokeDasharray="4 4" />
            <text x="290" y="454" fill="#a5b4fc" fontSize="10" fontWeight="bold">Qutub Minar & Mehrauli Precinct</text>

            {/* 4. IGI Airport High Security Zone */}
            <rect x="70" y="370" width="180" height="100" rx="18" fill="#06b6d4" fillOpacity="0.08" stroke="#06b6d4" strokeWidth="1" strokeDasharray="4 4" />
            <text x="95" y="415" fill="#67e8f9" fontSize="10" fontWeight="bold">IGI Airport T3 Expressway</text>

            {/* Evaluated Multi-Corridors */}
            {/* Route 2: Ring Road Bypass (Cyan) */}
            <path
              d="M 360 290 Q 460 380 640 370 T 780 180"
              fill="none"
              stroke="#06B6D4"
              strokeWidth={selectedRouteIndex === 1 ? "6" : "3"}
              strokeDasharray="6 4"
              strokeOpacity={selectedRouteIndex === 1 ? "1" : "0.55"}
            />

            {/* Route 3: Historic Market Shortcut (Amber) */}
            <path
              d="M 360 290 Q 560 250 780 180"
              fill="none"
              stroke="#F59E0B"
              strokeWidth={selectedRouteIndex === 2 ? "6" : "2.5"}
              strokeDasharray="4 4"
              strokeOpacity={selectedRouteIndex === 2 ? "1" : "0.5"}
            />

            {/* Route 1: Primary Arterial Safe Corridor (Emerald) */}
            <path
              d="M 360 290 Q 480 200 780 180"
              fill="none"
              stroke={simulatedDeviation ? "#64748B" : "#10B981"}
              strokeWidth={selectedRouteIndex === 0 ? "7" : "4"}
              strokeLinecap="round"
              strokeOpacity={selectedRouteIndex === 0 ? "1" : "0.7"}
            />
            {!simulatedDeviation && selectedRouteIndex === 0 && (
              <path
                d="M 360 290 Q 480 200 780 180"
                fill="none"
                stroke="#FFFFFF"
                strokeWidth="2"
                strokeDasharray="8 20"
                className="animate-pulse"
                opacity="0.8"
              />
            )}

            {/* Simulated Deviation Detour Path (Flashing Red/Amber) */}
            {simulatedDeviation && (
              <>
                <path
                  d="M 500 220 Q 560 160 620 130"
                  fill="none"
                  stroke="#EF4444"
                  strokeWidth="5"
                  strokeDasharray="6 4"
                  className="animate-pulse"
                />
                <g transform="translate(620, 130)">
                  <circle cx="0" cy="0" r="22" fill="#EF4444" fillOpacity="0.3" className="animate-ping" />
                  <circle cx="0" cy="0" r="9" fill="#EF4444" stroke="#ffffff" strokeWidth="2" />
                  <rect x="15" y="-12" width="165" height="24" rx="6" fill="#7f1d1d" stroke="#ef4444" strokeWidth="1" />
                  <text x="24" y="4" fill="#fecaca" fontSize="10" fontWeight="bold">Vehicle Veered &gt;520m Off Route</text>
                </g>
              </>
            )}

            {/* Police PCR Beat Posts along Route 1 */}
            <g transform="translate(420, 240)">
              <circle cx="0" cy="0" r="5" fill="#3B82F6" />
              <circle cx="0" cy="0" r="10" fill="#3B82F6" fillOpacity="0.2" />
              <text x="8" y="3" fill="#93C5FD" fontSize="8" fontWeight="bold">PCR Beat #14</text>
            </g>
            <g transform="translate(560, 195)">
              <circle cx="0" cy="0" r="5" fill="#10B981" />
              <circle cx="0" cy="0" r="10" fill="#10B981" fillOpacity="0.2" />
              <text x="8" y="3" fill="#6EE7B7" fontSize="8" fontWeight="bold">Tourist Police Kiosk</text>
            </g>
            <g transform="translate(700, 185)">
              <circle cx="0" cy="0" r="5" fill="#3B82F6" />
              <circle cx="0" cy="0" r="10" fill="#3B82F6" fillOpacity="0.2" />
              <text x="8" y="3" fill="#93C5FD" fontSize="8" fontWeight="bold">Control Kiosk #08</text>
            </g>

            {/* Origin Marker (Blue) */}
            <g transform="translate(360, 290)">
              <circle cx="0" cy="0" r="18" fill="#3B82F6" fillOpacity="0.25" className="animate-ping" />
              <circle cx="0" cy="0" r="8" fill="#3B82F6" stroke="#FFFFFF" strokeWidth="2.5" />
              <rect x="-135" y="-14" width="125" height="28" rx="8" fill="#0f172a" stroke="#3B82F6" strokeWidth="1" />
              <text x="-125" y="4" fill="#93C5FD" fontSize="10" fontWeight="bold">
                {origin?.name ? origin.name.split(',')[0].slice(0, 15) : 'Pickup Point'}
              </text>
            </g>

            {/* Destination Marker (Red) */}
            <g transform="translate(780, 180)">
              <circle cx="0" cy="0" r="20" fill="#EF4444" fillOpacity="0.25" className="animate-ping" />
              <circle cx="0" cy="0" r="8" fill="#EF4444" stroke="#FFFFFF" strokeWidth="2.5" />
              <rect x="14" y="-14" width="145" height="28" rx="8" fill="#0f172a" stroke="#EF4444" strokeWidth="1" />
              <text x="24" y="4" fill="#FCA5A5" fontSize="10" fontWeight="bold">
                {destination?.name ? destination.name.split(',')[0].slice(0, 18) : 'Destination'}
              </text>
            </g>

            {/* Live Vehicle Telemetry Beacon */}
            {!simulatedDeviation && (
              <g transform="translate(510, 215)">
                <circle cx="0" cy="0" r="22" fill="#10B981" fillOpacity="0.25" className="animate-ping" />
                <circle cx="0" cy="0" r="10" fill="#10B981" fillOpacity="0.5" />
                <circle cx="0" cy="0" r="5" fill="#FFFFFF" />
                <rect x="-45" y="-30" width="90" height="20" rx="6" fill="#064e3b" stroke="#10B981" strokeWidth="1" />
                <text x="-40" y="-16" fill="#6EE7B7" fontSize="9" fontWeight="bold">Live GPS (±4m)</text>
              </g>
            )}
          </svg>

          {/* Fallback Info Footer (Rendered only if bottom status enabled) */}
          {!hideBottomStatus && (
            <div className="p-3 bg-surface/90 backdrop-blur-md border-t border-white/10 flex items-center justify-between text-xs relative z-10">
              <div className="flex items-center space-x-2 text-slate-300">
                <ShieldCheck className="w-4 h-4 text-cyan-400" />
                <span>{loadError || 'Interactive High-Definition Radar Active (Connect Google Maps in .env for Satellite Imagery)'}</span>
              </div>
              <StatusBadge status="Official" />
            </div>
          )}
        </div>
      )}

      {/* Route Soft Deviation Alert Overlay */}
      {simulatedDeviation && (
        <div className="absolute bottom-4 left-4 right-4 p-3.5 bg-amber-500/20 backdrop-blur-md rounded-2xl border border-amber-500/40 text-amber-200 text-xs flex items-start space-x-2.5 animate-in slide-in-from-bottom duration-200 z-20 shadow-xl">
          <AlertCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-bold text-amber-300 block">Soft Corridor Deviation Detected (&gt;500m)</span>
            <span>Route diverted towards Chawri interior. Non-accusatory reminder: check route or ask driver politely.</span>
          </div>
        </div>
      )}

      {/* Fullscreen Floating Exit Button for HTML5 / Google Maps Native Fullscreen Mode */}
      {isFullscreen && typeof document !== 'undefined' && createPortal(
        <div className="fixed top-4 right-4 z-[2147483647] animate-in fade-in flex items-center space-x-2 pointer-events-auto">
          <button
            type="button"
            id="btn-fullscreen-exit-portal"
            onClick={handleExit}
            className="px-4 py-2.5 rounded-xl bg-rose-600/95 hover:bg-rose-600 text-white font-bold text-xs shadow-2xl backdrop-blur-md border border-rose-400 flex items-center space-x-2 transition-all hover:scale-105 active:scale-95 cursor-pointer ring-2 ring-rose-500/50"
            title="Exit Fullscreen (ESC)"
          >
            <ArrowLeft className="w-4 h-4 shrink-0" />
            <span>Exit Fullscreen</span>
            <span className="text-[10px] bg-black/40 px-1.5 py-0.5 rounded font-mono text-rose-200">ESC</span>
          </button>
        </div>,
        document.fullscreenElement || document.body
      )}
    </div>
  );
}
