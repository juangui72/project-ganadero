/*
  # Actualizar tabla salidas_detalle para solo ventas

  1. Cambios en tabla salidas_detalle
    - Actualizar constraint para permitir solo 'ventas'
    - Mantener estructura existente

  2. Verificar tabla ventas
    - Asegurar que tenga todos los campos necesarios
    - Verificar relaciones con registros

  3. Seguridad
    - Mantener RLS habilitado
    - Mantener políticas existentes
*/

-- Actualizar constraint para permitir solo ventas
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'salidas_detalle_causa_check'
  ) THEN
    ALTER TABLE salidas_detalle DROP CONSTRAINT salidas_detalle_causa_check;
  END IF;
END $$;

ALTER TABLE salidas_detalle ADD CONSTRAINT salidas_detalle_causa_check 
CHECK (causa = 'ventas');

-- Asegurar que la tabla ventas tenga todos los campos necesarios
DO $$
BEGIN
  -- Verificar y agregar campo observaciones si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ventas' AND column_name = 'observaciones'
  ) THEN
    ALTER TABLE ventas ADD COLUMN observaciones text DEFAULT 'venta';
  END IF;

  -- Verificar y agregar campo total_venta si no existe
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'ventas' AND column_name = 'total_venta'
  ) THEN
    ALTER TABLE ventas ADD COLUMN total_venta numeric(10,2) DEFAULT 0;
  END IF;
END $$;