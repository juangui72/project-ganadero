import React, { useState, useEffect } from 'react';
import { X, AlertTriangle, DollarSign, Skull, Shield, MessageSquare } from 'lucide-react';
import { supabase, CausaSalida, causaSalidaLabels } from '../lib/supabase';

interface ExitReasonsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (exitReasons: ExitReasonEntry[]) => void;
  totalExits: number;
  socio: string;
  fecha: string;
  registroId?: string;
  existingReasons?: ExitReasonEntry[];
}

export interface ExitReasonEntry {
  causa: CausaSalida;
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
  registroId,
  existingReasons = []
}) => {
  const [exitReasons, setExitReasons] = useState<ExitReasonEntry[]>([]);
  const [error, setError] = useState<string>('');
  const [showVentasModal, setShowVentasModal] = useState(false);
  const [ventasData, setVentasData] = useState({
    cantidad: 0,
    valor_kilo_venta: 0,
    total_kilos_venta: 0
  });
  const [observaciones, setObservaciones] = useState<Record<CausaSalida, string>>({
    ventas: 'venta',
    muerte: '',
    robo: ''
  });

  useEffect(() => {
    if (isOpen) {
      if (existingReasons.length > 0) {
        setExitReasons(existingReasons);
      } else {
        // Initialize with empty entries for each cause
        setExitReasons([
          { causa: 'ventas', cantidad: 0 },
          { causa: 'muerte', cantidad: 0 },
          { causa: 'robo', cantidad: 0 }
        ]);
      }
      setObservaciones({
        ventas: 'venta',
        muerte: '',
        robo: ''
      });
      setError('');
    }
  }, [isOpen, existingReasons]);

  const handleQuantityChange = (causa: CausaSalida, cantidad: number) => {
    const newCantidad = Math.max(0, cantidad);
    
    // Si es ventas y se ingresa una cantidad > 0, abrir modal de ventas
    if (causa === 'ventas' && newCantidad > 0 && cantidad !== exitReasons.find(e => e.causa === 'ventas')?.cantidad) {
      setVentasData({
        cantidad: newCantidad,
        valor_kilo_venta: 0,
        total_kilos_venta: 0
      });
      setShowVentasModal(true);
    }
    
    setExitReasons(prev => 
      prev.map(entry => 
        entry.causa === causa 
          ? { ...entry, cantidad: newCantidad }
          : entry
      )
    );
    setError('');
  };

  const handleObservacionesChange = (causa: CausaSalida, observacion: string) => {
    setObservaciones(prev => ({
      ...prev,
      [causa]: observacion
    }));
  };

  const handleVentasModalSave = () => {
    setExitReasons(prev => 
      prev.map(entry => 
        entry.causa === 'ventas' 
          ? { 
              ...entry, 
              cantidad: ventasData.cantidad,
              valor_kilo_venta: ventasData.valor_kilo_venta,
              total_kilos_venta: ventasData.total_kilos_venta,
              observaciones: 'venta'
            }
          : entry
      )
    );
    setShowVentasModal(false);
  };

  const getTotalAssigned = () => {
    return exitReasons.reduce((sum, entry) => sum + entry.cantidad, 0);
  };

  const handleSave = () => {
    const totalAssigned = getTotalAssigned();
    
    if (totalAssigned !== totalExits) {
      setError(`El total asignado (${totalAssigned}) debe ser igual al total de salidas (${totalExits})`);
      return;
    }

    // Filter out entries with 0 quantity
    const validReasons = exitReasons.filter(entry => entry.cantidad > 0).map(entry => ({
      ...entry,
      observaciones: observaciones[entry.causa] || (entry.causa === 'ventas' ? 'venta' : '')
    }));
    onSave(validReasons);
  };

  const getIconForCause = (causa: CausaSalida) => {
    switch (causa) {
      case 'ventas':
        return <DollarSign className="w-5 h-5 text-green-600" />;
      case 'muerte':
        return <Skull className="w-5 h-5 text-red-600" />;
      case 'robo':
        return <Shield className="w-5 h-5 text-orange-600" />;
    }
  };

  const getColorForCause = (causa: CausaSalida) => {
    switch (causa) {
      case 'ventas':
        return 'border-green-200 bg-green-50';
      case 'muerte':
        return 'border-red-200 bg-red-50';
      case 'robo':
        return 'border-orange-200 bg-orange-50';
    }
  };

  if (!isOpen) return null;

  const totalAssigned = getTotalAssigned();
  const remaining = totalExits - totalAssigned;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h3 className="text-lg font-semibold text-gray-900">
              Detalle de Salidas
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
              <span className={`text-sm font-medium ${remaining === 0 ? 'text-green-600' : 'text-orange-600'}`}>
                Restante: {remaining}
              </span>
            </div>
            
            {error && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertTriangle className="w-5 h-5 text-red-600 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}
          </div>

          <div className="space-y-4">
            {exitReasons.map((entry) => (
              <div
                key={entry.causa}
                className={`p-4 border-2 rounded-lg ${getColorForCause(entry.causa)}`}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    {getIconForCause(entry.causa)}
                    <span className="ml-2 font-medium text-gray-900">
                      {causaSalidaLabels[entry.causa]}
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
                    value={entry.cantidad}
                    onChange={(e) => handleQuantityChange(entry.causa, parseInt(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    placeholder="0"
                  />
                </div>
                
                {/* Campo de observaciones para muerte y robo */}
                {(entry.causa === 'muerte' || entry.causa === 'robo') && entry.cantidad > 0 && (
                  <div className="mt-3">
                    <label className="text-sm text-gray-600 block mb-1">
                      <MessageSquare className="w-4 h-4 inline mr-1" />
                      Observaciones:
                    </label>
                    <textarea
                      value={observaciones[entry.causa]}
                      onChange={(e) => handleObservacionesChange(entry.causa, e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors resize-none"
                      rows={2}
                      placeholder={`Motivo de ${entry.causa}...`}
                    />
                  </div>
                )}
              </div>
            ))}
          </div>

          <div className="mt-6 pt-4 border-t border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-gray-700">
                Total asignado:
              </span>
              <span className={`font-bold ${totalAssigned === totalExits ? 'text-green-600' : 'text-orange-600'}`}>
                {totalAssigned} / {totalExits}
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
                disabled={totalAssigned !== totalExits}
                className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
              >
                Guardar
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
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cantidad de animales vendidos
                  </label>
                  <input
                    type="number"
                    value={ventasData.cantidad}
                    onChange={(e) => setVentasData(prev => ({ ...prev, cantidad: parseInt(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    min="0"
                    max={totalExits}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Valor por Kg de Venta
                  </label>
                  <input
                    type="number"
                    value={ventasData.valor_kilo_venta}
                    onChange={(e) => setVentasData(prev => ({ ...prev, valor_kilo_venta: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total Kg Vendidos
                  </label>
                  <input
                    type="number"
                    value={ventasData.total_kilos_venta}
                    onChange={(e) => setVentasData(prev => ({ ...prev, total_kilos_venta: parseFloat(e.target.value) || 0 }))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-colors"
                    min="0"
                    step="0.01"
                    placeholder="0.00"
                  />
                </div>
                
                <div className="bg-green-50 p-3 rounded-lg">
                  <div className="text-sm text-green-700">
                    <strong>Total Venta:</strong> ${Math.round(ventasData.valor_kilo_venta * ventasData.total_kilos_venta).toLocaleString('es-CO')}
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
                    className="flex-1 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
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