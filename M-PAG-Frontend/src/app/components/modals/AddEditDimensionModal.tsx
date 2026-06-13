import React, { useState, useEffect } from 'react';
import { X, Save, Loader2 } from 'lucide-react';
import { dimensionsApi } from '../../services/api';
import { toast } from 'sonner';

interface AddEditDimensionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  dimension?: { id: number; name: string; code: string };
  pillarName: string;
  pillarId?: number;
}

export function AddEditDimensionModal({
  isOpen,
  onClose,
  onSuccess,
  dimension,
  pillarName,
  pillarId,
}: AddEditDimensionModalProps) {
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setName(dimension?.name || '');
      setCode(dimension?.code || '');
    }
  }, [isOpen, dimension]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
      if (!pillarId && !dimension) {
      toast.error('Cannot create dimension: M-PAGe pillar not found');
      return;
    }

    setIsSubmitting(true);
    try {
      if (dimension) {
        await dimensionsApi.update(dimension.id, { name, code });
        toast.success('Dimension updated successfully');
      } else {
        if (!pillarId) {
          throw new Error('M-PAGe pillar missing');
        }
        await dimensionsApi.create({ pillar: pillarId, name, code });
        toast.success('Dimension added successfully');
      }
      onSuccess();
      onClose();
    } catch (error: any) {
      toast.error(error.message || 'Error saving dimension');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-md w-full m-4">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">
            {dimension ? 'Edit' : 'Add'} dimension
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
              Pillar
            </label>
            <input
              type="text"
              value={pillarName}
              disabled
              className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-50 text-gray-600"
            />
          </div>

          <div>
            <label
              htmlFor="dimension-code"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Code <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="dimension-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Ex: G-D1"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label
              htmlFor="dimension-name"
              className="block text-sm font-medium text-gray-700 mb-2"
            >
              Dimension name <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              id="dimension-name"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Ex: Governance structure"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
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
