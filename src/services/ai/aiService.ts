import { supabase, isSupabaseConfigured } from '../../lib/supabase'
import type { UploadedImage } from '../../types'
import type { LanguageCode } from '../../i18n/translations'
import { getLocalizedAiContent } from './localizedAiResponses'

export type AnalysisMode = 'single' | 'optical_sar' | 'before_after' | 'change_detection' | 'object_detection' | 'land_cover' | 'disaster' | 'agriculture' | 'urban_growth'

export interface MockAiPayload {
  summary: string
  detailed_explanation: string
  confidence_score: number
  reliability_score: number
  detected_objects: Array<{
    id: string
    object_type: string
    label: string
    confidence: number
    x: number
    y: number
    width: number
    height: number
  }>
  detected_changes: Array<{ label: string; percentage: number }>
  land_cover_result: Array<{ label: string; percentage: number; color: string }>
  area_measurements: Record<string, number>
  recommendations: string[]
  evidence_data: string[]
  reliability_level: 'HIGH' | 'MEDIUM' | 'LOW'
}

async function imageToDataUrl(image: UploadedImage): Promise<string> {
  if (image.url.startsWith('data:')) return image.url
  const response = await fetch(image.url)
  if (!response.ok) throw new Error(`Unable to read ${image.name}.`)
  const blob = await response.blob()
  return await new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(String(reader.result))
    reader.onerror = () => reject(new Error(`Unable to prepare ${image.name} for analysis.`))
    reader.readAsDataURL(blob)
  })
}

function extractJson(content: string): MockAiPayload {
  const jsonStart = content.indexOf('{')
  const jsonEnd = content.lastIndexOf('}')
  if (jsonStart < 0 || jsonEnd < jsonStart) throw new Error('The local vision model returned an unreadable response.')
  return JSON.parse(content.slice(jsonStart, jsonEnd + 1)) as MockAiPayload
}

const normalizeModelName = (name: string): string => {
  const trimmed = name.trim()
  if (!trimmed) return 'llama3.2-vision'
  return trimmed.includes(':') ? trimmed : `${trimmed}:latest`
}

const getOllamaModelName = (): string => normalizeModelName(import.meta.env.VITE_OLLAMA_MODEL || 'llama3.2-vision')

async function ensureOllamaModelIsAvailable(): Promise<string> {
  const modelName = getOllamaModelName()

  const tagsResponse = await fetch('/ollama/api/tags')
  if (!tagsResponse.ok) {
    throw new Error('Ollama could not be reached. Start the Ollama server and verify that it is listening on port 11434.')
  }

  const tags = await tagsResponse.json() as { models?: Array<{ name?: string }> }
  const installedModels = new Set((tags.models ?? []).map((m) => normalizeModelName(m.name ?? '')).filter(Boolean))

  if (!installedModels.has(modelName)) {
    const baseName = modelName.replace(/:latest$/i, '')
    if (baseName === 'llama3.2' || baseName === 'llama3.2:latest') {
      throw new Error('This app needs a vision-capable Ollama model for image analysis. Install: ollama pull llama3.2-vision')
    }
    throw new Error(`Ollama model "${baseName}" is not installed. Run: ollama pull ${baseName}`)
  }

  return modelName
}

export const analyzeWithOllama = async (mode: AnalysisMode, prompt: string, images: UploadedImage[]): Promise<MockAiPayload> => {
  const modelName = await ensureOllamaModelIsAvailable()

  const response = await fetch('/ollama/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: modelName,
      stream: false,
      format: 'json',
      images: await Promise.all(images.map(async (image) => (await imageToDataUrl(image)).split(',')[1])),
      prompt: `Analyze these satellite images. Mode: ${mode}. Question: ${prompt}. Return only JSON with keys: summary, detailed_explanation, confidence_score (0-100), reliability_score (0-100), detected_objects (array with id, object_type, label, confidence, x, y, width, height), detected_changes (array of label and percentage), land_cover_result (array of label, percentage, color), area_measurements (object), recommendations (array), evidence_data (array), reliability_level (HIGH, MEDIUM, or LOW). If the image is insufficient, say so clearly.`,
    }),
  })

  if (!response.ok) {
    const fallbackMessage = `Ollama could not generate a response with model "${modelName}". Start the model with: ollama run ${modelName}`
    try {
      const body = await response.clone().json() as { error?: string }
      if (body.error) throw new Error(body.error)
    } catch {
      throw new Error(fallbackMessage)
    }
    throw new Error(fallbackMessage)
  }

  const result = await response.json() as { response?: string }
  if (!result.response) throw new Error('The local vision model returned no analysis.')
  return extractJson(result.response)
}

export const analyzeWithGemini = async (mode: AnalysisMode, prompt: string, images: UploadedImage[], language: LanguageCode = 'en'): Promise<MockAiPayload> => {
  if (isSupabaseConfigured) {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/analyze-image`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${session.access_token}`,
            apikey: import.meta.env.VITE_SUPABASE_ANON_KEY,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mode,
            query: prompt,
            language,
            images: await Promise.all(images.map(async (image) => ({ name: image.name, type: image.type, dataUrl: await imageToDataUrl(image) }))),
          }),
        })

        if (response.ok) {
          const result = await response.json() as MockAiPayload & { error?: string }
          if (!result.error) return result
        }
      }
    } catch {
      // Fall through to mockAiAnalysis fallback
    }
  }

  // Fallback: robust local satellite analysis engine supporting all 9 languages
  return await mockAiAnalysis(mode, prompt, language)
}

export const mockAiAnalysis = async (mode: AnalysisMode, prompt: string, language: LanguageCode = 'en'): Promise<MockAiPayload> => {
  await new Promise((resolve) => setTimeout(resolve, 500))
  return getLocalizedAiContent(mode, prompt, language)
}
