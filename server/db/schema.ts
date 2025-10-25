/* Pjuskeby Guardrails:
	 - Ingen placeholders. Ingen ubrukte exports.
	 - Følg koblinger.json for datakilder og relasjoner.
	 - All skriving til DB/FS logges i donetoday.json.
	 - Ved AI-generering: aldri publiser direkte; legg i drafts/.
	 - Ved valideringsfeil: returner 422, ikke "tøm felt".
*/

import { mysqlTable, varchar, text, timestamp, int, json, index, uniqueIndex } from 'drizzle-orm/mysql-core';

export const comments = mysqlTable('comments', {
	id: varchar('id', { length: 36 }).primaryKey(),
	postSlug: varchar('post_slug', { length: 255 }).notNull(),
	author: varchar('author', { length: 100 }).notNull(),
	email: varchar('email', { length: 255 }).notNull(),
	content: text('content').notNull(),
	parentId: varchar('parent_id', { length: 36 }),
	status: varchar('status', { length: 20 }).notNull().default('pending'),
	ipHash: varchar('ip_hash', { length: 64 }).notNull(),
	userAgent: varchar('user_agent', { length: 500 }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	moderatedAt: timestamp('moderated_at'),
	moderatedBy: varchar('moderated_by', { length: 100 }),
}, (table) => ({
	postSlugIdx: index('post_slug_idx').on(table.postSlug),
	statusIdx: index('status_idx').on(table.status),
	createdAtIdx: index('created_at_idx').on(table.createdAt),
}));

export const moderationLog = mysqlTable('moderation_log', {
	id: varchar('id', { length: 36 }).primaryKey(),
	commentId: varchar('comment_id', { length: 36 }).notNull(),
	action: varchar('action', { length: 50 }).notNull(),
	reason: text('reason'),
	moderator: varchar('moderator', { length: 100 }).notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
	commentIdIdx: index('comment_id_idx').on(table.commentId),
	createdAtIdx: index('created_at_idx').on(table.createdAt),
}));

export const rateLimits = mysqlTable('rate_limits', {
	id: varchar('id', { length: 36 }).primaryKey(),
	identifier: varchar('identifier', { length: 255 }).notNull(),
	action: varchar('action', { length: 50 }).notNull(),
	count: int('count').notNull().default(1),
	windowStart: timestamp('window_start').notNull().defaultNow(),
	expiresAt: timestamp('expires_at').notNull(),
}, (table) => ({
	identifierActionIdx: uniqueIndex('identifier_action_idx').on(table.identifier, table.action),
	expiresAtIdx: index('expires_at_idx').on(table.expiresAt),
}));

export const donations = mysqlTable('donations', {
	id: varchar('id', { length: 36 }).primaryKey(),
	kofiTransactionId: varchar('kofi_transaction_id', { length: 255 }).notNull(),
	donorName: varchar('donor_name', { length: 255 }),
	amount: varchar('amount', { length: 20 }).notNull(),
	currency: varchar('currency', { length: 10 }).notNull(),
	message: text('message'),
	isPublic: int('is_public').notNull().default(1),
	createdAt: timestamp('created_at').notNull().defaultNow(),
}, (table) => ({
	kofiTxIdx: uniqueIndex('kofi_tx_idx').on(table.kofiTransactionId),
	createdAtIdx: index('created_at_idx').on(table.createdAt),
}));

export const supporters = mysqlTable('supporters', {
	id: varchar('id', { length: 36 }).primaryKey(),
	name: varchar('name', { length: 255 }).notNull(),
	totalAmount: varchar('total_amount', { length: 20 }).notNull(),
	donationCount: int('donation_count').notNull().default(1),
	firstDonation: timestamp('first_donation').notNull(),
	lastDonation: timestamp('last_donation').notNull(),
	isVisible: int('is_visible').notNull().default(1),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
	nameIdx: index('name_idx').on(table.name),
	isVisibleIdx: index('is_visible_idx').on(table.isVisible),
}));

export const userPrefs = mysqlTable('user_prefs', {
	id: varchar('id', { length: 36 }).primaryKey(),
	identifier: varchar('identifier', { length: 255 }).notNull(),
	preferences: json('preferences').notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
	identifierIdx: uniqueIndex('identifier_idx').on(table.identifier),
}));

// PHASE 4: New entity tables
export const streets = mysqlTable('streets', {
	id: varchar('id', { length: 36 }).primaryKey(),
	name: varchar('name', { length: 200 }).notNull(),
	slug: varchar('slug', { length: 255 }).notNull(),
	description: text('description'),
	postalCode: varchar('postal_code', { length: 4 }),
	district: varchar('district', { length: 100 }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
	slugIdx: uniqueIndex('slug_idx').on(table.slug),
}));

export const places = mysqlTable('places', {
	id: varchar('id', { length: 36 }).primaryKey(),
	name: varchar('name', { length: 200 }).notNull(),
	slug: varchar('slug', { length: 255 }).notNull(),
	category: varchar('category', { length: 50 }).notNull(),
	description: text('description'),
	coordinatesLat: varchar('coordinates_lat', { length: 20 }),
	coordinatesLng: varchar('coordinates_lng', { length: 20 }),
	address: varchar('address', { length: 500 }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
	slugIdx: uniqueIndex('slug_idx').on(table.slug),
}));

export const organizations = mysqlTable('organizations', {
	id: varchar('id', { length: 36 }).primaryKey(),
	name: varchar('name', { length: 200 }).notNull(),
	slug: varchar('slug', { length: 255 }).notNull(),
	description: text('description'),
	type: varchar('type', { length: 50 }).notNull(),
	streetId: varchar('street_id', { length: 36 }),
	contactPhone: varchar('contact_phone', { length: 50 }),
	contactEmail: varchar('contact_email', { length: 255 }),
	contactWebsite: varchar('contact_website', { length: 500 }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
	slugIdx: uniqueIndex('slug_idx').on(table.slug),
}));

export const businesses = mysqlTable('businesses', {
	id: varchar('id', { length: 36 }).primaryKey(),
	name: varchar('name', { length: 200 }).notNull(),
	slug: varchar('slug', { length: 255 }).notNull(),
	description: text('description'),
	type: varchar('type', { length: 50 }).notNull(),
	streetId: varchar('street_id', { length: 36 }).notNull(),
	phone: varchar('phone', { length: 50 }),
	email: varchar('email', { length: 255 }),
	website: varchar('website', { length: 500 }),
	openingHours: json('opening_hours'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
	slugIdx: uniqueIndex('slug_idx').on(table.slug),
}));

export const people = mysqlTable('people', {
	id: varchar('id', { length: 36 }).primaryKey(),
	name: varchar('name', { length: 200 }).notNull(),
	slug: varchar('slug', { length: 255 }).notNull(),
	bio: text('bio'),
	age: int('age'),
	hobbies: json('hobbies'),
	streetId: varchar('street_id', { length: 36 }), // Phase 6: Made nullable to avoid orphan references
	workplaceId: varchar('workplace_id', { length: 36 }),
	workplaceType: varchar('workplace_type', { length: 20 }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
	slugIdx: uniqueIndex('slug_idx').on(table.slug),
}));

export const events = mysqlTable('events', {
	id: varchar('id', { length: 36 }).primaryKey(),
	title: varchar('title', { length: 200 }).notNull(),
	slug: varchar('slug', { length: 255 }).notNull(),
	description: text('description'),
	placeId: varchar('place_id', { length: 36 }).notNull(),
	startDate: timestamp('start_date').notNull(),
	endDate: timestamp('end_date'),
	organizer: varchar('organizer', { length: 200 }),
	category: varchar('category', { length: 50 }).notNull(),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
	slugIdx: uniqueIndex('slug_idx').on(table.slug),
}));

export const lakes = mysqlTable('lakes', {
	id: varchar('id', { length: 36 }).primaryKey(),
	name: varchar('name', { length: 200 }).notNull(),
	slug: varchar('slug', { length: 255 }).notNull(),
	description: text('description'),
	coordinatesLat: varchar('coordinates_lat', { length: 20 }),
	coordinatesLng: varchar('coordinates_lng', { length: 20 }),
	areaKm2: varchar('area_km2', { length: 20 }),
	depthM: varchar('depth_m', { length: 20 }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
	slugIdx: uniqueIndex('slug_idx').on(table.slug),
}));

export const entityMentions = mysqlTable('entity_mentions', {
	id: varchar('id', { length: 36 }).primaryKey(),
	storyId: varchar('story_id', { length: 36 }).notNull(),
	storySlug: varchar('story_slug', { length: 255 }).notNull(),
	entityType: varchar('entity_type', { length: 50 }).notNull(),
	entityId: varchar('entity_id', { length: 100 }).notNull(),
	entitySlug: varchar('entity_slug', { length: 255 }).notNull(),
	entityName: varchar('entity_name', { length: 200 }).notNull(),
	mentionContext: text('mention_context'),
	mentionPosition: int('mention_position').notNull().default(0),
	confidenceScore: varchar('confidence_score', { length: 10 }).notNull().default('1.00'),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
	storyIdIdx: index('story_id_idx').on(table.storyId),
	storySlugIdx: index('story_slug_idx').on(table.storySlug),
	entityIdx: index('entity_idx').on(table.entityType, table.entityId),
	entityTypeIdx: index('entity_type_idx').on(table.entityType),
}));

export const users = mysqlTable('users', {
	id: varchar('id', { length: 36 }).primaryKey(),
	email: varchar('email', { length: 255 }).notNull(),
	passwordHash: varchar('password_hash', { length: 255 }).notNull(),
	username: varchar('username', { length: 30 }),
	displayName: varchar('display_name', { length: 100 }),
	role: varchar('role', { length: 20 }).notNull().default('user'),
	avatarUrl: varchar('avatar_url', { length: 500 }),
	bio: varchar('bio', { length: 500 }),
	emailVerified: int('email_verified').notNull().default(0),
	verificationToken: varchar('verification_token', { length: 255 }),
	resetToken: varchar('reset_token', { length: 255 }),
	resetTokenExpires: timestamp('reset_token_expires'),
	lastLogin: timestamp('last_login'),
	loginCount: int('login_count').notNull().default(0),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
	emailIdx: uniqueIndex('email_idx').on(table.email),
	usernameIdx: uniqueIndex('username_idx').on(table.username),
}));

export const stories = mysqlTable('stories', {
	id: varchar('id', { length: 36 }).primaryKey(),
	slug: varchar('slug', { length: 255 }).notNull(),
	title: varchar('title', { length: 200 }).notNull(),
	content: text('content').notNull(),
	excerpt: varchar('excerpt', { length: 500 }),
	featuredImageUrl: varchar('featured_image_url', { length: 500 }),
	inlineImage1Url: varchar('inline_image_1_url', { length: 500 }),
	inlineImage2Url: varchar('inline_image_2_url', { length: 500 }),
	status: varchar('status', { length: 50 }).notNull().default('draft'),
	aiModel: varchar('ai_model', { length: 100 }),
	aiPromptVersion: varchar('ai_prompt_version', { length: 50 }),
	aiConfidenceScore: varchar('ai_confidence_score', { length: 10 }),
	aiGenerationTimeMs: int('ai_generation_time_ms'),
	approvedBy: varchar('approved_by', { length: 36 }),
	createdAt: timestamp('created_at').notNull().defaultNow(),
	publishedAt: timestamp('published_at'),
	updatedAt: timestamp('updated_at').notNull().defaultNow(),
}, (table) => ({
	slugIdx: uniqueIndex('slug_idx').on(table.slug),
	statusIdx: index('status_idx').on(table.status),
}));

export const aiDecisions = mysqlTable('ai_decisions', {
	id: varchar('id', { length: 36 }).primaryKey(),
	timestamp: timestamp('timestamp').notNull().defaultNow(),
	action: varchar('action', { length: 50 }).notNull(),
	model: varchar('model', { length: 100 }).notNull(),
	inputData: json('input_data'),
	outputData: json('output_data'),
	confidenceScore: varchar('confidence_score', { length: 10 }).notNull(),
	reasoning: text('reasoning'),
	sourceData: json('source_data'),
	approved: int('approved').notNull().default(0),
	approvedBy: varchar('approved_by', { length: 36 }),
	approvedAt: timestamp('approved_at'),
	flags: json('flags'),
	metadata: json('metadata'),
}, (table) => ({
	timestampIdx: index('timestamp_idx').on(table.timestamp),
	actionIdx: index('action_idx').on(table.action),
}));
