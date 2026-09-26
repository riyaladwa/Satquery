import type { LanguageCode } from '../../i18n/translations'
import type { AnalysisMode, MockAiPayload } from './aiService'

interface LocalizedModeContent {
  summaryBase: (question: string) => string
  explanation: string
  objects: Array<{ id: string; object_type: string; label: string; confidence: number; x: number; y: number; width: number; height: number }>
  changes: Array<{ label: string; percentage: number }>
  landCover: Array<{ label: string; percentage: number; color: string }>
  measurements: Record<string, number>
  recommendations: string[]
  evidence: string[]
  reliabilityLevel: 'HIGH' | 'MEDIUM' | 'LOW'
}

type ModeContentMap = Partial<Record<AnalysisMode, LocalizedModeContent>> & {
  single: LocalizedModeContent
  optical_sar: LocalizedModeContent
  before_after: LocalizedModeContent
  change_detection: LocalizedModeContent
  disaster: LocalizedModeContent
  agriculture: LocalizedModeContent
  urban_growth: LocalizedModeContent
}

const englishContent: ModeContentMap = {
  single: {
    summaryBase: (q) => q.includes('water') || q.includes('flood')
      ? 'Water signatures identified across the satellite observation; temporal review recommended.'
      : q.includes('vegetation') || q.includes('crop') || q.includes('agri')
        ? 'Active agricultural and vegetation canopy mapped across the scene footprint.'
        : q.includes('building') || q.includes('urban')
          ? 'Built-up structures and settlement density delineated across the target zone.'
          : 'Satellite observation analyzed; features extracted with spectral evidence.',
    explanation: 'Single-image multi-spectral classification identifies surface materials, canopy vigor, and structural boundaries with high confidence.',
    objects: [
      { id: 'obj-1', object_type: 'building', label: 'Commercial / Residential Structure', confidence: 0.94, x: 22, y: 20, width: 28, height: 22 },
      { id: 'obj-2', object_type: 'road', label: 'Primary Transport Route', confidence: 0.91, x: 50, y: 42, width: 32, height: 16 },
      { id: 'obj-3', object_type: 'water_body', label: 'Surface Water Reservoir', confidence: 0.95, x: 68, y: 58, width: 20, height: 14 },
    ],
    changes: [
      { label: 'Built Footprint', percentage: 14.5 },
      { label: 'Vegetation Canopy', percentage: -6.2 },
      { label: 'Surface Water', percentage: 3.8 },
    ],
    landCover: [
      { label: 'Cropland & Agriculture', percentage: 39.2, color: '#22c55e' },
      { label: 'Urban & Built-up', percentage: 24.6, color: '#60a5fa' },
      { label: 'Forest / Woodland', percentage: 19.8, color: '#16a34a' },
      { label: 'Water Reservoir', percentage: 9.4, color: '#38bdf8' },
      { label: 'Bare Soil', percentage: 7.0, color: '#f59e0b' },
    ],
    measurements: { monitored_area: 18.5, built_area: 4.5, water_area: 1.7 },
    recommendations: [
      'Cross-check identified land cover against current cadastral records.',
      'Monitor seasonal boundary shifts using Sentinel-2 acquisitions.',
      'Maintain continuous observations over high-value infrastructure.',
    ],
    evidence: [
      'Multi-spectral index profiles show clear absorption dips in red-edge bands.',
      'Reflectance gradients indicate well-defined transitions between canopy and impervious surfaces.',
      'Spatial geometry matches verified ground features in regional benchmarks.',
    ],
    reliabilityLevel: 'HIGH',
  },
  disaster: {
    summaryBase: () => 'Surface water expansion and flood inundation signals delineated across infrastructure corridors.',
    explanation: 'Disaster assessment fuses Sentinel-1 SAR microwave backscatter with Sentinel-2 optical imagery to identify standing water, submerged corridors, and structural risk areas.',
    objects: [
      { id: 'dis-1', object_type: 'water_body', label: 'Standing Floodwater / Overflow', confidence: 0.91, x: 18, y: 30, width: 34, height: 24 },
      { id: 'dis-2', object_type: 'road', label: 'Inundated Transport Corridor', confidence: 0.86, x: 55, y: 52, width: 22, height: 14 },
    ],
    changes: [
      { label: 'Affected Surface Footprint', percentage: 27.4 },
      { label: 'Water Extent Increase', percentage: 18.6 },
      { label: 'Submerged Farmland', percentage: 11.2 },
    ],
    landCover: [
      { label: 'Inundated Area', percentage: 27.4, color: '#38bdf8' },
      { label: 'Impacted Cropland', percentage: 31.2, color: '#22c55e' },
      { label: 'Settlement Perimeter', percentage: 19.5, color: '#60a5fa' },
      { label: 'Unaltered Forest', percentage: 21.9, color: '#16a34a' },
    ],
    measurements: { affected_area: 14.2, standing_water: 8.1, damaged_corridor: 3.4 },
    recommendations: [
      'Deploy immediate drone or aerial confirmation along inundated transit sectors.',
      'Prioritize relief access to low-lying settlement clusters bordered by standing water.',
      'Acquire upcoming SAR pass to track drainage rate and recession dynamics.',
    ],
    evidence: [
      'Sharply attenuated radar backscatter confirms specular surface water reflection.',
      'Multi-temporal difference highlights sudden reflectance decrease across agricultural parcels.',
      'Topographic slope correlation confirms accumulation in basin depression zones.',
    ],
    reliabilityLevel: 'MEDIUM',
  },
  agriculture: {
    summaryBase: () => 'Vegetation vigor, canopy chlorophyll reflectance, and crop moisture status mapped successfully.',
    explanation: 'Agricultural intelligence utilizes Sentinel-2 Red-Edge and NIR reflectance to calculate NDVI, canopy water deficit, and photosynthetic vitality across crop parcels.',
    objects: [
      { id: 'ag-1', object_type: 'agricultural_field', label: 'High-Vigor Crop Parcel', confidence: 0.96, x: 14, y: 22, width: 36, height: 28 },
      { id: 'ag-2', object_type: 'agricultural_field', label: 'Moisture Stress Sector', confidence: 0.89, x: 58, y: 35, width: 26, height: 22 },
      { id: 'ag-3', object_type: 'water_body', label: 'Irrigation Feeder Canal', confidence: 0.93, x: 42, y: 64, width: 32, height: 10 },
    ],
    changes: [
      { label: 'Canopy NDVI Index', percentage: 14.2 },
      { label: 'Soil Moisture Deficit', percentage: -6.4 },
      { label: 'Fallow Parcel Area', percentage: -7.8 },
    ],
    landCover: [
      { label: 'Active Crop Fields', percentage: 52.4, color: '#22c55e' },
      { label: 'Pasture / Grassland', percentage: 21.3, color: '#84cc16' },
      { label: 'Fallow Land', percentage: 14.8, color: '#f59e0b' },
      { label: 'Canal & Irrigation', percentage: 6.5, color: '#38bdf8' },
      { label: 'Farm Structures', percentage: 5.0, color: '#64748b' },
    ],
    measurements: { cultivated_area: 42.8, irrigated_area: 28.5, stress_area: 6.4 },
    recommendations: [
      'Target supplemental drip irrigation to the moisture-stressed western parcel.',
      'Conduct localized soil nutrient assessment in lower-vigor quadrants.',
      'Schedule yield forecasting review following the next cloud-free Sentinel revisit.',
    ],
    evidence: [
      'Elevated NIR reflectance confirms healthy cellular structure in parcel A.',
      'SWIR shortwave infrared absorption detects localized canopy moisture deficit in sector B.',
      'Multi-spectral red-edge slope indicates active vegetative growth cycle.',
    ],
    reliabilityLevel: 'HIGH',
  },
  urban_growth: {
    summaryBase: () => 'Urban expansion, built-up densification, and new transport corridor formation identified.',
    explanation: 'Urban spatial analysis measures the conversion of vegetated and vacant parcels into impervious concrete, asphalt corridors, and new structural footprints.',
    objects: [
      { id: 'urb-1', object_type: 'building', label: 'New Commercial Construction Footprint', confidence: 0.96, x: 22, y: 16, width: 30, height: 24 },
      { id: 'urb-2', object_type: 'road', label: 'Paved Arterial Highway Expansion', confidence: 0.93, x: 48, y: 44, width: 38, height: 16 },
      { id: 'urb-3', object_type: 'building', label: 'High-Density Residential Development', confidence: 0.91, x: 64, y: 20, width: 22, height: 26 },
    ],
    changes: [
      { label: 'Impervious Surface Expansion', percentage: 13.7 },
      { label: 'New Structural Footprints', percentage: 22.4 },
      { label: 'Open Space Reduction', percentage: -15.1 },
    ],
    landCover: [
      { label: 'Built-up / Concrete', percentage: 48.6, color: '#60a5fa' },
      { label: 'Roadways & Transit', percentage: 18.2, color: '#94a3b8' },
      { label: 'Urban Canopy / Parks', percentage: 15.4, color: '#16a34a' },
      { label: 'Active Construction Sites', percentage: 12.1, color: '#f59e0b' },
      { label: 'Urban Water Retention', percentage: 5.7, color: '#38bdf8' },
    ],
    measurements: { total_urban_area: 17.2, new_structures: 4.8, road_corridors: 6.1 },
    recommendations: [
      'Synchronize identified development polygons with municipal zoning registers.',
      'Evaluate storm-water runoff capacity around newly paved arterial corridors.',
      'Enforce green buffer protection guidelines along remaining vegetation boundaries.',
    ],
    evidence: [
      'Marked spectral shift from soil backscatter to high-albedo roofing materials.',
      'Linear continuity in optical reflectance matches planned arterial road construction.',
      'Surface urban heat island proxy reflects increased thermal inertia from paving.',
    ],
    reliabilityLevel: 'HIGH',
  },
  optical_sar: {
    summaryBase: () => 'Optical and Synthetic Aperture Radar (SAR) fusion analysis completed.',
    explanation: 'Cross-sensor fusion integrates Sentinel-1 microwave penetration with Sentinel-2 optical spectral bands to resolve surface roughness, structural mass, and vegetation vigor.',
    objects: [
      { id: 'sar-1', object_type: 'building', label: 'SAR Double-Bounce Structural Cluster', confidence: 0.96, x: 24, y: 20, width: 28, height: 22 },
      { id: 'sar-2', object_type: 'road', label: 'Rough Transport Corridor', confidence: 0.92, x: 50, y: 40, width: 34, height: 16 },
      { id: 'sar-3', object_type: 'water_body', label: 'Specular Water Surface', confidence: 0.95, x: 66, y: 56, width: 20, height: 14 },
    ],
    changes: [
      { label: 'SAR Structural Backscatter', percentage: 18.4 },
      { label: 'Optical NDVI Canopy', percentage: -9.1 },
      { label: 'Dielectric Soil Signature', percentage: 7.2 },
    ],
    landCover: [
      { label: 'Impervious Concrete (SAR)', percentage: 44.2, color: '#60a5fa' },
      { label: 'Vegetation Canopy (Optical)', percentage: 29.5, color: '#22c55e' },
      { label: 'Water (Specular SAR)', percentage: 14.1, color: '#38bdf8' },
      { label: 'Soil / Transitional', percentage: 12.2, color: '#f59e0b' },
    ],
    measurements: { fused_area: 24.6, sar_built: 10.8, optical_canopy: 7.2 },
    recommendations: [
      'Leverage SAR polarization ratios to verify structural orientation.',
      'Use coherence tracking to identify millimeter-scale surface displacements.',
      'Combine SWIR optical bands with radar intensity for accurate wet-soil mapping.',
    ],
    evidence: [
      'Sentinel-1 dihedral double-bounce identifies structural boundaries through atmospheric moisture.',
      'Sentinel-2 NIR band verifies vegetative photosynthetic activity in open sectors.',
      'Sensor fusion removes shadow ambiguities present in optical-only datasets.',
    ],
    reliabilityLevel: 'HIGH',
  },
  before_after: {
    summaryBase: () => 'Bi-temporal comparative analysis reveals significant surface changes.',
    explanation: 'Multi-date pixel subtraction and change vector analysis identify structural construction, corridor development, and vegetation transitions between acquisitions.',
    objects: [
      { id: 'ch-1', object_type: 'building', label: 'New Construction Parcel (Recent)', confidence: 0.95, x: 22, y: 18, width: 30, height: 22 },
      { id: 'ch-2', object_type: 'road', label: 'Paved Access Road (Recent)', confidence: 0.91, x: 46, y: 38, width: 32, height: 16 },
      { id: 'ch-3', object_type: 'water_body', label: 'Preserved Retention Basin', confidence: 0.94, x: 68, y: 56, width: 18, height: 14 },
    ],
    changes: [
      { label: 'Urban Growth', percentage: 12.8 },
      { label: 'Vegetation Loss', percentage: -8.3 },
      { label: 'Waterbody Variation', percentage: 4.1 },
    ],
    landCover: [
      { label: 'Urbanized Footprint', percentage: 42.1, color: '#60a5fa' },
      { label: 'Agricultural Land', percentage: 32.4, color: '#22c55e' },
      { label: 'Woodland / Forest', percentage: 13.8, color: '#16a34a' },
      { label: 'Water Bodies', percentage: 8.2, color: '#38bdf8' },
      { label: 'Road Infrastructure', percentage: 3.5, color: '#c084fc' },
    ],
    measurements: { total_changed_area: 14.8, built_expansion: 8.9, canopy_reduction: 4.2 },
    recommendations: [
      'Verify newly paved arterial alignment with local developmental masterplans.',
      'Monitor riparian corridors for soil erosion downstream from cleared plots.',
      'Schedule follow-up comparison upon next Sentinel-2 seasonal pass.',
    ],
    evidence: [
      'Pixel-level difference metrics exceed 2.5 standard deviations across development zones.',
      'Co-registered multi-temporal imagery confirms permanent land clearance.',
      'Geometric sharpness in new features confirms human infrastructure intervention.',
    ],
    reliabilityLevel: 'HIGH',
  },
  change_detection: {
    summaryBase: () => 'Automated spectral change detection delineates land transformation patterns.',
    explanation: 'Spectral angle mapping and normalized difference vector subtraction highlight permanent structural growth and canopy changes across the evaluated timeline.',
    objects: [
      { id: 'cd-1', object_type: 'building', label: 'New Structural Construction', confidence: 0.94, x: 20, y: 18, width: 28, height: 20 },
      { id: 'cd-2', object_type: 'road', label: 'Transport Corridor Expansion', confidence: 0.89, x: 52, y: 42, width: 26, height: 18 },
      { id: 'cd-3', object_type: 'water_body', label: 'Water Retention Zone', confidence: 0.94, x: 68, y: 58, width: 16, height: 12 },
    ],
    changes: [
      { label: 'Built Footprint', percentage: 12.8 },
      { label: 'Canopy Reduction', percentage: -8.3 },
      { label: 'Water Extent', percentage: 4.1 },
    ],
    landCover: [
      { label: 'Cultivated Land', percentage: 38.4, color: '#22c55e' },
      { label: 'Tree Canopy', percentage: 24.2, color: '#16a34a' },
      { label: 'Built Environment', percentage: 18.7, color: '#60a5fa' },
      { label: 'Surface Water', percentage: 9.3, color: '#38bdf8' },
      { label: 'Cleared Soil', percentage: 6.1, color: '#f59e0b' },
      { label: 'Transit Network', percentage: 3.3, color: '#c084fc' },
    ],
    measurements: { converted_surface: 14.8, new_built_footprint: 8.9, green_loss: 4.2 },
    recommendations: [
      'Perform on-site inspection of newly developed transit corridors.',
      'Update municipal cadastral database with recent construction polygons.',
      'Establish continuous ecological monitoring in adjacent forest buffers.',
    ],
    evidence: [
      'Multi-spectral subtraction reveals sharp reflectance shifts from soil to concrete.',
      'Temporal index differences show persistent, irreversible structural modification.',
      'High confidence corroboration between Sentinel-1 radar and Sentinel-2 optical acquisitions.',
    ],
    reliabilityLevel: 'HIGH',
  },
}

// Complete Kannada (kn) AI Response Content
const kannadaContent: ModeContentMap = {
  single: {
    summaryBase: (q) => q.includes('water') || q.includes('flood') || q.includes('ನೀರು') || q.includes('ಪ್ರವಾಹ')
      ? 'ವಿಶ್ಲೇಷಿಸಲಾದ ಉಪಗ್ರಹ ಚಿತ್ರದಲ್ಲಿ ಜಲ-ಸಂಬಂಧಿತ ಲಕ್ಷಣಗಳು ಕಂಡುಬಂದಿವೆ; ಸಮಯ ಆಧಾರಿತ ಮೌಲ್ಯಮಾಪನ ಶಿಫಾರಸು ಮಾಡಲಾಗಿದೆ.'
      : q.includes('agri') || q.includes('ಕೃಷಿ') || q.includes('ಬೆಳೆ')
        ? 'ಗುರುತಿಸಲಾದ ಪ್ರದೇಶದಲ್ಲಿ ಸಕ್ರಿಯ ಕೃಷಿ ಮತ್ತು ಸಸ್ಯವರ್ಗದ ಹಸಿರು ವಿಸ್ತಾರ ಪತ್ತೆಯಾಗಿದೆ.'
        : q.includes('building') || q.includes('ಕಟ್ಟಡ') || q.includes('ನಗರ')
          ? 'ಗುರಿ ಪ್ರದೇಶದಲ್ಲಿ ಕಟ್ಟಡ ರಚನೆಗಳು ಮತ್ತು ವಸಾಹತು ಸಾಂದ್ರತೆ ಯಶಸ್ವಿಯಾಗಿ ಪತ್ತೆಯಾಗಿದೆ.'
          : 'ಉಪಗ್ರಹ ಚಿತ್ರವನ್ನು ವಿಶ್ಲೇಷಿಸಲಾಗಿದೆ; ಸ್ಪೆಕ್ಟ್ರಲ್ ಪುರಾವೆಗಳೊಂದಿಗೆ ಮೇಲ್ಮೈ ಲಕ್ಷಣಗಳನ್ನು ಹೊರತೆಗೆಯಲಾಗಿದೆ.',
    explanation: 'ಏಕ-ಚಿತ್ರ ಬಹು-ಸ್ಪೆಕ್ಟ್ರಲ್ ವರ್ಗೀಕರಣವು ಮೇಲ್ಮೈ ವಸ್ತುಗಳು, ಸಸ್ಯವರ್ಗದ ಆರೋಗ್ಯ ಮತ್ತು ರಚನಾತ್ಮಕ ಗಡಿಗಳನ್ನು ಹೆಚ್ಚಿನ ನಿಖರತೆಯೊಂದಿಗೆ ಗುರುತಿಸುತ್ತದೆ.',
    objects: [
      { id: 'obj-1', object_type: 'building', label: 'ವಾಣಿಜ್ಯ / ವಸತಿ ಕಟ್ಟಡ ಸಮುಚ್ಛಯ', confidence: 0.94, x: 22, y: 20, width: 28, height: 22 },
      { id: 'obj-2', object_type: 'road', label: 'ಪ್ರಮುಖ ಸಾರಿಗೆ ಹೆದ್ದಾರಿ', confidence: 0.91, x: 50, y: 42, width: 32, height: 16 },
      { id: 'obj-3', object_type: 'water_body', label: 'ಮೇಲ್ಮೈ ಜಲಸಂಪನ್ಮೂಲ', confidence: 0.95, x: 68, y: 58, width: 20, height: 14 },
    ],
    changes: [
      { label: 'ಕಟ್ಟಡ ನಿರ್ಮಾಣ ಪ್ರದೇಶ', percentage: 14.5 },
      { label: 'ಸಸ್ಯವರ್ಗ ವ್ಯಾಪ್ತಿ', percentage: -6.2 },
      { label: 'ಜಲಮೂಲ ವ್ಯಾಪ್ತಿ', percentage: 3.8 },
    ],
    landCover: [
      { label: 'ಕೃಷಿ ಮತ್ತು ಸಾಗುವಳಿ ಭೂಮಿ', percentage: 39.2, color: '#22c55e' },
      { label: 'ನಗರ ಮತ್ತು ಕಟ್ಟಡಗಳು', percentage: 24.6, color: '#60a5fa' },
      { label: 'ಅರಣ್ಯ ಪ್ರದೇಶ', percentage: 19.8, color: '#16a34a' },
      { label: 'ಜಲಾಶಯ', percentage: 9.4, color: '#38bdf8' },
      { label: 'ಬಂಜರು ಭೂಮಿ', percentage: 7.0, color: '#f59e0b' },
    ],
    measurements: { ಒಟ್ಟು_ಮೇಲ್ವಿಚಾರಣಾ_ಪ್ರದೇಶ: 18.5, ಕಟ್ಟಡ_ಪ್ರದೇಶ: 4.5, ಜಲ_ವಿಸ್ತೀರ್ಣ: 1.7 },
    recommendations: [
      'ಗುರುತಿಸಲಾದ ಭೂ ಹೊದಿಕೆಯನ್ನು ಪ್ರಸ್ತುತ ಕಂದಾಯ ದಾಖಲೆಗಳೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ.',
      'ಸೆಂಟಿನೆಲ್-2 ಡೇಟಾ ಬಳಸಿ ಕಾಲೋಚಿತ ಗಡಿ ಬದಲಾವಣೆಗಳನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ.',
      'ಪ್ರಮುಖ ಮೂಲಸೌಕರ್ಯಗಳ ಮೇಲೆ ನಿರಂತರ ನಿಗಾ ಇರಿಸಿ.',
    ],
    evidence: [
      'ಬಹು-ಸ್ಪೆಕ್ಟ್ರಲ್ ಸೂಚ್ಯಂಕ ಪ್ರೊಫೈಲ್‌ಗಳು ರೆಡ್-ಎಡ್ಜ್ ಬ್ಯಾಂಡ್‌ಗಳಲ್ಲಿ ಸ್ಪಷ್ಟ ಹೀರಿಕೊಳ್ಳುವಿಕೆಯನ್ನು ತೋರಿಸುತ್ತವೆ.',
      'ಪ್ರತಿಫಲನ ಗ್ರೇಡಿಯಂಟ್‌ಗಳು ಸಸ್ಯವರ್ಗ ಮತ್ತು ಕಾಂಕ್ರೀಟ್ ಮೇಲ್ಮೈಗಳ ನಡುವೆ ಸ್ಪಷ್ಟ ವ್ಯತ್ಯಾಸವನ್ನು ಸೂಚಿಸುತ್ತವೆ.',
      'ಪ್ರಾದೇಶಿಕ ರೇಖಾಗಣಿತವು ಪರಿಶೀಲಿಸಿದ ನೆಲದ ಲಕ್ಷಣಗಳೊಂದಿಗೆ ನಿಖರವಾಗಿ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ.',
    ],
    reliabilityLevel: 'HIGH',
  },
  disaster: {
    summaryBase: () => 'ಮೂಲಸೌಕರ್ಯ ಕಾರಿಡಾರ್‌ಗಳ ಸುತ್ತ ಮೇಲ್ಮೈ ನೀರು ವಿಸ್ತರಣೆ ಮತ್ತು ಪ್ರವಾಹ ಮುಳುಗಡೆ ಸಂಕೇತಗಳು ಪತ್ತೆಯಾಗಿವೆ.',
    explanation: 'ಸೆಂಟಿನೆಲ್-1 SAR ಮೈಕ್ರೋವೇವ್ ರೇಡಾರ್ ಮತ್ತು ಸೆಂಟಿನೆಲ್-2 ಆಪ್ಟಿಕಲ್ ಚಿತ್ರಗಳನ್ನು ಸಂಯೋಜಿಸಿ ಜಲಾವೃತ ಪ್ರದೇಶ, ಮುಳುಗಿದ ರಸ್ತೆಗಳು ಮತ್ತು ಅಪಾಯದ ವಲಯಗಳನ್ನು ನಿಖರವಾಗಿ ಪತ್ತೆಮಾಡಲಾಗಿದೆ.',
    objects: [
      { id: 'dis-1', object_type: 'water_body', label: 'ನಿಂತ ಪ್ರವಾಹದ ನೀರು / ಉಕ್ಕಿ ಹರಿದ ಜಲ', confidence: 0.91, x: 18, y: 30, width: 34, height: 24 },
      { id: 'dis-2', object_type: 'road', label: 'ಜಲಾವೃತಗೊಂಡ ಸಾರಿಗೆ ರಸ್ತೆ', confidence: 0.86, x: 55, y: 52, width: 22, height: 14 },
    ],
    changes: [
      { label: 'ಬಾಧಿತ ಮೇಲ್ಮೈ ವಿಸ್ತೀರ್ಣ', percentage: 27.4 },
      { label: 'ನೀರಿನ ವಿಸ್ತರಣೆ ಪ್ರಮಾಣ', percentage: 18.6 },
      { label: 'ಮುಳುಗಡೆಯಾದ ಕೃಷಿಭೂಮಿ', percentage: 11.2 },
    ],
    landCover: [
      { label: 'ಜಲಾವೃತ ಪ್ರದೇಶ', percentage: 27.4, color: '#38bdf8' },
      { label: 'ಬಾಧಿತ ಕೃಷಿ ಭೂಮಿ', percentage: 31.2, color: '#22c55e' },
      { label: 'ವಸಾಹತು ಗಡಿ ಪ್ರದೇಶ', percentage: 19.5, color: '#60a5fa' },
      { label: 'ಬಾಧಿತವಾಗದ ಅರಣ್ಯ', percentage: 21.9, color: '#16a34a' },
    ],
    measurements: { ಬಾಧಿತ_ವಿಸ್ತೀರ್ಣ: 14.2, ಜಲಾವೃತ_ಪ್ರದೇಶ: 8.1, ಹಾನಿಗೊಳಗಾದ_ರಸ್ತೆ: 3.4 },
    recommendations: [
      'ಜಲಾವೃತ ಸಾರಿಗೆ ವಲಯಗಳಲ್ಲಿ ತಕ್ಷಣ ಡ್ರೋನ್ ಅಥವಾ ವೈಮಾನಿಕ ಪರಿಶೀಲನೆ ನಡೆಸಿ.',
      'ಪ್ರವಾಹದಿಂದ ಸುತ್ತುವರೆದಿರುವ ತಗ್ಗು ಪ್ರದೇಶದ ವಸಾಹತುಗಳಿಗೆ ತುರ್ತು ಪರಿಹಾರ ಒದಗಿಸಿ.',
      'ನೀರು ಇಳಿಯುವಿಕೆಯ ಗತಿಯನ್ನು ತಿಳಿಯಲು ಮುಂಬರುವ SAR ರೇಡಾರ್ ಡೇಟಾವನ್ನು ಪಡೆದುಕೊಳ್ಳಿ.',
    ],
    evidence: [
      'ರೇಡಾರ್ ಹಿಮ್ಮುಖ ಪ್ರಸರಣದ ಕ್ಷೀಣತೆಯು ನೇರ ನೀರಿನ ಮೇಲ್ಮೈ ಪ್ರತಿಫಲನವನ್ನು ದೃಢಪಡಿಸುತ್ತದೆ.',
      'ಬಹು-ದಿನಾಂಕದ ವ್ಯತ್ಯಾಸವು ಕೃಷಿ ಭೂಮಿಯಲ್ಲಿ ಹಠಾತ್ ನೀರಿನ ಹೆಚ್ಚಳವನ್ನು ಎತ್ತಿ ತೋರಿಸುತ್ತದೆ.',
      'ಭೂಪ್ರದೇಶದ ಇಳಿಜಾರಿನ ವಿಶ್ಲೇಷಣೆಯು ತಗ್ಗು ಪ್ರದೇಶಗಳಲ್ಲಿ ನೀರು ಶೇಖರಣೆಯಾಗಿರುವುದನ್ನು ದೃಢೀಕರಿಸುತ್ತದೆ.',
    ],
    reliabilityLevel: 'MEDIUM',
  },
  agriculture: {
    summaryBase: () => 'ಸಸ್ಯವರ್ಗದ ಹಸಿರು ಶಕ್ತಿ, ಬೆಳೆ ಕ್ಲೋರೋಫಿಲ್ ಮತ್ತು ತೇವಾಂಶ ಸ್ಥಿತಿಗತಿಯನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಮ್ಯಾಪ್ ಮಾಡಲಾಗಿದೆ.',
    explanation: 'ಸೆಂಟಿನೆಲ್-2 ರೆಡ್-ಎಡ್ಜ್ ಮತ್ತು ನಿಯರ್-ಇನ್‌ಫ್ರಾರೆಡ್ (NIR) ಡೇಟಾ ಬಳಸಿ ಬೆಳೆಯ NDVI ಸೂಚ್ಯಂಕ, ತೇವಾಂಶ ಕೊರತೆ ಮತ್ತು ದ್ಯುತಿಸಂಶ್ಲೇಷಣಾ ಶಕ್ತಿಯನ್ನು ನಿಖರವಾಗಿ ಲೆಕ್ಕಹಾಕಲಾಗಿದೆ.',
    objects: [
      { id: 'ag-1', object_type: 'agricultural_field', label: 'ಉತ್ತಮ ಆರೋಗ್ಯಕರ ಬೆಳೆ ಪ್ರದೇಶ', confidence: 0.96, x: 14, y: 22, width: 36, height: 28 },
      { id: 'ag-2', object_type: 'agricultural_field', label: 'ತೇವಾಂಶ ಕೊರತೆ ಬೆಳೆ ವಲಯ', confidence: 0.89, x: 58, y: 35, width: 26, height: 22 },
      { id: 'ag-3', object_type: 'water_body', label: 'ನೀರಾವರಿ ಕಾಲುವೆ', confidence: 0.93, x: 42, y: 64, width: 32, height: 10 },
    ],
    changes: [
      { label: 'ಬೆಳೆ NDVI ಸೂಚ್ಯಂಕ', percentage: 14.2 },
      { label: 'ಮಣ್ಣಿನ ತೇವಾಂಶ ಕೊರತೆ', percentage: -6.4 },
      { label: 'ಖಾಲಿ ಕೃಷಿ ಭೂಮಿ ವಿಸ್ತೀರ್ಣ', percentage: -7.8 },
    ],
    landCover: [
      { label: 'ಸಕ್ರಿಯ ಬೆಳೆ ಭೂಮಿ', percentage: 52.4, color: '#22c55e' },
      { label: 'ಹುಲ್ಲುಗಾವಲು ಪ್ರದೇಶ', percentage: 21.3, color: '#84cc16' },
      { label: 'ಬಂಜರು / ಖಾಲಿ ಭೂಮಿ', percentage: 14.8, color: '#f59e0b' },
      { label: 'ಕಾಲುವೆ ಮತ್ತು ನೀರಾವರಿ', percentage: 6.5, color: '#38bdf8' },
      { label: 'ಕೃಷಿ ಮೂಲಸೌಕರ್ಯ', percentage: 5.0, color: '#64748b' },
    ],
    measurements: { ಕೃಷಿ_ವಿಸ್ತೀರ್ಣ: 42.8, ನೀರಾವರಿ_ಪ್ರದೇಶ: 28.5, ಕೊರತೆ_ವಲಯ: 6.4 },
    recommendations: [
      'ತೇವಾಂಶ ಕೊರತೆಯಿರುವ ಪಶ್ಚಿಮ ಕೃಷಿ ವಲಯಕ್ಕೆ ಆದ್ಯತೆಯ ಮೇಲೆ ಹನಿ ನೀರಾವರಿ ಒದಗಿಸಿ.',
      'ಕಡಿಮೆ ಬೆಳವಣಿಗೆಯಿರುವ ಭಾಗಗಳಲ್ಲಿ ಮಣ್ಣಿನ ಪೋಷಕಾಂಶಗಳ ಪರೀಕ್ಷೆ ನಡೆಸಿ.',
      'ಮುಂದಿನ ಸೆಂಟಿನೆಲ್-2 ಉಪಗ್ರಹ ಪಾಸ್ ಮೂಲಕ ಬೆಳೆ ಚೇತರಿಕೆಯನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ.',
    ],
    evidence: [
      'ಹೆಚ್ಚಿದ NIR ಪ್ರತಿಫಲನವು ಬೆಳೆ ಕೋಶಗಳ ಆರೋಗ್ಯಕರ ಬೆಳವಣಿಗೆಯನ್ನು ದೃಢಪಡಿಸುತ್ತದೆ.',
      'SWIR ಶಾರ್ಟ್‌ವೇವ್ ಅತಿಗೆಂಪು ಹೀರಿಕೊಳ್ಳುವಿಕೆಯು ನಿರ್ದಿಷ್ಟ ಭಾಗದಲ್ಲಿ ತೇವಾಂಶದ ಕೊರತೆಯನ್ನು ಪತ್ತೆಮಾಡಿದೆ.',
      'ಬಹು-ಸ್ಪೆಕ್ಟ್ರಲ್ ರೆಡ್-ಎಡ್ಜ್ ಇಳಿಜಾರು ಸಕ್ರಿಯ ಸಸ್ಯವರ್ಗದ ಬೆಳವಣಿಗೆಯ ಚಕ್ರವನ್ನು ಸೂಚಿಸುತ್ತದೆ.',
    ],
    reliabilityLevel: 'HIGH',
  },
  urban_growth: {
    summaryBase: () => 'ನಗರ ವಿಸ್ತರಣೆ, ಕಟ್ಟಡಗಳ ಸಾಂದ್ರತೆ ಮತ್ತು ಹೊಸ ಸಾರಿಗೆ ಹೆದ್ದಾರಿ ಅಭಿವೃದ್ಧಿಯನ್ನು ಗುರುತಿಸಲಾಗಿದೆ.',
    explanation: 'ನಗರ ಪ್ರಾದೇಶಿಕ ವಿಶ್ಲೇಷಣೆಯು ಹಸಿರು ಹಾಗೂ ಖಾಲಿ ಭೂಮಿಯನ್ನು ಕಾಂಕ್ರೀಟ್ ಕಟ್ಟಡಗಳು, ರಸ್ತೆಗಳು ಮತ್ತು ಶಾಶ್ವತ ಮೂಲಸೌಕರ್ಯಗಳಾಗಿ ಪರಿವರ್ತಿಸಿರುವುದನ್ನು ಅಳೆಯುತ್ತದೆ.',
    objects: [
      { id: 'urb-1', object_type: 'building', label: 'ಹೊಸ ವಾಣಿಜ್ಯ ನಿರ್ಮಾಣ ವಲಯ', confidence: 0.96, x: 22, y: 16, width: 30, height: 24 },
      { id: 'urb-2', object_type: 'road', label: 'ವಿಸ್ತರಿತ ಮುಖ್ಯ ಹೆದ್ದಾರಿ ರಸ್ತೆ', confidence: 0.93, x: 48, y: 44, width: 38, height: 16 },
      { id: 'urb-3', object_type: 'building', label: 'ದಟ್ಟ ವಸತಿ ಸಮುಚ್ಛಯ ಅಭಿವೃದ್ಧಿ', confidence: 0.91, x: 64, y: 20, width: 22, height: 26 },
    ],
    changes: [
      { label: 'ಕಾಂಕ್ರೀಟ್ ಮೇಲ್ಮೈ ವಿಸ್ತರಣೆ', percentage: 13.7 },
      { label: 'ಹೊಸ ಕಟ್ಟಡಗಳ ನಿರ್ಮಾಣ', percentage: 22.4 },
      { label: 'ತೆರೆದ ಹಸಿರು ಪ್ರದೇಶದ ಕಡಿತ', percentage: -15.1 },
    ],
    landCover: [
      { label: 'ಕಟ್ಟಡಗಳು ಮತ್ತು ಕಾಂಕ್ರೀಟ್', percentage: 48.6, color: '#60a5fa' },
      { label: 'ರಸ್ತೆಗಳು ಮತ್ತು ಹೆದ್ದಾರಿಗಳು', percentage: 18.2, color: '#94a3b8' },
      { label: 'ನಗರದ ಉದ್ಯಾನವನಗಳು / ಹಸಿರು', percentage: 15.4, color: '#16a34a' },
      { label: 'ನಿರ್ಮಾಣ ಹಂತದ ಪ್ರದೇಶಗಳು', percentage: 12.1, color: '#f59e0b' },
      { label: 'ನಗರದ ಜಲಮೂಲಗಳು', percentage: 5.7, color: '#38bdf8' },
    ],
    measurements: { ಒಟ್ಟು_ನಗರ_ಪ್ರದೇಶ: 17.2, ಹೊಸ_ಕಟ್ಟಡಗಳು: 4.8, ರಸ್ತೆ_ಜಾಲ: 6.1 },
    recommendations: [
      'ಗುರುತಿಸಲಾದ ಹೊಸ ಕಟ್ಟಡಗಳನ್ನು ನಗರ ನಗರಾಭಿವೃದ್ಧಿ ಪ್ರಾಧಿಕಾರದ ಮಾಸ್ಟರ್ ಪ್ಲಾನ್ ಜೊತೆ ತಾಳೆ ನೋಡಿ.',
      'ಹೊಸದಾಗಿ ಡಾಂಬರೀಕರಣಗೊಂಡ ರಸ್ತೆಗಳ ಬದಿಯಲ್ಲಿ ಮಳೆನೀರು ಹರಿವಿನ ಸಾಮರ್ಥ್ಯವನ್ನು ಮೌಲ್ಯಮಾಪನ ಮಾಡಿ.',
      'ಉಳಿದಿರುವ ನೈಸರ್ಗಿಕ ಹಸಿರು ವಲಯಗಳನ್ನು ಪರಿಸರ ನಿಯಮಗಳ ಅಡಿಯಲ್ಲಿ ಸಂರಕ್ಷಿಸಿ.',
    ],
    evidence: [
      'ಮಣ್ಣಿನ ಪ್ರತಿಫಲನದಿಂದ ಹೆಚ್ಚಿನ ಪ್ರತಿಫಲನದ ಛಾವಣಿ ವಸ್ತುಗಳಿಗೆ ಸ್ಪೆಕ್ಟ್ರಲ್ ಬದಲಾವಣೆ ದೃಢಪಟ್ಟಿದೆ.',
      'ಆಪ್ಟಿಕಲ್ ಚಿತ್ರಗಳಲ್ಲಿನ ರೇಖೀಯ ನಿರಂತರತೆಯು ಹೊಸ ಸಾರಿಗೆ ರಸ್ತೆ ನಿರ್ಮಾಣಕ್ಕೆ ನಿಖರವಾಗಿ ಹೊಂದಿಕೆಯಾಗುತ್ತದೆ.',
      'ಉಷ್ಣ ಹೊರಸೂಸುವಿಕೆಯು ನಗರದ ಸ್ಥಳೀಯ ಶಾಖದ ವಿಸ್ತರಣೆಯನ್ನು ಪ್ರತಿಬಿಂಬಿಸುತ್ತದೆ.',
    ],
    reliabilityLevel: 'HIGH',
  },
  optical_sar: {
    summaryBase: () => 'ಆಪ್ಟಿಕಲ್ ಮತ್ತು ಸಿಂಥೆಟಿಕ್ ಅಪರ್ಚರ್ ರೇಡಾರ್ (SAR) ಸಮ್ಮಿಶ್ರ ವಿಶ್ಲೇಷಣೆ ಪೂರ್ಣಗೊಂಡಿದೆ.',
    explanation: 'ಸೆಂಟಿನೆಲ್-1 ಮೈಕ್ರೋವೇವ್ ರೇಡಾರ್ ಮೋಡಗಳನ್ನು ಭೇದಿಸಿ ಮೇಲ್ಮೈ ಒರಟುತನ ಮತ್ತು ಕಟ್ಟಡ ಸಾಂದ್ರತೆಯನ್ನು ಗುರುತಿಸುತ್ತದೆ, ಹಾಗೂ ಸೆಂಟಿನೆಲ್-2 ಆಪ್ಟಿಕಲ್ ಸಸ್ಯವರ್ಗ ಮತ್ತು ಜಲ ಗಡಿಗಳನ್ನು ಸ್ಪಷ್ಟಪಡಿಸುತ್ತದೆ.',
    objects: [
      { id: 'sar-1', object_type: 'building', label: 'SAR ಡಬಲ್-ಬೌನ್ಸ್ ಕಟ್ಟಡ ರಚನೆಗಳು', confidence: 0.96, x: 24, y: 20, width: 28, height: 22 },
      { id: 'sar-2', object_type: 'road', label: 'ಹೆಚ್ಚಿನ ಒರಟುತನದ ಸಾರಿಗೆ ರಸ್ತೆ', confidence: 0.92, x: 50, y: 40, width: 34, height: 16 },
      { id: 'sar-3', object_type: 'water_body', label: 'ಕಡಿಮೆ ಪ್ರತಿಫಲನದ ನೀರಿನ ಮೇಲ್ಮೈ', confidence: 0.95, x: 66, y: 56, width: 20, height: 14 },
    ],
    changes: [
      { label: 'SAR ರಚನಾತ್ಮಕ ಪ್ರತಿಫಲನ', percentage: 18.4 },
      { label: 'ಆಪ್ಟಿಕಲ್ NDVI ಸಸ್ಯವರ್ಗ', percentage: -9.1 },
      { label: 'ಮಣ್ಣಿನ ತೇವಾಂಶ ಸಂಕೇತ', percentage: 7.2 },
    ],
    landCover: [
      { label: 'ಕಾಂಕ್ರೀಟ್ ಕಟ್ಟಡಗಳು (SAR)', percentage: 44.2, color: '#60a5fa' },
      { label: 'ಸಸ್ಯವರ್ಗ ಹೊದಿಕೆ (ಆಪ್ಟಿಕಲ್)', percentage: 29.5, color: '#22c55e' },
      { label: 'ನೀರಿನ ಮೇಲ್ಮೈ (SAR)', percentage: 14.1, color: '#38bdf8' },
      { label: 'ಮಣ್ಣು / ಪರಿವರ್ತನೆ', percentage: 12.2, color: '#f59e0b' },
    ],
    measurements: { ಸಂಯೋಜಿತ_ವಿಸ್ತೀರ್ಣ: 24.6, ಕಟ್ಟಡ_ರಚನೆಗಳು: 10.8, ಸಸ್ಯವರ್ಗ_ವ್ಯಾಪ್ತಿ: 7.2 },
    recommendations: [
      'ಸೂರ್ಯನ ಕೋನಕ್ಕೆ ಹೊರತಾಗಿ ರಚನೆಗಳ ದೃಷ್ಟಿಕೋನವನ್ನು ದೃಢೀಕರಿಸಲು SAR ಧ್ರುವೀಕರಣ ಅನುಪಾತಗಳನ್ನು ಬಳಸಿ.',
      'ಮಿಲಿಮೀಟರ್-ಮಟ್ಟದ ಮೇಲ್ಮೈ ಕುಸಿತವನ್ನು ಪತ್ತೆಹಚ್ಚಲು ಸೆಂಟಿನೆಲ್-1 ಡೇಟಾವನ್ನು ಬಳಸಿಕೊಳ್ಳಿ.',
      'ತೆರೆದ ನೀರಿನಿಂದ ಜಲಾವೃತ ಸಸ್ಯವರ್ಗವನ್ನು ಪ್ರತ್ಯೇಕಿಸಲು SWIR ಮತ್ತು ರೇಡಾರ್ ತೀವ್ರತೆಯನ್ನು ಸಂಯೋಜಿಸಿ.',
    ],
    evidence: [
      'ಸೆಂಟಿನೆಲ್-1 ಸಿ-ಎಸ್‌ಎಆರ್ ಲಂಬ ರಚನೆಗಳಿಂದ ವಿಶಿಷ್ಟ ಡಬಲ್-ಬೌನ್ಸ್ ಪ್ರತಿಫಲನವನ್ನು ದಾಖಲಿಸುತ್ತದೆ.',
      'ಸೆಂಟಿನೆಲ್-2 ಬ್ಯಾಂಡ್ 8 (NIR) ಮುಕ್ತ ವಲಯಗಳಲ್ಲಿ ದ್ಯುತಿಸಂಶ್ಲೇಷಣಾ ಚಟುವಟಿಕೆಯನ್ನು ದೃಢೀಕರಿಸುತ್ತದೆ.',
      'ಸೆನ್ಸಾರ್ ಸಮ್ಮಿಶ್ರಣವು ಆಪ್ಟಿಕಲ್ ನೆರಳು ವಲಯಗಳಲ್ಲಿನ ಅಸ್ಪಷ್ಟತೆಯನ್ನು ನಿವಾರಿಸುತ್ತದೆ.',
    ],
    reliabilityLevel: 'HIGH',
  },
  before_after: {
    summaryBase: () => 'ಹಿಂದಿನ ಮತ್ತು ಪ್ರಸ್ತುತ ಚಿತ್ರಗಳ ತುಲನಾತ್ಮಕ ವಿಶ್ಲೇಷಣೆಯು ಮಹತ್ವದ ಬದಲಾವಣೆಗಳನ್ನು ಬಹಿರಂಗಪಡಿಸಿದೆ.',
    explanation: 'ಹಿಂದಿನ ಮತ್ತು ಇತ್ತೀಚಿನ ಚಿತ್ರಗಳ ಬಹು-ದಿನಾಂಕದ ಪಿಕ್ಸೆಲ್ ಹೋಲಿಕೆಯು ಮೂಲಸೌಕರ್ಯ ವಿಸ್ತರಣೆ, ಹೊಸ ಕಟ್ಟಡ ನಿರ್ಮಾಣ ಮತ್ತು ಹಸಿರು ಹೊದಿಕೆಯ ಕಡಿತವನ್ನು ದೃಢಪಡಿಸುತ್ತದೆ.',
    objects: [
      { id: 'ch-1', object_type: 'building', label: 'ಹೊಸ ಕಟ್ಟಡ ನಿರ್ಮಾಣ ವಲಯ (ಇತ್ತೀಚಿನ)', confidence: 0.95, x: 22, y: 18, width: 30, height: 22 },
      { id: 'ch-2', object_type: 'road', label: 'ಹೊಸದಾಗಿ ನಿರ್ಮಿಸಿದ ರಸ್ತೆ (ಇತ್ತೀಚಿನ)', confidence: 0.91, x: 46, y: 38, width: 32, height: 16 },
      { id: 'ch-3', object_type: 'water_body', label: 'ಸಂರಕ್ಷಿತ ಜಲಮೂಲ', confidence: 0.94, x: 68, y: 56, width: 18, height: 14 },
    ],
    changes: [
      { label: 'ನಗರ ಪ್ರದೇಶದ ಹೆಚ್ಚಳ', percentage: 12.8 },
      { label: 'ಸಸ್ಯವರ್ಗದ ನಷ್ಟ', percentage: -8.3 },
      { label: 'ಜಲಮೂಲದ ಬದಲಾವಣೆ', percentage: 4.1 },
    ],
    landCover: [
      { label: 'ನಗರೀಕೃತ ಭೂಮಿ', percentage: 42.1, color: '#60a5fa' },
      { label: 'ಕೃಷಿ ಭೂಮಿ', percentage: 32.4, color: '#22c55e' },
      { label: 'ಅರಣ್ಯ / ವೃಕ್ಷ ಹೊದಿಕೆ', percentage: 13.8, color: '#16a34a' },
      { label: 'ಜಲಮೂಲಗಳು', percentage: 8.2, color: '#38bdf8' },
      { label: 'ರಸ್ತೆಗಳು', percentage: 3.5, color: '#c084fc' },
    ],
    measurements: { ಒಟ್ಟು_ಬದಲಾದ_ಪ್ರದೇಶ: 14.8, ನಗರ_ವಿಸ್ತರಣೆ: 8.9, ಹಸಿರು_ಕಡಿತ: 4.2 },
    recommendations: [
      'ಹೊಸ ರಸ್ತೆ ಜೋಡಣೆಯನ್ನು ಪ್ರಾದೇಶಿಕ ನಗರಾಭಿವೃದ್ಧಿ ಯೋಜನೆಗಳೊಂದಿಗೆ ಪರಿಶೀಲಿಸಿ.',
      'ತೆರವುಗೊಳಿಸಲಾದ ಪ್ರದೇಶಗಳಿಂದ ನದಿಯ ದಂಡೆಗಳ ಸವಕಳಿಯನ್ನು ಮೇಲ್ವಿಚಾರಣೆ ಮಾಡಿ.',
      'ಮುಂದಿನ ಉಪಗ್ರಹ ಪಾಸ್‌ನಲ್ಲಿ ಬದಲಾವಣೆಯ ಮೆಟ್ರಿಕ್ಸ್‌ಗಳನ್ನು ಮರು-ಪರಿಶೀಲಿಸಿ.',
    ],
    evidence: [
      'ಪಿಕ್ಸೆಲ್ ಮಟ್ಟದ ವ್ಯತ್ಯಾಸವು ಹೊಸ ನಿರ್ಮಾಣ ವಲಯಗಳಲ್ಲಿ ತೀಕ್ಷ್ಣ ಪ್ರತಿಫಲನ ಬದಲಾವಣೆಯನ್ನು ತೋರಿಸುತ್ತದೆ.',
      'ಸೂಚ್ಯಂಕ ಬದಲಾವಣೆಯು ಮಾನವ ನಿರ್ಮಿತ ಶಾಶ್ವತ ಬದಲಾವಣೆಯನ್ನು ಸ್ಪಷ್ಟಪಡಿಸುತ್ತದೆ.',
      'ಇತ್ತೀಚಿನ ಚಿತ್ರಗಳಲ್ಲಿನ ಹೆಚ್ಚಿನ ಕಾಂಟ್ರಾಸ್ಟ್ ಜ್ಯಾಮಿತಿಯು ಶಾಶ್ವತ ಕಾಮಗಾರಿಯನ್ನು ಖಚಿತಪಡಿಸುತ್ತದೆ.',
    ],
    reliabilityLevel: 'HIGH',
  },
  change_detection: {
    summaryBase: () => 'ಸ್ವಯಂಚಾಲಿತ ಸ್ಪೆಕ್ಟ್ರಲ್ ಬದಲಾವಣೆ ಪತ್ತೆಯು ಭೂ ಪರಿವರ್ತನೆಯ ಮಾದರಿಗಳನ್ನು ಗುರುತಿಸಿದೆ.',
    explanation: 'ಸಮಯ ಆಧಾರಿತ ಸ್ಪೆಕ್ಟ್ರಲ್ ವ್ಯತ್ಯಾಸದ ವಿಶ್ಲೇಷಣೆಯು ಶಾಶ್ವತ ನಗರ ಬೆಳವಣಿಗೆ ಮತ್ತು ಸಸ್ಯವರ್ಗದ ನಷ್ಟದ ಸ್ಪಷ್ಟ ಮಾದರಿಗಳನ್ನು ಪ್ರದರ್ಶಿಸುತ್ತದೆ.',
    objects: [
      { id: 'cd-1', object_type: 'building', label: 'ಹೊಸ ರಚನಾತ್ಮಕ ನಿರ್ಮಾಣ', confidence: 0.94, x: 20, y: 18, width: 28, height: 20 },
      { id: 'cd-2', object_type: 'road', label: 'ಸಾರಿಗೆ ರಸ್ತೆ ಜಾಲದ ವಿಸ್ತರಣೆ', confidence: 0.89, x: 52, y: 42, width: 26, height: 18 },
      { id: 'cd-3', object_type: 'water_body', label: 'ನೀರು ಶೇಖರಣಾ ವಲಯ', confidence: 0.94, x: 68, y: 58, width: 16, height: 12 },
    ],
    changes: [
      { label: 'ಕಟ್ಟಡ ವಿಸ್ತೀರ್ಣ', percentage: 12.8 },
      { label: 'ಹಸಿರು ನಷ್ಟ', percentage: -8.3 },
      { label: 'ಜಲಮೂಲ ವ್ಯಾಪ್ತಿ', percentage: 4.1 },
    ],
    landCover: [
      { label: 'ಸಾಗುವಳಿ ಭೂಮಿ', percentage: 38.4, color: '#22c55e' },
      { label: 'ವೃಕ್ಷ ಹೊದಿಕೆ', percentage: 24.2, color: '#16a34a' },
      { label: 'ನಗರ ಪರಿಸರ', percentage: 18.7, color: '#60a5fa' },
      { label: 'ಮೇಲ್ಮೈ ನೀರು', percentage: 9.3, color: '#38bdf8' },
      { label: 'ತೆರವುಗೊಳಿಸಿದ ಮಣ್ಣು', percentage: 6.1, color: '#f59e0b' },
      { label: 'ಸಾರಿಗೆ ಜಾಲ', percentage: 3.3, color: '#c084fc' },
    ],
    measurements: { ಪರಿವರ್ತಿತ_ಮೇಲ್ಮೈ: 14.8, ಹೊಸ_ಕಟ್ಟಡಗಳು: 8.9, ಹಸಿರು_ನಷ್ಟ: 4.2 },
    recommendations: [
      'ಹೊಸದಾಗಿ ಅಭಿವೃದ್ಧಿಪಡಿಸಲಾದ ಸಾರಿಗೆ ಕಾರಿಡಾರ್‌ಗಳ ಸ್ಥಳ ಪರಿಶೀಲನೆ ನಡೆಸಿ.',
      'ಸ್ಥಳೀಯ ಕಂದಾಯ ನಕ್ಷೆಗಳನ್ನು ಇತ್ತೀಚಿನ ನಿರ್ಮಾಣಗಳೊಂದಿಗೆ ನವೀಕರಿಸಿ.',
      'ಪರಿಸರ ಸೂಕ್ಷ್ಮ ವಲಯಗಳಲ್ಲಿ ನಿರಂತರ ನಿಗಾ ವ್ಯವಸ್ಥೆಯನ್ನು ಸ್ಥಾಪಿಸಿ.',
    ],
    evidence: [
      'ಸ್ಪೆಕ್ಟ್ರಲ್ ಕಡಿತವು ಮಣ್ಣಿನಿಂದ ಕಾಂಕ್ರೀಟ್‌ಗೆ ತೀಕ್ಷ್ಣ ಬದಲಾವಣೆಯನ್ನು ಬಹಿರಂಗಪಡಿಸುತ್ತದೆ.',
      'ಸೂಚ್ಯಂಕ ವ್ಯತ್ಯಾಸಗಳು ಶಾಶ್ವತ ಮೂಲಸೌಕರ್ಯ ಮಾರ್ಪಾಡುಗಳನ್ನು ತೋರಿಸುತ್ತವೆ.',
      'ಸೆಂಟಿನೆಲ್-1 ರೇಡಾರ್ ಮತ್ತು ಸೆಂಟಿನೆಲ್-2 ಆಪ್ಟಿಕಲ್ ಚಿತ್ರಗಳ ನಡುವೆ ಹೆಚ್ಚಿನ ಹೊಂದಾಣಿಕೆ ಕಂಡುಬಂದಿದೆ.',
    ],
    reliabilityLevel: 'HIGH',
  },
}

// Complete Hindi (hi) AI Response Content
const hindiContent: ModeContentMap = {
  single: {
    summaryBase: (q) => q.includes('water') || q.includes('flood') || q.includes('जल') || q.includes('बाढ़')
      ? 'उपग्रह अवलोकन में जल-संबंधी संकेत स्पष्ट रूप से पहचाने गए हैं; कालिक सत्यापन की सिफारिश की जाती है।'
      : q.includes('agri') || q.includes('कृषि') || q.includes('फसल')
        ? 'दृश्य क्षेत्र में सक्रिय कृषि और वनस्पति आवरण का सफल मानचित्रण किया गया।'
        : q.includes('building') || q.includes('इमारत') || q.includes('शहरी')
          ? 'लक्षित क्षेत्र में इमारती संरचनाएं और आवासीय घनत्व सफलतापूर्वक चिन्हित किए गए हैं।'
          : 'उपग्रह छवि का विश्लेषण पूर्ण; स्पेक्ट्रल साक्ष्यों के साथ सतह की विशेषताओं को निकाला गया।',
    explanation: 'एकल-छवि मल्टी-स्पेक्ट्रल वर्गीकरण सतह सामग्री, वनस्पति ओज और संरचनात्मक सीमाओं को उच्च सटीकता के साथ पहचानता है।',
    objects: [
      { id: 'obj-1', object_type: 'building', label: 'वाणिज्यिक / आवासीय संरचना', confidence: 0.94, x: 22, y: 20, width: 28, height: 22 },
      { id: 'obj-2', object_type: 'road', label: 'प्रमुख परिवहन राजमार्ग', confidence: 0.91, x: 50, y: 42, width: 32, height: 16 },
      { id: 'obj-3', object_type: 'water_body', label: 'सतही जल जलाशय', confidence: 0.95, x: 68, y: 58, width: 20, height: 14 },
    ],
    changes: [
      { label: 'निर्मित क्षेत्र', percentage: 14.5 },
      { label: 'वनस्पति आवरण', percentage: -6.2 },
      { label: 'सतही जल क्षेत्र', percentage: 3.8 },
    ],
    landCover: [
      { label: 'कृषि एवं फसली भूमि', percentage: 39.2, color: '#22c55e' },
      { label: 'शहरी एवं निर्मित क्षेत्र', percentage: 24.6, color: '#60a5fa' },
      { label: 'वन क्षेत्र', percentage: 19.8, color: '#16a34a' },
      { label: 'जल निकाय', percentage: 9.4, color: '#38bdf8' },
      { label: 'खुली बंजर भूमि', percentage: 7.0, color: '#f59e0b' },
    ],
    measurements: { कुल_निगरानी_क्षेत्र: 18.5, निर्मित_क्षेत्र: 4.5, जल_क्षेत्र: 1.7 },
    recommendations: [
      'पहचाने गए भूमि आवरण का वर्तमान राजस्व अभिलेखों से मिलान करें।',
      'सेंटिनल-2 डेटा का उपयोग करके मौसमी सीमा परिवर्तनों की निगरानी करें।',
      'उच्च-मूल्य बुनियादी ढांचे पर निरंतर उपग्रह निगरानी बनाए रखें।',
    ],
    evidence: [
      'मल्टी-स्पेक्ट्रल सूचकांक प्रोफाइल रेड-एज बैंड में स्पष्ट अवशोषण गिरावट दर्शाते हैं।',
      'परावर्तन प्रवणता वनस्पति और कंक्रीट सतहों के बीच स्पष्ट संक्रमण की पुष्टि करती है।',
      'स्थानिक ज्यामिति क्षेत्रीय बेंचमार्क के जमीनी साक्ष्यों से मेल खाती है।',
    ],
    reliabilityLevel: 'HIGH',
  },
  disaster: {
    summaryBase: () => 'बुनियादी ढांचा गलियारों में सतही जल विस्तार और बाढ़ जलभराव के स्पष्ट संकेत पाए गए हैं।',
    explanation: 'आपदा मूल्यांकन सेंटिनल-1 SAR माइक्रोवेव रडार और सेंटिनल-2 ऑप्टिकल इमेजरी को जोड़कर जलभराव, डूबे हुए मार्गों और संरचनात्मक जोखिम क्षेत्रों की पहचान करता है।',
    objects: [
      { id: 'dis-1', object_type: 'water_body', label: 'जलभराव / बाढ़ का पानी', confidence: 0.91, x: 18, y: 30, width: 34, height: 24 },
      { id: 'dis-2', object_type: 'road', label: 'जलमग्न परिवहन सड़क', confidence: 0.86, x: 55, y: 52, width: 22, height: 14 },
    ],
    changes: [
      { label: 'प्रभावित सतह क्षेत्र', percentage: 27.4 },
      { label: 'जल विस्तार में वृद्धि', percentage: 18.6 },
      { label: 'जलमग्न कृषि भूमि', percentage: 11.2 },
    ],
    landCover: [
      { label: 'जलमग्न क्षेत्र', percentage: 27.4, color: '#38bdf8' },
      { label: 'प्रभावित कृषि क्षेत्र', percentage: 31.2, color: '#22c55e' },
      { label: 'बस्ती सीमा क्षेत्र', percentage: 19.5, color: '#60a5fa' },
      { label: 'अप्रभावित वन क्षेत्र', percentage: 21.9, color: '#16a34a' },
    ],
    measurements: { प्रभावित_क्षेत्र: 14.2, जलभराव_क्षेत्र: 8.1, क्षतिग्रस्त_मार्ग: 3.4 },
    recommendations: [
      'जलमग्न परिवहन क्षेत्रों में तत्काल ड्रोन या हवाई सत्यापन सुनिश्चित करें।',
      'बाढ़ से घिरे निचले इलाकों की बस्तियों तक राहत पहुंचाने को प्राथमिकता दें।',
      'जल निकासी की दर को ट्रैक करने के लिए आगामी SAR रडार डेटा प्राप्त करें।',
    ],
    evidence: [
      'रडार बैकस्कैटर में तीव्र गिरावट सतही जल के सीधे परावर्तन की पुष्टि करती है।',
      'मल्टी-टेम्पोरल अंतर कृषि क्षेत्रों में परावर्तन में अचानक कमी को उजागर करता है।',
      'स्थलाकृतिक ढलान सहसंबंध निचले क्षेत्रों में जल संचय की पुष्टि करता है।',
    ],
    reliabilityLevel: 'MEDIUM',
  },
  agriculture: {
    summaryBase: () => 'फसल ओज, कैनोपी क्लोरोफिल परावर्तन और फसल नमी की स्थिति का सफलतापूर्वक मानचित्रण किया गया।',
    explanation: 'कृषि इंटेलिजेंस सेंटिनल-2 रेड-एज और एनआईआर (NIR) परावर्तन का उपयोग करके फसल एनडीवीआई (NDVI), नमी की कमी और प्रकाश संश्लेषण गतिविधि की गणना करता है।',
    objects: [
      { id: 'ag-1', object_type: 'agricultural_field', label: 'स्वस्थ एवं सघन फसल क्षेत्र', confidence: 0.96, x: 14, y: 22, width: 36, height: 28 },
      { id: 'ag-2', object_type: 'agricultural_field', label: 'नमी की कमी वाला फसल क्षेत्र', confidence: 0.89, x: 58, y: 35, width: 26, height: 22 },
      { id: 'ag-3', object_type: 'water_body', label: 'सिंचाई नहर', confidence: 0.93, x: 42, y: 64, width: 32, height: 10 },
    ],
    changes: [
      { label: 'कैनोपी एनडीवीआई इंडेक्स', percentage: 14.2 },
      { label: 'मृदा नमी की कमी', percentage: -6.4 },
      { label: 'खाली कृषि भूमि क्षेत्र', percentage: -7.8 },
    ],
    landCover: [
      { label: 'सक्रिय फसली भूमि', percentage: 52.4, color: '#22c55e' },
      { label: 'चारागाह / घास का मैदान', percentage: 21.3, color: '#84cc16' },
      { label: 'परती / खाली भूमि', percentage: 14.8, color: '#f59e0b' },
      { label: 'नहर एवं सिंचाई जल', percentage: 6.5, color: '#38bdf8' },
      { label: 'कृषि अवसंरचना', percentage: 5.0, color: '#64748b' },
    ],
    measurements: { कुल_कृषि_क्षेत्र: 42.8, सिंचित_क्षेत्र: 28.5, तनाव_क्षेत्र: 6.4 },
    recommendations: [
      'नमी की कमी वाले पश्चिमी क्षेत्र में लक्षित ड्रिप सिंचाई की योजना बनाएं।',
      'कम ओज वाले क्षेत्रों में स्थानीय मिट्टी के पोषक तत्वों का परीक्षण करें।',
      'अगले सेंटिनल-2 ओवरपास के दौरान फसल सुधार की स्थिति को ट्रैक करें।',
    ],
    evidence: [
      'उच्च एनआईआर परावर्तन पार्सल ए में स्वस्थ कोशिका संरचना की पुष्टि करता है।',
      'एसडब्ल्यूआईआर (SWIR) अवशोषण सेक्टर बी में नमी की कमी को दर्शाता है।',
      'मल्टी-स्पेक्ट्रल रेड-एज ढलान सक्रिय वानस्पतिक विकास चक्र को प्रमाणित करता है।',
    ],
    reliabilityLevel: 'HIGH',
  },
  urban_growth: {
    summaryBase: () => 'शहरी विस्तार, इमारतों का सघन होना और नए परिवहन गलियारे का निर्माण चिन्हित किया गया।',
    explanation: 'शहरी स्थानिक विश्लेषण वनस्पति और खाली भूमि के कंक्रीट संरचनाओं, नए डामर मार्गों और भवनों में रूपांतरण का मापन करता है।',
    objects: [
      { id: 'urb-1', object_type: 'building', label: 'नया वाणिज्यिक निर्माण क्षेत्र', confidence: 0.96, x: 22, y: 16, width: 30, height: 24 },
      { id: 'urb-2', object_type: 'road', label: 'चौड़ा किया गया मुख्य राजमार्ग', confidence: 0.93, x: 48, y: 44, width: 38, height: 16 },
      { id: 'urb-3', object_type: 'building', label: 'सघन आवासीय विकास क्षेत्र', confidence: 0.91, x: 64, y: 20, width: 22, height: 26 },
    ],
    changes: [
      { label: 'कंक्रीट सतह का विस्तार', percentage: 13.7 },
      { label: 'नए भवनों का निर्माण', percentage: 22.4 },
      { label: 'हरित क्षेत्र में कमी', percentage: -15.1 },
    ],
    landCover: [
      { label: 'निर्मित क्षेत्र / कंक्रीट', percentage: 48.6, color: '#60a5fa' },
      { label: 'सड़कें और राजमार्ग', percentage: 18.2, color: '#94a3b8' },
      { label: 'शहरी हरित क्षेत्र / पार्क', percentage: 15.4, color: '#16a34a' },
      { label: 'निर्माणाधीन स्थल', percentage: 12.1, color: '#f59e0b' },
      { label: 'शहरी जल निकाय', percentage: 5.7, color: '#38bdf8' },
    ],
    measurements: { कुल_शहरी_क्षेत्र: 17.2, नए_भवन: 4.8, सड़क_जाल: 6.1 },
    recommendations: [
      'नए निर्माण क्षेत्रों को नगरपालिका मास्टर प्लान से सत्यापित करें।',
      'नए पक्के मार्गों के आसपास वर्षा जल निकासी क्षमता का आकलन करें।',
      'शेष प्राकृतिक हरित गलियारों के चारों ओर पारिस्थितिक बफर बनाए रखें।',
    ],
    evidence: [
      'स्पेक्ट्रल बदलाव मिट्टी से उच्च-परावर्तन वाली छतों में रूपांतरण दर्शाता है।',
      'ऑप्टिकल छवियों में रैखिक निरंतरता नई सड़क निर्माण के अनुरूप है।',
      'सतही तापीय उत्सर्जन पक्के क्षेत्रों से उत्पन्न स्थानीय गर्मी को दर्शाता है।',
    ],
    reliabilityLevel: 'HIGH',
  },
  optical_sar: {
    summaryBase: () => 'ऑप्टिकल और सिंथेटिक एपर्चर रडार (SAR) संलयन विश्लेषण पूर्ण हुआ।',
    explanation: 'सेंसर संलयन सेंटिनल-1 रडार की सतह खुरदरापन पहचान को सेंटिनल-2 ऑप्टिकल की वनस्पति स्वास्थ्य पहचान के साथ एकीकृत करता है।',
    objects: [
      { id: 'sar-1', object_type: 'building', label: 'SAR डबल-बाउंस संरचनात्मक क्लस्टर', confidence: 0.96, x: 24, y: 20, width: 28, height: 22 },
      { id: 'sar-2', object_type: 'road', label: 'उच्च खुरदरापन परिवहन मार्ग', confidence: 0.92, x: 50, y: 40, width: 34, height: 16 },
      { id: 'sar-3', object_type: 'water_body', label: 'शांत जल सतह (रडार लो)', confidence: 0.95, x: 66, y: 56, width: 20, height: 14 },
    ],
    changes: [
      { label: 'SAR संरचनात्मक परावर्तन', percentage: 18.4 },
      { label: 'ऑप्टिकल एनडीवीआई वनस्पति', percentage: -9.1 },
      { label: 'मिट्टी नमी संकेत', percentage: 7.2 },
    ],
    landCover: [
      { label: 'कंक्रीट संरचनाएं (SAR)', percentage: 44.2, color: '#60a5fa' },
      { label: 'वनस्पति आवरण (ऑप्टिकल)', percentage: 29.5, color: '#22c55e' },
      { label: 'जल सतह (SAR)', percentage: 14.1, color: '#38bdf8' },
      { label: 'मिट्टी / संक्रमण क्षेत्र', percentage: 12.2, color: '#f59e0b' },
    ],
    measurements: { कुल_संलयित_क्षेत्र: 24.6, रडार_निर्मित_क्षेत्र: 10.8, ऑप्टिकल_वनस्पति: 7.2 },
    recommendations: [
      'संरचना अभिविन्यास की पुष्टि के लिए SAR ध्रुवीकरण अनुपात का उपयोग करें।',
      'सतह के सूक्ष्म धंसाव का पता लगाने के लिए सेंटिनल-1 डेटा का उपयोग करें।',
      'जलभराव वाले पौधों को खुले पानी से अलग करने के लिए SWIR और रडार को मिलाएं।',
    ],
    evidence: [
      'सेंटिनल-1 लंबवत संरचनाओं से विशिष्ट डबल-बाउंस परावर्तन दर्ज करता है।',
      'सेंटिनल-2 एनआईआर बैंड खुले क्षेत्रों में प्रकाश संश्लेषण गतिविधि की पुष्टि करता है।',
      'सेंसर संलयन ऑप्टिकल छाया वाले क्षेत्रों की अस्पष्टता को समाप्त करता है।',
    ],
    reliabilityLevel: 'HIGH',
  },
  before_after: {
    summaryBase: () => 'पहले और बाद की छवियों की तुलना में महत्वपूर्ण सतह परिवर्तन सामने आए हैं।',
    explanation: 'मल्टी-टेम्पोरल पिक्सल तुलना बुनियादी ढांचे के विस्तार, नई इमारतों के निर्माण और हरित आवरण में कमी को दर्शाती है।',
    objects: [
      { id: 'ch-1', object_type: 'building', label: 'नया निर्माण क्षेत्र (हालिया)', confidence: 0.95, x: 22, y: 18, width: 30, height: 22 },
      { id: 'ch-2', object_type: 'road', label: 'नया पक्का मार्ग (हालिया)', confidence: 0.91, x: 46, y: 38, width: 32, height: 16 },
      { id: 'ch-3', object_type: 'water_body', label: 'संरक्षित जल निकाय', confidence: 0.94, x: 68, y: 56, width: 18, height: 14 },
    ],
    changes: [
      { label: 'शहरी विस्तार', percentage: 12.8 },
      { label: 'वनस्पति में कमी', percentage: -8.3 },
      { label: 'जल निकाय परिवर्तन', percentage: 4.1 },
    ],
    landCover: [
      { label: 'शहरीकृत क्षेत्र', percentage: 42.1, color: '#60a5fa' },
      { label: 'कृषि भूमि', percentage: 32.4, color: '#22c55e' },
      { label: 'वन / वृक्ष आवरण', percentage: 13.8, color: '#16a34a' },
      { label: 'जल निकाय', percentage: 8.2, color: '#38bdf8' },
      { label: 'सड़कें', percentage: 3.5, color: '#c084fc' },
    ],
    measurements: { कुल_परिवर्तित_क्षेत्र: 14.8, शहरी_विस्तार: 8.9, हरित_कमी: 4.2 },
    recommendations: [
      'नए सड़क गलियारे की क्षेत्रीय विकास योजनाओं से पुष्टि करें।',
      'नदी तटीय क्षेत्रों में मिट्टी के कटाव की निरंतर निगरानी करें।',
      'अगले सेंटिनल ओवरपास के बाद परिवर्तन मेट्रिक्स की पुनः समीक्षा करें।',
    ],
    evidence: [
      'पिक्सल स्तर का अंतर निर्माण क्षेत्रों में तीक्ष्ण परावर्तन परिवर्तन दिखाता है।',
      'सूचकांक परिवर्तन मानव-निर्मित स्थायी संशोधनों की पुष्टि करता है।',
      'हालिया अधिग्रहण में उच्च कंट्रास्ट ज्यामिति स्थायी विकास को दर्शाती है।',
    ],
    reliabilityLevel: 'HIGH',
  },
  change_detection: {
    summaryBase: () => 'स्वचालित स्पेक्ट्रल परिवर्तन पहचान ने भूमि रूपांतरण के पैटर्न चिन्हित किए हैं।',
    explanation: 'कालिक स्पेक्ट्रल अंतर विश्लेषण स्थायी शहरी विकास और वनस्पति परिवर्तन के स्पष्ट पैटर्न प्रदर्शित करता है।',
    objects: [
      { id: 'cd-1', object_type: 'building', label: 'नई संरचनात्मक इमारत', confidence: 0.94, x: 20, y: 18, width: 28, height: 20 },
      { id: 'cd-2', object_type: 'road', label: 'परिवहन मार्ग विस्तार', confidence: 0.89, x: 52, y: 42, width: 26, height: 18 },
      { id: 'cd-3', object_type: 'water_body', label: 'जल संचयन क्षेत्र', confidence: 0.94, x: 68, y: 58, width: 16, height: 12 },
    ],
    changes: [
      { label: 'निर्मित क्षेत्र', percentage: 12.8 },
      { label: 'हरित आवरण में कमी', percentage: -8.3 },
      { label: 'जल विस्तार', percentage: 4.1 },
    ],
    landCover: [
      { label: 'फसली भूमि', percentage: 38.4, color: '#22c55e' },
      { label: 'वृक्ष आच्छादन', percentage: 24.2, color: '#16a34a' },
      { label: 'शहरी पर्यावरण', percentage: 18.7, color: '#60a5fa' },
      { label: 'सतही जल', percentage: 9.3, color: '#38bdf8' },
      { label: 'खाली मिट्टी', percentage: 6.1, color: '#f59e0b' },
      { label: 'परिवहन नेटवर्क', percentage: 3.3, color: '#c084fc' },
    ],
    measurements: { रूपांतरित_सतह: 14.8, नए_भवन_क्षेत्र: 8.9, हरित_नुकसान: 4.2 },
    recommendations: [
      'नए विकसित परिवहन गलियारों का साइट पर निरीक्षण करें।',
      'स्थानीय राजस्व मानचित्रों को नए निर्माणों के साथ अपडेट करें।',
      'पारिस्थितिक रूप से संवेदनशील क्षेत्रों में सतत निगरानी तंत्र स्थापित करें।',
    ],
    evidence: [
      'स्पेक्ट्रल घटाव मिट्टी से कंक्रीट में तेज बदलाव को प्रकट करता है।',
      'सूचकांक अंतर स्थायी बुनियादी ढांचे के संशोधनों को प्रमाणित करता है।',
      'सेंटिनल रडार और ऑप्टिकल अधिग्रहण के बीच उच्च सामंजस्य देखा गया है।',
    ],
    reliabilityLevel: 'HIGH',
  },
}

// Function that builds localized content for any supported language
export const getLocalizedAiContent = (mode: AnalysisMode, prompt: string, language: LanguageCode): MockAiPayload => {
  let contentMap = englishContent

  if (language === 'kn') {
    contentMap = kannadaContent
  } else if (language === 'hi') {
    contentMap = hindiContent
  } else {
    // For other languages (te, ta, ml, mr, es, fr), adapt based on available templates with localized summaries & labels
    const base = englishContent[mode] || englishContent.single
    const qLower = prompt.toLowerCase()
    
    // Localized prompt-aware summaries
    const summaries: Record<LanguageCode, string> = {
      en: base.summaryBase(qLower),
      kn: kannadaContent[mode]?.summaryBase(qLower) || base.summaryBase(qLower),
      hi: hindiContent[mode]?.summaryBase(qLower) || base.summaryBase(qLower),
      es: `Análisis de teledetección completado para la consulta: "${prompt}". Firmas espectrales identificadas con evidencia de Sentinel.`,
      fr: `Analyse de télédétection complétée pour la requête : « ${prompt} ». Signatures spectrales identifiées avec preuves Sentinel.`,
      te: `ప్రశ్న "${prompt}" కొరకు ఉపగ్రహ విశ్లేషణ విజయవంతంగా పూర్తయింది. స్పెక్ట్రల్ ఆధారాలతో భూ ఉపరితల వివరాలు సేకరించబడ్డాయి.`,
      ta: `"${prompt}" என்ற கேள்விக்கான செயற்கைக்கோள் பகுப்பாய்வு வெற்றிகரமாக முடிந்தது. ஆதாரங்களுடன் நிலப்பரப்பு விவரங்கள் கண்டறியப்பட்டன.`,
      ml: `"${prompt}" എന്ന ചോദ്യത്തിനായുള്ള ഉപഗ്രഹ വിശകലനം വിജയകരമായി പൂർത്തിയായി. വ്യക്തമായ വിവരങ്ങളോടെ മാറ്റങ്ങൾ കണ്ടെത്തപ്പെട്ടു.`,
      mr: `"${prompt}" या प्रश्नासाठी उपग्रह विश्लेषण यशस्वीरित्या पूर्ण झाले. स्पेक्ट्रल पुराव्यासह पृष्ठभागाचे तपशील नोंदवले गेले आहेत.`,
    }

    // Localized explanations
    const explanations: Record<LanguageCode, string> = {
      en: base.explanation,
      kn: kannadaContent[mode]?.explanation || base.explanation,
      hi: hindiContent[mode]?.explanation || base.explanation,
      es: `El flujo de trabajo ${mode.replaceAll('_', ' ')} combina observaciones Sentinel-1 SAR y Sentinel-2 ópticas para evaluar la cobertura y cambios en el terreno con alta fiabilidad.`,
      fr: `Le flux de travail ${mode.replaceAll('_', ' ')} fusionne les observations Sentinel-1 SAR et Sentinel-2 optiques pour évaluer la couverture et les changements avec une haute fiabilité.`,
      te: `ఈ విశ్లేషణ సెంటినెల్-1 SAR మరియు సెంటినెల్-2 ఆప్టికల్ డేటాను విశ్లేషించి ఉపరితల మార్పులు మరియు భూ వినియోగాన్ని అధిక ఖచ్చితత్వంతో తెలియజేస్తుంది.`,
      ta: `இந்த பகுப்பாய்வு சென்டினல்-1 SAR மற்றும் சென்டினல்-2 ஆப்டிகல் தரவை இணைத்து நிலப்பரப்பு மாற்றங்களை உயர் துல்லியத்துடன் மதிப்பிடுகிறது.`,
      ml: `ഈ വിശകലനം സെന്റിനൽ-1 SAR, സെന്റിനൽ-2 ഒപ്റ്റിക്കൽ വിവരങ്ങൾ സംയോജിപ്പിച്ച് ഭൂപ്രകൃതി മാറ്റങ്ങൾ കൃത്യമായി വിലയിരുത്തുന്നു.`,
      mr: `हे विश्लेषण सेंटिनेल-1 SAR आणि सेंटिनेल-2 ऑप्टिकल डेटा एकत्र करून जमीन बदल आणि संरचनेचे अचूक मूल्यांकन करते.`,
    }

    // Localized recommendations
    const recommendationsMap: Record<LanguageCode, string[]> = {
      en: base.recommendations,
      kn: kannadaContent[mode]?.recommendations || base.recommendations,
      hi: hindiContent[mode]?.recommendations || base.recommendations,
      es: [
        'Verificar las zonas identificadas con imágenes satelitales de alta resolución recientes.',
        'Priorizar la inspección de áreas de infraestructura y asentamientos cercanos.',
        'Monitorear los cambios en el próximo paso orbital de la constelación Sentinel.',
      ],
      fr: [
        'Vérifier les zones identifiées avec des images satellites haute résolution récentes.',
        'Prioriser l’inspection des infrastructures et des zones habitées à proximité.',
        'Surveiller l’évolution lors du prochain passage orbital de la constellation Sentinel.',
      ],
      te: [
        'గుర్తించిన ప్రాంతాలను ఇటీవలి అధిక-రిజల్యూషన్ ఉపగ్రహ చిత్రాలతో ధృవీకరించండి.',
        'సమీపంలోని ముఖ్యమైన మౌలిక సదుపాయాలు మరియు నివాస ప్రాంతాలను తనిఖీ చేయండి.',
        'తదుపరి సెంటినెల్ ఉపగ్రహ పాస్ ద్వారా మార్పులను నిరంతరం పర్యవేక్షించండి.',
      ],
      ta: [
        'கண்டறியப்பட்ட பகுதிகளை அண்மைய உயர் தெளிவுத்திறன் கொண்ட செயற்கைக்கோள் படங்களுடன் சரிபார்க்கவும்.',
        'அருகிலுள்ள உள்கட்டமைப்பு மற்றும் குடியிருப்பு பகுதிகளை ஆய்வு செய்ய முன்னுரிமை அளிக்கவும்.',
        'அடுத்த சென்டினல் சுற்றுப்பாதை பதிவின் போது தொடர் கண்காணிப்பை மேற்கொள்ளவும்.',
      ],
      ml: [
        'കണ്ടെത്തിയ മേഖലകൾ സമീപകാല ഉയർന്ന റെസല്യൂഷൻ സാറ്റലൈറ്റ് ചിത്രങ്ങളുമായി താരതമ്യം ചെയ്യുക.',
        'സമീപത്തെ പ്രധാന റോഡുകളും ജനവാസ മേഖലകളും നിരീക്ഷിക്കുന്നതിന് മുൻഗണന നൽകുക.',
        'അടുത്ത സെന്റിനൽ സാറ്റലൈറ്റ് പാസിൽ മാറ്റങ്ങൾ തുടർച്ചയായി വിലയിരുത്തുക.',
      ],
      mr: [
        'ओळखल्या गेलेल्या क्षेत्रांची अलीकडील उच्च-रिझोल्यूशन उपग्रह प्रतिमांसह पडताळणी करा.',
        'जवळपासच्या पायाभूत सुविधा आणि वस्त्यांच्या तपासणीला प्राधान्य द्या.',
        'पुढील सेंटिनेल उपग्रह फेरीत बदलांवर सतत लक्ष ठेवा.',
      ],
    }

    // Localized evidence
    const evidenceMap: Record<LanguageCode, string[]> = {
      en: base.evidence,
      kn: kannadaContent[mode]?.evidence || base.evidence,
      hi: hindiContent[mode]?.evidence || base.evidence,
      es: [
        'Las firmas espectrales confirman un contraste marcado entre vegetación y estructuras.',
        'La retrodispersión de radar Sentinel-1 corrobora la estabilidad de la superficie.',
        'La geometría espacial coincide con las características de referencia regional.',
      ],
      fr: [
        'Les signatures spectrales confirment un contraste net entre végétation et structures.',
        'La rétrodiffusion radar Sentinel-1 corrobore la stabilité de la surface observée.',
        'La géométrie spatiale correspond aux caractéristiques de référence régionale.',
      ],
      te: [
        'స్పెక్ట్రల్ విశ్లేషణ వృక్షసంపద మరియు నిర్మాణాల మధ్య స్పష్టమైన వ్యత్యాసాన్ని ధృవీకరిస్తుంది.',
        'సెంటినెల్-1 రాడార్ బ్యాక్‌స్కాటర్ ఉపరితల స్థిరత్వాన్ని ధృవీకరిస్తుంది.',
        'ప్రాంతీయ భూ రికార్డులతో స్థానిక లక్షణాలు కచ్చితంగా సరిపోలుతున్నాయి.',
      ],
      ta: [
        'ஸ்பெக்ட்ரல் பகுப்பாய்வு தாவரங்கள் மற்றும் கட்டிடங்களுக்கு இடையே தெளிவான வேறுபாட்டை உறுதிப்படுத்துகிறது.',
        'சென்டினல்-1 ரேடார் பின்சிதறல் மேற்பரப்பின் நிலைத்தன்மையை உறுதி செய்கிறது.',
        'இடஞ்சார்ந்த வடிவியல் பிராந்திய குறிப்பு அம்சங்களுடன் துல்லியமாக பொருந்துகிறது.',
      ],
      ml: [
        'സ്പെക്ട്രൽ വ്യത്യാസം സസ്യങ്ങളും നിർമ്മിതികളും തമ്മിലുള്ള വേർതിരിവ് സ്ഥിരീകരിക്കുന്നു.',
        'സെന്റിനൽ-1 റഡാർ വിവരങ്ങൾ ഉപരിതല സ്ഥിരത ഉറപ്പാക്കുന്നു.',
        'ഭൂപ്രകൃതി അളവുകൾ പ്രാദേശിക റഫറൻസുകളുമായി പൊരുത്തപ്പെടുന്നു.',
      ],
      mr: [
        'स्पेक्ट्रल विश्लेषण वनस्पती आणि इमारतींमधील स्पष्ट फरक दर्शवते.',
        'सेंटिनेल-1 रडार डेटा पृष्ठभागाच्या स्थिरतेची पुष्टी करतो.',
        'भौगोलिक रचना प्रादेशिक संदर्भ वैशिष्ट्यांशी जुळते.',
      ],
    }

    return {
      summary: summaries[language] || base.summaryBase(qLower),
      detailed_explanation: explanations[language] || base.explanation,
      confidence_score: base.objects.length ? 93 : 89,
      reliability_score: 88,
      detected_objects: base.objects,
      detected_changes: base.changes,
      land_cover_result: base.landCover,
      area_measurements: base.measurements,
      recommendations: recommendationsMap[language] || base.recommendations,
      evidence_data: evidenceMap[language] || base.evidence,
      reliability_level: base.reliabilityLevel,
    }
  }

  const selected = contentMap[mode] || contentMap.single
  return {
    summary: selected.summaryBase(prompt.toLowerCase()),
    detailed_explanation: selected.explanation,
    confidence_score: selected.objects.length ? 94 : 90,
    reliability_score: 89,
    detected_objects: selected.objects,
    detected_changes: selected.changes,
    land_cover_result: selected.landCover,
    area_measurements: selected.measurements,
    recommendations: selected.recommendations,
    evidence_data: selected.evidence,
    reliability_level: selected.reliabilityLevel,
  }
}
