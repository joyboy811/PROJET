import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { itemsApi } from '../../services/api';
import { toast } from 'sonner';

interface AddEditItemModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  item?: { id: number; label: string; code: string };
  factorName: string;
  factorId?: number;
}

export function AddEditItemModal({
  isOpen,
  onClose,
  onSuccess,
  item,
  factorName,
  factorId,
}: AddEditItemModalProps) {
  const [label, setLabel] = useState('');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setLabel(item?.label || '');
      setCode(item?.code || '');
    }
  }, [isOpen, item]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!factorId && !item) return;

    setIsSubmitting(true);
    try {
      if (item) {
        await itemsApi.update(item.id, { label, code });
        toast.success('Question updated successfully');
      } else {
        await itemsApi.create({ factor: factorId!, label, code });
        toast.success('Question added successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error saving question');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {item ? 'Edit' : 'Add'} question
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            disabled={isSubmitting}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Factor
            </label>
            <input
              type="text"
              value={factorName}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          <div>
            <label
              htmlFor="item-code"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="item-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex: Q-101"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="item-label"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Question / Item <span className="text-red-500">*</span>
            </label>
            <textarea
              id="item-label"
              required
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              placeholder="e.g. Existence of a dedicated AI oversight committee"
              rows={3}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-500 mt-2">
              This question will be rated on a scale from 1 to 5
            </p>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
