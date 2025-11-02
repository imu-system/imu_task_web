import { Page, expect } from '@playwright/test';
import { mockUsers } from './auth';

/**
 * Helpers pour les tests E2E de messagerie
 */

export interface MockThread {
  id: string;
  participantIds: string[];
  participantNames: string[];
  lastMessage: string;
  lastMessageTimestamp: number;
  unreadCount?: number;
  isFavorite?: boolean;
  isGroup?: boolean;
  groupName?: string;
}

export interface MockMessage {
  id: string;
  threadId: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: number;
  hasPII?: boolean;
}

/**
 * Données de test pour la messagerie
 */
export const mockThreads: MockThread[] = [
  {
    id: 'thread-001',
    participantIds: ['test-client-uid-001', 'test-pro-uid-002'],
    participantNames: ['Marie Dupont', 'Jean Martin'],
    lastMessage: 'Bonjour, comment puis-je vous aider ?',
    lastMessageTimestamp: Date.now() - 300000, // 5 min ago
    unreadCount: 2,
    isFavorite: false,
    isGroup: false,
  },
  {
    id: 'thread-002',
    participantIds: ['test-client-uid-001', 'test-senior-uid-003'],
    participantNames: ['Marie Dupont', 'Robert Durand'],
    lastMessage: 'Merci pour votre message',
    lastMessageTimestamp: Date.now() - 3600000, // 1h ago
    unreadCount: 0,
    isFavorite: true,
    isGroup: false,
  },
  {
    id: 'thread-003',
    participantIds: ['test-client-uid-001', 'test-pro-uid-002', 'test-senior-uid-003'],
    participantNames: ['Marie Dupont', 'Jean Martin', 'Robert Durand'],
    lastMessage: 'Réunion prévue pour demain',
    lastMessageTimestamp: Date.now() - 7200000, // 2h ago
    unreadCount: 5,
    isFavorite: false,
    isGroup: true,
    groupName: 'Projet Alpha',
  },
];

export const mockMessages: MockMessage[] = [
  {
    id: 'msg-001',
    threadId: 'thread-001',
    senderId: 'test-pro-uid-002',
    senderName: 'Jean Martin',
    content: 'Bonjour, comment puis-je vous aider ?',
    timestamp: Date.now() - 300000,
  },
  {
    id: 'msg-002',
    threadId: 'thread-001',
    senderId: 'test-client-uid-001',
    senderName: 'Marie Dupont',
    content: 'J\'aurais besoin d\'informations sur votre service',
    timestamp: Date.now() - 240000,
  },
  {
    id: 'msg-003',
    threadId: 'thread-002',
    senderId: 'test-senior-uid-003',
    senderName: 'Robert Durand',
    content: 'Merci pour votre message',
    timestamp: Date.now() - 3600000,
  },
];

/**
 * Mock Firestore data pour les tests de messagerie
 */
export async function injectMessagingMocks(page: Page) {
  await page.addInitScript(
    ({ threads, messages }) => {
      // Mock Firestore collections pour la messagerie
      (window as any).__FIRESTORE_MESSAGING_MOCK__ = {
        threads,
        messages,
      };

      // Override Firestore queries
      const originalFirestore = (window as any).firebase?.firestore;
      if (originalFirestore) {
        (window as any).firebase.firestore = () => {
          const db = originalFirestore();
          const originalCollection = db.collection.bind(db);

          db.collection = (path: string) => {
            const collection = originalCollection(path);

            // Mock threads collection
            if (path === 'threads') {
              const originalWhere = collection.where.bind(collection);
              collection.where = (...args: any[]) => {
                const query = originalWhere(...args);
                const originalOnSnapshot = query.onSnapshot.bind(query);

                query.onSnapshot = (callback: any) => {
                  const snapshot = {
                    docs: threads.map((thread: any) => ({
                      id: thread.id,
                      data: () => thread,
                      exists: true,
                    })),
                    empty: threads.length === 0,
                  };
                  callback(snapshot);
                  return () => {};
                };

                return query;
              };
            }

            // Mock messages collection
            if (path === 'messages') {
              const originalWhere = collection.where.bind(collection);
              collection.where = (...args: any[]) => {
                const query = originalWhere(...args);
                const originalOnSnapshot = query.onSnapshot.bind(query);

                query.onSnapshot = (callback: any) => {
                  const threadId = args[2]; // Assuming threadId is the 3rd argument
                  const threadMessages = messages.filter(
                    (msg: any) => msg.threadId === threadId
                  );

                  const snapshot = {
                    docs: threadMessages.map((msg: any) => ({
                      id: msg.id,
                      data: () => msg,
                      exists: true,
                    })),
                    empty: threadMessages.length === 0,
                  };
                  callback(snapshot);
                  return () => {};
                };

                return query;
              };
            }

            return collection;
          };

          return db;
        };
      }
    },
    { threads: mockThreads, messages: mockMessages }
  );
}

/**
 * Naviguer vers la page de messagerie
 */
export async function navigateToMessages(page: Page, locale = 'fr') {
  await page.goto(`/${locale}/dashboard/messages`);
  await page.waitForLoadState('networkidle');
}

/**
 * Attendre le chargement complet de la liste des threads
 */
export async function waitForThreadList(page: Page) {
  // Attendre que le spinner disparaisse
  await page.waitForSelector('[data-testid="thread-list-loading"]', {
    state: 'hidden',
    timeout: 5000,
  }).catch(() => {
    // Le spinner peut ne pas apparaître si le chargement est rapide
  });

  // Attendre que la liste soit visible
  await page.waitForSelector('[data-testid="thread-list"]', {
    state: 'visible',
    timeout: 5000,
  });
}

/**
 * Ouvrir le modal de nouvelle conversation
 */
export async function openNewConversationModal(page: Page) {
  const fabButton = page.locator('[data-testid="new-conversation-fab"]');
  await fabButton.click();

  const modal = page.locator('[data-testid="new-conversation-modal"]');
  await expect(modal).toBeVisible();

  return modal;
}

/**
 * Rechercher un utilisateur dans le modal
 */
export async function searchUserInModal(page: Page, searchTerm: string) {
  const searchInput = page.locator('[data-testid="user-search-input"]');
  await searchInput.fill(searchTerm);
  await page.waitForTimeout(500); // Debounce
}

/**
 * Sélectionner un thread dans la liste
 */
export async function selectThread(page: Page, threadIndex = 0) {
  const threads = page.locator('[data-testid="thread-item"]');
  await threads.nth(threadIndex).click();
  await page.waitForTimeout(300); // Animation
}

/**
 * Envoyer un message
 */
export async function sendMessage(page: Page, content: string) {
  const messageInput = page.locator('[data-testid="message-input"]');
  await messageInput.fill(content);

  const sendButton = page.locator('[data-testid="send-button"]');
  await sendButton.click();

  // Attendre que le message apparaisse
  await page.waitForTimeout(500);
}

/**
 * Cliquer sur un filtre pill
 */
export async function clickFilter(page: Page, filter: 'all' | 'unread' | 'favorites' | 'groups') {
  const filterButton = page.locator(`[data-testid="filter-${filter}"]`);
  await filterButton.click();
  await page.waitForTimeout(300);
}

/**
 * Rechercher dans les threads
 */
export async function searchThreads(page: Page, query: string) {
  const searchInput = page.locator('[data-testid="thread-search-input"]');
  await searchInput.fill(query);
  await page.waitForTimeout(500); // Debounce
}

/**
 * Vérifier qu'un thread est visible
 */
export async function expectThreadVisible(page: Page, threadId: string) {
  const thread = page.locator(`[data-testid="thread-item-${threadId}"]`);
  await expect(thread).toBeVisible();
}

/**
 * Vérifier qu'un thread n'est pas visible
 */
export async function expectThreadNotVisible(page: Page, threadId: string) {
  const thread = page.locator(`[data-testid="thread-item-${threadId}"]`);
  await expect(thread).not.toBeVisible();
}

/**
 * Vérifier le nombre de threads visibles
 */
export async function expectThreadCount(page: Page, count: number) {
  const threads = page.locator('[data-testid="thread-item"]');
  await expect(threads).toHaveCount(count);
}

/**
 * Vérifier l'état vide avec illustration
 */
export async function expectEmptyState(page: Page, type: string) {
  const emptyState = page.locator(`[data-testid="empty-state-${type}"]`);
  await expect(emptyState).toBeVisible();
}

/**
 * Fermer le banner de notification
 */
export async function dismissNotificationBanner(page: Page) {
  const dismissButton = page.locator('[data-testid="banner-dismiss"]');
  if (await dismissButton.isVisible()) {
    await dismissButton.click();
  }
}

/**
 * Ouvrir le menu des actions du header
 */
export async function openHeaderMenu(page: Page) {
  const menuButton = page.locator('[data-testid="header-menu-button"]');
  await menuButton.click();
  await page.waitForTimeout(200);
}

/**
 * Vérifier qu'un message contient un avertissement PII
 */
export async function expectPIIWarning(page: Page) {
  const warning = page.locator('[data-testid="pii-warning"]');
  await expect(warning).toBeVisible();
}

/**
 * Compter les messages non lus sur un thread
 */
export async function getUnreadCount(page: Page, threadId: string): Promise<number> {
  const badge = page.locator(`[data-testid="thread-item-${threadId}"] [data-testid="unread-badge"]`);
  
  if (await badge.isVisible()) {
    const text = await badge.textContent();
    return text === '9+' ? 10 : parseInt(text || '0', 10);
  }
  
  return 0;
}
