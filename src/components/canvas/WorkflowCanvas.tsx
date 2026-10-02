'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  ReactFlow,
  Background,
  Controls,
  useNodesState,
  useEdgesState,
  type Edge,
  type OnNodeDrag,
  type NodeMouseHandler,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import { StepNode, type StepNodeType } from './StepNode';
import type { WorkflowStep } from '@/lib/graphql/workflow-detail';
import { updateStepPosition } from '@/app/orgs/[orgId]/workflows/[workflowId]/actions';
import { EditStepPanel } from './EditStepPanel';
import type { StepType } from '@/lib/graphql/workflow-steps';

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

  const [nodes, setNodes, onNodesChange] =
    useNodesState<StepNodeType>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);

  useEffect(() => {
    setNodes(initialNodes);
  }, [initialNodes, setNodes]);

  useEffect(() => {
    setEdges(initialEdges);
  }, [initialEdges, setEdges]);

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

  const referencingStepOrders = useMemo(() => {
    const map = new Map<number, number[]>();
    for (const step of steps) {
      if (step.type !== 'conditional_branch') continue;
      const target = step.config.jumpToStepOnFalse;
      if (typeof target !== 'number') continue;
      const existing = map.get(target) ?? [];
      map.set(target, [...existing, step.stepOrder]);
    }
    return map;
  }, [steps]);

  const [selectedStep, setSelectedStep] = useState<StepNodeType | null>(null);
  const handleNodeClick = useCallback<NodeMouseHandler<StepNodeType>>(
    (_event, node) => {
      setSelectedStep(node);
    },
    [],
  );

  return (
    <div className="relative h-full w-full bg-bg">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeDragStop={handleNodeDragStop}
        onNodeClick={handleNodeClick}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background color="var(--color-border)" gap={24} />
        <Controls />
      </ReactFlow>

      {selectedStep && (
        <EditStepPanel
          key={selectedStep.id}
          stepId={selectedStep.id}
          stepOrder={selectedStep.data.stepOrder}
          type={selectedStep.data.type as StepType}
          config={selectedStep.data.config}
          referencedByStepOrders={
            referencingStepOrders.get(selectedStep.data.stepOrder) ?? []
          }
          onClose={() => setSelectedStep(null)}
        />
      )}
    </div>
  );
}
