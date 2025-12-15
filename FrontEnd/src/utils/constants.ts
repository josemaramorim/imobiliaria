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
  { id: OpportunityStage.NEW, title: 'Novo', color: '#9CA3AF' },          // gray-400
  { id: OpportunityStage.QUALIFIED, title: 'Qualificado', color: '#38BDF8' }, // sky-400
  { id: OpportunityStage.VISIT_SCHEDULED, title: 'Visita Agendada', color: '#3B82F6' }, // blue-500
  { id: OpportunityStage.PROPOSAL, title: 'Proposta', color: '#F59E0B' },    // amber-500
  { id: OpportunityStage.NEGOTIATION, title: 'Negociação', color: '#8B5CF6' }, // purple-500
  { id: OpportunityStage.CLOSED_WON, title: 'Ganho', color: '#10B981' },     // green-500 (must be green)
  { id: OpportunityStage.CLOSED_LOST, title: 'Perdido', color: '#EF4444' },   // red-500 (must be red)
];