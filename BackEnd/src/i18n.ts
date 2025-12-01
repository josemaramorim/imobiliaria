import { Request } from 'express';

export type Language = 'pt-BR' | 'en' | 'es';

const pt = {
  'auth.error.past_due': 'Sua assinatura está com o pagamento pendente. Regularize para reativar o acesso.',
  'auth.error.inactive': 'Esta conta foi suspensa ou desativada.',
  'auth.error.invalid': 'E-mail ou senha incorretos.',
  'auth.error.generic': 'Ocorreu um erro ao tentar entrar.',
  'common.required_field_error': 'Por favor, preencha este campo obrigatório',
  'saas.add_tenant': 'Nova Imobiliária',
  'saas.form.domain': 'Subdomínio (sem .apollo.app)',
  'saas.table.domain': 'Domínio',
  'saas.table.name': 'Nome do Tenant',
  'saas.table.status': 'Status',
  'saas.invoices.empty': 'Nenhuma fatura encontrada para este cliente.',
  'common.not_found': 'Recurso não encontrado',
  'common.unauthorized': 'Não autorizado',
  'common.forbidden': 'Ação proibida',
  'tenant.created': 'Imobiliária criada com sucesso',
  'tenant.updated': 'Imobiliária atualizada',
  'tenant.deleted': 'Imobiliária excluída',
  'opportunity.created': 'Oportunidade criada com sucesso',
  'opportunity.updated': 'Oportunidade atualizada',
  'opportunity.deleted': 'Oportunidade removida',
  'interaction.added': 'Interação registrada',
  'visit.created': 'Visita agendada com sucesso!',
  'visit.updated': 'Visita atualizada',
  'visit.deleted': 'Visita removida',
  'invoice.created': 'Fatura criada',
  'invoice.updated': 'Fatura atualizada',
  'invoice.marked_paid': 'Fatura marcada como paga',
  'apikey.created': 'Chave de API gerada',
  'apikey.revoked': 'Chave revogada',
  'webhook.created': 'Webhook criado',
  'webhook.deleted': 'Webhook excluído',
};

const en = {
  'auth.error.past_due': 'Your subscription payment is past due. Please settle to reactivate access.',
  'auth.error.inactive': 'This account has been suspended or deactivated.',
  'auth.error.invalid': 'Invalid email or password.',
  'auth.error.generic': 'An error occurred while trying to sign in.',
  'common.required_field_error': 'Please fill out this required field',
  'saas.add_tenant': 'New Agency',
  'saas.form.domain': 'Subdomain (without .apollo.app)',
  'saas.table.domain': 'Domain',
  'saas.table.name': 'Tenant Name',
  'saas.table.status': 'Status',
  'saas.invoices.empty': 'No invoices found for this customer.',
  'common.not_found': 'Resource not found',
  'common.unauthorized': 'Unauthorized',
  'common.forbidden': 'Forbidden',
  'tenant.created': 'Tenant created successfully',
  'tenant.updated': 'Tenant updated',
  'tenant.deleted': 'Tenant deleted',
  'opportunity.created': 'Opportunity created',
  'opportunity.updated': 'Opportunity updated',
  'opportunity.deleted': 'Opportunity removed',
  'interaction.added': 'Interaction recorded',
  'visit.created': 'Visit scheduled successfully!',
  'visit.updated': 'Visit updated',
  'visit.deleted': 'Visit removed',
  'invoice.created': 'Invoice created',
  'invoice.updated': 'Invoice updated',
  'invoice.marked_paid': 'Invoice marked as paid',
  'apikey.created': 'API key generated',
  'apikey.revoked': 'API key revoked',
  'webhook.created': 'Webhook created',
  'webhook.deleted': 'Webhook deleted',
};

const es = {
  'auth.error.past_due': 'Su suscripción tiene pagos pendientes. Regularice para reactivar el acceso.',
  'auth.error.inactive': 'Esta cuenta ha sido suspendida o desactivada.',
  'auth.error.invalid': 'Correo electrónico o contraseña incorrectos.',
  'auth.error.generic': 'Ocurrió un error al intentar iniciar sesión.',
  'common.required_field_error': 'Por favor, complete este campo obligatorio',
  'saas.add_tenant': 'Nueva Inmobiliaria',
  'saas.form.domain': 'Subdominio (sin .apollo.app)',
  'saas.table.domain': 'Dominio',
  'saas.table.name': 'Nombre del Tenant',
  'saas.table.status': 'Estado',
  'saas.invoices.empty': 'No se encontraron facturas para este cliente.',
  'common.not_found': 'Recurso no encontrado',
  'common.unauthorized': 'No autorizado',
  'common.forbidden': 'Prohibido',
  'tenant.created': 'Tenant creado con éxito',
  'tenant.updated': 'Tenant actualizado',
  'tenant.deleted': 'Tenant eliminado',
  'opportunity.created': 'Oportunidad creada',
  'opportunity.updated': 'Oportunidad actualizada',
  'opportunity.deleted': 'Oportunidad eliminada',
  'interaction.added': 'Interacción registrada',
  'visit.created': 'Visita agendada con éxito!',
  'visit.updated': 'Visita actualizada',
  'visit.deleted': 'Visita eliminada',
  'invoice.created': 'Factura creada',
  'invoice.updated': 'Factura actualizada',
  'invoice.marked_paid': 'Factura marcada como pagada',
  'apikey.created': 'Clave API generada',
  'apikey.revoked': 'Clave API revocada',
  'webhook.created': 'Webhook creado',
  'webhook.deleted': 'Webhook eliminado',
};

const translations: Record<Language, Record<string, string>> = {
  'pt-BR': pt,
  en,
  es,
};

export function getRequestLanguage(req: Request): Language {
  const qLang = (req.query.lang as string | undefined);
  const header = (req.headers['accept-language'] as string | undefined) || 'pt-BR';
  if (qLang && (qLang === 'pt-BR' || qLang === 'en' || qLang === 'es')) return qLang;
  if (header.startsWith('en')) return 'en';
  if (header.startsWith('es')) return 'es';
  return 'pt-BR';
}

export function t(req: Request, key: string): string {
  const lang = getRequestLanguage(req);
  return translations[lang][key] || translations['pt-BR'][key] || key;
}
