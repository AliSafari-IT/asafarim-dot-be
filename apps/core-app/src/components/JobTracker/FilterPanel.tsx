import { useState } from 'react';
import type { JobStatus } from '../../types/jobTypes';
import './FilterPanel.css';

export interface FilterCriteria {
  status?: JobStatus | 'All';
  city?: string;
  company?: string;
}

interface FilterPanelProps {
  onFilterChange: (filters: FilterCriteria) => void;
  cities: string[];
  companies: string[];
}

const FilterPanel = ({ onFilterChange, cities, companies }: FilterPanelProps) => {
  const [filters, setFilters] = useState<FilterCriteria>({
    status: 'All',
    city: '',
    company: '',
  });

  const handleStatusChange = (status: JobStatus | 'All') => {
    const newFilters = { ...filters, status };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCityChange = (city: string) => {
    const newFilters = { ...filters, city };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleCompanyChange = (company: string) => {
    const newFilters = { ...filters, company };
    setFilters(newFilters);
    onFilterChange(newFilters);
  };

  const handleReset = () => {
    const resetFilters: FilterCriteria = { status: 'All', city: '', company: '' };
    setFilters(resetFilters);
    onFilterChange(resetFilters);
  };

  return (
    <div className="filter-panel">
      <div className="filter-header">
        <h3>Filter Jobs</h3>
        <button className="reset-btn" onClick={handleReset}>Reset</button>
      </div>

      <div className="filter-group">
        <label>Status</label>
        <select value={filters.status || 'All'} onChange={(e) => handleStatusChange(e.target.value as JobStatus | 'All')}>
          <option value="All">All Statuses</option>
          <option value="Applied">Applied</option>
          <option value="Interview">Interview</option>
          <option value="Offer">Offer</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="filter-group">
        <label>City</label>
        <select value={filters.city || ''} onChange={(e) => handleCityChange(e.target.value)}>
          <option value="">All Cities</option>
          {cities.map((city) => (
            <option key={city} value={city}>
              {city}
            </option>
          ))}
        </select>
      </div>

      <div className="filter-group">
        <label>Company</label>
        <select value={filters.company || ''} onChange={(e) => handleCompanyChange(e.target.value)}>
          <option value="">All Companies</option>
          {companies.map((company) => (
            <option key={company} value={company}>
              {company}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default FilterPanel;
