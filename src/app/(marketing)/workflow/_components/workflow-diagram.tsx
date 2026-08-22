'use client'

import { InfoIcon } from 'lucide-react'
import {
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'

import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'

import {
  WORKFLOW_LOOP_NODES,
  WORKFLOW_TOOL_LOGOS,
  type WorkflowEnvironment,
  type WorkflowLoopNodeId,
} from '../_lib/workflow-page-content'

const DEFAULT_DETAIL = 'Select or focus a step to see what happens there.'

interface WorkflowDiagramProps {
  ariaLabelledBy: string
}

const ENVIRONMENT_LABEL: Record<WorkflowEnvironment, string> = {
  claude: 'Claude',
  cursor: 'Cursor',
}

const ENVIRONMENT_ACCENT_VAR: Record<WorkflowEnvironment, string> = {
  claude: '--info',
  cursor: '--primary',
}

const getNodeColors = (
  environment: WorkflowEnvironment,
  isSpotlightActive: boolean,
) => {
  const accentVar = ENVIRONMENT_ACCENT_VAR[environment]
  const fillMix = isSpotlightActive ? '28%' : '15%'

  return {
    fill: `color-mix(in oklch, var(${accentVar}) ${fillMix}, var(--card))`,
    stroke: isSpotlightActive
      ? `var(${accentVar})`
      : `color-mix(in oklch, var(${accentVar}) 30%, var(--border))`,
    ring: `var(${accentVar})`,
    text: 'var(--foreground)',
    modelText: 'var(--muted-foreground)',
  }
}

const MODEL_LINE_FONT_SIZE = 11
const MODEL_LINE_LOGO_SIZE = 12
const MODEL_LINE_LOGO_GAP = 4

const estimateModelLabelWidth = (label: string) =>
  label.length * (MODEL_LINE_FONT_SIZE * 0.55)

const getModelLineLogoWidth = (environment: WorkflowEnvironment) => {
  if (environment === 'claude') {
    return MODEL_LINE_LOGO_SIZE
  }

  const cursorLogo = WORKFLOW_TOOL_LOGOS.cursor
  return MODEL_LINE_LOGO_SIZE * (cursorLogo.width / cursorLogo.height)
}

const WorkflowNodeModelLine = ({
  environment,
  environmentName,
  unitLeft,
  y,
  textFill,
}: {
  environment: WorkflowEnvironment
  environmentName: string
  unitLeft: number
  y: number
  textFill: string
}) => {
  const logoWidth = getModelLineLogoWidth(environment)
  const logoY = y - MODEL_LINE_LOGO_SIZE / 2

  if (environment === 'claude') {
    const logo = WORKFLOW_TOOL_LOGOS.claude

    return (
      <>
        <image
          href={logo.src}
          x={unitLeft}
          y={logoY}
          width={MODEL_LINE_LOGO_SIZE}
          height={MODEL_LINE_LOGO_SIZE}
          preserveAspectRatio="xMidYMid meet"
          aria-hidden
        />
        <text
          x={unitLeft + logoWidth + MODEL_LINE_LOGO_GAP}
          y={y}
          dominantBaseline="central"
          fontSize={MODEL_LINE_FONT_SIZE}
          fill={textFill}
          fontFamily="sans-serif"
        >
          {environmentName}
        </text>
      </>
    )
  }

  const cursorLogo = WORKFLOW_TOOL_LOGOS.cursor

  return (
    <>
      <image
        href={cursorLogo.src}
        x={unitLeft}
        y={logoY}
        width={logoWidth}
        height={MODEL_LINE_LOGO_SIZE}
        preserveAspectRatio="xMidYMid meet"
        className="dark:hidden"
        aria-hidden
      />
      <image
        href={cursorLogo.srcDark}
        x={unitLeft}
        y={logoY}
        width={logoWidth}
        height={MODEL_LINE_LOGO_SIZE}
        preserveAspectRatio="xMidYMid meet"
        className="hidden dark:block"
        aria-hidden
      />
      <text
        x={unitLeft + logoWidth + MODEL_LINE_LOGO_GAP}
        y={y}
        dominantBaseline="central"
        fontSize={MODEL_LINE_FONT_SIZE}
        fill={textFill}
        fontFamily="sans-serif"
      >
        {environmentName}
      </text>
    </>
  )
}

export const WorkflowDiagram = ({ ariaLabelledBy }: WorkflowDiagramProps) => {
  const [hoveredNodeId, setHoveredNodeId] = useState<WorkflowLoopNodeId | null>(
    null,
  )
  const [selectedNodeId, setSelectedNodeId] =
    useState<WorkflowLoopNodeId | null>(null)
  const [focusedNodeId, setFocusedNodeId] = useState<WorkflowLoopNodeId | null>(
    null,
  )

  const activeNodeId = hoveredNodeId ?? focusedNodeId ?? selectedNodeId
  const ringNodeId = focusedNodeId ?? selectedNodeId
  const activeNode =
    WORKFLOW_LOOP_NODES.find((node) => node.id === activeNodeId) ?? null

  const handleDiagramBlur = (event: FocusEvent<HTMLDivElement>) => {
    if (!event.currentTarget.contains(event.relatedTarget)) {
      setFocusedNodeId(null)
      setSelectedNodeId(null)
    }
  }

  const handleNodeKeyDown =
    (nodeId: WorkflowLoopNodeId) => (event: KeyboardEvent<SVGGElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      setSelectedNodeId(nodeId)
    }

  const handleDiagramMouseOver = (event: MouseEvent<SVGSVGElement>) => {
    const nodeEl = (event.target as Element).closest('[data-node-id]')
    if (nodeEl) {
      setHoveredNodeId(
        nodeEl.getAttribute('data-node-id') as WorkflowLoopNodeId,
      )
    }
  }

  return (
    <div onBlur={handleDiagramBlur}>
      <svg
        width="100%"
        viewBox="0 0 680 496"
        role="group"
        aria-labelledby={ariaLabelledBy}
        aria-describedby="workflow-diagram-detail"
        className="rounded-xl border"
        onMouseOver={handleDiagramMouseOver}
        onMouseLeave={() => setHoveredNodeId(null)}
      >
        <desc>
          Project kickoff and initialize project feed into a phase loop of three
          centered rows: plan phase and kickoff phase, an epic loop of plan
          epic, review plan, build, and mark epic complete, then ship phase.
          Connectors enter and leave the epic loop at its container edges.
        </desc>
        <rect x="0" y="0" width="680" height="496" rx="12" fill="var(--card)" />
        <defs>
          <marker
            id="workflow-arrow"
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="6"
            markerHeight="6"
            orient="auto-start-reverse"
          >
            <path
              d="M2 1L8 5L2 9"
              fill="none"
              stroke="var(--muted-foreground)"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </marker>
        </defs>

        <line
          x1="330"
          y1="64"
          x2="354"
          y2="64"
          stroke="var(--muted-foreground)"
          strokeWidth="1.5"
          markerEnd="url(#workflow-arrow)"
        />

        <path
          d="M431 98 V150 H258 V166"
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth="1.5"
          markerEnd="url(#workflow-arrow)"
        />

        <rect
          x="30"
          y="130"
          width="620"
          height="346"
          rx="12"
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth="1"
          strokeDasharray="6 4"
        />
        <text
          x="638"
          y="147"
          textAnchor="end"
          fontSize="11"
          fill="var(--muted-foreground)"
          fontFamily="sans-serif"
        >
          ↻ Phase loop
        </text>

        <line
          x1="328"
          y1="200"
          x2="352"
          y2="200"
          stroke="var(--muted-foreground)"
          strokeWidth="1.5"
          markerEnd="url(#workflow-arrow)"
        />

        <path
          d="M422 234 V246 H339 V252"
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth="1.5"
          markerEnd="url(#workflow-arrow)"
        />

        <rect
          x="46"
          y="252"
          width="586"
          height="114"
          rx="12"
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth="1"
          strokeDasharray="6 4"
        />
        <text
          x="58"
          y="268"
          fontSize="11"
          fill="var(--muted-foreground)"
          fontFamily="sans-serif"
        >
          ↻ Epic loop
        </text>

        <line
          x1="192"
          y1="312"
          x2="208"
          y2="312"
          stroke="var(--muted-foreground)"
          strokeWidth="1.5"
          markerEnd="url(#workflow-arrow)"
        />

        <line
          x1="340"
          y1="312"
          x2="356"
          y2="312"
          stroke="var(--muted-foreground)"
          strokeWidth="1.5"
          markerEnd="url(#workflow-arrow)"
        />

        <line
          x1="448"
          y1="312"
          x2="464"
          y2="312"
          stroke="var(--muted-foreground)"
          strokeWidth="1.5"
          markerEnd="url(#workflow-arrow)"
        />

        <path
          d="M339 366 V390"
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth="1.5"
          markerEnd="url(#workflow-arrow)"
        />

        {WORKFLOW_LOOP_NODES.map((node) => {
          const { geometry } = node
          const centerX = geometry.x + geometry.width / 2
          const isSpotlightActive = activeNodeId === node.id
          const isSpotlightDimmed =
            activeNodeId != null && activeNodeId !== node.id
          const showRing = ringNodeId === node.id
          const nodeColors = getNodeColors(node.environment, isSpotlightActive)
          const environmentName = ENVIRONMENT_LABEL[node.environment]
          const ariaLabel = node.skill
            ? `${node.label}, ${node.skill}, ${environmentName}`
            : `${node.label}, ${environmentName}`
          const modelLineY =
            geometry.layout === 'three-line'
              ? geometry.y + (node.skill ? 54 : 36)
              : geometry.y + 44
          const logoWidth = getModelLineLogoWidth(node.environment)
          const modelUnitWidth =
            logoWidth +
            MODEL_LINE_LOGO_GAP +
            estimateModelLabelWidth(environmentName)
          const modelUnitLeft = centerX - modelUnitWidth / 2

          return (
            <g
              key={node.id}
              data-node-id={node.id}
              role="button"
              tabIndex={0}
              aria-label={ariaLabel}
              style={{
                cursor: 'default',
                opacity: isSpotlightDimmed ? 0.75 : 1,
              }}
              onClick={() => setSelectedNodeId(node.id)}
              onFocus={() => setFocusedNodeId(node.id)}
              onKeyDown={handleNodeKeyDown(node.id)}
            >
              {showRing ? (
                <rect
                  x={geometry.x - 3}
                  y={geometry.y - 3}
                  width={geometry.width + 6}
                  height={geometry.height + 6}
                  rx="10"
                  fill="none"
                  stroke={nodeColors.ring}
                  strokeWidth="2"
                  pointerEvents="none"
                />
              ) : null}
              <rect
                x={geometry.x}
                y={geometry.y}
                width={geometry.width}
                height={geometry.height}
                rx="8"
                fill={nodeColors.fill}
                stroke={nodeColors.stroke}
                strokeWidth={isSpotlightActive ? 1.5 : 1}
              />
              {geometry.layout === 'three-line' ? (
                <>
                  <text
                    x={centerX}
                    y={geometry.y + 18}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontWeight="600"
                    fontSize="13"
                    fill={nodeColors.text}
                    fontFamily="sans-serif"
                  >
                    {node.label}
                  </text>
                  {node.skill ? (
                    <text
                      x={centerX}
                      y={geometry.y + 36}
                      textAnchor="middle"
                      dominantBaseline="central"
                      fontSize="11"
                      fontStyle="italic"
                      fill={nodeColors.text}
                      fontFamily="sans-serif"
                    >
                      {node.skill}
                    </text>
                  ) : null}
                </>
              ) : (
                <text
                  x={centerX}
                  y={geometry.y + 24}
                  textAnchor="middle"
                  dominantBaseline="central"
                  fontWeight="600"
                  fontSize="13"
                  fill={nodeColors.text}
                  fontFamily="sans-serif"
                >
                  {node.label}
                </text>
              )}
              <WorkflowNodeModelLine
                environment={node.environment}
                environmentName={environmentName}
                unitLeft={modelUnitLeft}
                y={modelLineY}
                textFill={nodeColors.modelText}
              />
            </g>
          )
        })}
      </svg>

      <Alert
        id="workflow-diagram-detail"
        variant="info"
        role="note"
        aria-live="polite"
        className="mt-3 min-h-14"
      >
        <InfoIcon aria-hidden />
        {activeNode ? (
          <>
            <AlertTitle>{activeNode.label}</AlertTitle>
            <AlertDescription>{activeNode.detail}</AlertDescription>
          </>
        ) : (
          <AlertDescription>{DEFAULT_DETAIL}</AlertDescription>
        )}
      </Alert>
    </div>
  )
}
