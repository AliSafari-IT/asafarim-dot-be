export interface TestRunRequest {
    runId: string;
    runName: string;
    functionalRequirementId?: string;
    testSuites?: TestSuite[];
    testCases?: TestCase[];
    environment: string;
    browser: string;
    apiUrl: string;
    userId: string;
}

export interface TestSuite {
    id: string;
    name: string;
    fixtureId: string;
    testCases: TestCase[];
}

export interface TestCase {
    id: string;
    name: string;
    testType: 'steps' | 'script';
    steps?: TestStep[];
    scriptText?: string;
    testDataSets?: TestDataSet[];
    timeout?: number;
    retryCount?: number;
}

export interface TestStep {
    action: 'navigate' | 'click' | 'type' | 'select' | 'wait' | 'assert' | 'screenshot';
    target?: string;
    value?: string;
    description?: string;
}

export interface TestDataSet {
    id: string;
    name: string;
    data: Record<string, any>;
}

export interface TestResult {
    testCaseId: string;
    testDataSetId?: string;
    status: 'passed' | 'failed' | 'skipped' | 'error';
    duration: number;
    errorMessage?: string;
    stackTrace?: string;
    screenshots?: string[];
}

export interface TestRunStatus {
    runId: string;
    status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
    totalTests: number;
    completedTests: number;
    passedTests: number;
    failedTests: number;
    skippedTests: number;
    currentTest?: string;
    progress: number;
    error?: {
        message?: string;
        stack?: string;
        name?: string;
        code?: string | number;
        details?: any;
    };
}