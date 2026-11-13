interface Props extends React.InputHTMLAttributes<HTMLInputElement> {
  label: string
  id: string
  error?: string
  rightElement?: React.ReactNode
}

export default function AuthInput({ label, id, error, rightElement, className = '', ...rest }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label
        htmlFor={id}
        className="text-[13px] font-semibold text-white/70 tracking-[-0.01em]"
      >
        {label}
      </label>
      <div className="relative">
        <input
          id={id}
          {...rest}
          aria-invalid={!!error}
          aria-describedby={error ? `${id}-error` : undefined}
          className={`
            w-full px-4 py-3 pr-${rightElement ? '11' : '4'}
            rounded-xl text-[14px] text-white
            bg-white/[0.06] border outline-none
            placeholder:text-white/25
            transition-all duration-150
            ${error
              ? 'border-red-custom/70 focus:border-red-custom bg-red-custom/5'
              : 'border-white/[0.1] focus:border-teal focus:bg-white/[0.08]'
            }
            ${className}
          `}
        />
        {rightElement && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            {rightElement}
          </div>
        )}
      </div>
      {error && (
        <p id={`${id}-error`} role="alert" className="text-[12px] text-red-400 font-medium flex items-center gap-1">
          <span aria-hidden="true">⚠</span> {error}
        </p>
      )}
    </div>
  )
}
