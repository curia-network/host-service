/**
 * AuthenticationStep - Wallet and authentication selection
 * 
 * Beautiful custom UI cards that trigger the CORRECT wallet ecosystem:
 * - ENS: EthereumProfileProvider + RainbowKit + window.ethereum
 * - UP: UniversalProfileProvider + window.lukso + ethers.js
 * - Anonymous: Direct backend integration
 * 
 * Updated to use SessionManager instead of localStorage for session storage.
 */

import React, { useCallback, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Wallet, Globe, Zap, User, ArrowRight, Lock, QrCode } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AuthenticationStepProps, AuthOption } from '@/types/embed';
import { UniversalProfileProvider, useUniversalProfile } from '@/contexts/UniversalProfileContext';
import { EthereumProfileProvider, useEthereumProfile } from '@/contexts/EthereumProfileContext';
import { ConnectButton } from '@rainbow-me/rainbowkit';
import Image from 'next/image';
import { sessionManager } from '@/lib/SessionManager';
import { shouldShowQRScanner } from '@/lib/embed/utils/deviceDetection';
import { QRScanner, QRCodeGenerator, type QRTransferData } from '@/lib/embed/components/qr';

// Separate component for Universal Profile connection
const UniversalProfileConnection: React.FC<{ onSuccess: (data: any) => void }> = ({ onSuccess }) => {
  const { upAddress, isConnecting, connect } = useUniversalProfile();
  
  React.useEffect(() => {
    if (upAddress) {
      // UP connection successful - map to embed format with basic info
      // Profile details will be fetched in the ProfilePreviewStep
      onSuccess({
        type: 'universal_profile',
        address: upAddress,
        name: 'Universal Profile User', // Will be enhanced in preview step
        avatar: null, // Will be enhanced in preview step
        balance: undefined, // Will be fetched by context
        followerCount: undefined, // Will be fetched by context
        verificationLevel: 'verified' as const
      });
    }
  }, [upAddress, onSuccess]);

  React.useEffect(() => {
    // Auto-trigger UP connection when component mounts
    if (!upAddress && !isConnecting) {
      connect().catch(console.error);
    }
  }, [upAddress, isConnecting, connect]);

  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mb-4"></div>
      <p className="text-muted-foreground">
        {isConnecting ? 'Connecting to Universal Profile...' : 'Opening Universal Profile extension...'}
      </p>
    </div>
  );
};

// Separate component for Ethereum/ENS connection
const EthereumConnection: React.FC<{ onSuccess: (data: any) => void }> = ({ onSuccess }) => {
  const { isConnected, ethAddress, getENSProfile } = useEthereumProfile();
  const [ensData, setEnsData] = React.useState<{ name?: string; avatar?: string }>({});
  
  // Fetch ENS data when connected
  React.useEffect(() => {
    if (isConnected && ethAddress) {
      getENSProfile().then(setEnsData).catch(console.error);
    }
  }, [isConnected, ethAddress, getENSProfile]);
  
  React.useEffect(() => {
    if (isConnected && ethAddress) {
      // Ethereum connection successful - map to embed format
      onSuccess({
        type: 'ens',
        address: ethAddress,
        name: ensData.name || 'Ethereum User',
        avatar: ensData.avatar || null,
        domain: ensData.name,
        balance: undefined, // Will be fetched by context
        verificationLevel: ensData.name ? 'verified' as const : 'partial' as const
      });
    }
  }, [isConnected, ethAddress, ensData, onSuccess]);

  if (!isConnected) {
    return (
      <div className="text-center py-8">
        <div className="mb-6">
          <p className="text-muted-foreground mb-4">
            Connect your Ethereum wallet to continue
          </p>
          <ConnectButton />
        </div>
      </div>
    );
  }

  return (
    <div className="text-center py-8">
      <div className="w-16 h-16 mx-auto border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mb-4"></div>
      <p className="text-muted-foreground">Processing Ethereum connection...</p>
    </div>
  );
};

// Separate component for QR Scanner connection flow
const QRScannerConnection: React.FC<{ onSuccess: (data: any) => void }> = ({ onSuccess }) => {
  type QRScreenType = 'instructions' | 'scanning' | 'review';
  
  const [currentScreen, setCurrentScreen] = React.useState<QRScreenType>('instructions');
  const [scannedData, setScannedData] = React.useState<string | null>(null);
  const [parsedData, setParsedData] = React.useState<QRTransferData | null>(null);
  const [scanError, setScanError] = React.useState<string | null>(null);
  const [isProcessing, setIsProcessing] = React.useState<boolean>(false);

  // Handle QR code scanned
  const handleQRScanned = React.useCallback((qrData: string) => {
    try {
      console.log('[QRScannerConnection] QR scanned:', qrData.substring(0, 100) + '...');
      
      // Parse QR data
      const transferData = QRCodeGenerator.parseScannedQR(qrData);
      
      setScannedData(qrData);
      setParsedData(transferData);
      setCurrentScreen('review');
      setScanError(null);
      
    } catch (error) {
      console.error('[QRScannerConnection] QR parse failed:', error);
      setScanError(error instanceof Error ? error.message : 'Invalid QR code');
    }
  }, []);

  // Handle camera error
  const handleScanError = React.useCallback((error: string) => {
    console.error('[QRScannerConnection] Camera error:', error);
    setScanError(error);
  }, []);

  // Handle session import
  const handleImport = React.useCallback(async () => {
    if (!parsedData) return;
    
    try {
      setIsProcessing(true);
      console.log('[QRScannerConnection] Importing', parsedData.sessions.length, 'sessions');
      
      // TODO: Implement actual session import via SessionManager
      // For now, just simulate success with first session
      const firstSession = parsedData.sessions[0];
      
      // Simulate processing delay
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Mock successful import - call onSuccess with profile data
      onSuccess({
        type: firstSession.identityType,
        name: firstSession.name || firstSession.ensName || 'Imported User',
        userId: firstSession.userId,
        sessionToken: firstSession.sessionToken,
        walletAddress: firstSession.walletAddress,
        ensName: firstSession.ensName,
        upAddress: firstSession.upAddress,
        profileImageUrl: firstSession.profileImageUrl,
        verificationLevel: 'verified' as const
      });
      
    } catch (error) {
      console.error('[QRScannerConnection] Import failed:', error);
      setScanError(error instanceof Error ? error.message : 'Import failed');
      setIsProcessing(false);
    }
  }, [parsedData, onSuccess]);

  // Reset to instructions
  const handleBack = React.useCallback(() => {
    setCurrentScreen('instructions');
    setScannedData(null);
    setParsedData(null);
    setScanError(null);
    setIsProcessing(false);
  }, []);

  // Screen 1: Instructions
  if (currentScreen === 'instructions') {
    return (
      <div className="text-center py-6">
        <div className="mb-6">
          <QrCode className="w-16 h-16 mx-auto text-violet-500 mb-4" />
          <h3 className="text-lg font-semibold mb-2">How to get your QR Code:</h3>
          <div className="text-left max-w-sm mx-auto space-y-2 text-sm text-muted-foreground mb-6">
            <div className="flex items-center gap-2">
              <span className="bg-violet-100 text-violet-700 w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium">1</span>
              Open Curia on another device
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-violet-100 text-violet-700 w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium">2</span>
              Go to your profile menu
            </div>
            <div className="flex items-center gap-2">
              <span className="bg-violet-100 text-violet-700 w-5 h-5 rounded-full text-xs flex items-center justify-center font-medium">3</span>
              Click "Share Login QR"
            </div>
          </div>
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 text-sm">
            <div className="flex items-center gap-2 text-blue-700 mb-2">
              <Lock className="w-4 h-4" />
              <span className="font-medium">When you tap "Scan QR Code":</span>
            </div>
            <ul className="text-blue-600 space-y-1 text-left">
              <li>• Your phone will ask for camera permission</li>
              <li>• Point camera at the QR code</li>
              <li>• We'll show you what we found</li>
            </ul>
          </div>
        </div>

        {scanError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
            {scanError}
          </div>
        )}

        <Button 
          onClick={() => setCurrentScreen('scanning')}
          className="bg-violet-600 hover:bg-violet-700 text-white"
          size="lg"
        >
          <QrCode className="w-4 h-4 mr-2" />
          Scan QR Code
        </Button>
      </div>
    );
  }

  // Screen 2: Scanning
  if (currentScreen === 'scanning') {
    return (
      <div className="py-6">
        <div className="text-center mb-4">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleBack}
            className="mb-4"
          >
            ← Back
          </Button>
        </div>
        
        <QRScanner
          isActive={true}
          onQRScanned={handleQRScanned}
          onClose={handleBack}
          onError={handleScanError}
        />
      </div>
    );
  }

  // Screen 3: Review
  if (currentScreen === 'review' && parsedData) {
    return (
      <div className="py-6">
        <div className="text-center mb-6">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => setCurrentScreen('scanning')}
            className="mb-4"
          >
            ← Back to Scanner
          </Button>
          
          <div className="text-green-600 mb-4">
            <div className="w-12 h-12 mx-auto bg-green-100 rounded-full flex items-center justify-center mb-2">
              ✅
            </div>
            <h3 className="text-lg font-semibold text-foreground">QR Code Scanned Successfully</h3>
            <p className="text-sm text-muted-foreground">
              Found <strong>{parsedData.sessions.length}</strong> session(s) to transfer
            </p>
          </div>
        </div>

        {/* Session List */}
        <div className="space-y-3 mb-6">
          <h4 className="font-medium text-sm text-muted-foreground uppercase tracking-wide">
            Sessions to Import:
          </h4>
          {parsedData.sessions.map((session, index) => (
            <div key={index} className="flex items-center gap-3 p-3 bg-violet-50 border border-violet-200 rounded-lg">
              <div className="w-10 h-10 rounded-lg overflow-hidden bg-violet-100 flex items-center justify-center">
                {session.profileImageUrl ? (
                  <img src={session.profileImageUrl} alt="Profile" className="w-full h-full object-cover" />
                ) : (
                  <span className="text-violet-600 font-medium">
                    {(session.name || session.userId || '?').charAt(0).toUpperCase()}
                  </span>
                )}
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="font-medium text-sm truncate">
                  {session.name || session.ensName || 'Unnamed Account'}
                </div>
                <div className="text-xs text-muted-foreground">
                  {session.identityType === 'ens' && '🏷️ ENS Domain'}
                  {session.identityType === 'universal_profile' && '🔗 Universal Profile'}
                  {session.identityType === 'anonymous' && '👤 Guest Account'}
                </div>
                {session.walletAddress && (
                  <div className="text-xs text-muted-foreground font-mono">
                    {session.walletAddress.substring(0, 8)}...{session.walletAddress.substring(-6)}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Metadata */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 mb-6 text-xs">
          <div className="flex justify-between items-center mb-1">
            <span className="text-muted-foreground">Transfer Time:</span>
            <span className="font-medium">{new Date(parsedData.timestamp).toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center mb-1">
            <span className="text-muted-foreground">Version:</span>
            <span className="font-medium">{parsedData.version}</span>
          </div>
          {parsedData.sourceDevice && (
            <div className="flex justify-between items-center">
              <span className="text-muted-foreground">Source Device:</span>
              <span className="font-medium">{parsedData.sourceDevice}</span>
            </div>
          )}
        </div>

        {scanError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4 text-sm text-red-700">
            {scanError}
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={isProcessing}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleImport}
            disabled={isProcessing}
            className="flex-1 bg-violet-600 hover:bg-violet-700 text-white"
          >
            {isProcessing ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                Importing...
              </>
            ) : (
              'Import Sessions'
            )}
          </Button>
        </div>
      </div>
    );
  }

  return null;
};

export const AuthenticationStep: React.FC<AuthenticationStepProps> = ({ 
  onAuthenticated, 
  config 
}) => {
  const [isAuthenticating, setIsAuthenticating] = useState<string | null>(null);
  const [connectionType, setConnectionType] = useState<'ens' | 'universal_profile' | 'qr_scanner' | null>(null);
  


  const handleConnectionSuccess = useCallback((profileData: any) => {
    console.log('[AuthenticationStep] Connection successful:', profileData);
    setIsAuthenticating(null);
    setConnectionType(null);
    onAuthenticated(profileData);
  }, [onAuthenticated]);

  const handleAuth = useCallback(async (type: string) => {
    setIsAuthenticating(type);
    
    if (type === 'qr_scanner') {
      // Show QR scanner connection flow (like ENS/UP)
      setConnectionType('qr_scanner');
      setIsAuthenticating(null);
      return;
    } else if (type === 'anonymous') {
      // Handle anonymous auth directly with our backend
      try {
        const response = await fetch('/api/auth/create-anonymous', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ origin: window.location.origin })
        });

        if (!response.ok) {
          throw new Error(`Anonymous authentication failed: ${response.status}`);
        }

        const data = await response.json();
        
        console.log('[AuthenticationStep] Anonymous auth successful, creating session');
        
        // Create proper session with SessionManager instead of localStorage
        await sessionManager.addSession({
          sessionToken: data.token,
          userId: data.user.user_id,
          identityType: 'anonymous',
          name: data.user.name,
          expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days
          isActive: true,
        });

        console.log('[AuthenticationStep] ✅ Anonymous session created in SessionManager');
        
        setTimeout(() => {
          handleConnectionSuccess({
            type: 'anonymous',
            name: data.user.name,
            userId: data.user.user_id,
            sessionToken: data.token,
            verificationLevel: 'unverified' as const
          });
        }, 1000);
        
      } catch (error) {
        console.error('[AuthenticationStep] Anonymous authentication error:', error);
        setIsAuthenticating(null);
      }
    } else {
      // For wallet connections, set the connection type to show the right provider
      setConnectionType(type as 'ens' | 'universal_profile');
    }
  }, [handleConnectionSuccess]);

  const handleBack = useCallback(() => {
    setIsAuthenticating(null);
    setConnectionType(null);
  }, []);



  const getAuthOptions = (): AuthOption[] => {
    const allOptions = [
      {
        id: 'ens',
        title: 'ENS Domain',
        description: 'Connect with your Ethereum Name Service domain',
        icon: <Image src="/ens.svg" alt="ENS" width={24} height={24} />,
        gradientClass: 'gradient-blue-cyan',
        buttonClass: 'btn-gradient-blue-cyan',
        action: () => handleAuth('ens')
      },
      {
        id: 'universal_profile',
        title: 'Universal Profile',
        description: 'Connect with your LUKSO Universal Profile',
        icon: <Image src="/customers/lukso.png" alt="LUKSO" width={24} height={24} />,
        gradientClass: 'gradient-pink-rose',
        buttonClass: 'btn-gradient-pink-rose',
        action: () => handleAuth('universal_profile')
      },
      // QR Scanner option (mobile/tablet only)
      ...(shouldShowQRScanner() ? [{
        id: 'qr_scanner',
        title: 'Login with QR Code',
        description: 'Scan QR code from another logged-in device',
        icon: <QrCode className="w-6 h-6" />,
        gradientClass: 'gradient-violet-purple',
        buttonClass: 'btn-gradient-violet-purple',
        action: () => handleAuth('qr_scanner')
      }] : []),
      {
        id: 'anonymous',
        title: 'Continue as Guest',
        description: 'Browse without connecting a wallet',
        icon: <User className="w-6 h-6" />,
        gradientClass: 'gradient-gray-slate',
        buttonClass: 'btn-gradient-gray-slate',
        action: () => handleAuth('anonymous')
      }
    ];

    // Filter out anonymous option in secure-auth mode
    if (config.mode === 'secure-auth') {
      return allOptions.filter(option => option.id !== 'anonymous');
    }

    return allOptions;
  };

  const authOptions = getAuthOptions();

  // Show connection flow for specific wallet type
  if (connectionType === 'universal_profile') {
    return (
      <div className="embed-step">
        <Card className="embed-card embed-card--md">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl">Universal Profile Connection</CardTitle>
            <Button variant="outline" size="sm" onClick={handleBack} className="mt-2">
              ← Back to Options
            </Button>
          </CardHeader>
          <CardContent>
            <UniversalProfileProvider>
              <UniversalProfileConnection onSuccess={handleConnectionSuccess} />
            </UniversalProfileProvider>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (connectionType === 'ens') {
    return (
      <div className="embed-step">
        <Card className="embed-card embed-card--md">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl">Ethereum Wallet Connection</CardTitle>
            <Button variant="outline" size="sm" onClick={handleBack} className="mt-2">
              ← Back to Options
            </Button>
          </CardHeader>
          <CardContent>
            <EthereumProfileProvider storageKey="embed_ethereum">
              <EthereumConnection onSuccess={handleConnectionSuccess} />
            </EthereumProfileProvider>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (connectionType === 'qr_scanner') {
    return (
      <div className="embed-step">
        <Card className="embed-card embed-card--md">
          <CardHeader className="text-center pb-6">
            <CardTitle className="text-xl">Login with QR Code</CardTitle>
            <Button variant="outline" size="sm" onClick={handleBack} className="mt-2">
              ← Back to Options
            </Button>
          </CardHeader>
          <CardContent>
            <QRScannerConnection onSuccess={handleConnectionSuccess} />
          </CardContent>
        </Card>
      </div>
    );
  }

  // Show beautiful wallet selection cards
  return (
    <div className="embed-step">
      <Card className="embed-card embed-card--lg">
        <CardHeader className="text-center pb-6">
          <div className="flex justify-center mb-4">
            <div className="embed-header-icon gradient-blue-purple">
              <Wallet className="w-8 h-8" />
            </div>
          </div>
          <CardTitle className="text-2xl embed-gradient-text">
            Welcome to Curia
          </CardTitle>
          <CardDescription className="text-base">
            Choose your preferred way to join the conversation
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4 px-6 pb-8">
          {/* Beautiful Custom Cards */}
          {authOptions.map((option) => (
            <Card key={option.id} className="auth-option-card">
              <CardContent className="p-5">
                <div className="flex items-center space-x-4">
                  <div className={cn("auth-option-icon", option.gradientClass)}>
                    {option.icon}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-foreground text-lg">
                      {option.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {option.description}
                    </p>
                  </div>

                  <Button
                    onClick={option.action}
                    disabled={!!isAuthenticating}
                    className={cn(
                      "auth-option-button",
                      option.buttonClass,
                      isAuthenticating === option.id && "opacity-50 cursor-not-allowed"
                    )}
                  >
                    {isAuthenticating === option.id ? (
                      <div className="loading-spinner border-white" />
                    ) : (
                      <ArrowRight className="w-4 h-4" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}

          <div className="text-center mt-6 pt-4 border-t border-border">
            <p className="text-xs text-muted-foreground flex items-center justify-center gap-2">
              <Lock className="w-3 h-3" />
              Powered by Curia • Secure & Private
            </p>
          </div>
        </CardContent>
      </Card>


    </div>
  );
}; 