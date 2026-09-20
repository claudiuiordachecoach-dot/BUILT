import { getClientId, getMetricHistory, getNutritionLogs } from "../actions";
import EvolutionDashboard from "./EvolutionDashboard";

export default async function EvolutiePage() {
  const clientId = await getClientId();
  
  if (!clientId) {
    return (
      <div className="p-8 text-center text-zinc-500">
        Nu te-am putut identifica. Încearcă să te loghezi din nou.
      </div>
    );
  }

  // Fetch data in parallel
  const [metricsData, nutritionLogs] = await Promise.all([
    getMetricHistory(clientId),
    getNutritionLogs(clientId)
  ]);

  return (
    <EvolutionDashboard 
      metrics={metricsData.points}
      targetWeight={metricsData.targetWeight}
      nutritionLogs={nutritionLogs}
    />
  );
}
