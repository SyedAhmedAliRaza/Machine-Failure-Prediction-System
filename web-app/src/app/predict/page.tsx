"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { makePrediction } from "@/actions/predict-actions";
import { getSessionUser } from "@/actions/auth-actions";
import { FEATURE_RANGES } from "@/lib/model";
import type { PredictionResult } from "@/lib/model";
import Navbar from "@/components/navbar";

const FIELD_CONFIG = [
  {
    key: "airTemp" as const,
    label: "Air Temperature",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707" />
    ),
  },
  {
    key: "processTemp" as const,
    label: "Process Temperature",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2z" />
    ),
  },
  {
    key: "rotationalSpeed" as const,
    label: "Rotational Speed",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
    ),
  },
  {
    key: "torque" as const,
    label: "Torque",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
    ),
  },
  {
    key: "toolWear" as const,
    label: "Tool Wear",
    icon: (
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
    ),
  },
];

interface NavUser {
  name?: string | null;
  email?: string | null;
}

export default function PredictPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<PredictionResult | null>(null);
  const [error, setError] = useState("");
  const [modelType, setModelType] = useState<string>("both");
  
  // Fetch user object to display real name on navbar
  const [navUser, setNavUser] = useState<NavUser | null>(null);

  useEffect(() => {
    getSessionUser().then((user) => {
      if (user) setNavUser(user);
    });
  }, []);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError("");
    setResult(null);

    formData.set("modelType", modelType);
    const response = await makePrediction(formData);

    if (response.error) {
      setError(response.error);
    } else if (response.result) {
      setResult(response.result);
    }
    setLoading(false);
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={navUser} />

      <main className="mx-auto max-w-4xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-text-primary">
            Machine Failure Prediction
          </h1>
          <p className="mt-2 text-text-secondary">
            Enter sensor readings below and our ML models will predict the probability of machine failure.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Form */}
          <div className="lg:col-span-3">
            <form action={handleSubmit} className="glass-card p-6 animate-slide-up">
              <div className="mb-6 border-b border-border pb-4">
                <h2 className="text-lg font-bold text-text-primary">Sensor Readings</h2>
                <p className="text-sm text-text-muted">Enter values from your machine sensors</p>
              </div>

              <div className="space-y-5">
                {FIELD_CONFIG.map((field) => {
                  const range = FEATURE_RANGES[field.key];
                  return (
                    <div key={field.key}>
                      <label
                        htmlFor={field.key}
                        className="mb-2 flex items-center gap-2 text-sm font-medium text-text-secondary"
                      >
                        <svg className="h-4 w-4 text-maroon-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {field.icon}
                        </svg>
                        {field.label}
                        <span className="ml-auto text-xs text-text-muted">
                          {range.min} - {range.max} {range.unit}
                        </span>
                      </label>
                      <input
                        id={field.key}
                        name={field.key}
                        type="number"
                        step={range.step}
                        min={range.min}
                        max={range.max}
                        required
                        placeholder={`e.g. ${((range.min + range.max) / 2).toFixed(1)}`}
                        className="input-dark"
                      />
                    </div>
                  );
                })}
              </div>

              {/* Model selector */}
              <div className="mt-6 border-t border-border pt-5">
                <label className="mb-3 block text-sm font-medium text-text-secondary">
                  Model Selection
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { value: "both", label: "Both Models" },
                    { value: "logistic_regression", label: "Logistic Reg." },
                    { value: "knn", label: "KNN" },
                  ].map((opt) => (
                    <button
                      key={opt.value}
                      type="button"
                      onClick={() => setModelType(opt.value)}
                      className={`rounded-lg border px-3 py-2.5 text-xs font-medium transition-all ${
                        modelType === opt.value
                          ? "border-maroon bg-maroon/15 text-maroon-light"
                          : "border-border bg-surface text-text-secondary hover:border-maroon/30"
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Error */}
              {error && (
                <div className="mt-5 rounded-lg border border-danger/30 bg-danger/10 p-4 text-sm text-danger">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="btn-maroon mt-6 w-full text-center disabled:opacity-50"
              >
                {loading ? (
                  <span className="inline-flex items-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    Analyzing...
                  </span>
                ) : (
                  "Run Prediction"
                )}
              </button>
            </form>
          </div>

          {/* Result Panel */}
          <div className="lg:col-span-2">
            {result ? (
              <div className="animate-slide-up space-y-4">
                {/* Primary Result */}
                <div className={`glass-card overflow-hidden ${result.bestPrediction ? "animate-pulse-glow" : ""}`}>
                  <div className={`px-6 py-3 ${result.bestPrediction ? "bg-danger/10" : "bg-success/10"}`}>
                    <span className={`text-sm font-bold ${result.bestPrediction ? "text-danger" : "text-success"}`}>
                      {result.bestPrediction ? "FAILURE PREDICTED" : "MACHINE OK"}
                    </span>
                  </div>
                  <div className="p-6">
                    {/* Probability Gauge */}
                    <div className="mb-6 text-center">
                      <div className="relative mx-auto h-32 w-32">
                        <svg className="h-full w-full -rotate-90" viewBox="0 0 100 100">
                          <circle cx="50" cy="50" r="40" fill="none" stroke="#262626" strokeWidth="8" />
                          <circle
                            cx="50"
                            cy="50"
                            r="40"
                            fill="none"
                            stroke={result.bestProbability >= 50 ? "#ef4444" : "#22c55e"}
                            strokeWidth="8"
                            strokeLinecap="round"
                            strokeDasharray={`${result.bestProbability * 2.51} 251`}
                            className="transition-all duration-1000"
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className="text-2xl font-extrabold text-text-primary">
                            {result.bestProbability.toFixed(1)}%
                          </span>
                          <span className="text-xs text-text-muted">Failure Risk</span>
                        </div>
                      </div>
                    </div>

                    {result.bestPrediction === 1 && (
                      <div className="mb-4 rounded-lg border border-danger/20 bg-danger/5 p-3 text-center">
                        <span className="text-xs text-text-muted">Failure Type</span>
                        <div className="mt-1 text-sm font-bold text-danger">
                          {result.bestFailureType}
                        </div>
                      </div>
                    )}

                    <div className="rounded-lg border border-border bg-surface/50 p-3 text-center">
                      <span className="text-xs text-text-muted">Best Model</span>
                      <div className="mt-1 text-sm font-semibold text-text-primary">
                        {result.bestModel}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Individual Model Results */}
                {result.results.length > 1 && (
                  <div className="glass-card p-6">
                    <h3 className="mb-4 text-sm font-bold text-text-secondary">Model Comparison</h3>
                    <div className="space-y-3">
                      {result.results.map((r, i) => (
                        <div key={i} className="flex items-center justify-between rounded-lg border border-border bg-surface/50 p-3">
                          <span className="text-sm text-text-secondary">{r.model}</span>
                          <span
                            className={`text-sm font-bold ${
                              r.probability >= 50 ? "text-danger" : "text-success"
                            }`}
                          >
                            {r.probability.toFixed(1)}%
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Actions after prediction */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => { setResult(null); router.refresh(); }}
                    className="btn-outline flex-1 !py-2 text-center text-sm"
                  >
                    New Prediction
                  </button>
                  <a href="/history" className="btn-outline flex-1 !py-2 text-center text-sm">
                    View History
                  </a>
                </div>
              </div>
            ) : (
              <div className="glass-card flex flex-col items-center justify-center p-12 text-center">
                <svg className="mb-4 h-16 w-16 text-text-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-sm text-text-muted">
                  Enter sensor readings and click &quot;Run Prediction&quot; to see results here.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
