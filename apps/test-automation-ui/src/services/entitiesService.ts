import { api } from "../config/api";

export interface TestSuite {
  id: string;
  fixtureId: string;
  name: string;
  description?: string;
  executionOrder: number;
  isActive: boolean;
  generatedTestCafeFile?: string;
  generatedFilePath?: string;
  createdAt: string;
  updatedAt: string;
}

export interface TestRun {
  id: string;
  testSuiteId: string;
  status: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  totalTests: number;
  passedTests: number;
  failedTests: number;
}

export interface TestRunResult {
  id: string;
  testRunId: string;
  testCaseId: string;
  status: string;
  startedAt: string;
  completedAt: string;
  durationMs: number;
  errorMessage?: string;
  stackTrace?: string;
}

export interface TestCase {
  id: string;
  testSuiteId: string;
  name: string;
  description?: string;
  executionOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface TestRunResultAttachment {
  id: string;
  testRunResultId: string;
  name: string;
  type: string;
  data: string;
}

export const getFunctionalRequirementId = async (fixtureId: string): Promise<string | null> => {
  try {
    const response = await api.get(`/api/fixtures/${fixtureId}`);
    return response.data.functionalRequirementId || null;
  } catch (error) {
    console.error('Failed to fetch functional requirement ID for fixture:', fixtureId, error);
    return null;
  }
};