import { useCallback, useEffect, useRef, useState } from 'react';
import {
  Camera,
  CameraOff,
  CheckCircle2,
  Loader2,
  MapPin,
  Send,
  ShieldCheck,
} from 'lucide-react';
import { Button } from './ui/Button';
import { DISTRICTS } from '../pages/Landing/sections/DemoData';

const API_BASE_URL = 'https://landslideearlywarning-system-backend.onrender.com';
const REPORT_ENDPOINT = `${API_BASE_URL}/landslide-report/makeReport`;

const inputClasses =
  'mt-1.5 block w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:bg-secondary-100 disabled:text-secondary-500';

/**
 * Citizen landslide report form.
 *
 * - Asks for location + back-camera permission (via the browser prompt)
 *   only when the user clicks the respective buttons.
 * - Captures a live frame from the rear camera and releases the stream.
 * - POSTs multipart/form-data to /landslide-report/makeReport with:
 *     mobileNo, description, latitude, longitude, image
 * - The backend runs an AI model on the image; only verified reports are
 *   stored. Response: { message: "..." }
 */
export default function CitizenReportForm() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const photoRef = useRef(null);

  /* reporter identity */
  const [reporterName, setReporterName] = useState('');
  const [reporterMobile, setReporterMobile] = useState('');

  /* location */
  const [location, setLocation] = useState({
    lat: null,
    lon: null,
    address: '',
    loading: false,
    error: null,
    requested: false,
  });

  /* camera */
  const [cameraState, setCameraState] = useState('off'); // off | starting | live | error
  const [cameraError, setCameraError] = useState('');

  /* photo */
  const [photo, setPhoto] = useState(null); // { blob, url }

  /* form */
  const [hazardType, setHazardType] = useState('Landslide');
  const [district, setDistrict] = useState('Tehri Garhwal');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState(null);
  const [mobileError, setMobileError] = useState(null);
  const [descriptionError, setDescriptionError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  /* -------------------- cleanup -------------------- */
  useEffect(
    () => () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (photoRef.current) URL.revokeObjectURL(photoRef.current);
    },
    []
  );

  /* -------------------- location -------------------- */
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocation((c) => ({
        ...c,
        loading: false,
        requested: true,
        error: 'Geolocation is not supported by this browser.',
      }));
      return;
    }

    setLocation((c) => ({ ...c, loading: true, error: null, requested: true }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        setLocation((c) => ({ ...c, lat: latitude, lon: longitude, loading: false }));

        // Reverse geocode for a human-readable address (best-effort).
        fetch(
          `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=16`
        )
          .then((r) => r.json())
          .then((data) => {
            setLocation((c) => ({ ...c, address: data?.display_name ?? '' }));
          })
          .catch(() => {});
      },
      (error) => {
        setLocation((c) => ({
          ...c,
          loading: false,
          error:
            error.code === error.PERMISSION_DENIED
              ? 'Location permission denied. Enable it in your browser settings and try again.'
              : 'Location could not be detected.',
        }));
      },
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  }, []);

  /* -------------------- camera -------------------- */
  const stopCamera = useCallback(() => {
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    setCameraState('off');
  }, []);

  const startCamera = useCallback(() => {
    setCameraState('starting');
    setCameraError('');

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraState('error');
      setCameraError(
        'Live camera is not supported in this browser/context. Use HTTPS or localhost.'
      );
      return;
    }

    navigator.mediaDevices
      .getUserMedia({
        // Force the rear camera — falls back gracefully if the device only has one.
        video: {
          facingMode: { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        },
        audio: false,
      })
      .then((stream) => {
        streamRef.current = stream;
        setCameraState('live');
      })
      .catch((error) => {
        setCameraState('error');
        setCameraError(
          error.name === 'NotAllowedError'
            ? 'Camera permission denied. Allow camera access and try again.'
            : error.name === 'NotFoundError'
              ? 'No camera device was found on this system.'
              : 'Camera could not be started.'
        );
      });
  }, []);

  /* attach stream after <video> mounts */
  useEffect(() => {
    const video = videoRef.current;
    if (
      cameraState === 'live' &&
      video &&
      streamRef.current &&
      video.srcObject !== streamRef.current
    ) {
      video.srcObject = streamRef.current;
      video.play().catch(() => {});
    }
  }, [cameraState]);

  /* capture a frame and return the JPEG blob */
  const captureFrame = () =>
    new Promise((resolve) => {
      const video = videoRef.current;
      if (!video || video.videoWidth === 0) {
        resolve(null);
        return;
      }
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
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

  const handleCameraButton = async () => {
    if (cameraState === 'live') {
      const blob = await captureFrame();
      stopCamera();
      if (!blob) setSubmitError('Could not capture a frame — is the camera feed running?');
      return;
    }
    if (cameraState === 'off' || cameraState === 'error') startCamera();
  };

  /* -------------------- submit -------------------- */
  const handleSubmit = async (event) => {
    event.preventDefault();

    // validations
    const errs = {
      name: reporterName.trim().length >= 2 ? null : 'Please enter your name.',
      mobile:
        /^[6-9]\d{9}$/.test(reporterMobile.trim())
          ? null
          : 'Enter a valid 10-digit Indian mobile number.',
      description:
        description.trim().length >= 10
          ? null
          : 'Please describe the hazard in at least 10 characters.',
    };
    setNameError(errs.name);
    setMobileError(errs.mobile);
    setDescriptionError(errs.description);

    if (errs.name || errs.mobile || errs.description) return;

    if (location.lat === null || location.lon === null) {
      setSubmitError('Location is required. Tap “Detect location” and allow access.');
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      // If the camera is still live, grab a fresh frame and shut it down.
      let blob = null;
      if (cameraState === 'live') {
        blob = await captureFrame();
        stopCamera();
      }
      if (!blob) blob = photo?.blob ?? null;

      // Build multipart form-data with the exact fields the backend expects.
      const formData = new FormData();
      formData.append('mobileNo', reporterMobile.trim());
      formData.append('description', description.trim());
      formData.append('latitude', String(location.lat));
      formData.append('longitude', String(location.lon));
      if (blob) formData.append('image', blob, 'report-photo.jpg');

      const res = await fetch(REPORT_ENDPOINT, {
        method: 'POST',
        body: formData,
        // do NOT set Content-Type — the browser sets the multipart boundary
      });

      const contentType = res.headers.get('content-type') ?? '';
      const payload = contentType.includes('application/json')
        ? await res.json().catch(() => null)
        : null;

      if (!res.ok) {
        throw new Error(
          payload?.message ?? `Submission failed with status ${res.status}.`
        );
      }

      setSuccessMessage(
        payload?.message ?? 'Landslide report submitted successfully.'
      );
    } catch (err) {
      setSubmitError(err?.message ?? 'Could not submit the report. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  /* -------------------- success screen -------------------- */
  if (successMessage) {
    return (
      <div className="rounded-xl border bg-white p-8 text-center shadow-sm" role="status">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden="true" />
        <h3 className="mt-4 text-xl font-bold text-[#0a2f5a]">Report submitted</h3>
        <p className="mt-2 text-sm text-secondary-600">{successMessage}</p>
        <button
          type="button"
          onClick={() => {
            setSuccessMessage(null);
            setDescription('');
            setPhoto(null);
            if (photoRef.current) URL.revokeObjectURL(photoRef.current);
            photoRef.current = null;
          }}
          className="mt-6 inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-semibold text-[#0a2f5a] transition-colors hover:bg-secondary-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
        >
          File another report
        </button>
      </div>
    );
  }

  const locationText =
    location.lat !== null
      ? `${location.lat.toFixed(5)}, ${location.lon.toFixed(5)}${
          location.address ? ` — ${location.address}` : ''
        }`
      : null;

  const cameraButtonLabel =
    cameraState === 'starting'
      ? 'Starting rear camera…'
      : cameraState === 'live'
        ? 'Capture photo'
        : photo
          ? 'Retake photo'
          : 'Open rear camera';

  /* -------------------- form -------------------- */
  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="overflow-hidden rounded-2xl border bg-white shadow-sm"
    >
      {/* header */}
      <div className="flex items-center gap-3 border-b bg-gradient-to-r from-[#0a2f5a] to-[#134b8a] px-6 py-4">
        <ShieldCheck className="h-6 w-6 text-amber-300" aria-hidden="true" />
        <div>
          <h2 className="text-base font-bold uppercase tracking-wider text-white">
            Citizen Landslide Report
          </h2>
          <p className="text-xs text-white/80">
            Photo + GPS are AI-verified before being stored.
          </p>
        </div>
      </div>

      {/* instructions */}
      <div className="border-b bg-sky-50 px-6 py-3 text-sm text-sky-900">
        📸 Rear camera only. 📍 Location is required. The camera opens only when you tap
        the button below — nothing is captured automatically.
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-2">
        {/* -------- left column: camera -------- */}
        <div>
          <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-secondary-700">
            <Camera className="h-4 w-4" aria-hidden="true" />
            Live photo <span className="text-red-600">*</span>
          </p>

          <div className="relative aspect-video w-full overflow-hidden rounded-lg border bg-secondary-900">
            <video
              ref={videoRef}
              autoPlay
              muted
              playsInline
              className={cameraState === 'live' ? 'h-full w-full object-cover' : 'hidden'}
              aria-label="Live rear-camera feed"
            />

            {cameraState === 'off' && photo && (
              <img
                src={photo.url}
                alt="Captured report"
                className="h-full w-full object-cover"
              />
            )}

            {cameraState === 'off' && !photo && (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-white/70">
                <CameraOff className="h-7 w-7" aria-hidden="true" />
                <p className="text-xs leading-5">
                  Camera is off. Tap “{cameraButtonLabel}” to open the rear camera.
                </p>
              </div>
            )}

            {cameraState === 'starting' && (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-white/80">
                <Loader2 className="h-7 w-7 animate-spin" aria-hidden="true" />
                <p className="text-xs leading-5">Starting rear camera… allow access if prompted.</p>
              </div>
            )}

            {cameraState === 'error' && (
              <div className="flex h-full flex-col items-center justify-center gap-2 px-4 text-center text-white/80">
                <CameraOff className="h-7 w-7" aria-hidden="true" />
                <p className="text-xs leading-5">{cameraError}</p>
                <button
                  type="button"
                  onClick={startCamera}
                  className="rounded-md border border-white/40 px-3 py-1.5 text-xs font-semibold text-white transition-colors hover:bg-white/10"
                >
                  Try again
                </button>
              </div>
            )}

            {cameraState === 'live' && (
              <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-black/55 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-red-500" aria-hidden="true" />
                Live · rear
              </span>
            )}

            {cameraState === 'off' && photo && (
              <span className="absolute left-2.5 top-2.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-600 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wide text-white">
                <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                Captured
              </span>
            )}
          </div>

          <Button
            type="button"
            onClick={handleCameraButton}
            disabled={cameraState === 'starting'}
            className="mt-3 w-full"
          >
            {cameraState === 'starting' && (
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
            )}
            {cameraState === 'live' && <Camera className="h-4 w-4" aria-hidden="true" />}
            {cameraButtonLabel}
          </Button>

          {photo && cameraState === 'off' && (
            <p className="mt-2 flex items-center gap-1.5 text-xs text-emerald-700" role="status">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
              Photo ready — it will be attached to this report.
            </p>
          )}
        </div>

        {/* -------- right column: location + reporter -------- */}
        <div className="space-y-5">
          <div>
            <p className="mb-2 flex items-center gap-1.5 text-sm font-semibold text-secondary-700">
              <MapPin className="h-4 w-4" aria-hidden="true" />
              Location <span className="text-red-600">*</span>
            </p>

            {!location.requested && location.lat === null && (
              <button
                type="button"
                onClick={requestLocation}
                className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-[#0a2f5a] bg-secondary-50 px-4 py-3 text-sm font-semibold text-[#0a2f5a] transition-colors hover:bg-secondary-100"
              >
                <MapPin className="h-4 w-4" aria-hidden="true" />
                Detect my location
              </button>
            )}

            {location.loading && (
              <p className="flex items-center gap-2 rounded-md border bg-secondary-50 px-3 py-2 text-sm text-secondary-600">
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                Getting GPS fix and address…
              </p>
            )}

            {!location.loading && locationText && (
              <div className="rounded-md border bg-emerald-50 px-3 py-2 text-sm text-emerald-900">
                <p className="font-mono text-xs">{locationText}</p>
              </div>
            )}

            {!location.loading && location.error && (
              <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-800">
                {location.error}{' '}
                <button
                  type="button"
                  onClick={requestLocation}
                  className="ml-1 underline"
                >
                  Retry
                </button>
              </div>
            )}
          </div>

          <div>
            <label htmlFor="cr-name" className="mb-1.5 block text-sm font-medium text-secondary-700">
              Your name <span className="text-red-600">*</span>
            </label>
            <input
              id="cr-name"
              type="text"
              required
              value={reporterName}
              onChange={(e) => {
                setReporterName(e.target.value);
                setNameError(null);
              }}
              placeholder="Full name"
              aria-invalid={nameError ? true : undefined}
              className={`block h-10 w-full rounded-md border bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring ${
                nameError ? 'border-destructive' : 'border-input'
              }`}
            />
            {nameError && <p className="mt-1.5 text-sm text-destructive">{nameError}</p>}
          </div>

          <div>
            <label htmlFor="cr-mobile" className="mb-1.5 block text-sm font-medium text-secondary-700">
              Mobile number <span className="text-red-600">*</span>
            </label>
            <input
              id="cr-mobile"
              type="tel"
              inputMode="numeric"
              maxLength={10}
              required
              value={reporterMobile}
              onChange={(e) => {
                setReporterMobile(e.target.value.replace(/\D/g, '').slice(0, 10));
                setMobileError(null);
              }}
              placeholder="10-digit mobile number"
              aria-invalid={mobileError ? true : undefined}
              className={`block h-10 w-full rounded-md border bg-white px-3 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring ${
                mobileError ? 'border-destructive' : 'border-input'
              }`}
            />
            {mobileError && <p className="mt-1.5 text-sm text-destructive">{mobileError}</p>}
          </div>
        </div>
      </div>

      {/* -------- bottom: hazard + description -------- */}
      <div className="grid gap-4 border-t px-6 py-5 sm:grid-cols-2">
        <div>
          <label htmlFor="cr-hazard" className="mb-1.5 block text-sm font-medium text-secondary-700">
            Hazard type
          </label>
          <select
            id="cr-hazard"
            value={hazardType}
            onChange={(e) => setHazardType(e.target.value)}
            className={inputClasses}
          >
            {['Landslide', 'Rockfall', 'Road blockage', 'Cracks in ground', 'Slope movement', 'Other hazard'].map(
              (opt) => (
                <option key={opt}>{opt}</option>
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
            onChange={(e) => setDistrict(e.target.value)}
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
            onChange={(e) => {
              setDescription(e.target.value);
              setDescriptionError(null);
            }}
            placeholder="Describe what you saw — size, slope, proximity to road, water seepage…"
            aria-invalid={descriptionError ? true : undefined}
            className={`block w-full rounded-md border bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring ${
              descriptionError ? 'border-destructive' : 'border-input'
            }`}
          />
          {descriptionError && (
            <p className="mt-1.5 text-sm text-destructive">{descriptionError}</p>
          )}
        </div>
      </div>

      {/* error + submit */}
      <div className="border-t bg-secondary-50/60 px-6 py-4">
        {submitError && (
          <div
            className="mb-3 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800"
            role="alert"
          >
            {submitError}
          </div>
        )}

        <div className="flex flex-col items-start justify-between gap-3 sm:flex-row sm:items-center">
          <p className="text-xs text-secondary-500">
            Your photo and GPS coordinates are sent to an AI model for verification. Only
            valid landslide reports are stored.
          </p>
          <Button type="submit" loading={submitting}>
            <Send className="h-4 w-4" aria-hidden="true" />
            Submit report
          </Button>
        </div>
      </div>
    </form>
  );
}