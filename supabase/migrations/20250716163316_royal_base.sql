/*
  # Agregar campo observaciones y total_venta a tabla ventas

  1. Cambios en tabla ventas
    - Agregar campo `observaciones` (text)
    - Agregar campo `total_venta` (numeric) calculado como valor_kilo_venta * total_kilos

  2. Actualizar registros existentes
    - Establecer observaciones por defecto para ventas existentes
    - Calcular total_venta para registros existentes
*/

-- Agregar campo observaciones a la tabla ventas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ventas' AND column_name = 'observaciones'
  ) THEN
    ALTER TABLE ventas ADD COLUMN observaciones text DEFAULT 'venta';
  END IF;
END $$;

-- Agregar campo total_venta a la tabla ventas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ventas' AND column_name = 'total_venta'
  ) THEN
    ALTER TABLE ventas ADD COLUMN total_venta numeric(10,2) DEFAULT 0;
  END IF;
END $$;

-- Actualizar registros existentes para calcular total_venta
UPDATE ventas 
SET total_venta = (valor_kilo_venta * total_kilos)
WHERE total_venta = 0 OR total_venta IS NULL;

-- Actualizar registros existentes para establecer observaciones por defecto
UPDATE ventas 
SET observaciones = 'venta'
WHERE observaciones IS NULL OR observaciones = '';