'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Share2, Copy, Check, Link2, Loader2, FileText } from 'lucide-react';

interface ShareDialogProps {
  planId: string;
  planTitle: string;
  isOpen: boolean;
  onClose: () => void;
}

export function ShareDialog({ planId, planTitle, isOpen, onClose }: ShareDialogProps) {
  const t = useTranslations('share');
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [includePdf, setIncludePdf] = useState(false);
  const [expiresInDays, setExpiresInDays] = useState<string>('30');
  const [error, setError] = useState<string | null>(null);

  const handleCreateShare = async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/share/create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId,
          includePdf,
          expiresInDays: expiresInDays === 'never' ? null : parseInt(expiresInDays),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create share link');
      }

      setShareUrl(data.shareUrl);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create share link');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopyLink = async () => {
    if (!shareUrl) return;

    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = shareUrl;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setShareUrl(null);
    setCopied(false);
    setError(null);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share2 className="h-5 w-5 text-rose-600" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description', { planTitle })}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {!shareUrl ? (
            <>
              {/* Options */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="space-y-0.5">
                    <Label htmlFor="include-pdf" className="text-sm font-medium">
                      {t('includePdf')}
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      {t('includePdfDescription')}
                    </p>
                  </div>
                  <Switch
                    id="include-pdf"
                    checked={includePdf}
                    onCheckedChange={setIncludePdf}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="expires">{t('linkExpires')}</Label>
                  <Select value={expiresInDays} onValueChange={setExpiresInDays}>
                    <SelectTrigger id="expires">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">{t('expires7Days')}</SelectItem>
                      <SelectItem value="30">{t('expires30Days')}</SelectItem>
                      <SelectItem value="90">{t('expires90Days')}</SelectItem>
                      <SelectItem value="never">{t('expiresNever')}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {error && (
                <p className="text-sm text-red-600">{error}</p>
              )}

              <Button
                onClick={handleCreateShare}
                disabled={isLoading}
                className="w-full bg-rose-600 hover:bg-rose-700"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {t('creating')}
                  </>
                ) : (
                  <>
                    <Link2 className="mr-2 h-4 w-4" />
                    {t('createLink')}
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              {/* Share link created */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <Check className="h-5 w-5 text-green-600" />
                  <span className="text-sm text-green-700">{t('linkCreated')}</span>
                </div>

                <div className="flex gap-2">
                  <Input
                    value={shareUrl}
                    readOnly
                    className="font-mono text-sm"
                  />
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={handleCopyLink}
                    className="shrink-0"
                  >
                    {copied ? (
                      <Check className="h-4 w-4 text-green-600" />
                    ) : (
                      <Copy className="h-4 w-4" />
                    )}
                  </Button>
                </div>

                {includePdf && (
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <FileText className="h-4 w-4" />
                    <span>{t('pdfIncluded')}</span>
                  </div>
                )}

                <p className="text-xs text-muted-foreground">
                  {expiresInDays === 'never'
                    ? t('linkNeverExpires')
                    : t('linkExpiresIn', { days: expiresInDays })}
                </p>
              </div>

              <div className="flex gap-2 pt-2">
                <Button
                  variant="outline"
                  onClick={handleCopyLink}
                  className="flex-1"
                >
                  {copied ? (
                    <>
                      <Check className="mr-2 h-4 w-4" />
                      {t('copied')}
                    </>
                  ) : (
                    <>
                      <Copy className="mr-2 h-4 w-4" />
                      {t('copyLink')}
                    </>
                  )}
                </Button>
                <Button
                  onClick={handleClose}
                  className="flex-1 bg-rose-600 hover:bg-rose-700"
                >
                  {t('done')}
                </Button>
              </div>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
