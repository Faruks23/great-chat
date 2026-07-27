/**
 * Converts a MongoDB User document into a safe object
 * that can be returned to the client.
 *
 * Removes:
 * - password
 * - __v
 *
 * Renames:
 * - _id -> id
 */

export function toUserDto(user: any) {
  if (!user) return null;

  const { _id, __v, password, ...rest } = user;

  return {
    id: _id?.toString(),
    ...rest,
  };
}