"use client";

import { ContractStatus } from '@/components/contract-status';

export default function ContractsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold">Smart Contract Status</h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Real-time information about UPool smart contracts deployed on Base Sepolia testnet.
            These contracts power the decentralized pool creation and yield optimization features.
          </p>
        </div>

        <ContractStatus />

        <div className="mt-12 p-6 bg-muted/50 rounded-lg">
          <h3 className="text-lg font-semibold mb-4">About UPool Smart Contracts</h3>
          <div className="prose prose-sm max-w-none">
            <p>
              UPool's smart contract architecture is designed for scalability, security, and gas efficiency.
              The modular design allows for independent deployment and upgrades of different system components.
            </p>
            
            <div className="grid md:grid-cols-2 gap-6 mt-6">
              <div>
                <h4 className="font-medium mb-2">🏛️ Registry Contract</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• Manages global pool registry</li>
                  <li>• Enforces creator limits and fees</li>
                  <li>• Provides pool discovery mechanism</li>
                  <li>• Handles vanity URL reservations</li>
                </ul>
              </div>
              
              <div>
                <h4 className="font-medium mb-2">📈 Yield Strategy Contract</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• AI-optimized yield strategies</li>
                  <li>• Multi-protocol DeFi integration</li>
                  <li>• Risk-based strategy selection</li>
                  <li>• Performance fee management</li>
                </ul>
              </div>
            </div>

            <div className="mt-6 p-4 bg-background rounded border">
              <h4 className="font-medium mb-2">🔧 Development Status</h4>
              <p className="text-sm text-muted-foreground">
                The UPool ecosystem is actively being developed with additional contracts for pool management,
                milestone tracking, and NFT integration. Current focus is on optimizing the UPoolFactory
                contract size to meet Ethereum's 24KB deployment limit.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}