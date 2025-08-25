"use client";

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  TrendingUp, 
  AlertCircle, 
  CheckCircle2, 
  Clock, 
  DollarSign,
  Zap
} from 'lucide-react';
import { usePoolCreation, useCurrencyInfo, usePlatformFees } from '@/hooks/use-oracles';
import { PoolCurrency, formatCurrency } from '@/lib/oracles';

interface CurrencySelectorProps {
  fundingGoal: string;
  currency: PoolCurrency;
  onCurrencyChange: (currency: PoolCurrency) => void;
  onFundingGoalChange: (amount: string) => void;
}

export function CurrencySelector({
  fundingGoal,
  currency,
  onCurrencyChange,
  onFundingGoalChange,
}: CurrencySelectorProps) {
  const { currencyOptions } = useCurrencyInfo();
  const { poolData, calculating, calculatePoolRequirements } = usePoolCreation();
  const { feePercentage, calculateFee } = usePlatformFees();
  const [error, setError] = useState<string | null>(null);

  // Recalculate when funding goal or currency changes
  useEffect(() => {
    if (fundingGoal && parseFloat(fundingGoal) > 0) {
      setError(null);
      calculatePoolRequirements(fundingGoal, currency).catch(err => {
        setError('Failed to calculate pool requirements');
        console.error(err);
      });
    }
  }, [fundingGoal, currency, calculatePoolRequirements]);

  const handleAmountChange = (value: string) => {
    // Only allow positive numbers with up to 6 decimal places
    const regex = /^\d*\.?\d{0,6}$/;
    if (regex.test(value) || value === '') {
      onFundingGoalChange(value);
    }
  };

  const selectedCurrencyOption = currencyOptions.find(opt => opt.value === currency);
  const platformFee = fundingGoal ? calculateFee(fundingGoal) : '0';

  return (
    <div className="space-y-6">
      {/* Currency Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pool Currency & Amount
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Currency Selector */}
          <div className="space-y-2">
            <Label htmlFor="currency">Pool Currency</Label>
            <Select value={currency} onValueChange={onCurrencyChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                {currencyOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    <div className="flex items-center gap-2">
                      <span>{option.label}</span>
                      <Badge variant="outline" className="text-xs">
                        {option.currentPrice}
                      </Badge>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedCurrencyOption && (
              <p className="text-sm text-muted-foreground">
                Current price: {selectedCurrencyOption.currentPrice}
                {selectedCurrencyOption.priceData && (
                  <Badge 
                    variant={selectedCurrencyOption.priceData ? "default" : "destructive"}
                    className="ml-2 text-xs"
                  >
                    {selectedCurrencyOption.priceData ? (
                      <><CheckCircle2 className="h-3 w-3 mr-1" />Live</>
                    ) : (
                      <><Clock className="h-3 w-3 mr-1" />Stale</>
                    )}
                  </Badge>
                )}
              </p>
            )}
          </div>

          {/* Funding Goal Input */}
          <div className="space-y-2">
            <Label htmlFor="fundingGoal">
              Funding Goal ({selectedCurrencyOption?.symbol || currency})
            </Label>
            <div className="relative">
              <span className="absolute left-3 top-3 text-muted-foreground">
                {selectedCurrencyOption?.icon || '$'}
              </span>
              <Input
                id="fundingGoal"
                type="text"
                value={fundingGoal}
                onChange={(e) => handleAmountChange(e.target.value)}
                placeholder="Enter funding goal amount"
                className="pl-8"
              />
            </div>
            <p className="text-sm text-muted-foreground">
              Minimum recommended: {selectedCurrencyOption?.icon} 10 {selectedCurrencyOption?.symbol}
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Platform Fee Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Platform Fee ({feePercentage}%)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">Pool Amount:</span>
              <p className="text-muted-foreground">
                {fundingGoal ? formatCurrency(fundingGoal, currency) : '0.00'}
              </p>
            </div>
            <div>
              <span className="font-medium">Platform Fee:</span>
              <p className="text-muted-foreground">
                {fundingGoal ? formatCurrency(platformFee, currency) : '0.00'}
              </p>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Platform fee helps maintain the infrastructure and development of UPool.
          </p>
        </CardContent>
      </Card>

      {/* Conversion Display */}
      {fundingGoal && parseFloat(fundingGoal) > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Zap className="h-5 w-5" />
              ETH Conversion Required
            </CardTitle>
          </CardHeader>
          <CardContent>
            {calculating ? (
              <div className="space-y-2">
                <Skeleton className="h-4 w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ) : poolData ? (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="font-medium">Target Amount:</span>
                    <p className="text-muted-foreground">
                      {formatCurrency(poolData.targetAmount, poolData.currency)}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">ETH Required:</span>
                    <p className="text-muted-foreground">
                      {formatCurrency(poolData.ethRequired, 'ETH')}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Platform Fee:</span>
                    <p className="text-muted-foreground">
                      {formatCurrency(poolData.platformFee, 'ETH')}
                    </p>
                  </div>
                  <div>
                    <span className="font-medium">Total ETH:</span>
                    <p className="font-semibold text-primary">
                      {formatCurrency(poolData.totalEthRequired, 'ETH')}
                    </p>
                  </div>
                </div>

                {currency !== 'ETH' && (
                  <div className="pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm">
                      <span className="font-medium">Exchange Rate:</span>
                      <span className="text-muted-foreground">
                        1 {currency} = {parseFloat(poolData.exchangeRate).toFixed(6)} ETH
                      </span>
                      <Badge variant={poolData.isDataFresh ? "default" : "destructive"} className="text-xs">
                        {poolData.isDataFresh ? (
                          <><CheckCircle2 className="h-3 w-3 mr-1" />Fresh</>
                        ) : (
                          <><AlertCircle className="h-3 w-3 mr-1" />Stale</>
                        )}
                      </Badge>
                    </div>
                  </div>
                )}

                {!poolData.isDataFresh && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Price data is more than 5 minutes old. Consider refreshing before proceeding.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            ) : error ? (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            ) : null}
          </CardContent>
        </Card>
      )}

      {/* Important Notes */}
      <Card className="bg-muted/50">
        <CardContent className="pt-6">
          <div className="space-y-2">
            <h4 className="font-medium flex items-center gap-2">
              <AlertCircle className="h-4 w-4" />
              Important Notes
            </h4>
            <ul className="text-sm text-muted-foreground space-y-1">
              <li>• Pool funds will be denominated in {currency} but transactions occur in ETH</li>
              <li>• Exchange rates are provided by Base chain oracles (Pyth Network)</li>
              <li>• Platform fee ({feePercentage}%) is automatically deducted during pool creation</li>
              <li>• All contributors can deposit in ETH, which gets converted to {currency}</li>
              <li>• Final milestone payouts will be in {currency} equivalent</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

// Loading skeleton for currency selector
export function CurrencySelectorSkeleton() {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <Skeleton className="h-6 w-48" />
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-48" />
          </div>
          <div className="space-y-2">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-4 w-40" />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}