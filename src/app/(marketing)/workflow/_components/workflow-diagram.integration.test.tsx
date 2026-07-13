import { fireEvent, render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { WORKFLOW_LOOP_NODES } from '../_lib/workflow-page-content'
import { WorkflowDiagram } from './workflow-diagram'

const DEFAULT_DETAIL = /hover or focus a step to see what happens there/i

const ringRectCount = (step: HTMLElement) =>
  step.querySelectorAll('rect').length

describe('WorkflowDiagram', () => {
  it('should reveal step detail on keyboard focus and keep it when tabbing between steps', async () => {
    const user = userEvent.setup()
    const firstNode = WORKFLOW_LOOP_NODES[0]
    const secondNode = WORKFLOW_LOOP_NODES[1]

    render(<WorkflowDiagram ariaLabelledBy="plan-review-build" />)

    const detail = screen.getByText(DEFAULT_DETAIL)
    const firstStep = screen.getByRole('button', {
      name: new RegExp(firstNode.label, 'i'),
    })
    const secondStep = screen.getByRole('button', {
      name: new RegExp(secondNode.label, 'i'),
    })

    await user.tab()
    expect(firstStep).toHaveFocus()
    expect(detail).toHaveTextContent(firstNode.detail)

    await user.tab()
    expect(secondStep).toHaveFocus()
    expect(detail).toHaveTextContent(secondNode.detail)
  })

  it('should activate a step with Enter and Space', async () => {
    const user = userEvent.setup()
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
    const user = userEvent.setup()
    const firstNode = WORKFLOW_LOOP_NODES[0]
    const secondNode = WORKFLOW_LOOP_NODES[1]

    render(<WorkflowDiagram ariaLabelledBy="plan-review-build" />)

    const detail = screen.getByText(DEFAULT_DETAIL)
    const firstStep = screen.getByRole('button', {
      name: new RegExp(firstNode.label, 'i'),
    })
    const secondStep = screen.getByRole('button', {
      name: new RegExp(secondNode.label, 'i'),
    })

    await user.hover(firstStep)
    expect(detail).toHaveTextContent(firstNode.detail)
    expect(firstStep).toHaveStyle({ opacity: 1 })
    expect(secondStep).toHaveStyle({ opacity: 0.75 })
    expect(ringRectCount(firstStep)).toBe(1)

    const diagram = firstStep.closest('svg')
    if (!diagram) {
      throw new Error('Expected svg diagram')
    }
    await user.unhover(diagram)
    expect(detail).toHaveTextContent(DEFAULT_DETAIL)
    expect(firstStep).toHaveStyle({ opacity: 1 })
    expect(secondStep).toHaveStyle({ opacity: 1 })
  })

  it('should move hover spotlight directly between steps without clearing', async () => {
    const user = userEvent.setup()
    const firstNode = WORKFLOW_LOOP_NODES[0]
    const secondNode = WORKFLOW_LOOP_NODES[1]

    render(<WorkflowDiagram ariaLabelledBy="plan-review-build" />)

    const detail = screen.getByText(DEFAULT_DETAIL)
    const firstStep = screen.getByRole('button', {
      name: new RegExp(firstNode.label, 'i'),
    })
    const secondStep = screen.getByRole('button', {
      name: new RegExp(secondNode.label, 'i'),
    })

    await user.hover(firstStep)
    expect(detail).toHaveTextContent(firstNode.detail)
    expect(firstStep).toHaveStyle({ opacity: 1 })
    expect(secondStep).toHaveStyle({ opacity: 0.75 })

    await user.hover(secondStep)
    expect(detail).toHaveTextContent(secondNode.detail)
    expect(firstStep).toHaveStyle({ opacity: 0.75 })
    expect(secondStep).toHaveStyle({ opacity: 1 })
    expect(ringRectCount(firstStep)).toBe(1)
    expect(ringRectCount(secondStep)).toBe(1)
  })

  it('should keep hover spotlight when moving over non-node diagram chrome', async () => {
    const user = userEvent.setup()
    const firstNode = WORKFLOW_LOOP_NODES[0]
    const secondNode = WORKFLOW_LOOP_NODES[1]

    render(<WorkflowDiagram ariaLabelledBy="plan-review-build" />)

    const detail = screen.getByText(DEFAULT_DETAIL)
    const firstStep = screen.getByRole('button', {
      name: new RegExp(firstNode.label, 'i'),
    })
    const secondStep = screen.getByRole('button', {
      name: new RegExp(secondNode.label, 'i'),
    })

    await user.hover(firstStep)
    expect(detail).toHaveTextContent(firstNode.detail)
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
    expect(detail).toHaveTextContent(firstNode.detail)
    expect(firstStep).toHaveStyle({ opacity: 1 })
    expect(secondStep).toHaveStyle({ opacity: 0.75 })
  })

  it('should show a ring and persist detail after click and unhover', async () => {
    const user = userEvent.setup()
    const buildNode = WORKFLOW_LOOP_NODES.find((node) => node.id === 'build')

    if (!buildNode) {
      throw new Error('Expected build node in workflow loop data')
    }

    render(<WorkflowDiagram ariaLabelledBy="plan-review-build" />)

    const detail = screen.getByText(DEFAULT_DETAIL)
    const buildStep = screen.getByRole('button', { name: /build/i })
    const planStep = screen.getByRole('button', {
      name: new RegExp(WORKFLOW_LOOP_NODES[0].label, 'i'),
    })

    await user.click(buildStep)
    expect(detail).toHaveTextContent(buildNode.detail)
    expect(ringRectCount(buildStep)).toBe(2)
    expect(planStep).toHaveStyle({ opacity: 0.75 })

    await user.unhover(buildStep)
    expect(detail).toHaveTextContent(buildNode.detail)
    expect(ringRectCount(buildStep)).toBe(2)
    expect(planStep).toHaveStyle({ opacity: 0.75 })
  })

  it('should keep selection when tabbing between steps and clear when focus leaves the diagram', async () => {
    const user = userEvent.setup()
    const firstNode = WORKFLOW_LOOP_NODES[0]
    const secondNode = WORKFLOW_LOOP_NODES[1]

    render(
      <>
        <WorkflowDiagram ariaLabelledBy="plan-review-build" />
        <button type="button">Outside diagram</button>
      </>,
    )

    const detail = screen.getByText(DEFAULT_DETAIL)
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
    expect(detail).toHaveTextContent(firstNode.detail)
    expect(ringRectCount(firstStep)).toBe(2)

    await user.tab()
    expect(secondStep).toHaveFocus()
    expect(detail).toHaveTextContent(secondNode.detail)
    expect(ringRectCount(firstStep)).toBe(2)

    for (let index = 2; index < WORKFLOW_LOOP_NODES.length; index += 1) {
      await user.tab()
    }
    await user.tab()

    expect(outsideButton).toHaveFocus()
    expect(detail).toHaveTextContent(DEFAULT_DETAIL)
    expect(ringRectCount(firstStep)).toBe(1)
  })
})
