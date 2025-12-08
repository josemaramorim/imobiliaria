import { UserRole, Opportunity, OpportunityStage, Permission } from '../types/types';

// --- RBAC Configuration ---
// Define what each role CAN do. 
export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.SUPER_ADMIN]: [
    'properties.create', 'properties.edit', 'properties.delete',
    'crm.view', 'crm.manage',
    'team.view', 'team.invite', 'team.edit', 'team.delete',
    'settings.view', 'settings.manage',
    'saas.manage'
  ],
  [UserRole.ADMIN]: [
    'properties.create', 'properties.edit', 'properties.delete',
    'crm.view', 'crm.manage',
    'team.view', 'team.invite', 'team.edit', 'team.delete',
    'settings.view', 'settings.manage'
  ],
  [UserRole.MANAGER]: [
    'properties.create', 'properties.edit', 'properties.delete',
    'crm.view', 'crm.manage',
    'team.view',
  ],
  [UserRole.BROKER]: [
    'properties.create', 'properties.edit',
    'crm.view', 'crm.manage'
  ]
};

export const KANBAN_COLUMNS = [
  { id: OpportunityStage.NEW, title: 'Novo', color: 'border-gray-400' },
  { id: OpportunityStage.QUALIFIED, title: 'Qualificado', color: 'border-sky-400' },
  { id: OpportunityStage.VISIT_SCHEDULED, title: 'Visita Agendada', color: 'border-blue-400' },
  { id: OpportunityStage.PROPOSAL, title: 'Proposta', color: 'border-yellow-400' },
  { id: OpportunityStage.NEGOTIATION, title: 'Negociação', color: 'border-purple-400' },
  { id: OpportunityStage.CLOSED_WON, title: 'Ganho', color: 'border-green-400' },
  { id: OpportunityStage.CLOSED_LOST, title: 'Perdido', color: 'border-red-400' },
];