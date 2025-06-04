'use client';

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { useCredits } from '@/hooks/useCredits';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { 
  Coins, 
  Plus, 
  TrendingUp, 
  TrendingDown,
  ShoppingCart,
  FileText,
  Target,
  PenTool,
  AlertCircle,
  RefreshCw
} from 'lucide-react';
import { CreditService } from '@/services/creditService';
import CreditPurchaseModal from './CreditPurchaseModal';

interface Transaction {
  id: string;
  type: 'purchase' | 'usage';
  amount: number;
  description: string;
  date: Date;
  relatedService?: 'cv-review' | 'job-matching' | 'cv-creation';
  status?: 'completed' | 'pending' | 'failed';
}

export default function CreditDashboard() {
  const { user } = useAuth();
  const { credits, loading: creditsLoading, refreshCredits } = useCredits(user);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadTransactions();
    }
  }, [user]);

  const loadTransactions = async () => {
    if (!user) return;
    
    setIsLoadingTransactions(true);
    setError(null);
    
    try {
      const [purchaseHistory, usageHistory] = await Promise.all([
        CreditService.getPurchaseHistory(user.uid),
        CreditService.getUsageHistory(user.uid)
      ]);

      const allTransactions: Transaction[] = [
        ...purchaseHistory.map(purchase => ({
          id: purchase.id,
          type: 'purchase' as const,
          amount: purchase.credits,
          description: `Compra de ${purchase.credits} créditos`,
          date: purchase.createdAt.toDate(),
          status: purchase.status
        })),
        ...usageHistory.map(usage => ({
          id: usage.id,
          type: 'usage' as const,
          amount: -usage.credits,
          description: getUsageDescription(usage.service, usage.description),
          date: usage.createdAt.toDate(),
          relatedService: usage.service
        }))
      ];

      // Ordenar por fecha descendente
      allTransactions.sort((a, b) => b.date.getTime() - a.date.getTime());
      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
      setError('Error al cargar el historial de transacciones');
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const getUsageDescription = (service: string, description?: string) => {
    const serviceNames = {
      'cv-review': 'Análisis de CV',
      'job-matching': 'Match de CV con empleos',
      'cv-creation': 'Creación de CV'
    };
    
    return description || serviceNames[service as keyof typeof serviceNames] || 'Uso de servicio';
  };

  const getServiceIcon = (service?: string) => {
    switch (service) {
      case 'cv-review':
        return <FileText className="h-4 w-4" />;
      case 'job-matching':
        return <Target className="h-4 w-4" />;
      case 'cv-creation':
        return <PenTool className="h-4 w-4" />;
      default:
        return <Coins className="h-4 w-4" />;
    }
  };

  const getStatusBadge = (status?: string) => {
    switch (status) {
      case 'completed':
        return <Badge variant="default" className="text-xs">Completado</Badge>;
      case 'pending':
        return <Badge variant="outline" className="text-xs">Pendiente</Badge>;
      case 'failed':
        return <Badge variant="destructive" className="text-xs">Fallido</Badge>;
      default:
        return null;
    }
  };

  const totalCreditsSpent = transactions
    .filter(t => t.type === 'usage')
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const totalCreditsPurchased = transactions
    .filter(t => t.type === 'purchase' && t.status === 'completed')
    .reduce((sum, t) => sum + t.amount, 0);

  if (creditsLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Credit Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Créditos Actuales</CardTitle>
            <Coins className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{credits}</div>
            <p className="text-xs text-muted-foreground">
              Disponibles para usar
            </p>
            <Button 
              size="sm" 
              className="mt-2 w-full"
              onClick={() => setShowPurchaseModal(true)}
            >
              <Plus className="h-3 w-3 mr-1" />
              Comprar Créditos
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Comprado</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCreditsPurchased}</div>
            <p className="text-xs text-muted-foreground">
              Créditos adquiridos
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Usado</CardTitle>
            <TrendingDown className="h-4 w-4 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalCreditsSpent}</div>
            <p className="text-xs text-muted-foreground">
              En servicios utilizados
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Historial de Transacciones</CardTitle>
              <CardDescription>
                Registro completo de compras y usos de créditos
              </CardDescription>
            </div>            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                loadTransactions();
                refreshCredits();
              }}
              disabled={isLoadingTransactions}
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoadingTransactions ? 'animate-spin' : ''}`} />
              Actualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {error && (
            <div className="flex items-center space-x-2 text-red-600 mb-4">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">{error}</span>
            </div>
          )}

          {isLoadingTransactions ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-500" />
            </div>
          ) : transactions.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Coins className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No hay transacciones aún</p>
              <p className="text-sm">Compra créditos o usa nuestros servicios para ver tu historial</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descripción</TableHead>
                  <TableHead>Créditos</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Fecha</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {transactions.map((transaction) => (
                  <TableRow key={transaction.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        {transaction.type === 'purchase' ? (
                          <ShoppingCart className="h-4 w-4 text-green-600" />
                        ) : (
                          getServiceIcon(transaction.relatedService)
                        )}
                        <Badge 
                          variant={transaction.type === 'purchase' ? 'default' : 'secondary'}
                          className="text-xs"
                        >
                          {transaction.type === 'purchase' ? 'Compra' : 'Uso'}
                        </Badge>
                      </div>
                    </TableCell>
                    <TableCell>{transaction.description}</TableCell>
                    <TableCell>
                      <span className={`font-medium ${
                        transaction.amount > 0 ? 'text-green-600' : 'text-red-600'
                      }`}>
                        {transaction.amount > 0 ? '+' : ''}{transaction.amount}
                      </span>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(transaction.status)}
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {transaction.date.toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>      {/* Credit Purchase Modal */}
      <CreditPurchaseModal 
        isOpen={showPurchaseModal}
        onClose={() => setShowPurchaseModal(false)}
        onSuccess={() => {
          refreshCredits();
          loadTransactions();
        }}
      />
    </div>
  );
}
