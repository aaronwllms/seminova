import { render, screen } from '@/test/test-utils'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'

import { WORKFLOW_LOOP_NODES } from '../_lib/workflow-page-content'
import { WorkflowDiagram } from './workflow-diagram'

describe('WorkflowDiagram', () => {
  it('should reveal step detail on keyboard focus and keep it when tabbing between steps', async () => {
    const user = userEvent.setup()
    const firstNode = WORKFLOW_LOOP_NODES[0]
    const secondNode = WORKFLOW_LOOP_NODES[1]

    render(<WorkflowDiagram ariaLabelledBy="plan-review-build" />)

    const detail = screen.getByText(
      /hover or focus a step to see what happens there/i,
    )
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

    await user.keyboard(' ')
    expect(screen.getByText(buildNode.detail)).toBeInTheDocument()
  })
})
