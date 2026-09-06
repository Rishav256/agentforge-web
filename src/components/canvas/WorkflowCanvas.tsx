'use client';

import { useMemo } from 'react';
import { ReactFlow, Background, Controls, type Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { StepNode, type StepNodeType } from './StepNode';
import type { WorkflowStep } from '@/lib/graphql/workflow-detail';

const nodeTypes = { step: StepNode };

interface WorkflowCanvasProps {
  steps: WorkflowStep[];
}

export function WorkflowCanvas({ steps }: WorkflowCanvasProps) {
  const nodes = useMemo<StepNodeType[]>(
    () =>
      steps.map((step, index) => ({
        id: step.id,
        type: 'step',
        position: step.position ?? { x: 250, y: index * 140 },
        data: {
          type: step.type,
          stepOrder: step.stepOrder,
          config: step.config,
        },
      })),
    [steps],
  );

  const edges = useMemo<Edge[]>(
    () =>
      steps.slice(1).map((step, index) => ({
        id: `${steps[index].id}-${step.id}`,
        source: steps[index].id,
        target: step.id,
        style: { stroke: 'var(--color-border)' },
      })),
    [steps],
  );

  return (
    <div className="h-full w-full bg-bg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--color-border)" gap={24} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
