'use client'

import { useState } from 'react'

import {
  WORKFLOW_LOOP_NODES,
  type WorkflowEnvironment,
} from '../_lib/workflow-page-content'

const DEFAULT_DETAIL = 'Hover a step to see what happens there.'

type WorkflowDiagramProps = {
  ariaLabelledBy: string
}

type NodeGeometry = {
  x: number
  y: number
  width: number
  height: number
  layout: 'three-line' | 'two-line'
}

const NODE_GEOMETRY: Record<
  (typeof WORKFLOW_LOOP_NODES)[number]['id'],
  NodeGeometry
> = {
  'project-kickoff': {
    x: 260,
    y: 40,
    width: 150,
    height: 68,
    layout: 'three-line',
  },
  'initialize-project': {
    x: 436,
    y: 40,
    width: 170,
    height: 68,
    layout: 'three-line',
  },
  'phase-planning': {
    x: 60,
    y: 186,
    width: 130,
    height: 68,
    layout: 'three-line',
  },
  'plan-next-epic': {
    x: 232,
    y: 186,
    width: 130,
    height: 68,
    layout: 'three-line',
  },
  'plan-review': {
    x: 388,
    y: 186,
    width: 130,
    height: 68,
    layout: 'three-line',
  },
  build: { x: 544, y: 186, width: 90, height: 68, layout: 'two-line' },
  'ship-phase': {
    x: 676,
    y: 186,
    width: 130,
    height: 68,
    layout: 'three-line',
  },
}

const ENVIRONMENT_LABEL: Record<WorkflowEnvironment, string> = {
  claude: 'Claude',
  cursor: 'Cursor',
}

const nodeTokens = (environment: WorkflowEnvironment) =>
  environment === 'claude'
    ? {
        fill: 'var(--primary)',
        stroke: 'var(--primary)',
        text: 'var(--primary-foreground)',
      }
    : {
        fill: 'var(--success)',
        stroke: 'var(--success)',
        text: 'var(--success-foreground)',
      }

export const WorkflowDiagram = ({ ariaLabelledBy }: WorkflowDiagramProps) => {
  const [activeNodeId, setActiveNodeId] = useState<string | null>(null)

  const detail =
    WORKFLOW_LOOP_NODES.find((node) => node.id === activeNodeId)?.detail ??
    DEFAULT_DETAIL

  const clearActive = () => setActiveNodeId(null)

  return (
    <div>
      <svg
        width="100%"
        viewBox="0 0 860 320"
        role="img"
        aria-labelledby={ariaLabelledBy}
        aria-describedby="workflow-diagram-detail"
        className="rounded-lg border"
      >
        <title>Seminova workflow</title>
        <desc>
          Project kickoff and initialize project feed into a phase loop
          containing plan phase and a nested epic loop of plan epic, review
          plan, build, then out to ship phase, with a dashed revise arrow back
          from review plan to plan epic.
        </desc>
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
          x1="410"
          y1="74"
          x2="434"
          y2="74"
          stroke="var(--border)"
          strokeWidth="1.5"
          markerEnd="url(#workflow-arrow)"
        />

        <path
          d="M521 108 V140 H125 V184"
          fill="none"
          stroke="var(--border)"
          strokeWidth="1.5"
          markerEnd="url(#workflow-arrow)"
        />

        <rect
          x="40"
          y="150"
          width="786"
          height="140"
          rx="12"
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
          strokeDasharray="6 4"
        />
        <text
          x="806"
          y="166"
          textAnchor="end"
          fontSize="11"
          fill="var(--muted-foreground)"
          fontFamily="sans-serif"
        >
          ↻ Phase loop
        </text>

        <line
          x1="190"
          y1="220"
          x2="214"
          y2="220"
          stroke="var(--border)"
          strokeWidth="1.5"
          markerEnd="url(#workflow-arrow)"
        />

        <rect
          x="216"
          y="170"
          width="434"
          height="100"
          rx="12"
          fill="none"
          stroke="var(--border)"
          strokeWidth="1"
          strokeDasharray="6 4"
        />
        <text
          x="228"
          y="184"
          fontSize="10"
          fill="var(--muted-foreground)"
          fontFamily="sans-serif"
        >
          ↻ Epic loop
        </text>

        <line
          x1="362"
          y1="220"
          x2="386"
          y2="220"
          stroke="var(--border)"
          strokeWidth="1.5"
          markerEnd="url(#workflow-arrow)"
        />

        <line
          x1="518"
          y1="220"
          x2="542"
          y2="220"
          stroke="var(--border)"
          strokeWidth="1.5"
          markerEnd="url(#workflow-arrow)"
        />

        <path
          d="M453 254 L453 264 L297 264 L297 256"
          fill="none"
          stroke="var(--muted-foreground)"
          strokeWidth="1"
          strokeDasharray="4 3"
          markerEnd="url(#workflow-arrow)"
        />
        <text
          x="375"
          y="263"
          textAnchor="middle"
          fontSize="9"
          fill="var(--muted-foreground)"
          fontFamily="sans-serif"
        >
          revise
        </text>

        <line
          x1="650"
          y1="220"
          x2="674"
          y2="220"
          stroke="var(--border)"
          strokeWidth="1.5"
          markerEnd="url(#workflow-arrow)"
        />

        {WORKFLOW_LOOP_NODES.map((node) => {
          const geometry = NODE_GEOMETRY[node.id]
          const tokens = nodeTokens(node.environment)
          const centerX = geometry.x + geometry.width / 2
          const isActive = activeNodeId === node.id
          const environmentName = ENVIRONMENT_LABEL[node.environment]
          const ariaLabel = node.skill
            ? `${node.label}, ${node.skill}, ${environmentName}`
            : `${node.label}, ${environmentName}`

          return (
            <g
              key={node.id}
              role="button"
              tabIndex={0}
              aria-label={ariaLabel}
              style={{
                cursor: 'default',
                opacity: isActive ? 0.75 : 1,
              }}
              onMouseEnter={() => setActiveNodeId(node.id)}
              onMouseLeave={clearActive}
              onFocus={() => setActiveNodeId(node.id)}
              onBlur={clearActive}
            >
              <rect
                x={geometry.x}
                y={geometry.y}
                width={geometry.width}
                height={geometry.height}
                rx="8"
                fill={tokens.fill}
                stroke={tokens.stroke}
                strokeWidth="1"
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
                    fill={tokens.text}
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
                      fill={tokens.text}
                      fontFamily="sans-serif"
                    >
                      {node.skill}
                    </text>
                  ) : null}
                  <text
                    x={centerX}
                    y={geometry.y + (node.skill ? 54 : 36)}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="11"
                    fill={tokens.text}
                    fontFamily="sans-serif"
                  >
                    {environmentName}
                  </text>
                </>
              ) : (
                <>
                  <text
                    x={centerX}
                    y={geometry.y + 24}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontWeight="600"
                    fontSize="13"
                    fill={tokens.text}
                    fontFamily="sans-serif"
                  >
                    {node.label}
                  </text>
                  <text
                    x={centerX}
                    y={geometry.y + 44}
                    textAnchor="middle"
                    dominantBaseline="central"
                    fontSize="11"
                    fill={tokens.text}
                    fontFamily="sans-serif"
                  >
                    {environmentName}
                  </text>
                </>
              )}
            </g>
          )
        })}
      </svg>

      <p
        id="workflow-diagram-detail"
        aria-live="polite"
        className="text-muted-foreground mt-3 min-h-9 text-[13px]"
      >
        {detail}
      </p>
    </div>
  )
}
