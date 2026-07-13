'use client'

import {
  useRef,
  useState,
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
} from 'react'

import {
  WORKFLOW_LOOP_NODES,
  type WorkflowEnvironment,
  type WorkflowLoopNodeId,
} from '../_lib/workflow-page-content'

const DEFAULT_DETAIL = 'Hover or focus a step to see what happens there.'

interface WorkflowDiagramProps {
  ariaLabelledBy: string
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

const isWithinDiagram = (
  container: Element | null,
  target: EventTarget | null,
) => target instanceof Node && container?.contains(target)

export const WorkflowDiagram = ({ ariaLabelledBy }: WorkflowDiagramProps) => {
  const svgRef = useRef<SVGSVGElement>(null)
  const [activeNodeId, setActiveNodeId] = useState<WorkflowLoopNodeId | null>(
    null,
  )
  const [focusedNodeId, setFocusedNodeId] = useState<WorkflowLoopNodeId | null>(
    null,
  )

  const detail =
    WORKFLOW_LOOP_NODES.find((node) => node.id === activeNodeId)?.detail ??
    DEFAULT_DETAIL

  const activateNode = (nodeId: WorkflowLoopNodeId) => {
    setActiveNodeId(nodeId)
  }

  const handleNodeMouseLeave =
    (nodeId: WorkflowLoopNodeId) => (event: MouseEvent<SVGGElement>) => {
      if (isWithinDiagram(svgRef.current, event.relatedTarget)) return
      setActiveNodeId((current) => (current === nodeId ? null : current))
    }

  const handleNodeBlur =
    (nodeId: WorkflowLoopNodeId) => (event: FocusEvent<SVGGElement>) => {
      if (isWithinDiagram(svgRef.current, event.relatedTarget)) return
      setFocusedNodeId((current) => (current === nodeId ? null : current))
      setActiveNodeId((current) => (current === nodeId ? null : current))
    }

  const handleNodeKeyDown =
    (nodeId: WorkflowLoopNodeId) => (event: KeyboardEvent<SVGGElement>) => {
      if (event.key !== 'Enter' && event.key !== ' ') return
      event.preventDefault()
      activateNode(nodeId)
    }

  return (
    <div>
      <svg
        ref={svgRef}
        width="100%"
        viewBox="0 0 860 320"
        role="group"
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
          const { geometry } = node
          const tokens = nodeTokens(node.environment)
          const centerX = geometry.x + geometry.width / 2
          const isActive = activeNodeId === node.id
          const isFocused = focusedNodeId === node.id
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
              onMouseEnter={() => activateNode(node.id)}
              onMouseLeave={handleNodeMouseLeave(node.id)}
              onFocus={() => {
                setFocusedNodeId(node.id)
                activateNode(node.id)
              }}
              onBlur={handleNodeBlur(node.id)}
              onKeyDown={handleNodeKeyDown(node.id)}
            >
              {isFocused ? (
                <rect
                  x={geometry.x - 3}
                  y={geometry.y - 3}
                  width={geometry.width + 6}
                  height={geometry.height + 6}
                  rx="10"
                  fill="none"
                  stroke="var(--ring)"
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
