import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getPredictionStats, getPredictionHistory } from "@/actions/predict-actions";
import Navbar from "@/components/navbar";

export default async function DashboardPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const stats = await getPredictionStats();
  const { predictions } = await getPredictionHistory();
  const recent = predictions.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={session.user} />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        {/* Welcome Banner */}
        <div className="mb-8 animate-fade-in">
          <h1 className="text-3xl font-bold text-text-primary sm:text-4xl">
            Welcome back,{" "}
            <span className="bg-gradient-to-r from-maroon-light to-maroon-glow bg-clip-text text-transparent">
              {session.user.name}
            </span>
          </h1>
          <p className="mt-2 text-text-secondary">
            Monitor your machine health predictions and track maintenance insights.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="mb-10 grid gap-6 sm:grid-cols-3 animate-slide-up">
          {/* Total Predictions */}
          <div className="glass-card p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-maroon/10">
                <svg className="h-5 w-5 text-maroon-light" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-text-secondary">Total Predictions</span>
            </div>
            <div className="text-3xl font-extrabold text-text-primary">{stats.total}</div>
          </div>

          {/* Failures Detected */}
          <div className="glass-card p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-danger/10">
                <svg className="h-5 w-5 text-danger" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-text-secondary">Failures Detected</span>
            </div>
            <div className="text-3xl font-extrabold text-danger">{stats.failures}</div>
          </div>

          {/* Success Rate */}
          <div className="glass-card p-6">
            <div className="mb-3 flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
                <svg className="h-5 w-5 text-success" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-sm font-medium text-text-secondary">Machine OK Rate</span>
            </div>
            <div className="text-3xl font-extrabold text-success">{stats.successRate}%</div>
          </div>
        </div>

        {/* Actions Row */}
        <div className="mb-10 flex flex-col gap-4 sm:flex-row">
          <Link href="/predict" className="btn-maroon inline-flex items-center justify-center gap-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            New Prediction
          </Link>
          <Link href="/history" className="btn-outline inline-flex items-center justify-center gap-2">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            View All History
          </Link>
        </div>

        {/* Recent Predictions */}
        <div className="glass-card overflow-hidden animate-slide-up" style={{ animationDelay: "200ms" }}>
          <div className="border-b border-border px-6 py-4">
            <h2 className="text-lg font-bold text-text-primary">Recent Predictions</h2>
          </div>
          {recent.length === 0 ? (
            <div className="px-6 py-16 text-center">
              <svg className="mx-auto mb-4 h-12 w-12 text-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p className="text-text-secondary">No predictions yet.</p>
              <Link href="/predict" className="mt-4 inline-block text-sm font-medium text-maroon-light hover:text-maroon-glow">
                Make your first prediction &rarr;
              </Link>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-text-muted">
                    <th className="px-6 py-3 font-medium">Date</th>
                    <th className="px-6 py-3 font-medium">Air Temp</th>
                    <th className="px-6 py-3 font-medium">Torque</th>
                    <th className="px-6 py-3 font-medium">Probability</th>
                    <th className="px-6 py-3 font-medium">Result</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((p) => (
                    <tr key={p.id} className="border-b border-border/50 transition-colors hover:bg-surface">
                      <td className="px-6 py-4 text-text-secondary">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-text-primary">{p.airTemp} K</td>
                      <td className="px-6 py-4 text-text-primary">{p.torque} Nm</td>
                      <td className="px-6 py-4">
                        <span className={p.failureProbability >= 50 ? "text-danger font-semibold" : "text-success font-semibold"}>
                          {p.failureProbability.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            p.predictedFailure
                              ? "bg-danger/10 text-danger border border-danger/20"
                              : "bg-success/10 text-success border border-success/20"
                          }`}
                        >
                          {p.predictedFailure ? "FAILURE" : "OK"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
