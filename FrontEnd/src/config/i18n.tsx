

import React, { createContext, useState, useContext, ReactNode } from 'react';

export type Language = 'pt-BR' | 'en' | 'es';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const ptBRTranslations = {
    'saas.gateways.configure': 'Configurar',
    'saas.gateways.configured': 'Configurado',
    'saas.gateways.not_configured': 'Não Configurado',
    'saas.gateways.config_modal_title': 'Configurar {gatewayName}',
    'saas.gateways.save_config': 'Salvar Configuração',
    'saas.gateways.field_publishable_key': 'Chave Publicável (Publishable Key)',
    'saas.gateways.field_secret_key': 'Chave Secreta (Secret Key)',
    'saas.gateways.field_api_key': 'Chave de API (API Key)',
    'saas.gateways.field_email': 'Email de Acesso',
    'saas.gateways.field_token': 'Token de Acesso',
    'checkout.title': 'Pagamento Seguro',
    'checkout.pay_invoice': 'Pagar Fatura',
    'checkout.due_date': 'Vencimento',
    'checkout.card_details': 'Detalhes do Cartão',
    'checkout.card_number': 'Número do Cartão',
    'checkout.expiry_date': 'Validade (MM/AA)',
    'checkout.cvc': 'CVC',
    'checkout.pay_now': 'Pagar Agora',
    'checkout.pay_now_button': 'Pagar Agora',
    'checkout.processing': 'Processando...',
    'auth.error.past_due': 'Sua assinatura está com o pagamento pendente. Regularize para reativar o acesso.',
    'auth.error.inactive': 'Esta conta foi suspensa ou desativada.',
    'settings.menu.billing': 'Assinatura & Faturamento',
    'settings.api.empty_title': 'Nenhuma chave de API ainda',
    'settings.api.empty_desc': 'Crie sua primeira chave para começar a integrar seus sistemas.',
    'settings.api.generate_first': 'Gerar Primeira Chave',
    'settings.api.last_used': 'Último Uso:',
    'settings.api.created_at': 'Criada em:',
    'settings.webhooks.create_first': 'Criar Primeiro Webhook',
    'settings.webhooks.last_triggered': 'Último Disparo:',
    'settings.webhooks.created_at': 'Criado em:',
    'settings.webhooks.test': 'Testar',

    'login.title': 'Acesse sua conta', 'login.subtitle': 'Gerencie sua imobiliária de forma inteligente.',
    'login.email': 'E-mail Corporativo', 'login.password': 'Senha', 'login.remember': 'Lembrar de mim',
    'login.forgot': 'Esqueceu a senha?', 'login.submit': 'Entrar na Plataforma', 'auth.error.invalid': 'E-mail ou senha incorretos.',
    'auth.error.generic': 'Ocorreu um erro ao tentar entrar.', 'forgot.title': 'Recuperar Senha',
    'forgot.subtitle': 'Digite seu e-mail para receber o link de redefinição.', 'forgot.submit': 'Enviar Link de Recuperação',
    'forgot.success_title': 'E-mail enviado!', 'forgot.success_desc': 'Se existir uma conta associada a',
    'maintenance.title': 'Plataforma em Manutenção', 'maintenance.message': 'Estamos realizando atualizações para melhorar sua experiência. Voltaremos em breve.',
    'nav.dashboard': 'Painel', 'nav.properties': 'Imóveis', 'nav.crm': 'Pipeline (CRM)', 'nav.leads': 'Lista de Leads',
    'nav.agenda': 'Agenda', 'nav.team': 'Equipe & Corretores', 'nav.settings': 'Configurações',
    'nav.saas_admin': 'Admin SaaS (Super)', 'nav.simulate_role': 'Simular Cargo (Teste)', 'header.search': 'Busca global...',
    'header.overview': 'Visão Geral', 'common.save': 'Salvar', 'common.cancel': 'Cancelar', 'common.upload': 'Adicionar Fotos',
    'common.select_option': 'Selecione uma opção', 'common.yes': 'Sim', 'common.no': 'Não', 'common.delete': 'Excluir',
    'common.add': 'Adicionar', 'common.edit': 'Editar', 'common.update': 'Atualizar', 'common.confirm_delete': 'Tem certeza que deseja excluir?',
    'common.apply': 'Aplicar', 'common.clear': 'Limpar', 'common.min': 'Mín', 'common.max': 'Máx', 'common.back': 'Voltar',
    'common.back_to_login': 'Voltar para o Login',
    'common.required_field_error': 'Por favor, preencha este campo obrigatório', 'common.status': 'Status', 'common.active': 'Ativo',
    'common.inactive': 'Inativo', 'dashboard.title': 'Painel', 'dashboard.subtitle': 'Insights em tempo real e métricas.',
    'dashboard.revenue': 'Receita Total', 'dashboard.opportunities': 'Oportunidades Ativas', 'dashboard.leads': 'Total de Leads',
    'dashboard.listings': 'Imóveis Listados', 'dashboard.vs_last_month': 'vs. mês anterior', 'dashboard.trend_pipeline': 'Tendência do Pipeline',
    'dashboard.activity_leads': 'Atividade de Leads', 'dashboard.week': 'Esta Semana', 'dashboard.month': 'Este Mês', 'dashboard.quarter': 'Este Trimestre',
    'properties.title': 'Imóveis', 'properties.subtitle': 'Gerencie listagens, tours virtuais e disponibilidade.',
    'properties.filters': 'Filtros', 'properties.add': 'Novo Imóvel', 'properties.beds': 'Quartos', 'properties.baths': 'Banheiros',
    'properties.schedule_visit': 'Agendar Visita', 'properties.search_placeholder': 'Buscar por título ou endereço...',
    'properties.status.AVAILABLE': 'Disponível', 'properties.status.UNDER_OFFER': 'Em Proposta', 'properties.status.SOLD': 'Vendido',
    'properties.status.RENTED': 'Alugado', 'properties.form.section_basic': 'Informações Básicas',
    'properties.form.section_details': 'Detalhes do Imóvel', 'properties.form.section_media': 'Galeria de Mídia',
    'properties.form.section_features': 'Características e Detalhes', 'properties.form.title': 'Título do Anúncio',
    'properties.form.address': 'Endereço Completo', 'properties.form.price': 'Valor (R$)', 'properties.form.area': 'Área (m²)',
    'properties.form.bedrooms': 'Quartos', 'properties.form.bathrooms': 'Banheiros', 'properties.form.status': 'Status Atual',
    'properties.form.agent': 'Corretor Responsável', 'properties.form.no_images': 'Nenhuma imagem adicionada ainda.',
    'visit.modal_title': 'Agendar Visita', 'visit.edit_title': 'Editar Compromisso', 'visit.add_title': 'Novo Compromisso',
    'visit.form.date': 'Data e Hora', 'visit.form.broker': 'Corretor Responsável', 'visit.form.lead': 'Nome do Cliente / Título',
    'visit.form.property_title': 'Imóvel Relacionado (Opcional)', 'visit.form.notes': 'Observações',
    'visit.form.reminder_label': 'Lembretes Automáticos', 'visit.form.reminder_help': 'Notificar corretor e cliente 24h antes.',
    'visit.toast.success': 'Visita agendada com sucesso!', 'visit.delete_confirm': 'Deseja realmente remover este compromisso?',
    'properties.fields.manage': 'Gerenciar Campos', 'properties.fields.modal_title': 'Editor de Campos Personalizados',
    'properties.fields.modal_subtitle': 'Adicione ou edite campos específicos para o seu nicho.',
    'properties.fields.label': 'Nome do Campo', 'properties.fields.type': 'Tipo de Dado', 'properties.fields.options': 'Opções (separadas por vírgula)',
    'properties.fields.required': 'Obrigatório', 'properties.fields.optional': 'Opcional', 'properties.fields.type.TEXT': 'Texto Curto',
    'properties.fields.type.NUMBER': 'Número', 'properties.fields.type.SELECT': 'Seleção Única',
    'properties.fields.type.MULTI_SELECT': 'Seleção Múltipla', 'properties.fields.type.BOOLEAN': 'Sim/Não',
    'properties.fields.empty': 'Nenhum campo personalizado criado.', 'properties.fields.edit_mode': 'Editando Campo:',
    'properties.fields.add_mode': 'Adicionar Novo Campo', 'properties.fields.cancel_edit': 'Cancelar Edição', 'filters.title': 'Filtrar',
    'filters.price_range': 'Faixa de Preço', 'leads.title': 'Gestão de Leads', 'leads.subtitle': 'Visualize e gerencie sua base de contatos.',
    'leads.add': 'Novo Lead', 'leads.details': 'Detalhes do Lead', 'leads.search_placeholder': 'Buscar por nome, email ou telefone...',
    'leads.manage_tags': 'Gerenciar Tags', 'leads.manage_fields': 'Campos Personalizados', 'leads.tags_modal_title': 'Gerenciador de Tags',
    'leads.table.name': 'Nome', 'leads.table.contact': 'Contato', 'leads.table.source': 'Origem', 'leads.table.tags': 'Tags',
    'leads.table.status': 'Status', 'leads.form.source': 'Origem do Lead', 'leads.form.status': 'Status do Lead', 'leads.form.is_active': 'Lead está ativo?',
    'leads.form.tags': 'Etiquetas (Tags)', 'leads.form.section_additional': 'Informações Adicionais', 'leads.status.active': 'Ativo',
    'leads.status.inactive': 'Inativo', 'leads.interaction.CALL': 'Ligação', 'leads.interaction.EMAIL': 'E-mail',
    'leads.interaction.MEETING': 'Reunião', 'leads.interaction.WHATSAPP': 'WhatsApp', 'leads.interaction.NOTE': 'Anotação',
    'leads.history.title': 'Histórico de Interações', 'leads.history.add': 'Adicionar Interação', 'leads.history.type': 'Tipo',
    'leads.history.date': 'Data', 'leads.history.notes': 'Anotações', 'crm.prob': 'Prob.', 'crm.general_inquiry': 'Consulta Geral',
    'crm.agent': 'Corretor', 'crm.stage.NEW': 'Novo', 'crm.stage.QUALIFIED': 'Qualificado', 'crm.stage.VISIT_SCHEDULED': 'Visita Agendada',
    'crm.stage.PROPOSAL': 'Proposta', 'crm.stage.NEGOTIATION': 'Negociação', 'crm.stage.CLOSED_WON': 'Ganho', 'crm.stage.CLOSED_LOST': 'Perdido',
    'crm.drop_items': 'Arraste itens aqui', 'crm.add_opportunity': 'Adicionar Oportunidade', 'crm.new_deal': 'Nova Oportunidade',
    'crm.form.select_lead': 'Selecione um Cliente (Lead)', 'crm.form.deal_title': 'Título da Oportunidade', 'crm.form.select_property': 'Imóvel Vinculado (Opcional)',
    'crm.form.value': 'Valor Estimado (R$)', 'crm.form.stage': 'Etapa do Funil', 'crm.form.probability': 'Probabilidade de Fechamento',
    'crm.form.tags': 'Etiquetas (Tags)', 'crm.calendar.filter_agent': 'Filtrar corretor', 'crm.calendar.my_agenda': 'Minha Agenda',
    'crm.new_event': 'Novo Evento', 'crm.title': 'Pipeline de Vendas', 'crm.subtitle': 'Acompanhe suas negociações do início ao fim.',
    'crm.calendar': 'Ver Calendário', 'crm.kanban': 'Ver Kanban', 'team.title': 'Equipe & Corretores', 'team.subtitle': 'Gerencie membros da equipe e suas permissões.',
    'team.invite': 'Convidar Membro', 'team.edit_member': 'Editar Membro da Equipe', 'team.form.name': 'Nome Completo', 'team.form.email': 'E-mail Corporativo',
    'team.form.role': 'Cargo / Permissão', 'team.role.BROKER': 'Corretor', 'team.role.MANAGER': 'Gerente', 'team.role.ADMIN': 'Administrador',
    'team.status.ACTIVE': 'Ativo', 'team.status.INACTIVE': 'Inativo', 'team.stats.deals': 'Negócios', 'team.stats.value': 'Valor Total',
    'team.stats.conversion': 'Conversão', 'settings.title': 'Configurações do Tenant', 'settings.subtitle': 'Ajuste preferências, integrações e dados da sua imobiliária.',
    'settings.menu.general': 'Geral', 'settings.menu.api': 'API', 'settings.menu.webhooks': 'Webhooks', 'settings.general.company': 'Nome da Imobiliária',
    'settings.general.domain': 'Subdomínio', 'settings.general.color': 'Cor Principal da Marca', 'settings.general.update': 'Atualizar Informações',
    'settings.api.revoke': 'Revogar', 'settings.docs.title': 'Documentação da API', 'settings.docs.desc': 'Integre seus sistemas com nossa API RESTful para automatizar processos.',
    'settings.docs.link': 'Abrir Documentação', 'settings.api.title': 'Chaves de API', 'settings.api.new': 'Gerar Nova Chave',
    'settings.api.active': 'Ativa', 'settings.api.pause': 'Pausar', 'settings.api.resume': 'Reativar', 'settings.webhooks.title': 'Webhooks',
    'settings.webhooks.desc': 'Receba notificações em tempo real sobre eventos importantes.', 'settings.webhooks.add': 'Adicionar Webhook',
    'settings.api.new_key_title': 'Chave de API Gerada', 'settings.api.new_key_desc': 'Esta é a única vez que sua chave secreta será exibida. Guarde-a em um local seguro.',
    'settings.webhooks.new_secret_title': 'Webhook Criado', 'settings.webhooks.new_secret_desc': 'Use este segredo para verificar a autenticidade das chamadas do webhook. Guarde-o em um local seguro.',
    'settings.webhooks.empty_title': 'Nenhum webhook configurado.',
    'settings.webhooks.empty_desc': 'Crie um webhook para ser notificado sobre eventos.',
    'saas.title': 'Painel do Super Administrador', 'saas.subtitle': 'Gerenciamento global de todos os tenants da plataforma.',
    'saas.add_tenant': 'Nova Imobiliária', 'saas.switch.title': 'Acessar como Administrador',
    'saas.switch.desc': 'Você está prestes a entrar no painel do tenant {tenantName}. Todas as ações serão realizadas em nome deles.',
    'saas.switch.confirm': 'Confirmar e Acessar', 'saas.table.name': 'Nome do Tenant', 'saas.table.domain': 'Domínio',
    'saas.table.plan': 'Plano', 'saas.table.status': 'Status', 'saas.actions.access': 'Acessar Painel',
    'saas.form.name': 'Nome da Imobiliária', 'saas.form.domain': 'Subdomínio (sem .apollo.app)',
    'saas.form.plan': 'Plano de Assinatura', 'saas.form.theme': 'Cor do Tema',
    'saas.form.trial_duration': 'Duração do Trial (dias)',
    'saas.form.payment_gateway': 'Gateway de Pagamento',
    'saas.modal.add_title': 'Adicionar Nova Imobiliária', 'saas.modal.edit_title': 'Editar Imobiliária',
    'saas.table.active': 'Ativo', 'saas.table.inactive': 'Inativo', 'saas.table.trial': 'Em Teste', 'saas.table.past_due': 'Pendente',
    'saas.invoices.title': 'Faturas do Cliente', 'saas.invoices.empty': 'Nenhuma fatura encontrada para este cliente.',
    'saas.delete.title': 'Excluir Imobiliária Permanentemente', 'saas.delete.desc': 'Atenção: Esta ação apagará todos os dados (imóveis, leads, usuários) e não poderá ser desfeita.',
    'saas.plans.delete_title': 'Excluir Plano?', 'saas.plans.delete_desc': 'Tem certeza que quer excluir o plano? Isso pode afetar tenants assinantes.',
};

const translations: Record<Language, Record<string, string>> = {
  'pt-BR': ptBRTranslations,
  'en': {}, // Placeholder for English
  'es': {}  // Placeholder for Spanish
};

export const LanguageProvider = ({ children }: { children?: ReactNode }) => {
  const [language, setLanguage] = useState<Language>('pt-BR');
  const t = (key: string): string => translations[language][key] || translations['pt-BR'][key] || key;
  return (<LanguageContext.Provider value={{ language, setLanguage, t }}>{children}</LanguageContext.Provider>);
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error('useLanguage must be used within a LanguageProvider');
  return context;
};