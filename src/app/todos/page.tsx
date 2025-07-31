import { createClient } from '../../../utils/supabase/server'
import { cookies } from 'next/headers'

export default async function Page() {
  // Eliminar el await aquí
  const cookieStore = cookies()
  const supabase = createClient(cookieStore)

  const { data: todos } = await supabase.from('todos').select()

  return (
    <ul>
      {todos?.map((todo) => (
        <li>{todo}</li>
      ))}
    </ul>
  )
}
