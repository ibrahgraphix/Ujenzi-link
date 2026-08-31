import React, { useState, useEffect } from 'react';
import { MapPin, RotateCcw } from 'lucide-react';
import { LocationHierarchy } from '../../types';
import {
  getRegions,
  getDistrictsByRegion,
} from '../../services/locationsService';

interface LocationSelectorProps {
  value?: LocationHierarchy;
  onChange: (location: LocationHierarchy) => void;
  compact?: boolean;
  className?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  value = { country: 'Tanzania', region: '', district: '' },
  onChange,
  compact = false,
  className = '',
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>(value?.region || '');
  const [selectedDistrict, setSelectedDistrict] = useState<string>(value?.district || '');

  const [regionsList, setRegionsList] = useState<string[]>([]);
  const [districtsList, setDistrictsList] = useState<string[]>([]);

  // Load regions on mount
  useEffect(() => {
    getRegions().then((regs) => setRegionsList(regs || []));
  }, []);

  // Sync from external value changes
  useEffect(() => {
    setSelectedRegion(value?.region || '');
    setSelectedDistrict(value?.district || '');
  }, [value?.region, value?.district]);

  // Load districts when region changes
  useEffect(() => {
    if (selectedRegion) {
      getDistrictsByRegion(selectedRegion).then((dists) => setDistrictsList(dists || []));
    } else {
      setDistrictsList([]);
    }
  }, [selectedRegion]);

  const handleRegionChange = (newRegion: string) => {
    setSelectedRegion(newRegion);
    setSelectedDistrict('');
    onChange({ country: 'Tanzania', region: newRegion, district: '' });
  };

  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    onChange({
      country: 'Tanzania',
      region: selectedRegion,
      district: newDistrict,
    });
  };

  const handleReset = () => {
    setSelectedRegion('');
    setSelectedDistrict('');
    onChange({ country: 'Tanzania', region: '', district: '' });
  };

  const selectClass =
    'w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus:border-[#2E86D8] focus:outline-none focus:ring-2 focus:ring-[#2E86D8]/20';

  return (
    <div className={`space-y-3 ${className}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-slate-700">
          <MapPin className="w-3.5 h-3.5 text-[#2E86D8]" />
          <span>Location (Tanzania)</span>
        </div>
        {selectedRegion && (
          <button
            type="button"
            onClick={handleReset}
            className="inline-flex items-center gap-1 text-xs text-[#2E86D8] hover:text-[#1B3A6B] font-medium"
          >
            <RotateCcw className="w-3 h-3" /> Clear Location
          </button>
        )}
      </div>

      <div
        className={`grid gap-2.5 ${
          compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'
        }`}
      >
        {/* Region */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Region *</label>
          <select value={selectedRegion} onChange={(e) => handleRegionChange(e.target.value)} className={selectClass}>
            <option value="">Select Region</option>
            {regionsList.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">District *</label>
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            disabled={!selectedRegion}
            className={selectClass}
          >
            <option value="">{selectedRegion ? 'Select District' : 'Select Region first'}</option>
            {districtsList.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Selected location summary */}
      {selectedRegion && (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
          <span className="font-semibold text-slate-800">Location:</span>
          <span>
            {selectedRegion}
            {selectedDistrict ? ` › ${selectedDistrict}` : ''}
          </span>
        </div>
      )}
    </div>
  );
};
