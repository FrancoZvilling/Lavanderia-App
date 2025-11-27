import { useState, useEffect } from 'react';
import { type SingleValue } from 'react-select';
import CreatableSelect from 'react-select/creatable';
import type { TipoDePrenda, CategoriaPrenda } from '../../types';
import '../ventas/AddSaleForm.css';

// Definimos un tipo para las opciones del selector de categorías
type SelectOption = { value: string; label: string };

interface PrendaFormModalProps {
  onClose: () => void;
  // La firma de onSave ahora espera el objeto TipoDePrenda completo
  onSave: (prendaData: Omit<TipoDePrenda, 'id'>, id?: string) => void;
  prendaInicial: TipoDePrenda | null;
  // Nuevas props para manejar las categorías
  categorias: CategoriaPrenda[];
  onCreateCategoria: (nombreCategoria: string) => Promise<CategoriaPrenda>;
}

const PrendaFormModal: React.FC<PrendaFormModalProps> = ({ onClose, onSave, prendaInicial, categorias, onCreateCategoria }) => {
  const [nombre, setNombre] = useState('');
  const [precio, setPrecio] = useState('');
  const [selectedCategoria, setSelectedCategoria] = useState<SelectOption | null>(null);

  const isEditing = !!prendaInicial;
  
  // Creamos las opciones para el desplegable a partir de la prop 'categorias'
  const opcionesCategoria = categorias.map(c => ({ value: c.id, label: c.nombre }));

  // useEffect para rellenar el formulario al editar o limpiarlo al crear
  useEffect(() => {
    if (isEditing && prendaInicial) {
      setNombre(prendaInicial.nombre);
      setPrecio(prendaInicial.precio.toString());
      // Pre-seleccionamos la categoría si estamos editando
      setSelectedCategoria({ value: prendaInicial.categoriaId, label: prendaInicial.categoriaNombre });
    } else {
      setNombre('');
      setPrecio('');
      setSelectedCategoria(null);
    }
  }, [prendaInicial, isEditing]);

  // Función que se dispara cuando el usuario crea una nueva categoría en el desplegable
  const handleCreateCategoria = async (inputValue: string) => {
    // Deshabilitamos temporalmente el formulario para evitar doble envío
    // (Implementación más avanzada podría usar un estado de 'cargando')
    
    // Llamamos a la función del padre para crear la categoría en la base de datos
    const nuevaCategoria = await onCreateCategoria(inputValue);
    
    // Auto-seleccionamos la categoría recién creada
    setSelectedCategoria({ value: nuevaCategoria.id, label: nuevaCategoria.nombre });
  };

  const handleSubmit = () => {
    const precioNum = parseFloat(precio);
    if (!nombre.trim() || isNaN(precioNum) || precioNum < 0) {
      alert('Por favor, complete el nombre y un precio válido.');
      return;
    }
    if (!selectedCategoria) {
      alert('Por favor, seleccione o cree una categoría para la prenda.');
      return;
    }
    
    // Enviamos el objeto completo al padre
    onSave({ 
      nombre: nombre.trim(), 
      precio: precioNum,
      categoriaId: selectedCategoria.value,
      categoriaNombre: selectedCategoria.label
    }, prendaInicial?.id);
  };

  return (
    <form className="add-sale-form" onSubmit={(e) => { e.preventDefault(); handleSubmit(); }}>
      <div className="form-group">
        <label htmlFor="nombrePrenda">Nombre de la Prenda</label>
        <input 
          type="text" 
          id="nombrePrenda" 
          value={nombre} 
          onChange={e => setNombre(e.target.value)} 
          required 
          autoFocus 
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="categoriaPrenda">Categoría</label>
        <CreatableSelect
          id="categoriaPrenda"
          isClearable
          options={opcionesCategoria}
          value={selectedCategoria}
          onChange={(option: SingleValue<SelectOption>) => setSelectedCategoria(option)}
          onCreateOption={handleCreateCategoria}
          placeholder="Busque o cree una categoría..."
          formatCreateLabel={inputValue => `Crear "${inputValue}"`}
        />
      </div>
      
      <div className="form-group">
        <label htmlFor="precioPrenda">Precio del Lavado</label>
        <input 
          type="number" 
          id="precioPrenda" 
          value={precio} 
          onChange={e => setPrecio(e.target.value)} 
          required 
        />
      </div>

      <div className="form-actions">
        <button type="button" className="secondary-button" onClick={onClose}>Cancelar</button>
        <button type="submit" className="primary-button">{isEditing ? 'Actualizar Prenda' : 'Guardar Prenda'}</button>
      </div>
    </form>
  );
};

export default PrendaFormModal;