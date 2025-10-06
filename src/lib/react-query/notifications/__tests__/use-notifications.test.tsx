import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useNotifications, useInfiniteNotifications, useUnreadCount } from '../use-notifications';
import { NotificationCategory } from '@/lib/types/notifications';

const createWrapper = () => {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
  );
};

describe('useNotifications', () => {
  it('should fetch notifications', async () => {
    const { result } = renderHook(
      () => useNotifications({ userId: 'test-user', limit: 20 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data).toBeDefined();
  });

  it('should filter by category', async () => {
    const { result } = renderHook(
      () => useNotifications({ userId: 'test-user', category: NotificationCategory.TASKS }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useInfiniteNotifications', () => {
  it('should fetch paginated notifications', async () => {
    const { result } = renderHook(
      () => useInfiniteNotifications({ userId: 'test-user', limit: 10 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(result.current.data?.pages).toBeDefined();
  });

  it('should handle fetchNextPage', async () => {
    const { result } = renderHook(
      () => useInfiniteNotifications({ userId: 'test-user', limit: 10 }),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));

    if (result.current.hasNextPage) {
      result.current.fetchNextPage();
      await waitFor(() => expect(result.current.isFetchingNextPage).toBe(false));
    }
  });
});

describe('useUnreadCount', () => {
  it('should fetch unread count', async () => {
    const { result } = renderHook(
      () => useUnreadCount('test-user'),
      { wrapper: createWrapper() }
    );

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(typeof result.current.data).toBe('number');
  });
});
