import type { ChangeEvent } from 'react'

interface FiltroInputProps {
  placeholder: string
  value: string
  type?: 'text' | 'number'
  onChange: (value: string) => void
  onlyPositive?: boolean
}

export default function FiltroInput({
  placeholder,
  value,
  type = 'text',
  onChange,
  onlyPositive = false
}: FiltroInputProps) {
  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    let newValue = e.target.value

    // Validar apenas valores positivos se necessário
    if (onlyPositive && type === 'number') {
      if (newValue === '' || parseFloat(newValue) >= 0) {
        onChange(newValue)
      }
      return
    }

    onChange(newValue)
  }

  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={handleChange}
      style={{
        padding: '8px',
        borderRadius: '4px',
        border: '1px solid #ccc',
        fontSize: '14px',
        fontFamily: 'inherit'
      }}
    />
  )
}
