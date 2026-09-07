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

  const initialEdges = useMemo<Edge[]>(() => {
    const stepOrderToId = new Map(steps.map((s) => [s.stepOrder, s.id]));

    const sequentialEdges: Edge[] = steps.slice(1).map((step, index) => {
      const prevStep = steps[index];
      const isBranchSource = prevStep.type === 'conditional_branch';

      return {
        id: `${prevStep.id}-${step.id}`,
        source: prevStep.id,
        target: step.id,
        style: { stroke: 'var(--color-border)' },
        label: isBranchSource ? 'true' : undefined,
        labelStyle: { fill: 'var(--color-text-muted)', fontSize: 10 },
        labelBgStyle: { fill: 'var(--color-surface)' },
      };
    });

    const branchEdges: Edge[] = steps
      .filter((s) => s.type === 'conditional_branch')
      .flatMap((s) => {
        const jumpTarget = s.config.jumpToStepOnFalse;
        if (typeof jumpTarget !== 'number') return [];

        const targetId = stepOrderToId.get(jumpTarget);
        if (!targetId) return [];

        return [
          {
            id: `${s.id}-branch-${targetId}`,
            source: s.id,
            target: targetId,
            style: {
              stroke: 'var(--color-text-muted)',
              strokeDasharray: '4 4',
            },
            label: 'false',
            labelStyle: { fill: 'var(--color-text-muted)', fontSize: 10 },
            labelBgStyle: { fill: 'var(--color-surface)' },
          },
        ];
      });

    return [...sequentialEdges, ...branchEdges];
  }, [steps]);

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
