import { useState } from 'react';
import { Campo, Carga, Encabezado, Estado, Modal, Tabla } from '../components/Comunes';
import NivelStock from '../components/NivelStock';
import { PUEDE } from '../config/permisos';
import { useAuth } from '../context/AuthContext';
import { useDatos } from '../hooks/useDatos';
import { useFormulario } from '../hooks/useFormulario';
import { catalogosApi, materialesApi } from '../services/inventario.service';
import { numero } from '../utils/formato';

const numeroOpcional = (v) => (v === '' || v === null ? null : Number(v));
const texto = (v) => (v === null || v === undefined ? '' : String(v));

function FormMaterial({ material, categorias, alCerrar, alGuardar }) {
  const f = useFormulario(
    {
      codigo: material?.codigo ?? '',
      nombre: material?.nombre ?? '',
      unidad: material?.unidad ?? '',
      categoriaId: texto(material?.categoria_id),
      stockMinimo: texto(material?.stock_minimo),
      stockMaximo: texto(material?.stock_maximo),
      demandaPromedioDia: texto(material?.demanda_promedio_dia),
      demandaMaximaDia: texto(material?.demanda_maxima_dia),
      tiempoEntregaDias: texto(material?.tiempo_entrega_dias),
    },
    ({ codigo, categoriaId, stockMinimo, stockMaximo, demandaPromedioDia, demandaMaximaDia, tiempoEntregaDias, ...resto }) => {
      const datos = {
        ...resto,
        categoriaId: Number(categoriaId),
        stockMinimo: numeroOpcional(stockMinimo),
        stockMaximo: numeroOpcional(stockMaximo),
        demandaPromedioDia: numeroOpcional(demandaPromedioDia),
        demandaMaximaDia: numeroOpcional(demandaMaximaDia),
        tiempoEntregaDias: numeroOpcional(tiempoEntregaDias),
      };
      return material ? materialesApi.actualizar(material.id, datos) : materialesApi.crear({ ...datos, codigo });
    },
    { mensaje: material ? 'Material actualizado.' : 'Material registrado.', alTerminar: alGuardar },
  );
  const v = f.valores;
  const numerico = { type: 'number', min: 0, step: 'any' };

  return (
    <Modal titulo={material ? `Editar ${material.nombre}` : 'Registrar material'} alCerrar={alCerrar} alEnviar={f.alEnviar} enviando={f.enviando} error={f.error} textoEnviar={material ? 'Guardar cambios' : 'Registrar material'}>
      <div className="rejilla">
        {!material && <Campo etiqueta="Código estándar" required value={v.codigo} onChange={f.cambiar('codigo')} />}
        <Campo etiqueta="Nombre" required value={v.nombre} onChange={f.cambiar('nombre')} />
        <Campo etiqueta="Unidad" required value={v.unidad} onChange={f.cambiar('unidad')} />
        <Campo etiqueta="Categoría" required value={v.categoriaId} onChange={f.cambiar('categoriaId')}>
          <option value="">Seleccione</option>
          {categorias.filter((c) => c.padre_id).map((c) => <option key={c.id} value={c.id}>{c.padre.nombre} › {c.nombre}</option>)}
        </Campo>
        <Campo etiqueta="Stock mínimo" {...numerico} value={v.stockMinimo} onChange={f.cambiar('stockMinimo')} />
        <Campo etiqueta="Stock máximo" {...numerico} value={v.stockMaximo} onChange={f.cambiar('stockMaximo')} />
        <Campo etiqueta="Demanda promedio por día" {...numerico} value={v.demandaPromedioDia} onChange={f.cambiar('demandaPromedioDia')} />
        <Campo etiqueta="Demanda máxima por día" {...numerico} value={v.demandaMaximaDia} onChange={f.cambiar('demandaMaximaDia')} />
        <Campo etiqueta="Tiempo de entrega en días" type="number" min={0} step={1} value={v.tiempoEntregaDias} onChange={f.cambiar('tiempoEntregaDias')} ayuda="El stock de seguridad y el punto de reorden se calculan con estos datos." />
      </div>
    </Modal>
  );
}

export default function MaterialesPage() {
  const { puede } = useAuth();
  const materiales = useDatos(() => materialesApi.listar());
  const categorias = useDatos(() => catalogosApi.categorias());
  const [edicion, setEdicion] = useState(null);
  const puedeEditar = puede(PUEDE.editarMateriales);

  const columnas = [
    { titulo: 'Material', render: (m) => <>{m.nombre}<span className="codigo">{m.codigo}</span></> },
    { titulo: 'Categoría', render: (m) => m.categoria.nombre },
    { titulo: 'Nivel', render: (m) => <NivelStock stock={m.stock_actual} puntoReorden={m.punto_reorden} unidad={m.unidad} /> },
    { titulo: 'Seguridad', num: true, render: (m) => numero(m.stock_seguridad) },
    { titulo: 'Diferencia', num: true, render: (m) => numero(m.diferencia) },
    { titulo: 'Estado', render: (m) => <Estado valor={m.estado} /> },
  ];
  if (puedeEditar) columnas.push({ titulo: 'Acción', render: (m) => <button type="button" className="secundario chico" onClick={() => setEdicion(m)}>Editar</button> });

  return (
    <>
      <Encabezado titulo="Materiales" descripcion="Catálogo normalizado. El stock sale de los movimientos y el punto de reorden se calcula.">
        {puedeEditar && <button type="button" onClick={() => setEdicion('nuevo')}>Registrar material</button>}
      </Encabezado>
      <section className="panel">
        <Carga estado={materiales}>{(d) => <Tabla columnas={columnas} filas={d} vacio="Registre el primer material." />}</Carga>
      </section>
      {edicion && categorias.datos && (
        <FormMaterial material={edicion === 'nuevo' ? null : edicion} categorias={categorias.datos} alCerrar={() => setEdicion(null)} alGuardar={() => { setEdicion(null); materiales.recargar(); }} />
      )}
    </>
  );
}
