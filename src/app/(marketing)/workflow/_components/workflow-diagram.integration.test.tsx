import { fireEvent, render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { WORKFLOW_LOOP_NODES } from '../_lib/workflow-page-content'
import { WorkflowDiagram } from './workflow-diagram'

const DEFAULT_DETAIL = /select or focus a step to see what happens there/i

const getDetailRegion = () => {
  const region = document.getElementById('workflow-diagram-detail')
  if (!region) {
    throw new Error('Expected workflow diagram detail region')
  }
  return region
}

const ringRectCount = (step: HTMLElement) =>
  step.querySelectorAll('rect').length

const stepsWithRing = () =>
  screen.getAllByRole('button').filter((step) => ringRectCount(step) === 2)

const ENVIRONMENT_LABEL = {
  claude: 'Claude',
  cursor: 'Cursor',
} as const

describe('WorkflowDiagram', () => {
  it('should expose accessible names with title, skill when present, and environment for every node', () => {
    render(<WorkflowDiagram ariaLabelledBy="plan-review-build" />)

    for (const node of WORKFLOW_LOOP_NODES) {
      const environmentName = ENVIRONMENT_LABEL[node.environment]
      const expectedName = node.skill
        ? new RegExp(`${node.label}.*${node.skill}.*${environmentName}`, 'i')
        : new RegExp(`${node.label}.*${environmentName}`, 'i')

      expect(
        screen.getByRole('button', { name: expectedName }),
      ).toBeInTheDocument()
    }
  })

  it('should reveal step detail on keyboard focus and keep it when tabbing between steps', async () => {
    const user = userEvent.setup({ delay: null })
    const firstNode = WORKFLOW_LOOP_NODES[0]
    const secondNode = WORKFLOW_LOOP_NODES[1]

    render(<WorkflowDiagram ariaLabelledBy="plan-review-build" />)

    const firstStep = screen.getByRole('button', {
      name: new RegExp(firstNode.label, 'i'),
    })
    const secondStep = screen.getByRole('button', {
      name: new RegExp(secondNode.label, 'i'),
    })

    await user.tab()
    expect(firstStep).toHaveFocus()
    expect(getDetailRegion()).toHaveTextContent(firstNode.detail)

    await user.tab()
    expect(secondStep).toHaveFocus()
    expect(getDetailRegion()).toHaveTextContent(secondNode.detail)
  })

  it('should activate a step with Enter and Space', async () => {
    const user = userEvent.setup({ delay: null })
    const buildIndex = WORKFLOW_LOOP_NODES.findIndex(
      (node) => node.id === 'build',
    )
    const buildNode = WORKFLOW_LOOP_NODES[buildIndex]

    if (!buildNode) {
      throw new Error('Expected build node in workflow loop data')
    }

    render(<WorkflowDiagram ariaLabelledBy="plan-review-build" />)

    for (let index = 0; index <= buildIndex; index += 1) {
      await user.tab()
    }

    const buildStep = screen.getByRole('button', { name: /build/i })
    expect(buildStep).toHaveFocus()

    await user.keyboard('{Enter}')
    expect(screen.getByText(buildNode.detail)).toBeInTheDocument()
    expect(ringRectCount(buildStep)).toBe(2)

    await user.keyboard(' ')
    expect(screen.getByText(buildNode.detail)).toBeInTheDocument()
  })

  it('should preview detail and dim siblings on hover without a ring', async () => {
    const user = userEvent.setup({ delay: null })
    const firstNode = WORKFLOW_LOOP_NODES[0]
    const secondNode = WORKFLOW_LOOP_NODES[1]

    render(<WorkflowDiagram ariaLabelledBy="plan-review-build" />)

    const firstStep = screen.getByRole('button', {
      name: new RegExp(firstNode.label, 'i'),
    })
    const secondStep = screen.getByRole('button', {
      name: new RegExp(secondNode.label, 'i'),
    })

    await user.hover(firstStep)
    expect(getDetailRegion()).toHaveTextContent(firstNode.detail)
    expect(firstStep).toHaveStyle({ opacity: 1 })
    expect(secondStep).toHaveStyle({ opacity: 0.75 })
    expect(ringRectCount(firstStep)).toBe(1)

    const diagram = firstStep.closest('svg')
    if (!diagram) {
      throw new Error('Expected svg diagram')
    }
    await user.unhover(diagram)
    expect(getDetailRegion()).toHaveTextContent(DEFAULT_DETAIL)
    expect(firstStep).toHaveStyle({ opacity: 1 })
    expect(secondStep).toHaveStyle({ opacity: 1 })
  })

  it('should move hover spotlight directly between steps without clearing', async () => {
    const user = userEvent.setup({ delay: null })
    const firstNode = WORKFLOW_LOOP_NODES[0]
    const secondNode = WORKFLOW_LOOP_NODES[1]

    render(<WorkflowDiagram ariaLabelledBy="plan-review-build" />)

    const firstStep = screen.getByRole('button', {
      name: new RegExp(firstNode.label, 'i'),
    })
    const secondStep = screen.getByRole('button', {
      name: new RegExp(secondNode.label, 'i'),
    })

    await user.hover(firstStep)
    expect(getDetailRegion()).toHaveTextContent(firstNode.detail)
    expect(firstStep).toHaveStyle({ opacity: 1 })
    expect(secondStep).toHaveStyle({ opacity: 0.75 })

    await user.hover(secondStep)
    expect(getDetailRegion()).toHaveTextContent(secondNode.detail)
    expect(firstStep).toHaveStyle({ opacity: 0.75 })
    expect(secondStep).toHaveStyle({ opacity: 1 })
    expect(ringRectCount(firstStep)).toBe(1)
    expect(ringRectCount(secondStep)).toBe(1)
  })

  it('should keep hover spotlight when moving over non-node diagram chrome', async () => {
    const user = userEvent.setup({ delay: null })
    const firstNode = WORKFLOW_LOOP_NODES[0]
    const secondNode = WORKFLOW_LOOP_NODES[1]

    render(<WorkflowDiagram ariaLabelledBy="plan-review-build" />)

    const firstStep = screen.getByRole('button', {
      name: new RegExp(firstNode.label, 'i'),
    })
    const secondStep = screen.getByRole('button', {
      name: new RegExp(secondNode.label, 'i'),
    })

    await user.hover(firstStep)
    expect(getDetailRegion()).toHaveTextContent(firstNode.detail)
    expect(firstStep).toHaveStyle({ opacity: 1 })
    expect(secondStep).toHaveStyle({ opacity: 0.75 })

    const diagram = firstStep.closest('svg')
    if (!diagram) {
      throw new Error('Expected svg diagram')
    }
    const connector = diagram.querySelector('line')
    if (!connector) {
      throw new Error('Expected connector line in diagram')
    }

    fireEvent.mouseOver(diagram, { target: connector })
    expect(getDetailRegion()).toHaveTextContent(firstNode.detail)
    expect(firstStep).toHaveStyle({ opacity: 1 })
    expect(secondStep).toHaveStyle({ opacity: 0.75 })
  })

  it('should move the ring to the focused step after click then Tab', async () => {
    const user = userEvent.setup({ delay: null })
    const firstNode = WORKFLOW_LOOP_NODES[0]
    const secondNode = WORKFLOW_LOOP_NODES[1]

    render(<WorkflowDiagram ariaLabelledBy="plan-review-build" />)

    const firstStep = screen.getByRole('button', {
      name: new RegExp(firstNode.label, 'i'),
    })
    const secondStep = screen.getByRole('button', {
      name: new RegExp(secondNode.label, 'i'),
    })

    await user.click(firstStep)
    expect(ringRectCount(firstStep)).toBe(2)
    expect(stepsWithRing()).toHaveLength(1)

    await user.tab()
    expect(secondStep).toHaveFocus()
    expect(ringRectCount(firstStep)).toBe(1)
    expect(ringRectCount(secondStep)).toBe(2)
    expect(stepsWithRing()).toHaveLength(1)
  })

  it('should show a ring and persist detail after click and unhover', async () => {
    const user = userEvent.setup({ delay: null })
    const buildNode = WORKFLOW_LOOP_NODES.find((node) => node.id === 'build')

    if (!buildNode) {
      throw new Error('Expected build node in workflow loop data')
    }

    render(<WorkflowDiagram ariaLabelledBy="plan-review-build" />)

    const buildStep = screen.getByRole('button', { name: /build/i })
    const planStep = screen.getByRole('button', {
      name: new RegExp(WORKFLOW_LOOP_NODES[0].label, 'i'),
    })

    await user.click(buildStep)
    expect(getDetailRegion()).toHaveTextContent(buildNode.detail)
    expect(ringRectCount(buildStep)).toBe(2)
    expect(planStep).toHaveStyle({ opacity: 0.75 })

    await user.unhover(buildStep)
    expect(getDetailRegion()).toHaveTextContent(buildNode.detail)
    expect(ringRectCount(buildStep)).toBe(2)
    expect(planStep).toHaveStyle({ opacity: 0.75 })
  })

  it('should keep selection when tabbing between steps and clear when focus leaves the diagram', async () => {
    const user = userEvent.setup({ delay: null })
    const firstNode = WORKFLOW_LOOP_NODES[0]
    const secondNode = WORKFLOW_LOOP_NODES[1]

    render(
      <>
        <WorkflowDiagram ariaLabelledBy="plan-review-build" />
        <button type="button">Outside diagram</button>
      </>,
    )

    const firstStep = screen.getByRole('button', {
      name: new RegExp(firstNode.label, 'i'),
    })
    const secondStep = screen.getByRole('button', {
      name: new RegExp(secondNode.label, 'i'),
    })
    const outsideButton = screen.getByRole('button', {
      name: /outside diagram/i,
    })

    await user.tab()
    expect(firstStep).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(getDetailRegion()).toHaveTextContent(firstNode.detail)
    expect(ringRectCount(firstStep)).toBe(2)

    await user.tab()
    expect(secondStep).toHaveFocus()
    expect(getDetailRegion()).toHaveTextContent(secondNode.detail)
    expect(ringRectCount(firstStep)).toBe(1)
    expect(ringRectCount(secondStep)).toBe(2)

    for (let index = 2; index < WORKFLOW_LOOP_NODES.length; index += 1) {
      await user.tab()
    }
    await user.tab()

    expect(outsideButton).toHaveFocus()
    expect(getDetailRegion()).toHaveTextContent(DEFAULT_DETAIL)
    expect(ringRectCount(firstStep)).toBe(1)
  })
})
