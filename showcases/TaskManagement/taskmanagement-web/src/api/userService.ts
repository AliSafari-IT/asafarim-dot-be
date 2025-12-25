import { IDENTITY_API_URL } from '../config/api';

export interface UserDto {
  id: string;
  email: string;
  userName: string;
}

// Handle both PascalCase (from backend) and camelCase responses
type BatchUserResponse = {
  UserId: string;
  Email: string | null;
  UserName: string | null;
} | {
  userId: string;
  email: string | null;
  userName: string | null;
}

const userService = {
  async getUserById(userId: string): Promise<UserDto> {
    try {
      const url = `${IDENTITY_API_URL}/users/${encodeURIComponent(userId)}`;
      console.log(`👤 Fetching user from: ${url}`);
      const response = await fetch(url, {
        credentials: 'include',
      });
      if (!response.ok) {
        console.error(`❌ Failed to fetch user ${userId}: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch user: ${response.status}`);
      }
      const data = await response.json();
      console.log(`✅ User fetched:`, data);
      return data;
    } catch (error) {
      console.error(`❌ Error fetching user ${userId}:`, error);
      throw error;
    }
  },

  async getUsersByIds(userIds: string[]): Promise<Record<string, UserDto>> {
    try {
      const url = `${IDENTITY_API_URL}/users/batch`;
      console.log(`👥 Fetching batch users from: ${url}`, userIds);
      const response = await fetch(url, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ userIds }),
      });
      if (!response.ok) {
        console.error(`❌ Batch fetch failed: ${response.status} ${response.statusText}`);
        throw new Error(`Failed to fetch users: ${response.status}`);
      }

      const usersArray: BatchUserResponse[] = await response.json();
      console.log(`✅ Batch users fetched:`, usersArray);

      // Transform array response to Record<string, UserDto>
      const usersRecord: Record<string, UserDto> = {};
      usersArray.forEach((user) => {
        // Handle both PascalCase (UserId, Email, UserName) and camelCase (userId, email, userName)
        const userWithPascal = user as { UserId?: string; Email?: string | null; UserName?: string | null };
        const userWithCamel = user as { userId?: string; email?: string | null; userName?: string | null };
        
        const userId = userWithPascal.UserId || userWithCamel.userId;
        const email = userWithPascal.Email || userWithCamel.email;
        const userName = userWithPascal.UserName || userWithCamel.userName;
        
        if (userId) {
          usersRecord[userId] = {
            id: userId,
            email: email || userId,
            userName: userName || 'Unknown User'
          };
        }
      });

      console.log(`✅ Transformed users record:`, usersRecord);
      return usersRecord;
    } catch (error) {
      console.error(`❌ Error fetching batch users:`, error);
      throw error;
    }
  },
};

export default userService;
