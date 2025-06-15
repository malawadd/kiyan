import React, { useState } from "react";
import { useAction } from "convex/react";
import { api } from "../../convex/_generated/api";
import { Id } from "../../convex/_generated/dataModel";

interface StartStopAgentButtonProps {
  agentId: Id<"agents">;
  status: "active" | "stopped" | "paused";
  sessionId: Id<"sessions">;
  apiKey: string;
  onStatusChange?: (newStatus: "active" | "stopped") => void;
}

export const StartStopAgentButton: React.FC<StartStopAgentButtonProps> = ({
  agentId,
  status,
  sessionId,
  apiKey,
  onStatusChange,
}) => {
  const [loading, setLoading] = useState(false);
  const startAgent = useAction(api.fleekAgents.startAgentViaFleek);
  const stopAgent = useAction(api.fleekAgents.stopAgentViaFleek);
  const [error, setError] = useState<string | null>(null);

  const handleClick = async () => {
    setLoading(true);
    setError(null);
    try {
      if (status === "active") {
        await stopAgent({ sessionId, agentId, apiKey });
        onStatusChange?.("stopped");
      } else {
        await startAgent({ sessionId, agentId, apiKey });
        onStatusChange?.("active");
      }
    } catch (err: any) {
      setError(err.message || "Failed to update agent status");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="inline-block">
      <button
        className={`nb-button px-4 py-2 font-bold text-sm ${
          status === "active"
            ? "nb-button-warning bg-red-500 hover:bg-red-600 text-white"
            : "nb-button-success bg-green-500 hover:bg-green-600 text-white"
        }`}
        // eslint-disable-next-line @typescript-eslint/no-misused-promises
        onClick={handleClick}
        disabled={loading}
        title={status === "active" ? "Stop agent" : "Start agent"}
      >
        {loading
          ? "..."
          : status === "active"
          ? "Stop"
          : "Start"}
      </button>
      {error && (
        <div className="text-xs text-red-700 mt-1 font-bold">{error}</div>
      )}
    </div>
  );
};
