-- Test Automation Platform Database Schema
-- PostgreSQL Database

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Users table
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    username VARCHAR(100) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(500) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('Tester', 'Developer', 'Admin')),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Functional Requirements table
CREATE TABLE functional_requirements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(255) NOT NULL,
    description TEXT,
    project_name VARCHAR(255),
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true
);

-- Test Fixtures table
CREATE TABLE test_fixtures (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    functional_requirement_id UUID REFERENCES functional_requirements(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    page_url VARCHAR(500),
    setup_script JSONB,
    teardown_script JSONB,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test Suites table
CREATE TABLE test_suites (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    fixture_id UUID REFERENCES test_fixtures(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    execution_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test Cases table
CREATE TABLE test_cases (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_suite_id UUID REFERENCES test_suites(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    test_type VARCHAR(50) CHECK (test_type IN ('steps', 'script')),
    steps JSONB, -- For step-based tests
    script_text TEXT, -- For raw TestCafe scripts
    timeout_ms INT DEFAULT 30000,
    retry_count INT DEFAULT 0,
    is_active BOOLEAN DEFAULT true,
    created_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test Data Sets table
CREATE TABLE test_data_sets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_case_id UUID REFERENCES test_cases(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    input_data JSONB NOT NULL,
    expected_output JSONB,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test Runs table (master record for test execution)
CREATE TABLE test_runs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    run_name VARCHAR(255),
    functional_requirement_id UUID REFERENCES functional_requirements(id),
    environment VARCHAR(100),
    browser VARCHAR(50),
    status VARCHAR(50) CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    started_at TIMESTAMP,
    completed_at TIMESTAMP,
    executed_by UUID REFERENCES users(id),
    trigger_type VARCHAR(50) CHECK (trigger_type IN ('manual', 'scheduled', 'ci_cd')),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Test Results table
CREATE TABLE test_results (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    test_run_id UUID REFERENCES test_runs(id) ON DELETE CASCADE,
    test_case_id UUID REFERENCES test_cases(id),
    test_data_set_id UUID REFERENCES test_data_sets(id),
    test_suite_id UUID REFERENCES test_suites(id),
    fixture_id UUID REFERENCES test_fixtures(id),
    functional_requirement_id UUID REFERENCES functional_requirements(id),
    status VARCHAR(50) CHECK (status IN ('passed', 'failed', 'skipped', 'error')),
    duration_ms INT,
    error_message TEXT,
    stack_trace TEXT,
    screenshots JSONB,
    json_report JSONB,
    run_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    executed_by UUID REFERENCES users(id)
);

-- Audit Logs table
CREATE TABLE audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(100),
    entity_id UUID,
    old_values JSONB,
    new_values JSONB,
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create indexes for better performance
CREATE INDEX idx_functional_requirements_created_by ON functional_requirements(created_by);
CREATE INDEX idx_test_fixtures_functional_requirement ON test_fixtures(functional_requirement_id);
CREATE INDEX idx_test_suites_fixture ON test_suites(fixture_id);
CREATE INDEX idx_test_cases_suite ON test_cases(test_suite_id);
CREATE INDEX idx_test_data_sets_test_case ON test_data_sets(test_case_id);
CREATE INDEX idx_test_results_run ON test_results(test_run_id);
CREATE INDEX idx_test_results_test_case ON test_results(test_case_id);
CREATE INDEX idx_test_runs_status ON test_runs(status);
CREATE INDEX idx_test_runs_executed_by ON test_runs(executed_by);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_entity ON audit_logs(entity_type, entity_id);

-- Create updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at columns
CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_functional_requirements_updated_at BEFORE UPDATE ON functional_requirements
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_fixtures_updated_at BEFORE UPDATE ON test_fixtures
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_suites_updated_at BEFORE UPDATE ON test_suites
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_cases_updated_at BEFORE UPDATE ON test_cases
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_test_data_sets_updated_at BEFORE UPDATE ON test_data_sets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

    