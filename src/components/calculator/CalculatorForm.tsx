import { useState, useEffect, useCallback } from 'react';
import type { CalculatorInput, CalculatorResult, FitzpatrickType, AgeGroup, SurfaceType } from '../../lib/types';
import { calculate } from '../../lib/calculator';
import { getElevation } from '../../lib/geocoding';
import InteractiveMap from '../map/InteractiveMap';
import SkinTypeSelector from './SkinTypeSelector';
import ClothingSelector from './ClothingSelector';
import ResultsPanel from './ResultsPanel';

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function CalculatorForm() {
  // Location state
  const [latitude, setLatitude] = useState(40.7);
  const [longitude, setLongitude] = useState(-74.0);
  const [elevation, setElevation] = useState(0);

  // Personal state
  const [skinType, setSkinType] = useState<FitzpatrickType>(2);
  const [ageGroup, setAgeGroup] = useState<AgeGroup>('adult');
  const [outdoorMinutes, setOutdoorMinutes] = useState(30);
  const [outdoorStartHour, setOutdoorStartHour] = useState(10);
  const [outdoorEndHour, setOutdoorEndHour] = useState(14);
  const [exposedSkin, setExposedSkin] = useState(0.25);
  const [spf, setSpf] = useState(0);
  const [sunscreenCoverage, setSunscreenCoverage] = useState(0);

  // Environment state
  const [cloudCover, setCloudCover] = useState(40);
  const [surfaceType, setSurfaceType] = useState<SurfaceType>('grass');
  const [month, setMonth] = useState(new Date().getMonth() + 1);

  // Results
  const [result, setResult] = useState<CalculatorResult | null>(null);

  // Fetch elevation when location changes
  const handleLocationChange = useCallback(async (lat: number, lon: number) => {
    setLatitude(lat);
    setLongitude(lon);
    try {
      const elev = await getElevation(lat, lon);
      setElevation(elev);
    } catch {
      // Keep existing elevation
    }
  }, []);

  // Try to get user's location on mount
  useEffect(() => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => handleLocationChange(pos.coords.latitude, pos.coords.longitude),
        () => {} // Use default NYC if denied
      );
    }
  }, [handleLocationChange]);

  // Recalculate whenever inputs change
  useEffect(() => {
    const input: CalculatorInput = {
      location: { latitude, longitude, elevation_km: elevation },
      personal: {
        skinType,
        ageGroup,
        outdoorMinutes,
        outdoorStartHour,
        outdoorEndHour,
        exposedSkinFraction: exposedSkin,
        spf,
        sunscreenCoverage,
      },
      environment: {
        cloudCoverPercent: cloudCover,
        surfaceType,
        month,
      },
    };
    const r = calculate(input);
    setResult(r);
  }, [latitude, longitude, elevation, skinType, ageGroup, outdoorMinutes, outdoorStartHour, outdoorEndHour, exposedSkin, spf, sunscreenCoverage, cloudCover, surfaceType, month]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Hero */}
      <div className="text-center py-12">
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 mb-4">
          Vitamin D <span className="text-sunshine-500">Calculator</span>
        </h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Find out how much vitamin D your body produces from sunlight — and how much you should supplement.
          Backed by peer-reviewed science.
        </p>
      </div>

      {/* Map */}
      <div className="mb-8">
        <InteractiveMap
          latitude={latitude}
          longitude={longitude}
          onLocationChange={handleLocationChange}
        />
        <p className="text-xs text-gray-400 mt-2 text-center">
          Click the map or search to set your location. Drag the marker to fine-tune.
        </p>
      </div>

      {/* Form + Results grid */}
      <div className="grid lg:grid-cols-2 gap-8 mb-16">
        {/* Input form */}
        <div className="space-y-6">
          {/* Location & Environment */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-sunshine-500">&#9728;</span> Location & Environment
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Latitude</label>
                <input
                  type="number"
                  value={latitude.toFixed(2)}
                  onChange={e => setLatitude(parseFloat(e.target.value) || 0)}
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sunshine-400 focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Longitude</label>
                <input
                  type="number"
                  value={longitude.toFixed(2)}
                  onChange={e => setLongitude(parseFloat(e.target.value) || 0)}
                  step="0.1"
                  className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sunshine-400 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Elevation: {(elevation * 1000).toFixed(0)}m ({(elevation * 3280.84).toFixed(0)}ft)
              </label>
              <input
                type="range"
                min="0"
                max="5"
                step="0.01"
                value={elevation}
                onChange={e => setElevation(parseFloat(e.target.value))}
                className="w-full accent-sunshine-500"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Sea level</span>
                <span>5000m</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Month
              </label>
              <select
                value={month}
                onChange={e => setMonth(parseInt(e.target.value))}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sunshine-400 focus:outline-none"
              >
                {MONTH_NAMES.map((name, i) => (
                  <option key={i} value={i + 1}>{name}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Cloud Cover: {cloudCover}%
              </label>
              <input
                type="range"
                min="0"
                max="100"
                value={cloudCover}
                onChange={e => setCloudCover(parseInt(e.target.value))}
                className="w-full accent-sky-500"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>Clear sky</span>
                <span>Overcast</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Surface Type</label>
              <select
                value={surfaceType}
                onChange={e => setSurfaceType(e.target.value as SurfaceType)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sunshine-400 focus:outline-none"
              >
                <option value="grass">Grass / Park</option>
                <option value="concrete">Concrete / Urban</option>
                <option value="sand">Sand / Beach</option>
                <option value="water">Water / Lake</option>
                <option value="snow">Snow / Ice</option>
              </select>
            </div>
          </div>

          {/* Personal factors */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 space-y-5">
            <h2 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
              <span className="text-sky-500">&#9899;</span> Personal Factors
            </h2>

            <SkinTypeSelector value={skinType} onChange={setSkinType} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Age Group</label>
              <select
                value={ageGroup}
                onChange={e => setAgeGroup(e.target.value as AgeGroup)}
                className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sunshine-400 focus:outline-none"
              >
                <option value="infant">Infant (0-12 months)</option>
                <option value="child">Child / Teen (1-18)</option>
                <option value="adult">Adult (19-50)</option>
                <option value="older_adult">Older Adult (51-70)</option>
                <option value="elderly">Elderly (71+)</option>
                <option value="pregnant">Pregnant / Nursing</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Time Outdoors: {outdoorMinutes} min/day
              </label>
              <input
                type="range"
                min="0"
                max="240"
                step="5"
                value={outdoorMinutes}
                onChange={e => setOutdoorMinutes(parseInt(e.target.value))}
                className="w-full accent-sunshine-500"
              />
              <div className="flex justify-between text-xs text-gray-400">
                <span>0 min</span>
                <span>4 hours</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Outdoor Hours: {outdoorStartHour}:00 - {outdoorEndHour}:00
              </label>
              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min="6"
                  max="20"
                  value={outdoorStartHour}
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    setOutdoorStartHour(Math.min(val, outdoorEndHour - 1));
                  }}
                  className="w-full accent-sunshine-500"
                />
                <span className="text-xs text-gray-400 whitespace-nowrap">to</span>
                <input
                  type="range"
                  min="6"
                  max="20"
                  value={outdoorEndHour}
                  onChange={e => {
                    const val = parseInt(e.target.value);
                    setOutdoorEndHour(Math.max(val, outdoorStartHour + 1));
                  }}
                  className="w-full accent-sunshine-500"
                />
              </div>
            </div>

            <ClothingSelector value={exposedSkin} onChange={setExposedSkin} />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Sunscreen</label>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">SPF</label>
                  <select
                    value={spf}
                    onChange={e => {
                      const val = parseInt(e.target.value);
                      setSpf(val);
                      if (val === 0) setSunscreenCoverage(0);
                      else if (sunscreenCoverage === 0) setSunscreenCoverage(0.8);
                    }}
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-sunshine-400 focus:outline-none"
                  >
                    <option value="0">None</option>
                    <option value="15">SPF 15</option>
                    <option value="30">SPF 30</option>
                    <option value="50">SPF 50</option>
                    <option value="70">SPF 70</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">
                    Coverage: {Math.round(sunscreenCoverage * 100)}%
                  </label>
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.05"
                    value={sunscreenCoverage}
                    onChange={e => setSunscreenCoverage(parseFloat(e.target.value))}
                    className="w-full accent-sky-500 mt-2"
                    disabled={spf === 0}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Results */}
        <div className="lg:sticky lg:top-6 lg:self-start">
          <ResultsPanel result={result} />
        </div>
      </div>

      {/* Scientific references section */}
      <div className="mb-16 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <h2 className="text-xl font-bold text-gray-800 mb-4">Scientific Methodology</h2>
        <p className="text-sm text-gray-600 mb-6">
          This calculator combines multiple peer-reviewed models to estimate vitamin D synthesis.
          Here are the key scientific sources:
        </p>
        <div className="grid md:grid-cols-2 gap-4 text-xs text-gray-600">
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-gray-800">UV Index Model</p>
              <p>Madronich, S. (2007). Analytic Formula for the Clear-sky UV Index. <em>Photochemistry and Photobiology</em>, 83(6), 1537-1538.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Vitamin D Synthesis</p>
              <p>Holick, M.F. (2007). Vitamin D Deficiency. <em>NEJM</em>, 357(3), 266-281.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Skin Type & Melanin</p>
              <p>Clemens, T.L. et al. (1982). Increased skin pigment reduces vitamin D3 synthesis. <em>The Lancet</em>, 319(8263), 74-76.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Latitude & Season Effects</p>
              <p>Webb, A.R. & Holick, M.F. (1988). Influence of season and latitude on cutaneous synthesis of vitamin D3. <em>JCEM</em>, 67(2), 373-378.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Quantitative Production Rates</p>
              <p>Terushkin, V. et al. (2010). Estimated equivalency of vitamin D production from sun vs supplementation. <em>JAAD</em>, 62(6), 929.e1-e9.</p>
            </div>
          </div>
          <div className="space-y-3">
            <div>
              <p className="font-semibold text-gray-800">Elevation Effect on UV</p>
              <p>Blumthaler, M. et al. (1997). Increase in solar UV radiation with altitude. <em>J. Photochem. Photobiol. B</em>, 39(2), 130-134.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Cloud Effects on UV</p>
              <p>Calb&oacute;, J. et al. (2005). Empirical studies of cloud effects on UV radiation: A review. <em>Reviews of Geophysics</em>, 43(2).</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Sunscreen Real-World Efficacy</p>
              <p>Faurschou, A. & Wulf, H.C. (2007). The relation between SPF and amount of sunscreen applied. <em>BJD</em>, 156(4), 716-719.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Age-Related Decline</p>
              <p>MacLaughlin, J.A. & Holick, M.F. (1985). Aging decreases the capacity of skin to produce vitamin D3. <em>JCI</em>, 76(4), 1536-1538.</p>
            </div>
            <div>
              <p className="font-semibold text-gray-800">Supplementation Guidelines</p>
              <p>IOM (2011). Dietary Reference Intakes for Calcium and Vitamin D. <em>National Academies Press</em>. Demay, M.B. et al. (2024). Endocrine Society CPG. <em>JCEM</em>, 109(8).</p>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-gray-200 py-8 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} VitaminDCalculator.net</p>
        <p className="mt-1">
          This tool is for educational purposes only. It is not medical advice.
          Consult your healthcare provider for personalized vitamin D recommendations.
        </p>
      </footer>
    </div>
  );
}
