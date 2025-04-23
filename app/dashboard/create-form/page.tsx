'use client';

import { useState } from 'react';
import { useForm, SubmitHandler } from 'react-hook-form';

// Interfaz para los campos del formulario
interface FormInputs {
  nombre: string;
  apellidos: string;
  identificacion: string;
  fechaNacimiento: string;
  direccion: string;
  telefono: string;
  email: string;
  profesion: string;
  empresa: string;
  cargo: string;
  fechaIngreso: string;
  salario: string;
  categoria: string;
  observaciones: string;
}

export default function CreateForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 4; // Mantenemos los 4 pasos
  
  const { register, handleSubmit, watch, formState: { errors }, reset } = useForm<FormInputs>();
  
  const onSubmit: SubmitHandler<FormInputs> = (data) => {
    setIsSubmitting(true);
    
    // Simulando envío al servidor
    console.log('Datos enviados:', data);
    
    setTimeout(() => {
      setIsSubmitting(false);
      setSuccess(true);
      reset();
      setCurrentStep(1);
      
      // Ocultar mensaje de éxito después de unos segundos
      setTimeout(() => setSuccess(false), 5000);
    }, 1500);
  };
  
  const nextStep = () => {
    setCurrentStep(prev => Math.min(prev + 1, totalSteps));
  };
  
  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };
  
  return (
    <div className="space-y-8">
      {/* Encabezado */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold text-secondary">Crear Nueva Ficha</h2>
            <p className="text-gray-500 mt-1">Completa el formulario para registrar una nueva ficha</p>
          </div>
          
          {/* Indicador de progreso */}
          <div className="mt-4 md:mt-0 flex items-center">
            {Array.from({ length: totalSteps }).map((_, index) => (
              <div key={index} className="flex items-center">
                <div 
                  className={`w-8 h-8 rounded-full flex items-center justify-center ${
                    index + 1 === currentStep
                      ? 'bg-primary text-white'
                      : index + 1 < currentStep
                        ? 'bg-primary-light text-white'
                        : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {index + 1}
                </div>
                {index < totalSteps - 1 && (
                  <div 
                    className={`w-10 h-1 ${
                      index + 1 < currentStep ? 'bg-primary-light' : 'bg-gray-200'
                    }`}
                  ></div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      
      {/* Formulario */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          {/* Paso 1: Información Personal */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-secondary">Información Personal</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Nombre */}
                <div>
                  <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="nombre"
                    type="text"
                    className={`block w-full rounded-md border ${errors.nombre ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm`}
                    {...register("nombre", { required: "Este campo es obligatorio" })}
                  />
                  {errors.nombre && <p className="mt-1 text-sm text-red-600">{errors.nombre.message}</p>}
                </div>
                
                {/* Apellidos */}
                <div>
                  <label htmlFor="apellidos" className="block text-sm font-medium text-gray-700 mb-1">
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="apellidos"
                    type="text"
                    className={`block w-full rounded-md border ${errors.apellidos ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm`}
                    {...register("apellidos", { required: "Este campo es obligatorio" })}
                  />
                  {errors.apellidos && <p className="mt-1 text-sm text-red-600">{errors.apellidos.message}</p>}
                </div>
                
                {/* Identificación */}
                <div>
                  <label htmlFor="identificacion" className="block text-sm font-medium text-gray-700 mb-1">
                    Identificación <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="identificacion"
                    type="text"
                    className={`block w-full rounded-md border ${errors.identificacion ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm`}
                    {...register("identificacion", { required: "Este campo es obligatorio" })}
                  />
                  {errors.identificacion && <p className="mt-1 text-sm text-red-600">{errors.identificacion.message}</p>}
                </div>
                
                {/* Fecha de Nacimiento */}
                <div>
                  <label htmlFor="fechaNacimiento" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Nacimiento <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fechaNacimiento"
                    type="date"
                    className={`block w-full rounded-md border ${errors.fechaNacimiento ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm`}
                    {...register("fechaNacimiento", { required: "Este campo es obligatorio" })}
                  />
                  {errors.fechaNacimiento && <p className="mt-1 text-sm text-red-600">{errors.fechaNacimiento.message}</p>}
                </div>
                
                {/* Dirección */}
                <div className="md:col-span-2">
                  <label htmlFor="direccion" className="block text-sm font-medium text-gray-700 mb-1">
                    Dirección <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="direccion"
                    type="text"
                    className={`block w-full rounded-md border ${errors.direccion ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm`}
                    {...register("direccion", { required: "Este campo es obligatorio" })}
                  />
                  {errors.direccion && <p className="mt-1 text-sm text-red-600">{errors.direccion.message}</p>}
                </div>
                
                {/* Teléfono */}
                <div>
                  <label htmlFor="telefono" className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="telefono"
                    type="tel"
                    className={`block w-full rounded-md border ${errors.telefono ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm`}
                    {...register("telefono", { required: "Este campo es obligatorio" })}
                  />
                  {errors.telefono && <p className="mt-1 text-sm text-red-600">{errors.telefono.message}</p>}
                </div>
                
                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={`block w-full rounded-md border ${errors.email ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm`}
                    {...register("email", { 
                      required: "Este campo es obligatorio",
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: "Email inválido"
                      }
                    })}
                  />
                  {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>}
                </div>
              </div>
            </div>
          )}
          
          {/* Paso 2: Información Profesional */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-secondary">Información Profesional</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Profesión */}
                <div>
                  <label htmlFor="profesion" className="block text-sm font-medium text-gray-700 mb-1">
                    Profesión <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="profesion"
                    type="text"
                    className={`block w-full rounded-md border ${errors.profesion ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm`}
                    {...register("profesion", { required: "Este campo es obligatorio" })}
                  />
                  {errors.profesion && <p className="mt-1 text-sm text-red-600">{errors.profesion.message}</p>}
                </div>
                
                {/* Empresa */}
                <div>
                  <label htmlFor="empresa" className="block text-sm font-medium text-gray-700 mb-1">
                    Empresa <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="empresa"
                    type="text"
                    className={`block w-full rounded-md border ${errors.empresa ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm`}
                    {...register("empresa", { required: "Este campo es obligatorio" })}
                  />
                  {errors.empresa && <p className="mt-1 text-sm text-red-600">{errors.empresa.message}</p>}
                </div>
                
                {/* Cargo */}
                <div>
                  <label htmlFor="cargo" className="block text-sm font-medium text-gray-700 mb-1">
                    Cargo <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="cargo"
                    type="text"
                    className={`block w-full rounded-md border ${errors.cargo ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm`}
                    {...register("cargo", { required: "Este campo es obligatorio" })}
                  />
                  {errors.cargo && <p className="mt-1 text-sm text-red-600">{errors.cargo.message}</p>}
                </div>
                
                {/* Fecha de Ingreso */}
                <div>
                  <label htmlFor="fechaIngreso" className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Ingreso <span className="text-red-500">*</span>
                  </label>
                  <input
                    id="fechaIngreso"
                    type="date"
                    className={`block w-full rounded-md border ${errors.fechaIngreso ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm`}
                    {...register("fechaIngreso", { required: "Este campo es obligatorio" })}
                  />
                  {errors.fechaIngreso && <p className="mt-1 text-sm text-red-600">{errors.fechaIngreso.message}</p>}
                </div>
              </div>
            </div>
          )}
          
          {/* Paso 3: Información Adicional */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-secondary">Información Adicional</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Salario */}
                <div>
                  <label htmlFor="salario" className="block text-sm font-medium text-gray-700 mb-1">
                    Salario <span className="text-red-500">*</span>
                  </label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      id="salario"
                      type="text"
                      className={`block w-full rounded-md border ${errors.salario ? 'border-red-300' : 'border-gray-300'} pl-7 px-3 py-2 focus:border-primary focus:outline-none focus:ring-primary sm:text-sm`}
                      placeholder="0.00"
                      {...register("salario", { required: "Este campo es obligatorio" })}
                    />
                  </div>
                  {errors.salario && <p className="mt-1 text-sm text-red-600">{errors.salario.message}</p>}
                </div>
                
                {/* Categoría */}
                <div>
                  <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría <span className="text-red-500">*</span>
                  </label>
                  <select
                    id="categoria"
                    className={`block w-full rounded-md border ${errors.categoria ? 'border-red-300' : 'border-gray-300'} px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm`}
                    {...register("categoria", { required: "Este campo es obligatorio" })}
                  >
                    <option value="">Seleccionar</option>
                    <option value="A">Categoría A</option>
                    <option value="B">Categoría B</option>
                    <option value="C">Categoría C</option>
                    <option value="D">Categoría D</option>
                  </select>
                  {errors.categoria && <p className="mt-1 text-sm text-red-600">{errors.categoria.message}</p>}
                </div>
                
                {/* Observaciones */}
                <div className="md:col-span-2">
                  <label htmlFor="observaciones" className="block text-sm font-medium text-gray-700 mb-1">
                    Observaciones
                  </label>
                  <textarea
                    id="observaciones"
                    rows={4}
                    className="block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-primary focus:outline-none focus:ring-primary sm:text-sm"
                    {...register("observaciones")}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Paso 4: Formulario Guía (Versión mejorada) */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-secondary">Formulario Guía - Ficha Técnica</h3>
              
              <div className="overflow-x-auto border rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan={2}>
                        FICHA TÉCNICA PARA PROYECTOS Y PROGRAMAS DE EXTENSIÓN
                      </th>
                      <th className="px-3 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        CÓDIGO: FO-EX/IE-048
                      </th>
                    </tr>
                    <tr className="bg-gray-50">
                      <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider" colSpan={3}>
                        VERSIÓN: 00 - FECHA: {new Date().toLocaleDateString()}
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {/* Sección de información técnica */}
                    <tr>
                      <td className="px-3 py-4 font-medium bg-gray-50 text-secondary" colSpan={3}>INFORMACIÓN TÉCNICA</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-medium" width="30%">Código</td>
                      <td className="px-3 py-3" colSpan={2}>
                        <span className="text-gray-500 italic">Espacio diligenciado por la Vicerrectoría de Extensión</span>
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-medium">Nombre del Proyecto</td>
                      <td className="px-3 py-3" colSpan={2}>
                        {watch("nombre") ? watch("nombre") : "No especificado"}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-medium">Tipo de Proyecto</td>
                      <td className="px-3 py-3" colSpan={2}>Convenio/Contrato</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-medium">Cooperantes</td>
                      <td className="px-3 py-3" colSpan={2}>N/A</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-medium">Objeto</td>
                      <td className="px-3 py-3" colSpan={2}>
                        {watch("observaciones") ? watch("observaciones") : "No especificado"}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-medium">¿Requiere presupuesto?</td>
                      <td className="px-3 py-3" colSpan={2}>Si</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-medium">Plazo (Meses)</td>
                      <td className="px-3 py-3" colSpan={2}>4 MESES</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-medium">Lugar de ejecución</td>
                      <td className="px-3 py-3" colSpan={2}>
                        {watch("direccion") ? watch("direccion") : "No especificado"}
                      </td>
                    </tr>
                    
                    {/* Sección de justificación */}
                    <tr>
                      <td className="px-3 py-4 font-medium bg-gray-50 text-secondary" colSpan={3}>JUSTIFICACIÓN</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-medium">Necesidad identificada</td>
                      <td className="px-3 py-3" colSpan={2}>
                        Los programas de fortalecimiento institucional se constituyen en un pilar clave para el desarrollo de capacidades y la mejora continua de las entidades, alineándose con los objetivos estratégicos de cada institución.
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-medium">Conveniencia para la institución</td>
                      <td className="px-3 py-3" colSpan={2}>
                        El presente proyecto es el resultado del acompañamiento que viene realizando la Universidad en los entes territoriales y diferentes empresas que intervienen en el desarrollo de las comunidades.
                      </td>
                    </tr>
                    
                    {/* Sección de antecedentes */}
                    <tr>
                      <td className="px-3 py-4 font-medium bg-gray-50 text-secondary" colSpan={3}>ANTECEDENTES</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-medium">Experiencia relacionada</td>
                      <td className="px-3 py-3" colSpan={2}>
                        La universidad tiene una amplia experiencia en procesos formativos y de capacitación, entre ellos tenemos el plan de formación docente realizado a los docentes de las instituciónes educativas.
                      </td>
                    </tr>
                    
                    {/* Sección de alcance */}
                    <tr>
                      <td className="px-3 py-4 font-medium bg-gray-50 text-secondary" colSpan={3}>ALCANCE</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-medium">Objetivo General</td>
                      <td className="px-3 py-3" colSpan={2}>
                        Aunar esfuerzos para el fortalecimiento de las administraciones municipales mediante la Instalación de Capacidades para la Planeación y Gestión del Desarrollo Local.
                      </td>
                    </tr>
                    
                    {/* Sección responsable */}
                    <tr>
                      <td className="px-3 py-4 font-medium bg-gray-50 text-secondary" colSpan={3}>RESPONSABLE</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-medium">Nombres y Apellidos</td>
                      <td className="px-3 py-3" colSpan={2}>
                        {`${watch("nombre") || ''} ${watch("apellidos") || ''}`}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-medium">Identificación</td>
                      <td className="px-3 py-3" colSpan={2}>
                        {watch("identificacion") ? watch("identificacion") : "No especificado"}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-medium">Profesión</td>
                      <td className="px-3 py-3" colSpan={2}>
                        {watch("profesion") ? watch("profesion") : "No especificado"}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-medium">Empresa</td>
                      <td className="px-3 py-3" colSpan={2}>
                        {watch("empresa") ? watch("empresa") : "No especificado"}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-medium">Cargo</td>
                      <td className="px-3 py-3" colSpan={2}>
                        {watch("cargo") ? watch("cargo") : "No especificado"}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-medium">Teléfono</td>
                      <td className="px-3 py-3" colSpan={2}>
                        {watch("telefono") ? watch("telefono") : "No especificado"}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-medium">Correo Electrónico</td>
                      <td className="px-3 py-3" colSpan={2}>
                        {watch("email") ? watch("email") : "No especificado"}
                      </td>
                    </tr>
                    
                    {/* Sección presupuestal */}
                    <tr>
                      <td className="px-3 py-4 font-medium bg-gray-50 text-secondary" colSpan={3}>INFORMACIÓN PRESUPUESTAL</td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-medium">Valor del Proyecto</td>
                      <td className="px-3 py-3 font-medium text-right" colSpan={2}>
                        {watch("salario") ? `$${watch("salario")}` : "$0.00"}
                      </td>
                    </tr>
                    <tr>
                      <td className="px-3 py-3 font-medium">Categoría</td>
                      <td className="px-3 py-3" colSpan={2}>
                        {watch("categoria") ? watch("categoria") : "No especificado"}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              
              <p className="mt-4 text-sm text-gray-500">
                Este formulario muestra la ficha técnica con los datos ingresados en los pasos anteriores. 
                Los datos personales y profesionales se han integrado automáticamente en la ficha.
                Para ver todos los campos detallados, puede continuar con el envío del formulario.
              </p>
            </div>
          )}
          
          {/* Botones de Navegación */}
          <div className="flex justify-between pt-5">
            <button
              type="button"
              onClick={prevStep}
              disabled={currentStep === 1}
              className={`rounded-md px-4 py-2 text-sm font-medium shadow-sm ${
                currentStep === 1
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : 'bg-white border border-gray-300 text-secondary hover:bg-gray-50'
              }`}
            >
              Anterior
            </button>
            
            <div>
              {currentStep < totalSteps ? (
                <button
                  type="button"
                  onClick={nextStep}
                  className="ml-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                >
                  Siguiente
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="ml-3 rounded-md bg-primary px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-primary-dark focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 flex items-center"
                >
                  {isSubmitting && (
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                  )}
                  Guardar Ficha
                </button>
              )}
            </div>
          </div>
          
          {/* Mensaje de éxito */}
          {success && (
            <div className="rounded-md bg-green-50 p-4 mt-6">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-green-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-green-800">
                    ¡La ficha ha sido creada exitosamente!
                  </p>
                </div>
                <div className="ml-auto pl-3">
                  <div className="-mx-1.5 -my-1.5">
                    <button
                      type="button"
                      onClick={() => setSuccess(false)}
                      className="inline-flex rounded-md bg-green-50 p-1.5 text-green-500 hover:bg-green-100 focus:outline-none focus:ring-2 focus:ring-green-600 focus:ring-offset-2 focus:ring-offset-green-50"
                    >
                      <span className="sr-only">Cerrar</span>
                      <svg className="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
      
      {/* Ayuda e Instrucciones */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-medium text-secondary mb-4">¿Necesitas ayuda?</h3>
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-700">
                <strong>Consejo:</strong> Si ya tienes un archivo Excel con los datos, puedes usar la opción "Subir Excel" en el menú lateral para completar este formulario automáticamente.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}