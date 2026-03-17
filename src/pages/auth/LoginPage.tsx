import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useLogin } from '@/hooks/useAuth'

const loginSchema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type LoginForm = z.infer<typeof loginSchema>

export default function LoginPage() {
  const navigate = useNavigate()
  const { mutate: login, isPending, error } = useLogin()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginForm>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = (data: LoginForm) => {
    login(data, {
      onSuccess: () => navigate('/dashboard'),
    })
  }

  const errorMessage = (error as any)?.response?.data?.error

  return (
    <div className="space-y-6">
      <div className="space-y-2 text-center">
        <h2 className="text-2xl font-semibold tracking-tight">Bienvenido</h2>
        <p className="text-sm text-slate-500">Ingresa tus credenciales para acceder</p>
      </div>

      {errorMessage && (
        <div className="p-3 rounded-lg bg-red-50 border border-red-100 text-red-600 text-sm">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="email">
            Correo Electrónico
          </label>
          <input
            {...register('email')}
            id="email"
            type="email"
            placeholder="nombre@ejemplo.com"
            className="w-full"
            disabled={isPending}
          />
          {errors.email && (
            <p className="text-xs text-red-500">{errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium" htmlFor="password">
            Contraseña
          </label>
          <input
            {...register('password')}
            id="password"
            type="password"
            className="w-full"
            disabled={isPending}
          />
          {errors.password && (
            <p className="text-xs text-red-500">{errors.password.message}</p>
          )}
        </div>

        <button
          type="submit"
          className="btn-primary w-full h-11 flex items-center justify-center gap-2"
          disabled={isPending}
        >
          {isPending
            ? <div className="h-4 w-4 border-2 border-black/20 border-t-black rounded-full animate-spin" />
            : 'Iniciar Sesión'
          }
        </button>
      </form>
    </div>
  )
}