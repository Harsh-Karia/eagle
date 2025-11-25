import type { Issue, Drawing } from '../App'

/**
 * Generate realistic AI issues for a drawing
 * In production, this would call a real AI service like OpenAI Vision API
 */
export async function analyzeDrawing(
  drawing: Drawing,
  projectId: string
): Promise<Issue[]> {
  // Simulate AI processing delay
  await new Promise(resolve => setTimeout(resolve, 1500))

  // Realistic issue templates based on common engineering drawing issues
  const issueTemplates: Array<{
    type: string;
    severity: 'Low' | 'Medium' | 'High';
    description: string;
    x: number;
    y: number;
  }> = [
    {
      type: 'Missing Dimension/Callout',
      severity: 'High',
      description: 'Critical dimension missing for structural element. Required per Section 3.2.1 of specifications.',
      x: 0.25,
      y: 0.30,
    },
    {
      type: 'Code Compliance Concern',
      severity: 'Medium',
      description: 'Potential ADA compliance issue: Clear width appears insufficient. Minimum 60" required per ADAAG 4.3.3.',
      x: 0.55,
      y: 0.45,
    },
    {
      type: 'Grading/Elevation Issue',
      severity: 'High',
      description: 'Inconsistent elevation data: Spot elevation conflicts with contour interpolation. Verify against survey.',
      x: 0.75,
      y: 0.25,
    },
    {
      type: 'Specification Inconsistency',
      severity: 'Low',
      description: 'Detail reference calls out incorrect detail number. Verify correct reference.',
      x: 0.40,
      y: 0.70,
    },
    {
      type: 'Missing Dimension/Callout',
      severity: 'Medium',
      description: 'Structural column spacing dimension not shown. Required for contractor layout.',
      x: 0.15,
      y: 0.60,
    },
    {
      type: 'Visual Discrepancy',
      severity: 'Medium',
      description: 'Visual discrepancy: Measured distance appears different from annotated dimension. Verify survey data.',
      x: 0.65,
      y: 0.55,
    },
    {
      type: 'Code Compliance Concern',
      severity: 'High',
      description: 'Egress path width appears insufficient. Minimum 44" required per IBC 1018.2.',
      x: 0.30,
      y: 0.15,
    },
    {
      type: 'Missing Dimension/Callout',
      severity: 'Medium',
      description: 'Drainage swale invert elevation not labeled. Add elevation callout for construction reference.',
      x: 0.50,
      y: 0.80,
    },
    {
      type: 'Grading/Elevation Issue',
      severity: 'Medium',
      description: 'Storm drain invert elevation not shown. Required for construction and as-built documentation.',
      x: 0.70,
      y: 0.65,
    },
    {
      type: 'Specification Inconsistency',
      severity: 'Low',
      description: 'Pavement section detail calls for different thickness than specifications. Clarify correct thickness.',
      x: 0.20,
      y: 0.50,
    },
    {
      type: 'Code Compliance Concern',
      severity: 'High',
      description: 'Retaining wall height exceeds 4\' without structural engineer stamp. Required per IBC Section 1807.',
      x: 0.60,
      y: 0.35,
    },
    {
      type: 'Missing Dimension/Callout',
      severity: 'Medium',
      description: 'Property line setback dimension missing. Required for permit approval.',
      x: 0.10,
      y: 0.20,
    },
  ]

  // Select 4-7 issues randomly from templates (with some variation in positions)
  const numIssues = Math.floor(Math.random() * 4) + 4 // 4-7 issues
  const selectedIndices = new Set<number>()
  
  // Randomly select unique templates
  while (selectedIndices.size < numIssues && selectedIndices.size < issueTemplates.length) {
    selectedIndices.add(Math.floor(Math.random() * issueTemplates.length))
  }

  const issues: Issue[] = []
  let index = 0
  
  selectedIndices.forEach(templateIndex => {
    const template = issueTemplates[templateIndex]
    // Add slight random variation to positions (±0.05)
    const xVariation = (Math.random() - 0.5) * 0.1
    const yVariation = (Math.random() - 0.5) * 0.1
    
    issues.push({
      id: `ai-${Date.now()}-${index++}`,
      drawingId: drawing.id,
      pageNumber: 1,
      x: Math.max(0.05, Math.min(0.95, template.x + xVariation)),
      y: Math.max(0.05, Math.min(0.95, template.y + yVariation)),
      type: template.type,
      severity: template.severity,
      description: template.description,
      status: 'Open',
      createdBy: 'AI Assistant',
      aiGenerated: true,
      timestamp: new Date(),
    })
  })

  return issues
}

/**
 * Future: Real AI integration with OpenAI Vision API
 * 
 * export async function analyzeDrawingWithAI(
 *   drawing: Drawing
 * ): Promise<Issue[]> {
 *   // 1. Convert PDF pages to images
 *   // 2. Send to OpenAI Vision API
 *   // 3. Parse response and create issues
 *   // 4. Return structured issues
 * }
 */

