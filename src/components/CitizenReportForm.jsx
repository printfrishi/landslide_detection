import { useCallback, useEffect, useRef, useState } from 'react';
import {
  AlertTriangle,
  Camera,
  CameraOff,
  CheckCircle2,
  Loader2,
  MapPin,
  Send,
  ShieldCheck,
  X,
} from 'lucide-react';
import { Button } from './ui/Button';
import { DISTRICTS } from '../pages/Landing/sections/DemoData';

const API_BASE_URL = 'https://landslideearlywarning-system-backend.onrender.com';
const REPORT_ENDPOINT = `${API_BASE_URL}/landslide-report/makeReport`;

const inputClasses =
  'mt-1.5 block w-full rounded-md border border-input bg-white px-3 py-2 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-ring disabled:cursor-not-allowed disabled:bg-secondary-100 disabled:text-secondary-500';

export default function CitizenReportForm() {
  const videoRef = useRef(null);
  const streamRef = useRef(null);
  const photoRef = useRef(null);

  const [reporterName, setReporterName] = useState('');
  const [reporterMobile, setReporterMobile] = useState('');

  const [location, setLocation] = useState({
    lat: null,
    lon: null,
    address: '',
    loading: false,
    error: null,
    requested: false,
  });

  const [cameraState, setCameraState] = useState('off');
  const [cameraError, setCameraError] = useState('');

  const [photo, setPhoto] = useState(null);

  const [hazardType, setHazardType] = useState('Landslide');
  const [district, setDistrict] = useState('Tehri Garhwal');
  const [description, setDescription] = useState('');
  const [nameError, setNameError] = useState(null);
  const [mobileError, setMobileError] = useState(null);
  const [descriptionError, setDescriptionError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const stopCamera = useCallback(() => {
    const video = videoRef.current;

    if (video) {
      try { video.pause(); } catch {}
      try { video.srcObject = null; } catch {}
      try {
        video.removeAttribute('src');
        video.load();
      } catch {}
    }

    const stream = streamRef.current;
    if (stream) {
      stream.getTracks().forEach((track) => {
        try { track.stop(); } catch {}
      });
      streamRef.current = null;
    }

    setCameraState('off');
  }, []);

  useEffect(
    () => () => {
      stopCamera();
      if (photoRef.current) URL.revokeObjectURL(photoRef.current);
    },
    [stopCamera]
  );

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden && cameraState === 'live') {
        stopCamera();
      }
    };
    document.addEventListener('visibilitychange', handleVisibility);
    return () => document.removeEventListener('visibilitychange', handleVisibility);
  }, [cameraState, stopCamera]);

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
      if (!blob)
        setSubmitError({
          title: 'Capture failed',
          message: 'Could not capture a frame — is the camera feed running?',
        });
      return;
    }
    if (cameraState === 'off' || cameraState === 'error') startCamera();
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

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
      setSubmitError({
        title: 'Location required',
        message: 'Tap "Detect my location" and allow access before submitting.',
      });
      return;
    }

    setSubmitting(true);
    setSubmitError(null);

    try {
      let blob = null;
      if (cameraState === 'live') {
        blob = await captureFrame();
        stopCamera();
      }
      if (!blob) blob = photo?.blob ?? null;

      if (!blob) {
        setSubmitError({
          title: 'Photo required',
          message: 'Capture a live photo from the rear camera before submitting.',
        });
        return;
      }

      const formData = new FormData();
      formData.append('name', reporterName.trim());
      formData.append('mobileNo', reporterMobile.trim());
      formData.append('description', description.trim());
      formData.append('latitude', String(location.lat));
      formData.append('longitude', String(location.lon));
      formData.append('image', blob, 'report-photo.jpg');

      const res = await fetch(REPORT_ENDPOINT, {
        method: 'POST',
        body: formData,
      });

      const contentType = res.headers.get('content-type') ?? '';
      const payload = contentType.includes('application/json')
        ? await res.json().catch(() => null)
        : null;

      if (!res.ok) {
        const backendMessage =
          payload?.error ??
          payload?.message ??
          payload?.detail ??
          `Submission failed (HTTP ${res.status}).`;

        const isAiRejection =
          res.status === 400 &&
          typeof backendMessage === 'string' &&
          /reject|not detect|confidence|landslide/i.test(backendMessage);

        setSubmitError({
          title: isAiRejection ? 'Photo could not be verified' : 'Submission failed',
          message: backendMessage,
          status: res.status,
        });
        return;
      }

      setSuccessMessage(
        payload?.message ?? 'Landslide report submitted successfully.'
      );
    } catch (err) {
      setSubmitError({
        title: 'Network error',
        message:
          err?.message ??
          'Could not reach the server. Check your connection and try again.',
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (successMessage) {
    const match = successMessage.match(/Report ID:\s*(\d+)/i);
    const reportId = match?.[1];

    return (
      <div className="rounded-xl border bg-white p-8 text-center shadow-sm" role="status">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-600" aria-hidden="true" />
        <h3 className="mt-4 text-xl font-bold text-[#0a2f5a]">Report submitted</h3>

        {reportId && (
          <p className="mt-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-sm font-semibold text-emerald-800">
            Reference&nbsp;
            <span className="font-mono">#{reportId}</span>
          </p>
        )}

        <p className="mt-4 text-sm text-secondary-600">{successMessage}</p>

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

  return (
    <form
      onSubmit={handleSubmit}
      noValidate
      className="overflow-hidden rounded-2xl border bg-white shadow-sm"
    >
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

      <div className="border-b bg-sky-50 px-6 py-3 text-sm text-sky-900">
        📸 Rear camera only. 📍 Location is required. The camera opens only when you tap
        the button below — nothing is captured automatically.
      </div>

      <div className="grid gap-6 p-6 lg:grid-cols-2">
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
                  Camera is off. Tap "{cameraButtonLabel}" to open the rear camera.
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

      <div className="border-t bg-secondary-50/60 px-6 py-4">
        {submitError && (
          <div
            role="alert"
            className={`mb-4 flex items-start gap-3 rounded-lg border px-4 py-3 text-sm ${
              submitError.status === 400
                ? 'border-amber-300 bg-amber-50 text-amber-900'
                : 'border-red-200 bg-red-50 text-red-800'
            }`}
          >
            <span
              className={`mt-0.5 inline-flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full ${
                submitError.status === 400 ? 'bg-amber-500' : 'bg-red-500'
              }`}
              aria-hidden="true"
            >
              {submitError.status === 400 ? (
                <AlertTriangle className="h-3 w-3 text-white" />
              ) : (
                <X className="h-3 w-3 text-white" />
              )}
            </span>
            <div className="flex-1">
              <p className="font-semibold">{submitError.title}</p>
              <p className="mt-0.5 text-xs leading-5">{submitError.message}</p>
            </div>
            <button
              type="button"
              onClick={() => setSubmitError(null)}
              className="ml-2 text-lg leading-none opacity-60 transition-opacity hover:opacity-100"
              aria-label="Dismiss error"
            >
              ×
            </button>
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