/**
 * useCommunities - Hook for fetching user communities
 * 
 * Updated to use SessionManager for token management while maintaining API compatibility.
 */

import { useQuery } from '@tanstack/react-query';
import { sessionManager } from '@/lib/SessionManager';

interface Community {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isPublic: boolean;
  gradientClass: string;
  icon: string;
  logoUrl: string | null;
  requiresApproval: boolean;
  userRole?: string;
  isMember: boolean;
  createdAt: string;
  communityShortId?: string;
  pluginId?: string;
}

interface CommunitiesResponse {
  userCommunities: Community[];
  availableCommunities: Community[];
  isAuthenticated: boolean;
}

export function useCommunities(isAuthenticated: boolean) {
  return useQuery<CommunitiesResponse>({
    queryKey: ['communities', isAuthenticated],
    queryFn: async () => {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      // Use SessionManager instead of localStorage for token access
      if (typeof window !== 'undefined' && isAuthenticated) {
        const token = sessionManager.getActiveToken();
        if (token) {
          headers['Authorization'] = `Bearer ${token}`;
        }
      }

      const response = await fetch('/api/communities', {
        headers,
      });

      if (!response.ok) {
        throw new Error('Failed to fetch communities');
      }

      return response.json();
    },
    enabled: true, // Always enabled, API handles auth state
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
} 