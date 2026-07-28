"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Check, X } from "lucide-react";
import { FormEvent, useState, useTransition } from "react";
import { createTrip } from "./actions";
import styles from "../../mobile.module.css";

const steps = ["Name", "Dates", "Destination"];

export default function TripCreationFlow() {
  const [step, setStep] = useState(0);
  const [tripName, setTripName] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [destination, setDestination] = useState("");
  const [error, setError] = useState("");
  const [isPending, startTransition] = useTransition();

  const canContinue =
    (step === 0 && tripName.trim().length > 0) ||
    (step === 1 && startDate.length > 0 && endDate.length > 0) ||
    (step === 2 && destination.trim().length > 0);

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");

    if (!canContinue) return;

    if (step < steps.length - 1) {
      setStep((current) => current + 1);
      return;
    }

    const formData = new FormData();
    formData.set("tripName", tripName);
    formData.set("startDate", startDate);
    formData.set("endDate", endDate);
    formData.set("destination", destination);

    startTransition(async () => {
      const result = await createTrip(formData);

      if (result?.error) {
        setError(result.error);
      }
    });
  }

  return (
    <section className={styles.creationShell} aria-label="Create a trip">
      <header className={styles.creationHeader}>
        <Link className={styles.exitButton} href="/trips" aria-label="Cancel trip creation">
          <X aria-hidden="true" size={24} strokeWidth={2.6} />
        </Link>
      </header>

      <div className={styles.creationProgress} aria-label={`Step ${step + 1} of ${steps.length}`}>
        {steps.map((label, index) => (
          <div
            className={`${styles.progressStep} ${index <= step ? styles.progressStepActive : ""}`}
            key={label}
          >
            <span>{index < step ? <Check aria-hidden="true" size={14} /> : index + 1}</span>
            <p>{label}</p>
          </div>
        ))}
      </div>

      <form className={styles.creationForm} onSubmit={handleSubmit}>
        <div className={styles.stepCount}>Step {step + 1} of {steps.length}</div>

        {error ? <p className={styles.formError}>{error}</p> : null}

        {step === 0 && (
          <div className={styles.creationStep}>
            <div>
              <p className={styles.creationEyebrow}>Let&apos;s start with the basics</p>
              <h1>What should we call your trip?</h1>
              <p className={styles.creationDescription}>
                Pick a name everyone in your group will recognize.
              </p>
            </div>
            <label>
              Trip name
              <input
                autoFocus
                name="tripName"
                onInput={(event) => setTripName(event.currentTarget.value)}
                placeholder="e.g. Muskoka Weekend"
                value={tripName}
              />
            </label>
          </div>
        )}

        {step === 1 && (
          <div className={styles.creationStep}>
            <div>
              <p className={styles.creationEyebrow}>Mark the calendar</p>
              <h1>When is the adventure?</h1>
              <p className={styles.creationDescription}>
                These dates help keep every memory in the right place.
              </p>
            </div>
            <div className={styles.dateFields}>
              <label>
                Start date
                <input
                  autoFocus
                  name="startDate"
                  onInput={(event) => setStartDate(event.currentTarget.value)}
                  type="date"
                  value={startDate}
                />
              </label>
              <label>
                End date
                <input
                  min={startDate}
                  name="endDate"
                  onInput={(event) => setEndDate(event.currentTarget.value)}
                  type="date"
                  value={endDate}
                />
              </label>
            </div>
          </div>
        )}

        {step === 2 && (
          <div className={styles.creationStep}>
            <div>
              <p className={styles.creationEyebrow}>One last detail</p>
              <h1>Where are you headed?</h1>
              <p className={styles.creationDescription}>
                Add the city, region, or place at the heart of your trip.
              </p>
            </div>
            <label>
              Destination
              <input
                autoFocus
                name="destination"
                onInput={(event) => setDestination(event.currentTarget.value)}
                placeholder="e.g. Muskoka, Ontario"
                value={destination}
              />
            </label>
          </div>
        )}

        <div className={styles.creationActions}>
          {step > 0 ? (
            <button className={styles.backButton} onClick={() => setStep((current) => current - 1)} type="button">
              <ArrowLeft aria-hidden="true" size={20} />
              Back
            </button>
          ) : <span />}

          <button className={styles.continueButton} disabled={!canContinue || isPending} type="submit">
            {step === steps.length - 1 ? (isPending ? "Creating..." : "Create trip") : "Continue"}
            {step === steps.length - 1
              ? <Check aria-hidden="true" size={20} />
              : <ArrowRight aria-hidden="true" size={20} />}
          </button>
        </div>
      </form>
    </section>
  );
}
