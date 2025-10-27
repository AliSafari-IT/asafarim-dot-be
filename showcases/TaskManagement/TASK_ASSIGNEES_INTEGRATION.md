# Task Assignees Component - Integration Guide

## Overview
The `TaskAssignees` component provides role-based task assignment functionality with full permission enforcement.

## Component Location
- **Component**: `src/components/TaskAssignees.tsx`
- **Styles**: `src/components/TaskAssignees.css`

## Features
✅ Display current assignees with user info and role badges
✅ Role-based permission enforcement (Admin, Manager, Member)
✅ Assign new members with dropdown selector
✅ Unassign members with permission checks
✅ Real-time updates to task assignments
✅ Responsive design with mobile support

## Role-Based Permissions

### Assignment Rules
| Action | Admin | Manager | Member |
|--------|-------|---------|--------|
| Assign to others | ✅ | ✅ | ❌ |
| Assign to self | ✅ | ✅ | ✅ |
| Unassign self | ✅ | ✅ | ✅ |
| Unassign others | ✅ | ✅ | ❌ |

### Permission Logic
- **Member**: Can only assign/unassign themselves
- **Manager**: Can assign/unassign anyone
- **Admin**: Full control (same as Manager)

## Integration Steps

### 1. Import Component in TaskDetail.tsx
```typescript
import TaskAssignees from '../components/TaskAssignees'
import { useAuth } from '@asafarim/shared-ui-react'
import memberService, { ProjectRole } from '../api/memberService'
```

### 2. Add State for Current User Role
```typescript
const { user } = useAuth()
const [currentUserRole, setCurrentUserRole] = useState<ProjectRole | null>(null)

// Load user's role in the project
useEffect(() => {
  if (task && user?.id) {
    loadUserRole()
  }
}, [task?.projectId, user?.id])

const loadUserRole = async () => {
  if (!task) return
  try {
    const members = await memberService.getProjectMembers(task.projectId)
    const userMember = members.find(m => m.userId === user?.id)
    if (userMember) {
      setCurrentUserRole(userMember.role)
    }
  } catch (err) {
    console.error('Failed to load user role:', err)
  }
}
```

### 3. Add Task Update Handler
```typescript
const handleTaskUpdate = (updatedTask: TaskDto) => {
  setTask(updatedTask)
  // Optional: Show success message
  console.log('Task updated successfully')
}
```

### 4. Replace Assignees Section
Replace the existing assignees section in the sidebar (lines 310-324) with:

```typescript
{/* Assignees */}
{currentUserRole !== null && user?.id && (
  <TaskAssignees
    projectId={task.projectId}
    task={task}
    currentUserId={user.id}
    currentUserRole={currentUserRole}
    onTaskUpdate={handleTaskUpdate}
  />
)}
```

## Component Props

```typescript
interface TaskAssigneesProps {
  projectId: string;           // Project ID for fetching members
  task: TaskDto;               // Current task with assignments
  currentUserId: string;       // Current user's ID
  currentUserRole: ProjectRole; // Current user's role in project
  onTaskUpdate: (updatedTask: TaskDto) => void; // Callback when task is updated
}
```

## API Integration

The component uses these services:

### memberService
- `getProjectMembers(projectId)` - Fetch project members with roles

### userService
- `getUsersByIds(userIds)` - Fetch user details (name, email)

### taskService
- `updateTask(taskId, dto)` - Update task with new assignments

## Data Flow

```
Component Mounts
    ↓
Load assigned users + project members
    ↓
Display current assignees with roles
    ↓
User clicks "+ Assign" button
    ↓
Show dropdown with available members
    ↓
User selects member
    ↓
Check permissions
    ↓
Update task via API
    ↓
Callback to parent (onTaskUpdate)
    ↓
Update local state
```

## Error Handling

The component handles:
- ✅ Permission denied errors
- ✅ API failures with user-friendly messages
- ✅ Loading states during operations
- ✅ Disabled states for unavailable actions

## Styling

The component uses CSS custom properties:
- `--color-surface` - Background color
- `--color-border` - Border color
- `--color-foreground` - Text color
- `--color-primary-*` - Primary action colors
- `--color-error-*` - Error/danger colors
- `--color-success-*` - Success colors

## Example Usage

```typescript
import TaskAssignees from '../components/TaskAssignees'
import { ProjectRole } from '../api/memberService'

export default function TaskDetail() {
  const [task, setTask] = useState<TaskDto | null>(null)
  const [currentUserRole, setCurrentUserRole] = useState<ProjectRole | null>(null)
  const { user } = useAuth()

  const handleTaskUpdate = (updatedTask: TaskDto) => {
    setTask(updatedTask)
  }

  return (
    <div className="task-detail">
      {/* ... other content ... */}
      
      {currentUserRole !== null && user?.id && (
        <TaskAssignees
          projectId={task.projectId}
          task={task}
          currentUserId={user.id}
          currentUserRole={currentUserRole}
          onTaskUpdate={handleTaskUpdate}
        />
      )}
    </div>
  )
}
```

## Testing Checklist

- [ ] Member can assign themselves
- [ ] Member cannot assign others
- [ ] Member cannot unassign others
- [ ] Manager can assign anyone
- [ ] Manager can unassign anyone
- [ ] Admin has same permissions as Manager
- [ ] Dropdown shows only unassigned members
- [ ] Remove button only shows when permitted
- [ ] Role badges display correctly
- [ ] Error messages display on API failures
- [ ] Loading states work correctly
- [ ] Mobile responsive layout works

## Troubleshooting

### Assignees not loading
- Check if `task.assignments` is populated
- Verify `userService.getUsersByIds()` is working
- Check browser console for errors

### Permissions not working
- Verify `currentUserRole` is set correctly
- Check that `memberService.getProjectMembers()` returns correct roles
- Ensure `ProjectRole` enum values match backend

### Dropdown not showing
- Check if `canAssign()` returns true
- Verify `getAvailableUsers()` has members
- Check z-index CSS if dropdown is hidden behind other elements

## Future Enhancements

- [ ] Bulk assign/unassign
- [ ] Search members in dropdown
- [ ] Assignment history/audit log
- [ ] Notification on assignment
- [ ] Assignment templates
