// enums/projectEnums.js
export const AccountCreatedForEnum = {
    MY_OWN_DEVELOPMENT_OR_PROPERTY: 100,
    BEHALF_OF_CLIENT: 101,
    MY_COMPANY: 102
};

export const UserStatusEnum = {
    NOT_REGISTERED: 100,
    REGISTERED: 101
};

export const ProjectTypeEnum = {
    REPAIR: 100,
    RENOVATION: 101,
    AA: 102,
    FULL_REBUILD: 103,
    INTERIOR_FIT_OUT: 104
};

export const PropertyTypeEnum = {
    HDB: 100,
    CONDO: 101,
    LANDED: 102,
    COMMERCIAL: 103
};

export const ProjectStatusEnum = {
    PLANNED: 100,
    IN_PROGRESS: 101,
    ON_HOLD: 102,
    COMPLETED: 103,
    CANCELLED: 104
};

export const ProjectCollaboratorStatusEnum = {
    PENDING: 100,
    ACCEPTED: 101
};

export const ProjectDocumentEntityTypeEnum = {
    VO: 100,
    RFI: 101,
    TENDER: 102,
    INVOICE: 103
};

export const VoApprovalWorkflowEnum = {
    'Contractor → Architect/QS Review → Owner Approves': 100,
    'Contractor → QS Certifies → Owner Approves': 101,
    'Contractor → Architect Approves (Owner notified)': 102
};

export const VoThresholdTypeEnum = {
    AMBER: 100,
    RED: 101,
    OTHERS: 102
};

export const NotifyTypeEnum = {
    EMAIL: 100,
    WHATSAPP: 101,
    BOTH: 102
};

export const RoleTypeIdEnum = {
    COMPANY_ADMIN: 100,
    PROJECT_DIRECTOR: 101,
    PROJECT_MANAGER: 102,
    QUANTITY_SURVEYOR: 103,
    SITE_MANAGER_OR_SITE_SUPERVISOR: 104,
    ACOOUNTS_OR_FINANCE: 105,
    ARCHITECT_CONSULTANT: 106,
    CONTRACTOR: 107,
    VIEWER_OR_INVESTOR: 108,
};

export const RoleScopeEnum = {
    GLOBAL: 100,
    PROJECT_BASED: 101
};

export const PermissionAcionTypeEnum = {
    VIEW_ONLY: 100,
    CONTRIBUTE: 101,
    FULL_ACCESS: 102
};

export const DocumentFolderTypeEnum = {
    USER: 'user',
    VO: 'variant-order',
    RFI: 'rfi',
    TENDER: 'tender',
    PAYMENT: 'payment',
    OTHERS: 'others'
};

