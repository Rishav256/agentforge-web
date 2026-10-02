import type { StepType } from './graphql/workflow-steps';

export interface StepFieldState {
  prompt: string;
  url: string;
  method: string;
  body: string;
  message: string;
  dbKey: string;
  dbValue: string;
  field: string;
  value: string;
  jumpToStepOnFalse: string;
}

export const emptyStepFields: StepFieldState = {
  prompt: '',
  url: '',
  method: 'POST',
  body: '',
  message: '',
  dbKey: '',
  dbValue: '',
  field: '',
  value: '',
  jumpToStepOnFalse: '',
};

export function fieldsFromConfig(
  type: StepType,
  config: Record<string, unknown>,
): StepFieldState {
  const fields = { ...emptyStepFields };
  switch (type) {
    case 'llm_call':
      fields.prompt = typeof config.prompt === 'string' ? config.prompt : '';
      break;
    case 'http_request':
      fields.url = typeof config.url === 'string' ? config.url : '';
      fields.method =
        typeof config.method === 'string' ? config.method : 'POST';
      fields.body =
        config.body && typeof config.body === 'object'
          ? JSON.stringify(config.body)
          : '';
      break;
    case 'notify':
      fields.url = typeof config.url === 'string' ? config.url : '';
      fields.message = typeof config.message === 'string' ? config.message : '';
      break;
    case 'db_write':
      fields.dbKey = typeof config.key === 'string' ? config.key : '';
      fields.dbValue = typeof config.value === 'string' ? config.value : '';
      break;
    case 'conditional_branch':
      fields.field = typeof config.field === 'string' ? config.field : '';
      fields.value =
        typeof config.value === 'boolean' || typeof config.value === 'string'
          ? String(config.value)
          : '';
      fields.jumpToStepOnFalse =
        typeof config.jumpToStepOnFalse === 'number'
          ? String(config.jumpToStepOnFalse)
          : '';
      break;
    case 'approval_gate':
      break;
  }
  return fields;
}

export function buildStepConfig(
  type: StepType,
  fields: StepFieldState,
):
  | { success: true; config: Record<string, unknown> }
  | { success: false; error: string } {
  switch (type) {
    case 'llm_call':
      return { success: true, config: { prompt: fields.prompt } };
    case 'http_request': {
      let body: unknown = {};
      try {
        body = fields.body ? JSON.parse(fields.body) : {};
      } catch {
        return { success: false, error: 'Invalid JSON in body field' };
      }
      return {
        success: true,
        config: {
          url: fields.url,
          method: fields.method,
          headers: { 'Content-Type': 'application/json' },
          body,
        },
      };
    }
    case 'notify':
      return {
        success: true,
        config: { url: fields.url, message: fields.message },
      };
    case 'db_write':
      return {
        success: true,
        config: { key: fields.dbKey, value: fields.dbValue },
      };
    case 'conditional_branch': {
      const jumpTarget = Number(fields.jumpToStepOnFalse);
      if (!fields.jumpToStepOnFalse || Number.isNaN(jumpTarget)) {
        return {
          success: false,
          error: 'Jump-to-step number is required for conditional branches',
        };
      }
      return {
        success: true,
        config: {
          field: fields.field,
          operator: 'equals',
          value:
            fields.value === 'true'
              ? true
              : fields.value === 'false'
                ? false
                : fields.value,
          jumpToStepOnFalse: jumpTarget,
        },
      };
    }
    case 'approval_gate':
      return { success: true, config: {} };
  }
}
