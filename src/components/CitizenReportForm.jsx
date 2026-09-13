import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera,
  CameraOff,
  CheckCircle2,
  Loader2,
  MapPin,
  Send,
  User,
} from 'lucide-react';
import authService from '../services/authService';
import { submitCitizenReport } from '../services/api';
import { Button } from './ui/Button';
import { DISTRICTS } from '../pages/Landing/sections/DemoData';

const inputClasses =
  'mt-1.5 block w-full rounded-md border border-input bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:bg-secondary-100 disabled:text-secondary-500';

/**
 * Citizen landslide report form with live camera capture, auto-detected
 * location (GPS + reverse geocoding) and auto-filled reporter identity.
 * Builds multipart FormData (photo blob + fields) and POSTs it to
 * /api/citizen-reports through the API service.
 */
export default function CitizenReportForm() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const photoRef = useRef(null);

  /* reporter identity (auto-filled) */
  const [profile, setProfile] = useState({ name: '', mobile: '', loaded: false });

  /* location (auto-detected) */
  const [location, setLocation] = useState({ lat: null, lon: null, address: '', loading: true, error: null });

  /* camera */
  const [cameraState, setCameraState] = useState('starting'); // starting | live | error
  const [cameraError, setCameraError] = useState('');

  /* captured photo */
  const [photo, setPhoto] = useState(null); // { blob, url }

  /* form fields */
  const [hazardType, setHazardType] = useState('Landslide');
  const [district, setDistrict] = useState('Tehri Garhwal');
  const [description, setDescription] = useState('');
  const [descriptionError, setDescriptionError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successRef, setSuccessRef] = useState(null);

  /* auto-fill reporter identity */
  useEffect(() => {
    let active = true;
    authService
      .getUserProfile()
      .then((profile) => {
        if (active && profile) setProfile({ ...profile, loaded: true });
        else if (active) setProfile((current) => ({ ...current, loaded: true }));
      })
      .catch(() => {
        if (active) setProfile((current) => ({ ...current, loaded: true }));
      });
    return () => {
      active = false;
    };
  }, []);

  /* auto-detect location: GPS coordinates + reverse-geocoded address */
  useEffect(() => {
    if (!navigator.geolocation) {
      setLocation((current) => ({ ...current, loading: false, error: 'Geolocation is not supported by this browser.' }));
      return undefined;
    }
    const watcher = navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation((current) => ({ ...current, lat: latitude, lon: longitude, loading: false }));
        // Reverse geocode for a human-readable address (OpenStreetMap Nominatim).
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16`
        )
          .then((response) => response.json())
          .then((data) => {
            setLocation((current) => ({
              ...current,
              address: data?.display_name ?? '',
              loading: false,
            }));
          })
          .catch(() => {
            setLocation((current) => ({ ...current, loading: false }));
          });
      },
      (error) => {
        setLocation((current) => ({
          ...current,
          loading: false,
          error:
            error.code === error.PERMISSION_DENIED
              ? 'Location permission denied — enable it to auto-detect your position.'
              : 'Location could not be detected.',
        }));
      },
      { enableHighAccuracy: true, timeout: 12000 }
    );
    return () => navigator.geolocation.clearWatch(watcher);
  }, []);

  /* stop camera tracks on unmount */
  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      if (photoRef.current) URL.revokeObjectURL(photoRef.current);
    },
    []
  );

  /* start the live camera feed (rear camera when available) */
  const startCamera = useCallback(() => {
    setCameraState('starting');
    setCameraError('');
    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState('error');
      setCameraError('Live camera is not supported in this browser/context. Use HTTPS or localhost.');
      return;
    }
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' }, audio: false })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          setCameraState('live');
        }
      })
      .catch((error) => {
        setCameraState('error');
        setCameraError(
          error.name === 'NotAllowedError'
            ? 'Camera permission denied — allow camera access to capture a live photo.'
            : error.name === 'NotFoundError'
              ? 'No camera device was found on this system.'
              : 'Camera could not be started.'
        );
      });
  }, []);

  useEffect(() => {
    startCamera();
    return () => streamRef.current?.getTracks().forEach((track) => track.stop());
  }, [startCamera]);

  /** Draws the current video frame onto a canvas and stores it as a JPEG blob. */
  const captureFrame = () => {
    const video = videoRef.current;
    if (!video || video.videoWidth === 0) return null;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    canvas.getContext('2d').drawImage(video, 0, 0);
    return new Promise((resolve) => {
      canvas.toBlob(
        (blob) => {
          if (!blob) {
            resolve(null);
            return;
          }
          if (photoRef.current) URL.revokeObjectURL(photoRef.current);
          const url = URL.createObjectURL(blob);
          photoRef.current = url;
          setPhoto({ blob, url });
          resolve(blob);
        },
        'image/jpeg',
        0.9
      );
    });
  };

  const handleCapture = async () => {
    const blob = await captureFrame();
    if (!blob) setSubmitError('Could not capture a frame — is the camera feed running?');
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!description.trim() || description.trim().length < 10) {
      setDescriptionError('Please describe the hazard in at least 10 characters.');
      return;
    }
    setDescriptionError(null);
    setSubmitting(true);
    setSubmitError(null);

    try {
      // A fresh frame is captured on submit; fall back to the previewed one.
      let blob = await captureFrame();
      if (!blob) blob = photo?.blob ?? null;

      const formData = new FormData();
      if (blob) formData.append('photo', blob, 'report-photo.jpg');
      formData.append('hazardType', hazardType);
      formData.append('district', district);
      formData.append('reporterName', profile.name);
      formData.append('reporterMobile', profile.mobile);
      formData.append('location', location.address || (location.lat !== null ? `${location.lat}, ${location.lon}` : ''));
      if (location.lat !== null) {
        formData.append('latitude', String(location.lat));
        formData.append('longitude', String(location.lon));
      }
      formData.append('description', description.trim());

      const response = await submitCitizenReport(formData);
      const reference = response?.id ?? response?.reportId ?? response?.reference ?? 'received';
      setSuccessRef(String(reference));
    } catch (submitFailure) {
      setSubmitError(submitFailure?.message ?? 'Could not submit the report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const locationText =
    location.lat !== null
      ? `${location.lat.toFixed(5)}, ${location.lon.toFixed(5)}${location.address ? ` — ${location.address}` : ''}`
      : null;

  /* ---------------- success state ---------------- */
  if (successRef) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center shadow-sm" role="status">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden="true" />
        <h3 className="mt-4 text-xl font-bold text-[#0a2f5a]">Report submitted</h3>
        <p className="mt-2 text-sm text-secondary-600">
          Reference <span className="font-mono font-bold text-secondary-900">{successRef}</span> —
          monitoring teams will verify the site.
        </p>
        <button
          type="button"
          onClick={() => {
            setSuccessRef(null);
            setDescription('');
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold text-[#0a2f5a] transition-colors hover:bg-secondary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          File another report
        </button>
      </div>
    );
  }

  /* ---------------- form ---------------- */
  return (
    <form onSubmit={handleSubmit} noValidate className="rounded-xl border bg-white p-6 shadow-sm">
      {/* instructions */}
      <p className="rounded-md border border-sky-200 bg-sky-50 px-4 py-2.5 text-sm text-sky-900">
        📸 Live photo capture only — no upload feature. 📍 Location will be auto-detected.
      </p>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        {/* live camera feed */}
        <div>
          <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-secondary-700">
            <Camera className="h-4 w-4" aria-hidden="true" />
            Live camera
          </p>
          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-secondary-900">
            {cameraState === 'live' && (
              <video
                ref={videoRef}
                autoPlay
                muted
                playsInline
                className="h-full w-full object-cover"
                aria-label="Live camera feed"
              />
            )}
            {cameraState !== 'live' && (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-white/80">
                <CameraOff className="h-7 w-7" aria-hidden="true" />
                <p className="text-xs leading-5">
                  {cameraState === 'starting' ? 'Starting camera…' : cameraError}
                </p>
                {cameraState === 'error' && (
                  <button
                    type="button"
                    onClick={startCamera}
                    className="rounded-md border border-white/40 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                  >
                    Try again
                  </button>
                )}
              </div>
            )}
            {cameraState === 'live' && (
              <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" aria-hidden="true" />
                Live
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleCapture}
            disabled={cameraState !== 'live'}
            className="mt-3 inline-flex w-full items-center justify-center gap-2 rounded-md bg-[#0a2f5a] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#134b8a] disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <Camera className="h-4 w-4" aria-hidden="true" />
            Capture photo
          </button>
          {photo && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700" role="status">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Photo captured — it will be attached to this report.
            </p>
          )}
        </div>

        {/* auto-filled identity + location */}
        <div className="space-y-4">
          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-secondary-700">
              <User className="h-4 w-4" aria-hidden="true" />
              Reporter (auto-filled)
            </p>
            <input
              aria-label="Reporter name"
              value={profile.name || (profile.loaded ? 'Not signed in' : 'Loading…')}
              disabled
              className={inputClasses}
            />
            <input
              aria-label="Reporter mobile number"
              value={profile.mobile || (profile.loaded ? '—' : 'Loading…')}
              disabled
              placeholder="Mobile"
              className={`mt-2 ${inputClasses}`}
            />
            {!profile.loaded && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-secondary-400">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                Reading your session…
              </p>
            )}
          </div>

          <div>
            <p className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-secondary-700">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Location (auto-detected)
            </p>
            <textarea
              aria-label="Auto-detected location"
              value={
                location.loading
                  ? 'Detecting your location…'
                  : locationText ?? location.error ?? '—'
              }
              disabled
              rows={3}
              className={`${inputClasses} resize-none`}
            />
            {location.loading && (
              <p className="mt-1 flex items-center gap-1.5 text-xs text-secondary-400">
                <Loader2 className="h-3 w-3 animate-spin" aria-hidden="true" />
                Getting GPS fix and address…
              </p>
            )}
          </div>
        </div>
      </div>

      {/* report fields */}
      <div className="mt-5 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="cr-hazard" className="mb-1.5 block text-sm font-medium text-secondary-700">
            Hazard type
          </label>
          <select
            id="cr-hazard"
            value={hazardType}
            onChange={(event) => setHazardType(event.target.value)}
            className={inputClasses}
          >
            {['Landslide', 'Rockfall', 'Road blockage', 'Cracks in ground', 'Slope movement', 'Other hazard'].map(
              (option) => (
                <option key={option}>{option}</option>
              )
            )}
          </select>
        </div>
        <div>
          <label htmlFor="cr-district" className="mb-1.5 block text-sm font-medium text-secondary-700">
            District
          </label>
          <select
            id="cr-district"
            value={district}
            onChange={(event) => setDistrict(event.target.value)}
            className={inputClasses}
          >
            {DISTRICTS.map((item) => (
              <option key={item.id}>{item.name}</option>
            ))}
          </select>
        </div>
        <div className="sm:col-span-2">
          <label htmlFor="cr-description" className="mb-1.5 block text-sm font-medium text-secondary-700">
            Description <span className="text-red-600">*</span>
          </label>
          <textarea
            id="cr-description"
            rows={4}
            required
            value={description}
            onChange={(event) => {
              setDescription(event.target.value);
              setDescriptionError(null);
            }}
            placeholder="Describe what you saw — size, slope, proximity to the road, water seepage…"
            aria-invalid={descriptionError ? true : undefined}
            className={`block w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring ${
              descriptionError ? 'border-destructive' : 'border-input'
            }`}
          />
          {descriptionError && <p className="mt-1.5 text-sm text-destructive">{descriptionError}</p>}
        </div>
      </div>

      {submitError && (
        <div className="mt-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800" role="alert">
          {submitError}
        </div>
      )}

      <div className="mt-5 flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
        <p className="text-xs text-secondary-400">
          Photo and GPS coordinates are attached automatically with every report.
        </p>
        <Button type="submit" loading={submitting} disabled={cameraState !== 'live' && !photo}>
          <Send aria-hidden="true" />
          Submit Report
        </Button>
      </div>
    </form>
  );
}
