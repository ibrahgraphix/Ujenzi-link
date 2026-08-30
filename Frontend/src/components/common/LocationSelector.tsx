import React, { useState, useEffect } from 'react';
import { MapPin, RotateCcw } from 'lucide-react';
import { TANZANIA_LOCATIONS } from '../../data/mockData';
import { LocationHierarchy } from '../../types';

interface LocationSelectorProps {
  value?: LocationHierarchy;
  onChange: (location: LocationHierarchy) => void;
  showAllLevels?: boolean; // if true, shows ward and street
  compact?: boolean;
  className?: string;
}

export const LocationSelector: React.FC<LocationSelectorProps> = ({
  value = { country: 'Tanzania', region: '', district: '', ward: '', street: '' },
  onChange,
  showAllLevels = true,
  compact = false,
  className = '',
}) => {
  const [selectedRegion, setSelectedRegion] = useState<string>(value?.region || '');
  const [selectedDistrict, setSelectedDistrict] = useState<string>(value?.district || '');
  const [selectedWard, setSelectedWard] = useState<string>(value?.ward || '');
  const [selectedStreet, setSelectedStreet] = useState<string>(value?.street || '');

  useEffect(() => {
    setSelectedRegion(value?.region || '');
    setSelectedDistrict(value?.district || '');
    setSelectedWard(value?.ward || '');
    setSelectedStreet(value?.street || '');
  }, [value?.region, value?.district, value?.ward, value?.street]);

  const currentRegionData = TANZANIA_LOCATIONS.regions.find((r) => r.name === selectedRegion);
  const currentDistrictData = currentRegionData?.districts.find((d) => d.name === selectedDistrict);
  const currentWardData = currentDistrictData?.wards?.find((w) => w.name === selectedWard);

  const handleRegionChange = (newRegion: string) => {
    setSelectedRegion(newRegion);
    setSelectedDistrict('');
    setSelectedWard('');
    setSelectedStreet('');
    onChange({
      country: 'Tanzania',
      region: newRegion,
      district: '',
      ward: '',
      street: '',
    });
  };

  const handleDistrictChange = (newDistrict: string) => {
    setSelectedDistrict(newDistrict);
    setSelectedWard('');
    setSelectedStreet('');
    onChange({
      country: 'Tanzania',
      region: selectedRegion,
      district: newDistrict,
      ward: '',
      street: '',
    });
  };

  const handleWardChange = (newWard: string) => {
    setSelectedWard(newWard);
    setSelectedStreet('');
    onChange({
      country: 'Tanzania',
      region: selectedRegion,
      district: selectedDistrict,
      ward: newWard,
      street: '',
    });
  };

  const handleStreetChange = (newStreet: string) => {
    setSelectedStreet(newStreet);
    onChange({
      country: 'Tanzania',
      region: selectedRegion,
      district: selectedDistrict,
      ward: selectedWard,
      street: newStreet,
    });
  };

  const handleReset = () => {
    setSelectedRegion('');
    setSelectedDistrict('');
    setSelectedWard('');
    setSelectedStreet('');
    onChange({
      country: 'Tanzania',
      region: '',
    });
  };

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

      <div className={`grid gap-2.5 ${compact ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-4'}`}>
        {/* Region */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">Region</label>
          <select
            value={selectedRegion}
            onChange={(e) => handleRegionChange(e.target.value)}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 focus:border-[#2E86D8] focus:outline-none focus:ring-2 focus:ring-[#2E86D8]/20"
          >
            <option value="">All Regions</option>
            {TANZANIA_LOCATIONS.regions.map((r) => (
              <option key={r.name} value={r.name}>
                {r.name}
              </option>
            ))}
          </select>
        </div>

        {/* District */}
        <div>
          <label className="block text-[11px] font-semibold text-slate-500 mb-1">District</label>
          <select
            value={selectedDistrict}
            onChange={(e) => handleDistrictChange(e.target.value)}
            disabled={!selectedRegion || !currentRegionData}
            className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus:border-[#2E86D8] focus:outline-none focus:ring-2 focus:ring-[#2E86D8]/20"
          >
            <option value="">{selectedRegion ? 'All Districts' : 'Select Region first'}</option>
            {currentRegionData?.districts.map((d) => (
              <option key={d.name} value={d.name}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        {/* Ward */}
        {showAllLevels && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Ward / Area</label>
            <select
              value={selectedWard}
              onChange={(e) => handleWardChange(e.target.value)}
              disabled={!selectedDistrict || !currentDistrictData}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus:border-[#2E86D8] focus:outline-none focus:ring-2 focus:ring-[#2E86D8]/20"
            >
              <option value="">{selectedDistrict ? 'All Wards' : 'Select District first'}</option>
              {currentDistrictData?.wards?.map((w) => (
                <option key={w.name} value={w.name}>
                  {w.name}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Street */}
        {showAllLevels && (
          <div>
            <label className="block text-[11px] font-semibold text-slate-500 mb-1">Street / Landmark</label>
            <select
              value={selectedStreet}
              onChange={(e) => handleStreetChange(e.target.value)}
              disabled={!selectedWard || !currentWardData}
              className="w-full rounded-xl border border-slate-300 bg-white px-3 py-2 text-xs text-slate-900 disabled:bg-slate-100 disabled:text-slate-400 focus:border-[#2E86D8] focus:outline-none focus:ring-2 focus:ring-[#2E86D8]/20"
            >
              <option value="">{selectedWard ? 'All Streets' : 'Select Ward first'}</option>
              {currentWardData?.streets?.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Selected location summary badge */}
      {selectedRegion && (
        <div className="flex items-center gap-1.5 text-xs text-slate-600 bg-slate-100 px-3 py-1.5 rounded-lg">
          <span className="font-semibold text-slate-800">Filtered:</span>
          <span>
            {selectedRegion}
            {selectedDistrict ? ` > ${selectedDistrict}` : ''}
            {selectedWard ? ` > ${selectedWard}` : ''}
            {selectedStreet ? ` > ${selectedStreet}` : ''}
          </span>
        </div>
      )}
    </div>
  );
};
