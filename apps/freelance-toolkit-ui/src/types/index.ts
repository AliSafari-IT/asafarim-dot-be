// Client Types
export interface CreateClientDto {
    name: string;
    email?: string;
    phone?: string;
    companyName?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    companyWebsite?: string;
    notes?: string;
    tags?: string[];
}

export interface UpdateClientDto {
    name: string;
    email?: string;
    phone?: string;
    companyName?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    companyWebsite?: string;
    notes?: string;
    tags?: string[];
}

export interface ClientResponseDto {
    id: string;
    name: string;
    email?: string;
    phone?: string;
    companyName?: string;
    address?: string;
    city?: string;
    state?: string;
    postalCode?: string;
    country?: string;
    companyWebsite?: string;
    notes?: string;
    tags: string[];
    createdAt: string;
    updatedAt?: string;
    proposalsCount: number;
    invoicesCount: number;
    bookingsCount: number;
    totalRevenue: number;
}

// Proposal Types
export interface ProposalLineItemDto {
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
}

export interface CreateProposalDto {
    clientId: string;
    title: string;
    description?: string;
    lineItems: ProposalLineItemDto[];
    taxPercent?: number;
    terms?: string;
    notes?: string;
    validUntil?: string;
    templateId?: string;
}

export interface UpdateProposalDto {
    title: string;
    description?: string;
    status: string;
    lineItems: ProposalLineItemDto[];
    taxPercent?: number;
    terms?: string;
    notes?: string;
    validUntil?: string;
}

export interface ProposalResponseDto {
    id: string;
    proposalNumber: string;
    clientId: string;
    clientName: string;
    title: string;
    projectScope?: string;
    status: string;
    lineItems: ProposalLineItemDto[];
    totalAmount: number;
    disclaimer?: string;
    createdAt: string;
    validUntil?: string;
    sentAt?: string;
    acceptedAt?: string;
    rejectedAt?: string;
}

export interface ProposalVersionDto {
    id: string;
    proposalId: string;
    versionNumber: number;
    title: string;
    description?: string;
    lineItems: ProposalLineItemDto[];
    subtotal: number;
    taxPercent?: number;
    taxAmount: number;
    total: number;
    terms?: string;
    notes?: string;
    createdAt: string;
}

export interface ProposalTemplateDto {
    id?: string;
    name: string;
    description?: string;
    defaultLineItems: ProposalLineItemDto[];
    defaultTaxPercent?: number;
    defaultTerms?: string;
    createdAt?: string;
}

// Invoice Types
export interface InvoiceLineItemDto {
    description: string;
    quantity: number;
    unitPrice: number;
    discountPercent?: number;
    total: number;
}

export interface CreateInvoiceDto {
    clientId: string;
    proposalId?: string;
    issueDate: string;
    dueDate: string;
    lineItems: InvoiceLineItemDto[];
    taxPercent?: number;
    notes?: string;
    paymentInstructions?: string;
}

export interface UpdateInvoiceDto {
    issueDate: string;
    dueDate: string;
    status: string;
    lineItems: InvoiceLineItemDto[];
    taxPercent?: number;
    notes?: string;
    paymentInstructions?: string;
    paidAt?: string;
}

export interface InvoiceResponseDto {
    id: string;
    invoiceNumber: string;
    clientId: string;
    clientName: string;
    clientEmail?: string;
    proposalId?: string;
    proposalNumber?: string;
    issueDate: string;
    dueDate: string;
    status: string;
    lineItems: InvoiceLineItemDto[];
    subtotal: number;
    taxPercent?: number;
    taxAmount: number;
    total: number;
    notes?: string;
    paymentInstructions?: string;
    paidAt?: string;
    createdAt: string;
    updatedAt?: string;
    sentAt?: string;
    isOverdue: boolean;
    deliveryStatus?: string;
    lastAttemptAt?: string;
    retryCount?: number;
}

export interface SendInvoiceDto {
    customSubject?: string;
    customBody?: string;
}

// Calendar Types
export interface CreateBookingDto {
    clientId?: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    location?: string;
    meetingUrl?: string;
    notes?: string;
}

export interface UpdateBookingDto {
    clientId?: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    location?: string;
    meetingUrl?: string;
    status: string;
    notes?: string;
}

export interface BookingResponseDto {
    id: string;
    clientId?: string;
    clientName?: string;
    clientEmail?: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    durationMinutes: number;
    location?: string;
    meetingUrl?: string;
    status: string;
    notes?: string;
    createdAt: string;
    updatedAt?: string;
    deliveryStatus?: string;
    lastAttemptAt?: string;
    retryCount?: number;
}

export interface RescheduleRequest {
    newStartTime: string;
    newEndTime: string;
}

export interface AvailabilityRequest {
    startTime: string;
    endTime: string;
    excludeBookingId?: string;
}

export interface AvailabilityResponse {
    isAvailable: boolean;
    startTime: string;
    endTime: string;
}

// Dashboard Types
export interface RecentInvoiceDto {
    id: string;
    invoiceNumber: string;
    clientName: string;
    total: number;
    status: string;
    createdAt: string;
}

export interface RecentProposalDto {
    id: string;
    proposalNumber: string;
    clientName: string;
    total: number;
    status: string;
    createdAt: string;
}

export interface UpcomingBookingDto {
    id: string;
    title: string;
    clientName?: string;
    startTime: string;
    durationMinutes: number;
}

export interface DashboardStatsDto {
    // Revenue
    revenueThisMonth: number;
    revenueLastMonth: number;
    revenueThisYear: number;
    revenuePercentChange: number;

    // Invoices
    totalInvoices: number;
    unpaidInvoices: number;
    overdueInvoices: number;
    unpaidAmount: number;
    overdueAmount: number;

    // Proposals
    totalProposals: number;
    draftProposals: number;
    sentProposals: number;
    acceptedProposals: number;
    proposalAcceptanceRate: number;

    // Clients
    totalClients: number;
    activeClients: number;

    // Calendar
    upcomingBookings: number;
    bookingsThisWeek: number;
    bookingsThisMonth: number;

    // Recent activity
    recentInvoices: RecentInvoiceDto[];
    recentProposals: RecentProposalDto[];
    upcomingBookingsList: UpcomingBookingDto[];
}
