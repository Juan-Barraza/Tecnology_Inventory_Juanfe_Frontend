import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreateAsset } from '@/hooks/useAssets'
import { useCities, useAreas, useCategories, useAccountingGroups } from '@/hooks/useCatalogs'
import type { PhysicalStatus } from '@/types/asset.type'

const assetSchema = z.object({
  code: z.string().min(1, 'El código es requerido'),
  description: z.string().min(2, 'La descripción es requerida'),
  category_id: z.number({ message: 'Selecciona una categoría' }).min(1),
  asset_account_id: z.number({ message: 'Selecciona un grupo contable' }).min(1),
  city_id: z.number({ message: 'Selecciona una ciudad' }).min(1),
  area_id: z.number().nullable().optional(),
  historical_cost: z.number().nullable().optional(),
  activation_date: z.string().min(1, 'La fecha de activación es requerida'),
  physical_status: z.enum(['optimal', 'good', 'fair', 'deteriorated', 'out_of_service']),
})

type AssetForm = z.infer<typeof assetSchema>

interface Props {
  isOpen: boolean
  onClose: () => void
}

const inputClass = (hasError?: boolean) =>
  `w-full px-4 py-2.5 text-sm rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400
   focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors
   ${hasError
    ? 'border-red-400 focus:ring-red-400/30'
    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
  }`

const selectClass = (hasError?: boolean) =>
  `w-full px-4 py-2.5 text-sm rounded-xl border bg-white dark:bg-slate-800 text-slate-900 dark:text-white
   focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors appearance-none cursor-pointer
   ${hasError
    ? 'border-red-400 focus:ring-red-400/30'
    : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600'
  }`

function Label({ children }: { children: React.ReactNode }) {
  return (
    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
      {children}
    </label>
  )
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-red-500 font-medium">{message}</p>
}

export default function AddAssetModal({ isOpen, onClose }: Props) {
  const { mutate: createAsset, isPending, error } = useCreateAsset()

  const { data: cities = [] } = useCities()
  const { data: areas = [] } = useAreas()
  const { data: categories = [] } = useCategories()
  const { data: accountingGroups = [] } = useAccountingGroups()

  const { register, handleSubmit, reset, formState: { errors } } = useForm<AssetForm>({
    resolver: zodResolver(assetSchema),
    defaultValues: {
      physical_status: 'optimal',
      area_id: undefined,
      historical_cost: undefined,
      category_id: undefined,
      asset_account_id: undefined,
      city_id: undefined,
    },
  })

  useEffect(() => {
    if (!isOpen) reset()
  }, [isOpen, reset])

  if (!isOpen) return null

  const onSubmit = (data: AssetForm) => {
    createAsset(
      {
        ...data,
        category_id: Number(data.category_id),
        asset_account_id: Number(data.asset_account_id),
        city_id: Number(data.city_id),
        area_id: data.area_id ? Number(data.area_id) : null,
        historical_cost: data.historical_cost ?? null,
        physical_status: data.physical_status as PhysicalStatus,
      },
      { onSuccess: () => onClose() }
    )
  }

  const serverError = (error as any)?.response?.data?.error

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm">
      <div className="relative w-full sm:max-w-2xl bg-white dark:bg-slate-900 sm:rounded-3xl rounded-t-3xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[95vh] sm:max-h-[90vh]">

        {/* Header */}
        <div className="px-6 sm:px-8 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
          <div>
            <h3 className="text-lg sm:text-xl font-bold text-slate-900 dark:text-white">
              Registrar Nuevo Activo
            </h3>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              Completa los datos del equipo.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            <svg className="w-4 h-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Server error */}
        {serverError && (
          <div className="mx-6 sm:mx-8 mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 dark:border-red-800 text-red-600 dark:text-red-400 text-sm flex-shrink-0">
            {serverError}
          </div>
        )}

        {/* Form — scrollable */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex-1 overflow-y-auto px-6 sm:px-8 py-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">

            {/* Código */}
            <div>
              <Label>Código</Label>
              <input
                {...register('code')}
                placeholder="Ej. 08-EQC-100"
                className={inputClass(!!errors.code)}
              />
              <FieldError message={errors.code?.message} />
            </div>

            {/* Fecha activación */}
            <div>
              <Label>Fecha de Activación</Label>
              <input
                {...register('activation_date')}
                type="date"
                className={inputClass(!!errors.activation_date)}
              />
              <FieldError message={errors.activation_date?.message} />
            </div>

            {/* Descripción — ocupa las 2 columnas */}
            <div className="sm:col-span-2">
              <Label>Descripción</Label>
              <input
                {...register('description')}
                placeholder="Ej. Portátil Dell Latitude 5420"
                className={inputClass(!!errors.description)}
              />
              <FieldError message={errors.description?.message} />
            </div>

            {/* Categoría */}
            <div>
              <Label>Categoría</Label>
              <div className="relative">
                <select
                  {...register('category_id', { valueAsNumber: true })}
                  className={selectClass(!!errors.category_id)}
                >
                  <option value="">Seleccionar...</option>
                  {categories.map(c => (
                    <option key={c.ID} value={c.ID}>{c.Name}</option>
                  ))}
                </select>
                <ChevronIcon />
              </div>
              <FieldError message={errors.category_id?.message} />
            </div>

            {/* Grupo contable */}
            <div>
              <Label>Grupo Contable</Label>
              <div className="relative">
                <select
                  {...register('asset_account_id', { valueAsNumber: true })}
                  className={selectClass(!!errors.asset_account_id)}
                >
                  <option value="">Seleccionar...</option>
                  {accountingGroups.map(g =>
                    g.accounts.map(a => (
                      <option key={a.ID} value={a.ID}>
                        {g.name} — {a.account_code}
                      </option>
                    ))
                  )}
                </select>
                <ChevronIcon />
              </div>
              <FieldError message={errors.asset_account_id?.message} />
            </div>

            {/* Ciudad */}
            <div>
              <Label>Ciudad</Label>
              <div className="relative">
                <select
                  {...register('city_id', { valueAsNumber: true })}
                  className={selectClass(!!errors.city_id)}
                >
                  <option value="">Seleccionar...</option>
                  {cities.map(c => (
                    <option key={c.ID} value={c.ID}>{c.Name} — {c.Department}</option>
                  ))}
                </select>
                <ChevronIcon />
              </div>
              <FieldError message={errors.city_id?.message} />
            </div>

            {/* Área */}
            <div>
              <Label>
                Área{' '}
                <span className="text-slate-400 font-normal text-xs">(opcional)</span>
              </Label>
              <div className="relative">
                <select
                  {...register('area_id', { valueAsNumber: true })}
                  className={selectClass()}
                >
                  <option value="">Sin área asignada</option>
                  {areas.map(a => (
                    <option key={a.ID} value={a.ID}>{a.Name}</option>
                  ))}
                </select>
                <ChevronIcon />
              </div>
            </div>

            {/* Costo histórico */}
            <div>
              <Label>
                Costo Histórico{' '}
                <span className="text-slate-400 font-normal text-xs">(opcional)</span>
              </Label>
              <div className="relative">
                <input
                  {...register('historical_cost', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className={`${inputClass()} pl-8`}
                />
              </div>
            </div>

            {/* Estado físico */}
            <div>
              <Label>Estado Físico</Label>
              <div className="relative">
                <select
                  {...register('physical_status')}
                  className={selectClass()}
                >
                  <option value="optimal">Óptimo</option>
                  <option value="good">Bueno</option>
                  <option value="fair">Regular</option>
                  <option value="deteriorated">Deteriorado</option>
                  <option value="out_of_service">Fuera de servicio</option>
                </select>
                <ChevronIcon />
              </div>
            </div>

          </div>
        </form>

        {/* Footer — fijo abajo */}
        <div className="px-6 sm:px-8 py-5 border-t border-slate-100 dark:border-slate-800 flex gap-3 flex-shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isPending}
            className="flex-1 py-2.5 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 text-sm font-semibold rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={handleSubmit(onSubmit)}
            className="flex-1 py-2.5 btn-primary text-sm font-bold rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
          >
            {isPending
              ? <><div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />Guardando...</>
              : 'Guardar Activo'
            }
          </button>
        </div>
      </div>
    </div>
  )
}

function ChevronIcon() {
  return (
    <span className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
      </svg>
    </span>
  )
}