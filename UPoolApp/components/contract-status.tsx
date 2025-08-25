"use client";

import { useContracts } from '@/hooks/use-contracts';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  CheckCircle2, 
  XCircle, 
  ExternalLink, 
  RefreshCw, 
  Network, 
  Coins,
  Shield,
  TrendingUp
} from 'lucide-react';
import { DEPLOYMENT_INFO } from '@/lib/contracts';

export function ContractStatus() {
  const {
    registryInfo,
    yieldStrategyInfo,
    networkStatus,
    loading,
    error,
    isCorrectNetwork,
    contractsDeployed,
    poolCreationFee,
    formattedStrategies,
    refresh,
  } = useContracts();

  if (loading) {
    return <ContractStatusSkeleton />;
  }

  if (error) {
    return (
      <Alert variant="destructive">
        <XCircle className="h-4 w-4" />
        <AlertDescription>
          Failed to load contract information: {error}
          <Button 
            variant="outline" 
            size="sm" 
            onClick={refresh} 
            className="ml-2"
          >
            <RefreshCw className="h-3 w-3 mr-1" />
            Retry
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="space-y-6">
      {/* Network Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Network className="h-5 w-5" />
            Network Status
            {isCorrectNetwork ? (
              <Badge variant="default" className="bg-green-100 text-green-800">
                <CheckCircle2 className="h-3 w-3 mr-1" />
                Connected
              </Badge>
            ) : (
              <Badge variant="destructive">
                <XCircle className="h-3 w-3 mr-1" />
                Wrong Network
              </Badge>
            )}
          </CardTitle>
          <CardDescription>
            Smart contracts deployed on {DEPLOYMENT_INFO.network}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {networkStatus && (
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Current Network:</span>
                <p className="text-muted-foreground">{networkStatus.networkName}</p>
              </div>
              <div>
                <span className="font-medium">Chain ID:</span>
                <p className="text-muted-foreground">
                  {networkStatus.chainId}
                  {!isCorrectNetwork && ` (Expected: ${networkStatus.expectedChainId})`}
                </p>
              </div>
              <div>
                <span className="font-medium">Latest Block:</span>
                <p className="text-muted-foreground">#{networkStatus.blockNumber}</p>
              </div>
              <div>
                <span className="font-medium">Deployed:</span>
                <p className="text-muted-foreground">
                  {new Date(DEPLOYMENT_INFO.deployedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Contract Information Grid */}
      <div className="grid md:grid-cols-2 gap-6">
        {/* Registry Contract */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Coins className="h-5 w-5" />
              Pool Registry
              <Badge variant="outline">v{registryInfo?.version}</Badge>
            </CardTitle>
            <CardDescription>
              Manages pool creation and registry
            </CardDescription>
          </CardHeader>
          <CardContent>
            {registryInfo ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium">Creation Fee:</span>
                    <p className="text-muted-foreground">{poolCreationFee} ETH</p>
                  </div>
                  <div>
                    <span className="font-medium">Total Pools:</span>
                    <p className="text-muted-foreground">{registryInfo.totalPoolsRegistered}</p>
                  </div>
                  <div>
                    <span className="font-medium">Max per Creator:</span>
                    <p className="text-muted-foreground">{registryInfo.maxPoolsPerCreator}</p>
                  </div>
                  <div>
                    <span className="font-medium">Contract Size:</span>
                    <p className="text-muted-foreground">3.2 KB</p>
                  </div>
                </div>
                
                <div className="pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild
                  >
                    <a 
                      href={DEPLOYMENT_INFO.contracts.UPoolRegistry.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View on Blockscout
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Failed to load registry information</p>
            )}
          </CardContent>
        </Card>

        {/* Yield Strategy Contract */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Yield Strategy
              <Badge variant="outline">v{yieldStrategyInfo?.version}</Badge>
            </CardTitle>
            <CardDescription>
              AI-optimized yield generation strategies
            </CardDescription>
          </CardHeader>
          <CardContent>
            {yieldStrategyInfo ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium">Available Strategies:</span>
                    <p className="text-muted-foreground">{yieldStrategyInfo.availableStrategies}</p>
                  </div>
                  <div>
                    <span className="font-medium">Contract Size:</span>
                    <p className="text-muted-foreground">9.9 KB</p>
                  </div>
                </div>

                {formattedStrategies.length > 0 && (
                  <div className="pt-2 border-t">
                    <span className="font-medium text-sm">Strategy Types:</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {formattedStrategies.slice(0, 3).map((strategy, index) => (
                        <Badge key={index} variant="secondary" className="text-xs">
                          {strategy.name} ({strategy.expectedAPY}%)
                        </Badge>
                      ))}
                      {formattedStrategies.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{formattedStrategies.length - 3} more
                        </Badge>
                      )}
                    </div>
                  </div>
                )}
                
                <div className="pt-2 border-t">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    asChild
                  >
                    <a 
                      href={DEPLOYMENT_INFO.contracts.UPoolYieldStrategy.explorerUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-3 w-3 mr-1" />
                      View on Blockscout
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <p className="text-muted-foreground">Failed to load yield strategy information</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Future Contracts Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Development Status
          </CardTitle>
          <CardDescription>
            Additional contracts in development
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between">
              <span>UPoolFactory (Pool Creation)</span>
              <Badge variant="outline" className="bg-yellow-50 text-yellow-700">
                Size Optimization Needed
              </Badge>
            </div>
            <div className="flex items-center justify-between">
              <span>UPool (Individual Pools)</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Ready for Deployment
              </Badge>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            UPoolFactory currently exceeds the 24KB contract size limit and requires optimization before deployment.
          </p>
        </CardContent>
      </Card>

      {/* Refresh Button */}
      <div className="flex justify-center">
        <Button variant="outline" onClick={refresh} disabled={loading}>
          <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Contract Status
        </Button>
      </div>
    </div>
  );
}

function ContractStatusSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
          <Skeleton className="h-4 w-64" />
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i}>
                <Skeleton className="h-4 w-24 mb-1" />
                <Skeleton className="h-3 w-32" />
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {Array.from({ length: 2 }).map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <Skeleton className="h-6 w-40" />
              <Skeleton className="h-4 w-48" />
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  {Array.from({ length: 4 }).map((_, j) => (
                    <div key={j}>
                      <Skeleton className="h-3 w-20 mb-1" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  ))}
                </div>
                <Skeleton className="h-8 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}