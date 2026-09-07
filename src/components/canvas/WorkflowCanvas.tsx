'use client';

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Edge,
  type OnNodeDrag,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { StepNode, type StepNodeType } from './StepNode';
import type { WorkflowStep } from '@/lib/graphql/workflow-detail';
import { updateStepPosition } from '@/app/orgs/[orgId]/workflows/[workflowId]/actions';

const nodeTypes = { step: StepNode };

interface WorkflowCanvasProps {
  steps: WorkflowStep[];
}

export function WorkflowCanvas({ steps }: WorkflowCanvasProps) {
  const initialNodes = useMemo<StepNodeType[]>(
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

  const initialEdges = useMemo<Edge[]>(
    () =>
      steps.slice(1).map((step, index) => ({
        id: `${steps[index].id}-${step.id}`,
        source: steps[index].id,
        target: step.id,
        style: { stroke: 'var(--color-border)' },
      })),
    [steps],
  );

  const [nodes, , onNodesChange] = useNodesState<StepNodeType>(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState<Edge>(initialEdges);

  const handleNodeDragStop = useCallback<OnNodeDrag<StepNodeType>>(
    (_event, node) => {
      updateStepPosition(node.id, node.position).then((result) => {
        if (!result.success) {
          console.error('Failed to persist node position:', result.error);
        }
      });
    },
    [],
  );

  return (
    <div className="h-full w-full bg-bg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={handleNodeDragStop}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--color-border)" gap={24} />
        <Controls />
      </ReactFlow>
    </div>
  );
}
