import { getTestRunReport } from "../config/api";

// apps/test-automation-ui/src/hooks/useTestrunReport.ts
export async function fetchTestRunReport(id: string, format: "html" | "json"): Promise<string> {
    try {
        const response = await getTestRunReport(id, format);
        // When responseType is 'text', axios puts the string directly in response.data
        return typeof response.data === 'string' ? response.data : JSON.stringify(response.data);
    } catch (error) {
        console.error("Error fetching report:", error);
        throw error instanceof Error ? error : new Error("Unknown error");
    }
}