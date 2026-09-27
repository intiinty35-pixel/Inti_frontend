/**
 * El backend devuelve un arreglo plano de mensajes (uno por regla de class-validator
 * que falló), sin indicar a qué campo pertenece cada uno. Cada mensaje es lo bastante
 * específico como para identificar el campo por palabra clave, así se puede mostrar
 * debajo del input correspondiente en vez de un aviso genérico.
 */
export function mapMessagesToFields<Field extends string>(
  messages: string[],
  patterns: Record<Field, RegExp>,
): { fieldErrors: Partial<Record<Field, string>>; rest: string[] } {
  const fieldErrors: Partial<Record<Field, string>> = {};
  const rest: string[] = [];

  for (const message of messages) {
    const field = (Object.keys(patterns) as Field[]).find((key) => patterns[key].test(message));
    if (field && !fieldErrors[field]) {
      fieldErrors[field] = message;
    } else if (!field) {
      rest.push(message);
    }
  }

  return { fieldErrors, rest };
}
