import { renderHook, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import {
  useMarkAsRead,
  useMarkAsUnread,
  useDeleteNotification,
  useMarkAllAsRead,
} from '../use-notification-mutations';

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

describe('useMarkAsRead', () => {
  it('should mark notification as read', async () => {
    const { result } = renderHook(() => useMarkAsRead('test-user'), {
      wrapper: createWrapper(),
    });

    result.current.mutate('notification-id');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('should handle optimistic update', async () => {
    const { result } = renderHook(() => useMarkAsRead('test-user'), {
      wrapper: createWrapper(),
    });

    result.current.mutate('notification-id');

    expect(result.current.isPending).toBe(true);
  });
});

describe('useMarkAsUnread', () => {
  it('should mark notification as unread', async () => {
    const { result } = renderHook(() => useMarkAsUnread('test-user'), {
      wrapper: createWrapper(),
    });

    result.current.mutate('notification-id');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useDeleteNotification', () => {
  it('should delete notification', async () => {
    const { result } = renderHook(() => useDeleteNotification('test-user'), {
      wrapper: createWrapper(),
    });

    result.current.mutate('notification-id');

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});

describe('useMarkAllAsRead', () => {
  it('should mark all notifications as read', async () => {
    const { result } = renderHook(() => useMarkAllAsRead('test-user'), {
      wrapper: createWrapper(),
    });

    result.current.mutate(['id1', 'id2', 'id3']);

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });
});
