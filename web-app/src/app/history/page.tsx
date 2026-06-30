import { redirect } from "next/navigation";
import Link from "next/link";
import { auth } from "@/lib/auth";
import { getPredictionHistory } from "@/actions/predict-actions";
import Navbar from "@/components/navbar";

export default async function HistoryPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }

  const { predictions } = await getPredictionHistory();

  return (
    <div className="min-h-screen bg-background">
      <Navbar user={session.user} />

      <main className="mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between animate-fade-in">
          <div>
            <h1 className="text-3xl font-bold text-text-primary">Prediction History</h1>
            <p className="mt-2 text-text-secondary">
              {predictions.length} prediction{predictions.length !== 1 ? "s" : ""} recorded
            </p>
          </div>
          <Link href="/predict" className="btn-maroon !py-2.5 !px-5 text-sm">
            + New Prediction
          </Link>
        </div>

        {predictions.length === 0 ? (
          <div className="glass-card flex flex-col items-center justify-center py-24 text-center animate-fade-in">
            <svg className="mb-4 h-16 w-16 text-text-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="mb-2 text-lg font-semibold text-text-secondary">No predictions yet</h3>
            <p className="mb-6 text-sm text-text-muted">Make your first prediction to see it here.</p>
            <Link href="/predict" className="btn-maroon !py-2 text-sm">
              Make First Prediction
            </Link>
          </div>
        ) : (
          <div className="glass-card overflow-hidden animate-slide-up">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-left">
                    <th className="px-5 py-4 font-semibold text-text-muted">Date</th>
                    <th className="px-5 py-4 font-semibold text-text-muted">Air Temp (K)</th>
                    <th className="px-5 py-4 font-semibold text-text-muted">Process Temp (K)</th>
                    <th className="px-5 py-4 font-semibold text-text-muted">Speed (rpm)</th>
                    <th className="px-5 py-4 font-semibold text-text-muted">Torque (Nm)</th>
                    <th className="px-5 py-4 font-semibold text-text-muted">Tool Wear (min)</th>
                    <th className="px-5 py-4 font-semibold text-text-muted">Probability</th>
                    <th className="px-5 py-4 font-semibold text-text-muted">Result</th>
                    <th className="px-5 py-4 font-semibold text-text-muted">Type</th>
                    <th className="px-5 py-4 font-semibold text-text-muted">Model</th>
                  </tr>
                </thead>
                <tbody>
                  {predictions.map((p) => (
                    <tr
                      key={p.id}
                      className="border-b border-border/50 transition-colors hover:bg-surface"
                    >
                      <td className="whitespace-nowrap px-5 py-4 text-text-secondary">
                        {new Date(p.createdAt).toLocaleString()}
                      </td>
                      <td className="px-5 py-4 text-text-primary">{p.airTemp}</td>
                      <td className="px-5 py-4 text-text-primary">{p.processTemp}</td>
                      <td className="px-5 py-4 text-text-primary">{p.rotationalSpeed}</td>
                      <td className="px-5 py-4 text-text-primary">{p.torque}</td>
                      <td className="px-5 py-4 text-text-primary">{p.toolWear}</td>
                      <td className="px-5 py-4">
                        <span
                          className={`font-semibold ${
                            p.failureProbability >= 50
                              ? "text-danger"
                              : "text-success"
                          }`}
                        >
                          {p.failureProbability.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <span
                          className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold ${
                            p.predictedFailure
                              ? "border border-danger/20 bg-danger/10 text-danger"
                              : "border border-success/20 bg-success/10 text-success"
                          }`}
                        >
                          {p.predictedFailure ? "FAILURE" : "OK"}
                        </span>
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-text-muted">
                        {p.failureType}
                      </td>
                      <td className="whitespace-nowrap px-5 py-4 text-xs text-text-muted">
                        {p.modelUsed}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
