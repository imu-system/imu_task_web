'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Loader2, FileText } from 'lucide-react';

export interface Invoice {
  id: string;
  date: string; // Format: DD/MM/YYYY
  amount: number;
  status: 'paid' | 'pending' | 'failed';
  plan: string; // "Pro", "Business", etc.
  invoiceNumber: string; // "INV-2025-001"
  pdfUrl?: string; // URL du PDF (sera généré par le backend)
}

interface InvoicesTableProps {
  invoices: Invoice[];
  onDownload: (invoiceId: string) => Promise<void>;
}

export default function InvoicesTable({ invoices, onDownload }: InvoicesTableProps) {
  const t = useTranslations('SettingsPage.billing.invoices');
  
  const [downloading, setDownloading] = useState<string | null>(null);

  const handleDownload = async (invoiceId: string) => {
    setDownloading(invoiceId);
    try {
      await onDownload(invoiceId);
    } catch (err) {
      console.error('Failed to download invoice:', err);
      alert(t('errors.downloadFailed'));
    } finally {
      setDownloading(null);
    }
  };

  const getStatusBadge = (status: Invoice['status']) => {
    switch (status) {
      case 'paid':
        return (
          <Badge variant="default" className="bg-green-600 hover:bg-green-700">
            {t('status.paid')}
          </Badge>
        );
      case 'pending':
        return (
          <Badge variant="secondary" className="bg-yellow-600 hover:bg-yellow-700 text-white">
            {t('status.pending')}
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="destructive">
            {t('status.failed')}
          </Badge>
        );
    }
  };

  if (invoices.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-center">
        <FileText className="h-12 w-12 text-muted-foreground mb-4" />
        <h3 className="text-lg font-medium mb-1">{t('empty.title')}</h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {t('empty.description')}
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[120px]">{t('table.number')}</TableHead>
            <TableHead>{t('table.date')}</TableHead>
            <TableHead>{t('table.plan')}</TableHead>
            <TableHead className="text-right">{t('table.amount')}</TableHead>
            <TableHead>{t('table.status')}</TableHead>
            <TableHead className="text-right">{t('table.actions')}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {invoices.map((invoice) => (
            <TableRow key={invoice.id}>
              <TableCell className="font-mono text-sm">
                {invoice.invoiceNumber}
              </TableCell>
              <TableCell>{invoice.date}</TableCell>
              <TableCell>
                <span className="font-medium">{invoice.plan}</span>
              </TableCell>
              <TableCell className="text-right font-medium">
                {invoice.amount.toFixed(2)} €
              </TableCell>
              <TableCell>{getStatusBadge(invoice.status)}</TableCell>
              <TableCell className="text-right">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(invoice.id)}
                  disabled={downloading === invoice.id || invoice.status === 'failed'}
                >
                  {downloading === invoice.id ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-2" />
                      {t('table.download')}
                    </>
                  )}
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
