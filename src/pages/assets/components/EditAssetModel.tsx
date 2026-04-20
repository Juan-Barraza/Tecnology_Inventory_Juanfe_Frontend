import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useUpdateAsset } from '@/hooks/useAssets'
import { useCities, useAreas, useCategories, useAccountingGroups } from '@/hooks/useCatalogs'
import { CATEGORY_LABEL } from '@/utils/constants'
import type { Asset } from '@/types/asset.type'

const schema = z.object({
    description: z.string().nullable().optional(),
    owner: z.string().nullable().optional(),
    city_id: z.number().nullable().optional(),
    area_id: z.number().nullable().optional(),
    code: z.string().nullable().optional(),
    historical_cost: z.number().nullable().optional(),
    category_id: z.number().nullable().optional(),
    asset_account_id: z.number().nullable().optional(),
})

type EditForm = z.infer<typeof schema>

interface Props {
    isOpen: boolean
    onClose: () => void
    asset: Asset
}

const inputClass = 'w-full px-4 py-2.5 text-sm rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-accent/40 transition-colors'
const selectClass = `${inputClass} appearance-none cursor-pointer`

export default function EditAssetModal({ isOpen, onClose, asset }: Props) {
    const { mutate: updateAsset, isPending, error } = useUpdateAsset()
    const { data: cities = [] } = useCities()
    const { data: areas = [] } = useAreas()
    const { data: categories = [] } = useCategories()
    const { data: accountingGroups = [] } = useAccountingGroups()

    const { register, handleSubmit, reset, formState: { errors, isDirty } } = useForm<EditForm>({
        resolver: zodResolver(schema),
        defaultValues: {
            code: asset.code ?? '',
            description: asset.description,
            owner: asset.owner ?? '',
            city_id: asset.city_id,
            area_id: asset.area_id ?? null,
            historical_cost: asset.historical_cost,
            category_id: asset.category_id,
            asset_account_id: asset.asset_account_id,
        },
    })

    // Resetear con los datos actuales cada vez que cambia el activo o se abre
    useEffect(() => {
        if (isOpen) {
            reset({
                description: asset.description,
                owner: asset.owner ?? '',
                city_id: asset.city_id,
                area_id: asset.area_id ?? null,
                code: asset.code,
                historical_cost: asset.historical_cost,
                category_id: asset.category_id,
                asset_account_id: asset.asset_account_id,
            })
        }
    }, [isOpen, asset, reset])

    if (!isOpen) return null

    const onSubmit = (data: EditForm) => {
        updateAsset(
            {
                id: asset.id,
                data: {
                    description: data.description || '',
                    owner: data.owner || null,
                    city_id: data.city_id ? Number(data.city_id) : undefined,
                    area_id: data.area_id ? Number(data.area_id) : null,
                    code: data.code || '',
                    historical_cost: data.historical_cost ?? null,
                    category_id: data.category_id ? Number(data.category_id) : null,
                    asset_account_id: data.asset_account_id ? Number(data.asset_account_id) : null,
                },
            },
            { onSuccess: () => onClose() }
        )
    }

    const serverError = (error as any)?.response?.data?.error

    return (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:p-4 bg-slate-900/60 backdrop-blur-sm">
            <div className="relative w-full sm:max-w-lg bg-white dark:bg-slate-900 sm:rounded-2xl rounded-t-2xl shadow-2xl border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">

                {/* Header */}
                <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between flex-shrink-0">
                    <div>
                        <h3 className="font-bold text-slate-900 dark:text-white">Editar Activo</h3>
                        <p className="text-xs text-slate-500 mt-0.5 font-mono">{asset.code}</p>
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

                {serverError && (
                    <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-100 text-red-600 text-sm flex-shrink-0">
                        {serverError}
                    </div>
                )}

                {/* Form */}
                <form onSubmit={handleSubmit(onSubmit)} className="flex-1 overflow-y-auto px-6 py-6 space-y-5">

                    {/* Code */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Código <span className="text-slate-400 font-normal text-xs">(opcional)</span>
                        </label>
                        <input
                            {...register('code')}
                            placeholder="Código del activo"
                            className={inputClass}
                        />
                    </div>

                    {/* Descripción */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Descripción
                        </label>
                        <input
                            {...register('description')}
                            placeholder="Descripción del activo"
                            className={inputClass}
                        />
                        {errors.description && (
                            <p className="mt-1 text-xs text-red-500">{errors.description.message}</p>
                        )}
                    </div>

                    {/* Propietario */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Propietario legal <span className="text-slate-400 font-normal text-xs">(opcional)</span>
                        </label>
                        <input
                            {...register('owner')}
                            placeholder="Propietario del activo"
                            className={inputClass}
                        />
                    </div>

                    {/* Ciudad */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Ciudad
                        </label>
                        <div className="relative">
                            <select
                                {...register('city_id', { valueAsNumber: true })}
                                className={selectClass}
                            >
                                <option value={0}>Seleccionar...</option>
                                {cities.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {c.name} — {c.department}
                                    </option>
                                ))}
                            </select>
                            <ChevronIcon />
                        </div>
                        {errors.city_id && (
                            <p className="mt-1 text-xs text-red-500">{errors.city_id.message}</p>
                        )}
                    </div>

                    {/* Área */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Área <span className="text-slate-400 font-normal text-xs">(opcional)</span>
                        </label>
                        <div className="relative">
                            <select
                                {...register('area_id', { valueAsNumber: true })}
                                className={selectClass}
                            >
                                <option value={0}>Sin área asignada</option>
                                {areas.map(a => (
                                    <option key={a.id} value={a.id}>{a.name}</option>
                                ))}
                            </select>
                            <ChevronIcon />
                        </div>
                    </div>

                    {/* Categoría */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Categoría <span className="text-slate-400 font-normal text-xs">(opcional)</span>
                        </label>
                        <div className="relative">
                            <select
                                {...register('category_id', { valueAsNumber: true })}
                                className={selectClass}
                            >
                                <option value={0}>Seleccionar...</option>
                                {categories.map(c => (
                                    <option key={c.id} value={c.id}>
                                        {CATEGORY_LABEL[c.name] || c.name}
                                    </option>
                                ))}
                            </select>
                            <ChevronIcon />
                        </div>
                    </div>

                    {/* Grupo contable */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Grupo Contable <span className="text-slate-400 font-normal text-xs">(opcional)</span>
                        </label>
                        <div className="relative">
                            <select
                                {...register('asset_account_id', { valueAsNumber: true })}
                                className={selectClass}
                            >
                                <option value={0}>Seleccionar...</option>
                                {accountingGroups.map(g =>
                                    g.accounts.map(a => (
                                        <option key={a.id} value={a.id}>
                                            {g.name} — {a.account_code}
                                        </option>
                                    ))
                                )}
                            </select>
                            <ChevronIcon />
                        </div>
                    </div>

                    {/* Costo histórico */}
                    <div>
                        <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                            Costo Histórico <span className="text-slate-400 font-normal text-xs">(opcional)</span>
                        </label>
                        <div className="relative">
                            <input
                                {...register('historical_cost', {
                                    setValueAs: v => (v === "" || isNaN(Number(v)) ? 0 : Number(v))
                                })}
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                className={`${inputClass} pl-8`}
                            />
                        </div>
                    </div>

                </form>

                {/* Footer */}
                <div className="px-6 py-5 border-t border-slate-100 dark:border-slate-800 flex gap-3 flex-shrink-0">
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={isPending}
                        className="flex-1 py-2.5 text-sm font-semibold border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors disabled:opacity-50"
                    >
                        Cancelar
                    </button>
                    <button
                        type="button"
                        disabled={isPending || !isDirty}
                        onClick={handleSubmit(onSubmit)}
                        className="flex-1 py-2.5 text-sm font-bold btn-primary rounded-xl disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                        {isPending
                            ? <><div className="w-4 h-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />Guardando...</>
                            : 'Guardar cambios'
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