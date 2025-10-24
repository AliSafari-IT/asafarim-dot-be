import { IDENTITY_API_URL } from '../config/api';

export interface UserDto {
  id: string;
  email: string;
  userName: string;
}

const userService = {
  async getUserById(userId: string): Promise<UserDto> {
    const response = await fetch(`${IDENTITY_API_URL}/users/${userId}`, {
      credentials: 'include',
    });
    if (!response.ok) throw new Error('Failed to fetch user');
    return response.json();
  },

  async getUsersByIds(userIds: string[]): Promise<Record<string, UserDto>> {
    const response = await fetch(`${IDENTITY_API_URL}/users/batch`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ userIds }),
    });
    if (!response.ok) throw new Error('Failed to fetch users');
    return response.json();
  },
};

export default userService;
