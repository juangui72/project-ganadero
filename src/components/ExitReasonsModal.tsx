import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, DollarSign } from 'lucide-react';
import { supabase } from '../lib/supabase';

interface ExitReasonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exitReasons: ExitReasonEntry[]) => void;
  totalExits: number;
  socio: string;
  fecha: string;
  registroId?: string;
}

export interface ExitReasonEntry {
  causa: 'ventas';
  cantidad: number;
  observaciones?: string;
  valor_kilo_venta?: number;
  total_kilos_venta?: number;
}

const ExitReasonsModal: React.FC<ExitReasonsModalProps> = ({
  isOpen,
  onClose,
  onSave,
  totalExits,
  socio,
  fecha,
  registroId
}) => {
  const [cantidadVentas, setCantidadVentas] = useState<number>(0);
  const [error, setError] = useState<string>('');
  const [showVentasModal, setShowVentasModal] = useState(false);
  const [ventasData, setVentasData] = useState({
    valor_kilo_venta: 0,
    total_kilos_venta: 0
  });

  useEffect(() => {
    if (isOpen) {
      setCantidadVentas(0);
      setVentasData({
        valor_kilo_venta: 0,
        total_kilos_venta: 0
      });
      setError('');
    }
  }, [isOpen]);

  const handleCantidadChange = (value: string) => {
    const cantidad = value === '' ? 0 : Math.max(0, Math.min(parseInt(value) || 0, totalExits));
    setCantidadVentas(cantidad);
    setError('');
  };

  const handleVentasClick = () => {
    if (cantidadVentas > 0) {
      setShowVentasModal(true);
    }
  };

  const handleVentasModalSave = () => {
    const exitReason: ExitReasonEntry = {
      causa: 'ventas',
      cantidad: cantidadVentas,
      observaciones: 'venta',
      valor_kilo_venta: ventasData.valor_kilo_venta,
      total_kilos_venta: ventasData.total_kilos_venta
    };

    onSave([exitReason]);
    setShowVentasModal(false);
  };

  const handleSave = () => {
    if (cantidadVentas !== totalExits) {
      setError(`La cantidad de ventas (${cantidadVentas}) debe ser igual al total de salidas (${totalExits})`);
      return;
    }

    if (cantidadVentas > 0) {
      handleVentasClick();
    } else {
      // Si no hay ventas, guardar con valores en 0
      const exitReason: ExitReasonEntry = {
        causa: 'ventas',
        cantidad: 0,
        observaciones: 'venta',
        valor_kilo_venta: 0,
        total_kilos_venta: 0
      };
      onSave([exitReason]);
    }
  };

  if (!isOpen) return null;

  const totalVenta = ventasData.valor_kilo_venta * ventasData.total_kilos_venta;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Detalle de Salidas - Ventas
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              {socio} - {new Date(fecha + 'T00:00:00').toLocaleDateString('es-CO')}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">
                Total de salidas: <span className="font-bold text-gray-900">{totalExits}</span>
              </span>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
          </div>

          <div className="p-4 border-2 rounded-lg border-green-200 bg-green-50">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center">
                <DollarSign className="w-5 h-5 text-green-600" />
                <span className="ml-2 font-medium text-gray-900">
                  Ventas
                </span>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <label className="text-sm text-gray-600 min-w-0 flex-shrink-0">
                Cantidad:
              </label>
              <input
                type="number"
                min="0"
                max={totalExits}
                value={cantidadVentas === 0 ? '' : cantidadVentas}
                onChange={(e) => {
                  const value = e.target.value;
                  if (value === '') {
                    setCantidadVentas(0);
                  } else {
                    const cantidad = parseInt(value);
                    if (!isNaN(cantidad) && cantidad >= 0 && cantidad <= totalExits) {
                      setCantidadVentas(cantidad);
                    }
                  }
                  setError('');
                }}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                placeholder="0"
                autoFocus
              />
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">
                Cantidad asignada:
              </span>
              <span className={`font-bold ${cantidadVentas === totalExits ? 'text-green-600' : 'text-orange-600'}`}>
                {cantidadVentas} / {totalExits}
              </span>
            </div>
            
            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleSave}
                disabled={cantidadVentas !== totalExits}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Continuar
              </button>
            </div>
          </div>
        </div>
        
        {/* Modal de Ventas */}
        {showVentasModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-xl shadow-2xl max-w-md w-full mx-4">
              <div className="flex items-center justify-between p-6 border-b border-gray-200">
                <h4 className="text-lg font-semibold text-gray-900 flex items-center">
                  <DollarSign className="w-5 h-5 mr-2 text-green-600" />
                  Detalles de Venta
                </h4>
                <button
                  onClick={() => setShowVentasModal(false)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
              
              <div className="p-6 space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <div className="text-sm text-blue-700">
                    <strong>Cantidad de animales:</strong> {cantidadVentas}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor por Kg de Venta *
                  </label>
                  <input
                    type="number"
                    value={ventasData.valor_kilo_venta || ''}
                    onChange={(e) => setVentasData(prev => ({ 
                      ...prev, 
                      valor_kilo_venta: parseFloat(e.target.value) || 0 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Kg Vendidos *
                  </label>
                  <input
                    type="number"
                    value={ventasData.total_kilos_venta || ''}
                    onChange={(e) => setVentasData(prev => ({ 
                      ...prev, 
                      total_kilos_venta: parseFloat(e.target.value) || 0 
                    }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                    required
                  />
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-green-700">
                    <strong>Total Venta:</strong> ${Math.round(totalVenta).toLocaleString('es-CO')}
                  </div>
                </div>
                
                <div className="flex space-x-3 pt-4">
                  <button
                    onClick={() => setShowVentasModal(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleVentasModalSave}
                    disabled={!ventasData.valor_kilo_venta || !ventasData.total_kilos_venta}
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
                  >
                    Guardar Venta
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ExitReasonsModal;