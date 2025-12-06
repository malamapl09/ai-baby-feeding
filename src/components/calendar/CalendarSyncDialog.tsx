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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Calendar, Download, Check, Loader2, Bell, ExternalLink } from 'lucide-react';

interface CalendarSyncDialogProps {
  planId: string;
  planTitle: string;
  startDate: string;
  isOpen: boolean;
  onClose: () => void;
}

export function CalendarSyncDialog({
  planId,
  planTitle,
  startDate,
  isOpen,
  onClose,
}: CalendarSyncDialogProps) {
  const t = useTranslations('calendar');
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloaded, setDownloaded] = useState(false);
  const [reminderMinutes, setReminderMinutes] = useState<string>('30');

  const handleDownloadIcal = async () => {
    setIsDownloading(true);
    try {
      const response = await fetch(`/api/calendar/ical/${planId}?reminder=${reminderMinutes}`);

      if (!response.ok) {
        throw new Error('Failed to generate calendar');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `meal-plan-${startDate}.ics`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);

      setDownloaded(true);
      setTimeout(() => setDownloaded(false), 3000);
    } catch (error) {
      console.error('Error downloading calendar:', error);
    } finally {
      setIsDownloading(false);
    }
  };

  const handleGoogleCalendarAdd = () => {
    // Generate Google Calendar URL with basic event details
    // For a full implementation, this would use Google Calendar API
    // For now, we'll open Google Calendar with a pre-filled event
    const baseUrl = 'https://calendar.google.com/calendar/render';
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: planTitle,
      details: `Baby meal plan created with BabyBites. Download the full plan at ${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/meal-plans/${planId}`,
      dates: `${startDate.replace(/-/g, '')}/${startDate.replace(/-/g, '')}`,
    });

    window.open(`${baseUrl}?${params.toString()}`, '_blank');
  };

  const handleAppleCalendarInstructions = () => {
    // Show instructions for Apple Calendar
    alert(t('appleCalendarInstructions'));
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5 text-rose-600" />
            {t('title')}
          </DialogTitle>
          <DialogDescription>
            {t('description')}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Reminder Setting */}
          <div className="space-y-2">
            <Label htmlFor="reminder" className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              {t('reminderBefore')}
            </Label>
            <Select value={reminderMinutes} onValueChange={setReminderMinutes}>
              <SelectTrigger id="reminder">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">{t('noReminder')}</SelectItem>
                <SelectItem value="15">{t('reminder15Min')}</SelectItem>
                <SelectItem value="30">{t('reminder30Min')}</SelectItem>
                <SelectItem value="60">{t('reminder1Hour')}</SelectItem>
                <SelectItem value="120">{t('reminder2Hours')}</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Download Options */}
          <div className="space-y-3">
            <Label>{t('exportOptions')}</Label>

            {/* iCal Download */}
            <Button
              onClick={handleDownloadIcal}
              disabled={isDownloading}
              variant="outline"
              className="w-full justify-start"
            >
              {isDownloading ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : downloaded ? (
                <Check className="mr-2 h-4 w-4 text-green-600" />
              ) : (
                <Download className="mr-2 h-4 w-4" />
              )}
              <div className="text-left">
                <span className="font-medium">{t('downloadIcal')}</span>
                <p className="text-xs text-muted-foreground">{t('icalDescription')}</p>
              </div>
            </Button>

            {/* Google Calendar */}
            <Button
              onClick={handleGoogleCalendarAdd}
              variant="outline"
              className="w-full justify-start"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              <div className="text-left">
                <span className="font-medium">{t('addToGoogle')}</span>
                <p className="text-xs text-muted-foreground">{t('googleDescription')}</p>
              </div>
            </Button>

            {/* Apple Calendar Instructions */}
            <Button
              onClick={handleAppleCalendarInstructions}
              variant="outline"
              className="w-full justify-start"
            >
              <Calendar className="mr-2 h-4 w-4" />
              <div className="text-left">
                <span className="font-medium">{t('addToApple')}</span>
                <p className="text-xs text-muted-foreground">{t('appleDescription')}</p>
              </div>
            </Button>
          </div>

          {/* Info */}
          <p className="text-xs text-muted-foreground text-center">
            {t('calendarNote')}
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
