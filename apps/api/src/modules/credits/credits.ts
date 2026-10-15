/**
 * Módulo de Créditos - FASE 03
 * Maneja el ledger inmutable de créditos
 */

import { PrismaClient, LedgerEntryType, Prisma } from '@prisma/client';

/**
 * Reserva créditos para un trabajo
 * Usa transacción atómica para prevenir doble gasto
 */
export async function reserveCredits(
  prisma: PrismaClient,
  walletId: string,
  amount: number,
  jobId: string,
  description: string
): Promise<{ success: boolean; newBalance: number; error?: string }> {
  if (amount <= 0) {
    return { success: false, newBalance: 0, error: 'Amount must be positive' };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      // Bloquear la wallet para lectura/escritura
      const wallet = await tx.wallet.findUniqueOrThrow({
        where: { id: walletId },
      });

      const availableBalance = wallet.balance - wallet.totalReserved;

      if (availableBalance < amount) {
        throw new Error('Insufficient credits');
      }

      // Crear entrada de reserva en el ledger
      const newBalance = wallet.balance - amount;
      const newReserved = wallet.totalReserved + amount;

      await tx.creditLedgerEntry.create({
         {
          walletId,
          entryType: 'RESERVE',
          amount: -amount,
          balanceAfter: newBalance,
          relatedJobId: jobId,
          description,
          idempotencyKey: `reserve-${jobId}`,
        },
      });

      // Actualizar wallet
      await tx.wallet.update({
        where: { id: walletId },
         {
          balance: newBalance,
          totalReserved: newReserved,
        },
      });

      return { success: true, newBalance };
    });

    return result;
  } catch (error) {
    if (error instanceof Error && error.message === 'Insufficient credits') {
      return { success: false, newBalance: 0, error: 'Insufficient credits' };
    }
    throw error;
  }
}

/**
 * Consume créditos reservados (trabajo completado)
 */
export async function captureCredits(
  prisma: PrismaClient,
  walletId: string,
  amount: number,
  jobId: string,
  description: string
): Promise<{ success: boolean; newBalance: number }> {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUniqueOrThrow({
      where: { id: walletId },
    });

    // La reserva ya descontó del balance, solo reducimos totalReserved
    const newReserved = wallet.totalReserved - amount;

    await tx.creditLedgerEntry.create({
       {
        walletId,
        entryType: 'CAPTURE',
        amount: -amount,
        balanceAfter: wallet.balance, // Balance no cambia, ya se descontó en RESERVE
        relatedJobId: jobId,
        description,
        idempotencyKey: `capture-${jobId}`,
      },
    });

    await tx.wallet.update({
      where: { id: walletId },
       {
        totalReserved: newReserved,
        totalConsumed: wallet.totalConsumed + amount,
      },
    });

    return { success: true, newBalance: wallet.balance };
  });
}

/**
 * Libera créditos reservados (trabajo fallido o cancelado)
 */
export async function releaseCredits(
  prisma: PrismaClient,
  walletId: string,
  amount: number,
  jobId: string,
  description: string
): Promise<{ success: boolean; newBalance: number }> {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUniqueOrThrow({
      where: { id: walletId },
    });

    const newBalance = wallet.balance + amount;
    const newReserved = wallet.totalReserved - amount;

    await tx.creditLedgerEntry.create({
       {
        walletId,
        entryType: 'RELEASE',
        amount: amount,
        balanceAfter: newBalance,
        relatedJobId: jobId,
        description,
        idempotencyKey: `release-${jobId}`,
      },
    });

    await tx.wallet.update({
      where: { id: walletId },
       {
        balance: newBalance,
        totalReserved: newReserved,
      },
    });

    return { success: true, newBalance };
  });
}

/**
 * Concede créditos (por suscripción, compra o promoción)
 */
export async function grantCredits(
  prisma: PrismaClient,
  walletId: string,
  amount: number,
  grantType: 'SUBSCRIPTION' | 'PURCHASE' | 'PROMOTION' | 'ADJUSTMENT',
  source: string,
  description: string,
  idempotencyKey: string,
  relatedInvoiceId?: string,
  relatedSubscriptionId?: string
): Promise<{ success: boolean; newBalance: number }> {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUniqueOrThrow({
      where: { id: walletId },
    });

    const newBalance = wallet.balance + amount;

    await tx.creditLedgerEntry.create({
       {
        walletId,
        entryType: grantType === 'SUBSCRIPTION' ? 'GRANT' : 
                   grantType === 'PURCHASE' ? 'PURCHASE' : 
                   grantType === 'PROMOTION' ? 'GRANT' : 'ADJUSTMENT',
        amount: amount,
        balanceAfter: newBalance,
        description,
        idempotencyKey,
        relatedInvoiceId,
        relatedSubscriptionId,
      },
    });

    await tx.wallet.update({
      where: { id: walletId },
       {
        balance: newBalance,
        totalCredits: wallet.totalCredits + amount,
      },
    });

    return { success: true, newBalance };
  });
}

/**
 * Reembolsa créditos (trabajo fallido después de captura)
 */
export async function refundCredits(
  prisma: PrismaClient,
  walletId: string,
  amount: number,
  jobId: string,
  description: string
): Promise<{ success: boolean; newBalance: number }> {
  if (amount <= 0) {
    throw new Error('Amount must be positive');
  }

  return prisma.$transaction(async (tx) => {
    const wallet = await tx.wallet.findUniqueOrThrow({
      where: { id: walletId },
    });

    const newBalance = wallet.balance + amount;

    await tx.creditLedgerEntry.create({
       {
        walletId,
        entryType: 'REFUND',
        amount: amount,
        balanceAfter: newBalance,
        relatedJobId: jobId,
        description,
        idempotencyKey: `refund-${jobId}`,
      },
    });

    await tx.wallet.update({
      where: { id: walletId },
       {
        balance: newBalance,
      },
    });

    return { success: true, newBalance };
  });
}

/**
 * Obtiene el historial del ledger
 */
export async function getLedgerHistory(
  prisma: PrismaClient,
  walletId: string,
  limit: number = 50,
  offset: number = 0
): Promise<{
  entries: any[];
  total: number;
}> {
  const [entries, total] = await Promise.all([
    prisma.creditLedgerEntry.findMany({
      where: { walletId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset,
    }),
    prisma.creditLedgerEntry.count({
      where: { walletId },
    }),
  ]);

  return { entries, total };
}

/**
 * Obtiene el balance actual de una wallet
 */
export async function getWalletBalance(
  prisma: PrismaClient,
  walletId: string
): Promise<{
  balance: number;
  totalReserved: number;
  availableBalance: number;
}> {
  const wallet = await prisma.wallet.findUniqueOrThrow({
    where: { id: walletId },
  });

  return {
    balance: wallet.balance,
    totalReserved: wallet.totalReserved,
    availableBalance: wallet.balance - wallet.totalReserved,
  };
}

/**
 * Reconcilia el balance con el ledger
 */
export async function reconcileWallet(
  prisma: PrismaClient,
  walletId: string
): Promise<{
  matches: boolean;
  walletBalance: number;
  calculatedBalance: number;
  discrepancy: number;
}> {
  const wallet = await prisma.wallet.findUniqueOrThrow({
    where: { id: walletId },
  });

  // Calcular balance sumando todas las entradas del ledger
  const entries = await prisma.creditLedgerEntry.findMany({
    where: { walletId },
    orderBy: { createdAt: 'asc' },
  });

  let calculatedBalance = 0;
  for (const entry of entries) {
    calculatedBalance += entry.amount;
  }

  const discrepancy = wallet.balance - calculatedBalance;

  return {
    matches: discrepancy === 0,
    walletBalance: wallet.balance,
    calculatedBalance,
    discrepancy,
  };
}
