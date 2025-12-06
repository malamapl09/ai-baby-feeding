'use client';

import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Loader2, FileText, Image, Download } from 'lucide-react';

type ExportFormat = 'pdf' | 'png';
type ExportLayout = 'compact' | 'detailed';

interface ExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  type: 'meal-plan' | 'grocery-list';
  onExport: (format: ExportFormat, layout?: ExportLayout) => Promise<void>;
}

export function ExportDialog({ open, onOpenChange, type, onExport }: ExportDialogProps) {
  const [format, setFormat] = useState<ExportFormat>('pdf');
  const [layout, setLayout] = useState<ExportLayout>('detailed');
  const [loading, setLoading] = useState(false);

  const handleExport = async () => {
    setLoading(true);
    try {
      await onExport(format, type === 'meal-plan' ? layout : undefined);
      onOpenChange(false);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="w-5 h-5 text-rose-600" />
            Export {type === 'meal-plan' ? 'Meal Plan' : 'Grocery List'}
          </DialogTitle>
          <DialogDescription>
            Choose your preferred export format
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Format Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Format</Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => setFormat('pdf')}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                  format === 'pdf'
                    ? 'border-rose-500 bg-rose-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <FileText className={`w-5 h-5 ${format === 'pdf' ? 'text-rose-600' : 'text-gray-500'}`} />
                <div className="text-left">
                  <p className="font-medium">PDF</p>
                  <p className="text-xs text-gray-500">Best for printing</p>
                </div>
              </button>

              {type === 'meal-plan' && (
                <button
                  onClick={() => setFormat('png')}
                  className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all ${
                    format === 'png'
                      ? 'border-rose-500 bg-rose-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Image className={`w-5 h-5 ${format === 'png' ? 'text-rose-600' : 'text-gray-500'}`} />
                  <div className="text-left">
                    <p className="font-medium">Image</p>
                    <p className="text-xs text-gray-500">Best for sharing</p>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Layout Selection (only for meal plans and PDF format) */}
          {type === 'meal-plan' && format === 'pdf' && (
            <div className="space-y-3">
              <Label className="text-sm font-medium">Layout</Label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setLayout('compact')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    layout === 'compact'
                      ? 'border-rose-500 bg-rose-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium">Compact</p>
                  <p className="text-xs text-gray-500">Overview only</p>
                </button>

                <button
                  onClick={() => setLayout('detailed')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    layout === 'detailed'
                      ? 'border-rose-500 bg-rose-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <p className="font-medium">Detailed</p>
                  <p className="text-xs text-gray-500">Full recipes</p>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleExport}
            disabled={loading}
            className="bg-rose-600 hover:bg-rose-700"
          >
            {loading ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Download className="w-4 h-4 mr-2" />
                Download
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
