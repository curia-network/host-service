/**
 * AccountSwitcher - Beautiful multi-account switching UI
 * 
 * Demonstrates the new SessionManager capabilities with a Discord-style account switcher.
 * Shows ENS, Universal Profile, and Anonymous sessions with instant switching.
 */

import React from 'react';
import { ChevronDown, LogOut, Plus, Shield, User, Crown } from 'lucide-react';
import { useAccountSwitcher, useSessionManager } from '@/hooks/useSessionManager';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';

// ============================================================================
// ACCOUNT SWITCHER COMPONENT
// ============================================================================

export function AccountSwitcher() {
  const {
    accountOptions,
    activeAccount,
    switchToAccount,
    removeAccount,
    isLoading,
    hasMultipleAccounts,
  } = useAccountSwitcher();

  const { logout, logoutAll } = useSessionManager();

  // Don't show switcher if no accounts
  if (!activeAccount) {
    return null;
  }

  // Single account - show simple user display
  if (!hasMultipleAccounts) {
    return (
      <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 rounded-lg">
        <AccountAvatar account={activeAccount} />
        <div className="flex-1 min-w-0">
          <div className="font-medium text-sm truncate">
            {getDisplayName(activeAccount)}
          </div>
          <div className="text-xs text-gray-500">
            {getIdentityLabel(activeAccount)}
          </div>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <ChevronDown className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => logout()}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  // Multi-account switcher
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="ghost" 
          className="flex items-center gap-3 p-2 h-auto hover:bg-gray-50"
          disabled={isLoading}
        >
          <AccountAvatar account={activeAccount} />
          <div className="flex-1 min-w-0 text-left">
            <div className="font-medium text-sm truncate">
              {getDisplayName(activeAccount)}
            </div>
            <div className="text-xs text-gray-500">
              {accountOptions.length} accounts
            </div>
          </div>
          <ChevronDown className="h-4 w-4 text-gray-400" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent className="w-64" align="end">
        {/* Account List */}
        {accountOptions.map((account) => (
          <DropdownMenuItem
            key={account.sessionToken}
            onClick={() => switchToAccount(account.sessionToken)}
            className={`flex items-center gap-3 p-3 ${
              account.isActive ? 'bg-blue-50 border-l-2 border-blue-500' : ''
            }`}
          >
            <AccountAvatar account={account} />
            <div className="flex-1 min-w-0">
              <div className="font-medium text-sm truncate">
                {account.displayName}
              </div>
              <div className="text-xs text-gray-500 truncate">
                {getIdentityLabel(account)}
              </div>
            </div>
            {account.isActive && (
              <Badge variant="secondary" className="text-xs">
                Active
              </Badge>
            )}
          </DropdownMenuItem>
        ))}

        <DropdownMenuSeparator />

        {/* Actions */}
        <DropdownMenuItem onClick={() => {}}>
          <Plus className="h-4 w-4 mr-2" />
          Add Account
        </DropdownMenuItem>

        <DropdownMenuSeparator />

        <DropdownMenuItem onClick={() => logout()}>
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out Current
        </DropdownMenuItem>

        <DropdownMenuItem 
          onClick={() => logoutAll()}
          className="text-red-600 hover:text-red-700"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sign Out All Accounts
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

// ============================================================================
// ACCOUNT AVATAR COMPONENT
// ============================================================================

interface AccountAvatarProps {
  account: {
    identityType: 'ens' | 'universal_profile' | 'anonymous';
    profileImageUrl?: string;
    ensName?: string;
    upAddress?: string;
    walletAddress?: string;
  };
  size?: 'sm' | 'md' | 'lg';
}

function AccountAvatar({ account, size = 'md' }: AccountAvatarProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-8 w-8',
    lg: 'h-10 w-10',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  if (account.profileImageUrl) {
    return (
      <div className={`${sizeClasses[size]} relative`}>
        <img
          src={account.profileImageUrl}
          alt="Profile"
          className={`${sizeClasses[size]} rounded-full object-cover`}
        />
        <IdentityBadge 
          identityType={account.identityType} 
          size={size} 
        />
      </div>
    );
  }

  // Fallback avatar with identity icon
  const getIdentityIcon = () => {
    switch (account.identityType) {
      case 'ens':
        return <Crown className={iconSizes[size]} />;
      case 'universal_profile':
        return <Shield className={iconSizes[size]} />;
      case 'anonymous':
        return <User className={iconSizes[size]} />;
    }
  };

  const getBgColor = () => {
    switch (account.identityType) {
      case 'ens':
        return 'bg-purple-100 text-purple-600';
      case 'universal_profile':
        return 'bg-blue-100 text-blue-600';
      case 'anonymous':
        return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className={`
      ${sizeClasses[size]} ${getBgColor()}
      rounded-full flex items-center justify-center relative
    `}>
      {getIdentityIcon()}
      <IdentityBadge 
        identityType={account.identityType} 
        size={size} 
      />
    </div>
  );
}

// ============================================================================
// IDENTITY BADGE COMPONENT
// ============================================================================

interface IdentityBadgeProps {
  identityType: 'ens' | 'universal_profile' | 'anonymous';
  size: 'sm' | 'md' | 'lg';
}

function IdentityBadge({ identityType, size }: IdentityBadgeProps) {
  const badgeSizes = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
  };

  const getBadgeColor = () => {
    switch (identityType) {
      case 'ens':
        return 'bg-purple-500';
      case 'universal_profile':
        return 'bg-blue-500';
      case 'anonymous':
        return 'bg-gray-400';
    }
  };

  return (
    <div className={`
      ${badgeSizes[size]} ${getBadgeColor()}
      absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-white
    `} />
  );
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

function getDisplayName(account: any): string {
  if (account.name) {
    return account.name;
  }

  switch (account.identityType) {
    case 'ens':
      return account.ensName || `ENS ${account.walletAddress?.slice(-6)}`;
    case 'universal_profile':
      return `UP ${account.upAddress?.slice(-6)}`;
    case 'anonymous':
      return `Anonymous ${account.sessionToken?.slice(-6)}`;
    default:
      return 'Unknown Account';
  }
}

function getIdentityLabel(account: any): string {
  switch (account.identityType) {
    case 'ens':
      return account.ensName ? `ENS Domain` : `Ethereum ${account.walletAddress?.slice(0, 6)}...${account.walletAddress?.slice(-4)}`;
    case 'universal_profile':
      return `Universal Profile ${account.upAddress?.slice(0, 6)}...${account.upAddress?.slice(-4)}`;
    case 'anonymous':
      return 'Anonymous Session';
    default:
      return 'Unknown Identity';
  }
} 