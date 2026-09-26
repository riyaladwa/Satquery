import jsPDF from 'jspdf'
import type { LanguageCode } from '../i18n/translations'

const reportLabels: Record<LanguageCode, {
  reportHeader: string
  subHeader: string
  objective: string
  confidence: string
  reliability: string
  date: string
  summary: string
  detailedAnalysis: string
  evidence: string
  recommendations: string
  landCover: string
  detectedChanges: string
  measurements: string
  confidenceScore: string
  reliabilityIndex: string
  detectedCategories: string
  landCoverClasses: string
  footer: string
}> = {
  en: {
    reportHeader: 'SatQuery AI',
    subHeader: 'Remote Sensing Intelligence & Vision Analysis Report — Single Page Executive Summary',
    objective: 'Objective',
    confidence: 'Confidence',
    reliability: 'Reliability',
    date: 'Date',
    summary: 'Executive Summary',
    detailedAnalysis: 'Detailed Analysis',
    evidence: 'Key Evidence Findings',
    recommendations: 'Strategic Recommendations',
    landCover: 'Land-Cover Distribution',
    detectedChanges: 'Detected Changes & Dynamics',
    measurements: 'Measurements & Diagnostics',
    confidenceScore: 'Confidence Score',
    reliabilityIndex: 'Reliability Index',
    detectedCategories: 'Detected Categories',
    landCoverClasses: 'Land-Cover Classes',
    footer: 'SatQuery AI Remote Sensing Platform · Single Page Summary Report · Confidential & Decision Support',
  },
  kn: {
    reportHeader: 'ಸ್ಯಾಟ್‌ಕ್ವೆರಿ AI (SatQuery)',
    subHeader: 'ದೂರಸಂವೇದಿ ಕೃತಕ ಬುದ್ಧಿಮತ್ತೆ ವರದಿ — ಕಾರ್ಯನಿರ್ವಾಹಕ ಸಾರಾಂಶ',
    objective: 'ಉದ್ದೇಶ (Objective)',
    confidence: 'ನಿಖರತೆ (Confidence)',
    reliability: 'ವಿಶ್ವಾಸಾರ್ಹತೆ (Reliability)',
    date: 'ದಿನಾಂಕ (Date)',
    summary: 'ಕಾರ್ಯನಿರ್ವಾಹಕ ಸಾರಾಂಶ (Executive Summary)',
    detailedAnalysis: 'ವಿವರವಾದ ವಿಶ್ಲೇಷಣೆ (Detailed Analysis)',
    evidence: 'ಪ್ರಮುಖ ಪುರಾವೆ ಸಂಶೋಧನೆಗಳು (Evidence)',
    recommendations: 'ಕಾರ್ಯಾಚರಣಾ ಶಿಫಾರಸುಗಳು (Recommendations)',
    landCover: 'ಭೂ ಹೊದಿಕೆ ವಿತರಣೆ (Land-Cover Distribution)',
    detectedChanges: 'ಪತ್ತೆಯಾದ ಬದಲಾವಣೆಗಳು (Detected Changes)',
    measurements: 'ಅಳತೆಗಳು ಮತ್ತು ಫಲಿತಾಂಶಗಳು (Measurements)',
    confidenceScore: 'ನಿಖರತೆ ಸ್ಕೋರ್ (Confidence Score)',
    reliabilityIndex: 'ವಿಶ್ವಾಸಾರ್ಹತೆ ಸೂಚ್ಯಂಕ (Reliability Index)',
    detectedCategories: 'ಗುರುತಿಸಲಾದ ವರ್ಗಗಳು (Categories)',
    landCoverClasses: 'ಭೂ ಹೊದಿಕೆ ವಿಭಾಗಗಳು (Classes)',
    footer: 'ಸ್ಯಾಟ್‌ಕ್ವೆರಿ AI ರಿಮೋಟ್ ಸೆನ್ಸಿಂಗ್ ಪ್ಲಾಟ್‌ಫಾರ್ಮ್ · ಅಧಿಕೃತ ವರದಿ · ನಿರ್ಧಾರ ಬೆಂಬಲ ವ್ಯವಸ್ಥೆ',
  },
  hi: {
    reportHeader: 'सैटक्वेरी AI (SatQuery)',
    subHeader: 'रिमोट सेंसिंग इंटेलिजेंस रिपोर्ट — एकल पृष्ठ कार्यकारी सारांश',
    objective: 'उद्देश्य (Objective)',
    confidence: 'सटीकता (Confidence)',
    reliability: 'विश्वसनीयता (Reliability)',
    date: 'दिनांक (Date)',
    summary: 'कार्यकारी सारांश (Executive Summary)',
    detailedAnalysis: 'विस्तृत विश्लेषण (Detailed Analysis)',
    evidence: 'प्रमुख साक्ष्य निष्कर्ष (Key Evidence)',
    recommendations: 'रणनीतिक सिफारिशें (Recommendations)',
    landCover: 'भूमि आवरण वितरण (Land-Cover Distribution)',
    detectedChanges: 'पहचाने गए परिवर्तन (Detected Changes)',
    measurements: 'मापन एवं निदान (Measurements)',
    confidenceScore: 'सटीकता स्कोर (Confidence Score)',
    reliabilityIndex: 'विश्वसनीयता सूचकांक (Reliability Index)',
    detectedCategories: 'पहचाने गए वर्ग (Categories)',
    landCoverClasses: 'भूमि आवरण श्रेणियां (Classes)',
    footer: 'सैटक्वेरी AI रिमोट सेंसिंग प्लेटफॉर्म · एकल पृष्ठ सारांश रिपोर्ट · निर्णय समर्थन',
  },
  es: {
    reportHeader: 'SatQuery AI',
    subHeader: 'Informe de inteligencia de teledetección — Resumen ejecutivo',
    objective: 'Objetivo',
    confidence: 'Confianza',
    reliability: 'Fiabilidad',
    date: 'Fecha',
    summary: 'Resumen ejecutivo',
    detailedAnalysis: 'Análisis detallado',
    evidence: 'Hallazgos de evidencia clave',
    recommendations: 'Recomendaciones estratégicas',
    landCover: 'Distribución de cobertura del suelo',
    detectedChanges: 'Cambios y dinámica detectados',
    measurements: 'Mediciones y diagnósticos',
    confidenceScore: 'Puntaje de confianza',
    reliabilityIndex: 'Índice de fiabilidad',
    detectedCategories: 'Categorías detectadas',
    landCoverClasses: 'Clases de cobertura',
    footer: 'Plataforma de teledetección SatQuery AI · Informe de resumen · Soporte para decisiones',
  },
  fr: {
    reportHeader: 'SatQuery AI',
    subHeader: 'Rapport d’intelligence de télédétection — Résumé exécutif',
    objective: 'Objectif',
    confidence: 'Confiance',
    reliability: 'Fiabilité',
    date: 'Date',
    summary: 'Résumé exécutif',
    detailedAnalysis: 'Analyse détaillée',
    evidence: 'Preuves et constatations clés',
    recommendations: 'Recommandations stratégiques',
    landCover: 'Répartition de l’occupation des sols',
    detectedChanges: 'Changements et dynamiques détectés',
    measurements: 'Mesures et diagnostics',
    confidenceScore: 'Score de confiance',
    reliabilityIndex: 'Indice de fiabilité',
    detectedCategories: 'Catégories détectées',
    landCoverClasses: 'Classes d’occupation des sols',
    footer: 'Plateforme de télédétection SatQuery AI · Rapport de synthèse · Aide à la décision',
  },
  te: {
    reportHeader: 'శాట్‌క్వెరీ AI (SatQuery)',
    subHeader: 'రిమోట్ సెన్సింగ్ ఇంటెలిజెన్స్ నివేదిక — కార్యనిర్వాహక సారాంశం',
    objective: 'లక్ష్యం (Objective)',
    confidence: 'ఖచ్చితత్వం (Confidence)',
    reliability: 'విశ్వసనీయత (Reliability)',
    date: 'తేదీ (Date)',
    summary: 'కార్యనిర్వాహక సారాంశం (Executive Summary)',
    detailedAnalysis: 'వివరణాత్మక విశ్లేషణ (Detailed Analysis)',
    evidence: 'కీలక ఆధారాలు (Evidence Findings)',
    recommendations: 'సిఫార్సులు (Recommendations)',
    landCover: 'భూ కవరేజ్ పంపిణీ (Land-Cover Distribution)',
    detectedChanges: 'గుర్తించిన మార్పులు (Detected Changes)',
    measurements: 'కొలతలు మరియు ఫలితాలు (Measurements)',
    confidenceScore: 'ఖచ్చితత్వ స్కోరు (Confidence Score)',
    reliabilityIndex: 'విశ్వసనీయత సూచిక (Reliability Index)',
    detectedCategories: 'గుర్తించబడిన వర్గాలు (Categories)',
    landCoverClasses: 'భూమి వర్గాలు (Classes)',
    footer: 'శాట్‌క్వెరీ AI రిమోట్ సెన్సింగ్ ప్లాట్‌ఫారమ్ · సారాంశ నివేదిక · నిర్ణయ మద్దతు',
  },
  ta: {
    reportHeader: 'சாட்குவெரி AI (SatQuery)',
    subHeader: 'தொலையுணர்வு செயற்கை நுண்ணறிவு அறிக்கை — செயல்முறை சுருக்கம்',
    objective: 'நோக்கம் (Objective)',
    confidence: 'துல்லியம் (Confidence)',
    reliability: 'நம்பகத்தன்மை (Reliability)',
    date: 'தேதி (Date)',
    summary: 'செயல்முறை சுருக்கம் (Executive Summary)',
    detailedAnalysis: 'விரிவான பகுப்பாய்வு (Detailed Analysis)',
    evidence: 'முக்கிய ஆதாரங்கள் (Evidence Findings)',
    recommendations: 'பரிந்துரைகள் (Recommendations)',
    landCover: 'நிலப்பரப்பு விநியோகம் (Land-Cover Distribution)',
    detectedChanges: 'கண்டறியப்பட்ட மாற்றங்கள் (Detected Changes)',
    measurements: 'அளவீடுகள் (Measurements)',
    confidenceScore: 'துல்லிய மதிப்பெண் (Confidence Score)',
    reliabilityIndex: 'நம்பகத்தன்மை குறியீடு (Reliability Index)',
    detectedCategories: 'கண்டறியப்பட்ட பிரிவுகள் (Categories)',
    landCoverClasses: 'நிலப்பரப்பு வகுப்புகள் (Classes)',
    footer: 'சாட்குவெரி AI தொலையுணர்வு தளம் · சுருக்க அறிக்கை · முடிவெடுக்கும் ஆதரவு',
  },
  ml: {
    reportHeader: 'സാറ്റ്ക്വറി AI (SatQuery)',
    subHeader: 'റിമോട്ട് സെൻസിംഗ് ഇന്റലിജൻസ് റിപ്പോർട്ട് — സംഗ്രഹം',
    objective: 'ലക്ഷ്യം (Objective)',
    confidence: 'കൃത്യത (Confidence)',
    reliability: 'വിശ്വാസ്യത (Reliability)',
    date: 'തീയതി (Date)',
    summary: 'എക്സിക്യൂട്ടീവ് സംഗ്രഹം (Executive Summary)',
    detailedAnalysis: 'വിശദമായ വിശകലനം (Detailed Analysis)',
    evidence: 'പ്രധാന തെളിവുകൾ (Evidence Findings)',
    recommendations: 'ശുപാർശകൾ (Recommendations)',
    landCover: 'ഭൂപ്രകൃതി വിതരണം (Land-Cover Distribution)',
    detectedChanges: 'കണ്ടെത്തിയ മാറ്റങ്ങൾ (Detected Changes)',
    measurements: 'അളവുകൾ (Measurements)',
    confidenceScore: 'കൃത്യത സ്കോർ (Confidence Score)',
    reliabilityIndex: 'വിശ്വാസ്യത സൂചിക (Reliability Index)',
    detectedCategories: 'കണ്ടെത്തിയ വിഭാഗങ്ങൾ (Categories)',
    landCoverClasses: 'ഭൂപ്രകൃതി ക്ലാസുകൾ (Classes)',
    footer: 'സാറ്റ്ക്വറി AI റിമോട്ട് സെൻസിംഗ് പ്ലാറ്റ്ഫോം · സംഗ്രഹ റിപ്പോർട്ട്',
  },
  mr: {
    reportHeader: 'सॅटक्यूरी AI (SatQuery)',
    subHeader: 'रिमोट सेन्सिंग इंटेलिजन्स अहवाल — कार्यकारी सारांश',
    objective: 'उद्देश (Objective)',
    confidence: 'अचूकता (Confidence)',
    reliability: 'विश्वासार्हता (Reliability)',
    date: 'दिनांक (Date)',
    summary: 'कार्यकारी सारांश (Executive Summary)',
    detailedAnalysis: 'तपशीलवार विश्लेषण (Detailed Analysis)',
    evidence: 'प्रमुख पुरावे निष्कर्ष (Evidence Findings)',
    recommendations: 'धोरणात्मक शिफारसी (Recommendations)',
    landCover: 'जमीन आच्छादन वितरण (Land-Cover Distribution)',
    detectedChanges: 'ओळखले गेलेले बदल (Detected Changes)',
    measurements: 'मोजमाप आणि निकाल (Measurements)',
    confidenceScore: 'अचूकता स्कोअर (Confidence Score)',
    reliabilityIndex: 'विश्वासार्हता निर्देशांक (Reliability Index)',
    detectedCategories: 'ओळखल्या गेलेल्या श्रेणी (Categories)',
    landCoverClasses: 'जमीन आच्छादन वर्ग (Classes)',
    footer: 'सॅटक्यूरी AI रिमोट सेन्सिंग प्लॅटफॉर्म · सारांश अहवाल · निर्णय समर्थन',
  },
}

type ChartItem = { label: string; value: number; color?: string }

const chartColors = [
  [59, 130, 246],
  [16, 185, 129],
  [245, 158, 11],
  [239, 68, 68],
  [139, 92, 246],
  [20, 184, 166],
]

const hexToRgb = (color: string | undefined, fallback: number[]) => {
  if (!color?.startsWith('#') || color.length !== 7) return fallback
  return [1, 3, 5].map((index) => Number.parseInt(color.slice(index, index + 2), 16))
}

const drawPieChart = (pdf: jsPDF, items: ChartItem[], centerX: number, centerY: number, radius: number) => {
  const positiveItems = items.filter((item) => Number.isFinite(item.value) && item.value > 0)
  const total = positiveItems.reduce((sum, item) => sum + item.value, 0)
  if (!total) {
    pdf.setFontSize(10)
    pdf.setTextColor(100, 116, 139)
    pdf.text('No land-cover data available.', centerX - 30, centerY)
    return
  }

  let startAngle = -Math.PI / 2
  positiveItems.forEach((item, index) => {
    const endAngle = startAngle + (item.value / total) * Math.PI * 2
    const color = hexToRgb(item.color, chartColors[index % chartColors.length])
    pdf.setFillColor(color[0], color[1], color[2])
    const steps = Math.max(2, Math.ceil((endAngle - startAngle) * 18))
    for (let step = 0; step < steps; step += 1) {
      const firstAngle = startAngle + ((endAngle - startAngle) * step) / steps
      const secondAngle = startAngle + ((endAngle - startAngle) * (step + 1)) / steps
      pdf.triangle(
        centerX,
        centerY,
        centerX + Math.cos(firstAngle) * radius,
        centerY + Math.sin(firstAngle) * radius,
        centerX + Math.cos(secondAngle) * radius,
        centerY + Math.sin(secondAngle) * radius,
        'F',
      )
    }
    startAngle = endAngle
  })
}

const drawLegend = (pdf: jsPDF, items: ChartItem[], startX: number, startY: number, total: number) => {
  items.slice(0, 6).forEach((item, index) => {
    const color = hexToRgb(item.color, chartColors[index % chartColors.length])
    const y = startY + index * 9
    pdf.setFillColor(color[0], color[1], color[2])
    pdf.rect(startX, y - 4, 4, 4, 'F')
    pdf.setTextColor(51, 65, 85)
    pdf.setFontSize(9)
    pdf.text(`${item.label}: ${item.value.toFixed(1)}%`, startX + 7, y)
  })
  if (!items.length || total <= 0) {
    pdf.setTextColor(100, 116, 139)
    pdf.setFontSize(9)
    pdf.text('No data', startX, startY)
  }
}

const drawBarChart = (pdf: jsPDF, items: ChartItem[], startX: number, startY: number, width: number, height: number) => {
  const values = items.filter((item) => Number.isFinite(item.value))
  const maxValue = Math.max(...values.map((item) => Math.abs(item.value)), 1)
  pdf.setDrawColor(203, 213, 225)
  pdf.line(startX, startY + height, startX + width, startY + height)
  if (!values.length) {
    pdf.setFontSize(10)
    pdf.setTextColor(100, 116, 139)
    pdf.text('No change data available.', startX, startY + height / 2)
    return
  }

  const barWidth = Math.min(25, (width - 12) / values.length - 4)
  values.slice(0, 8).forEach((item, index) => {
    const barHeight = (Math.abs(item.value) / maxValue) * (height - 18)
    const x = startX + 8 + index * ((width - 8) / values.length)
    const y = item.value < 0 ? startY + height : startY + height - barHeight
    pdf.setFillColor(...chartColors[index % chartColors.length] as [number, number, number])
    pdf.rect(x, y, barWidth, item.value < 0 ? barHeight : barHeight, 'F')
    pdf.setTextColor(51, 65, 85)
    pdf.setFontSize(8)
    pdf.text(`${item.value > 0 ? '+' : ''}${item.value.toFixed(1)}%`, x, y - 3)
    const label = item.label.length > 16 ? `${item.label.slice(0, 15)}...` : item.label
    pdf.text(label, x, startY + height + 10, { angle: 0 })
  })
}

export const generateAnalysisPdf = async (payload: {
  title: string
  query: string
  summary: string
  explanation: string
  evidence: string[]
  recommendations: string[]
  confidence: number
  reliability: number
  landCover?: Array<{ label: string; percentage: number; color: string }>
  detectedChanges?: Array<{ label: string; percentage: number }>
  areaMeasurements?: Record<string, number>
  image?: string
  language?: LanguageCode
}) => {
  const lang = payload.language || 'en'
  const labels = reportLabels[lang] || reportLabels.en
  const pdf = new jsPDF()

  // Top header bar (compact single-page banner)
  pdf.setFillColor(15, 23, 42)
  pdf.rect(0, 0, 210, 22, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(16)
  pdf.text(labels.reportHeader, 14, 14)
  pdf.setFontSize(8)
  pdf.setTextColor(148, 163, 184)
  pdf.text(labels.subHeader, 65, 14)

  // Meta header
  pdf.setTextColor(15, 23, 42)
  pdf.setFontSize(13)
  pdf.text(payload.title || 'Analysis Report', 14, 30)

  pdf.setFontSize(8.5)
  pdf.setTextColor(71, 85, 105)
  const queryTruncated = payload.query?.length > 110 ? `${payload.query.slice(0, 108)}...` : (payload.query || 'Default inquiry')
  pdf.text(`${labels.objective}: ${queryTruncated}`, 14, 36)
  pdf.text(`${labels.confidence}: ${payload.confidence}%  |  ${labels.reliability}: ${payload.reliability}%  |  ${labels.date}: ${new Date().toLocaleDateString()}`, 14, 41)

  pdf.setDrawColor(226, 232, 240)
  pdf.line(14, 44, 196, 44)

  // Two-column layout for single-page presentation
  // Left column: Narrative (Summary, Detailed Analysis, Evidence, Recommendations)
  const leftX = 14
  const leftW = 92
  let leftY = 50

  // 1. Summary
  pdf.setFontSize(10)
  pdf.setTextColor(15, 23, 42)
  pdf.text(labels.summary, leftX, leftY)
  leftY += 5
  pdf.setFontSize(8)
  pdf.setTextColor(51, 65, 85)
  const summaryLines = pdf.splitTextToSize(payload.summary || 'No summary available.', leftW)
  pdf.text(summaryLines.slice(0, 6), leftX, leftY)
  leftY += Math.min(summaryLines.length, 6) * 4.2 + 5

  // 2. Detailed Analysis
  pdf.setFontSize(10)
  pdf.setTextColor(15, 23, 42)
  pdf.text(labels.detailedAnalysis, leftX, leftY)
  leftY += 5
  pdf.setFontSize(8)
  pdf.setTextColor(51, 65, 85)
  const explLines = pdf.splitTextToSize(payload.explanation || 'No detailed explanation available.', leftW)
  pdf.text(explLines.slice(0, 8), leftX, leftY)
  leftY += Math.min(explLines.length, 8) * 4.2 + 5

  // 3. Evidence
  pdf.setFontSize(10)
  pdf.setTextColor(15, 23, 42)
  pdf.text(labels.evidence, leftX, leftY)
  leftY += 5
  pdf.setFontSize(8)
  pdf.setTextColor(51, 65, 85)
  ;(payload.evidence ?? []).slice(0, 4).forEach((item, index) => {
    const lines = pdf.splitTextToSize(`${index + 1}. ${item}`, leftW)
    pdf.text(lines.slice(0, 2), leftX, leftY)
    leftY += Math.min(lines.length, 2) * 4.2 + 1.5
  })
  leftY += 3

  // 4. Strategic Recommendations
  pdf.setFontSize(10)
  pdf.setTextColor(15, 23, 42)
  pdf.text(labels.recommendations, leftX, leftY)
  leftY += 5
  pdf.setFontSize(8)
  pdf.setTextColor(51, 65, 85)
  ;(payload.recommendations ?? []).slice(0, 3).forEach((item) => {
    const lines = pdf.splitTextToSize(`• ${item}`, leftW)
    pdf.text(lines.slice(0, 2), leftX, leftY)
    leftY += Math.min(lines.length, 2) * 4.2 + 1.5
  })

  // Right column: Charts & Tabular Statistics
  const rightX = 114
  const rightW = 82
  let rightY = 50

  // 1. Land-Cover Distribution
  pdf.setFontSize(10)
  pdf.setTextColor(15, 23, 42)
  pdf.text(labels.landCover, rightX, rightY)
  rightY += 4

  const landCover = (payload.landCover ?? []).map((item) => ({ label: item.label, value: item.percentage, color: item.color }))
  const totalLandCover = landCover.reduce((sum, item) => sum + item.value, 0)
  drawPieChart(pdf, landCover, rightX + 22, rightY + 20, 16)
  drawLegend(pdf, landCover, rightX + 44, rightY + 10, totalLandCover)
  rightY += 44

  // 2. Detected Changes
  pdf.setFontSize(10)
  pdf.setTextColor(15, 23, 42)
  pdf.text(labels.detectedChanges, rightX, rightY)
  rightY += 4
  drawBarChart(pdf, (payload.detectedChanges ?? []).map((item) => ({ label: item.label, value: item.percentage })), rightX, rightY, rightW, 36)
  rightY += 48

  // 3. Key Statistics & Area Measurements
  pdf.setFontSize(10)
  pdf.setTextColor(15, 23, 42)
  pdf.text(labels.measurements, rightX, rightY)
  rightY += 6

  const statistics = [
    [labels.confidenceScore, `${payload.confidence}%`],
    [labels.reliabilityIndex, `${payload.reliability}%`],
    [labels.detectedCategories, String(payload.detectedChanges?.length ?? 0)],
    [labels.landCoverClasses, String(payload.landCover?.length ?? 0)],
    ...Object.entries(payload.areaMeasurements ?? {}).map(([label, value]) => [label.replaceAll('_', ' '), `${value} km²`]),
  ]

  statistics.slice(0, 7).forEach(([label, value], index) => {
    const rowY = rightY + index * 6.5
    pdf.setFillColor(index % 2 === 0 ? 241 : 248, index % 2 === 0 ? 245 : 250, index % 2 === 0 ? 249 : 252)
    pdf.rect(rightX, rowY - 4.5, rightW, 6, 'F')
    pdf.setTextColor(51, 65, 85)
    pdf.setFontSize(8)
    pdf.text(label, rightX + 3, rowY)
    pdf.text(value, rightX + rightW - 20, rowY)
  })

  // Footer bar on single page
  pdf.setDrawColor(226, 232, 240)
  pdf.line(14, 282, 196, 282)
  pdf.setFontSize(7.5)
  pdf.setTextColor(148, 163, 184)
  pdf.text(labels.footer, 14, 287)

  return pdf.output('blob')
}
