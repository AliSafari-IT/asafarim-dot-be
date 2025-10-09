# Update resumeApi.ts to use API helpers

Replace all fetch calls with the new API helpers:

## fetchResumes

```typescript
export const fetchResumes = async (myResumes: boolean = false): Promise<ResumeDto[]> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  const params = new URLSearchParams();
  if (myResumes) params.append('myResumes', 'true');
  const path = params.toString() ? `/resumes?${params}` : '/resumes';
  return apiGet<ResumeDto[]>(path, {
    headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
  });
};
```

## fetchResumeById

```typescript
export const fetchResumeById = async (id: string): Promise<ResumeDetailDto> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  return apiGet<ResumeDetailDto>(`/resumes/${id}`, {
    headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
  });
};
```

## createResume

```typescript
export const createResume = async (request: CreateResumeRequest): Promise<ResumeDto> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  return apiPost<ResumeDto>('/resumes', {
    headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
    body: JSON.stringify(request),
  });
};
```

## updateResume

```typescript
export const updateResume = async (id: string, request: UpdateResumeRequest): Promise<void> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  await apiPut<void>(`/resumes/${id}`, {
    headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
    body: JSON.stringify(request),
  });
};
```

## deleteResume

```typescript
export const deleteResume = async (id: string): Promise<void> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  await apiDelete<void>(`/resumes/${id}`, {
    headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
  });
};
```

## publishResume

```typescript
export const publishResume = async (id: string, request: PublishResumeRequest): Promise<PublishResumeResponse> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  return apiPost<PublishResumeResponse>(`/resumes/${id}/publish`, {
    headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
    body: JSON.stringify(request),
  });
};
```

## unpublishResume

```typescript
export const unpublishResume = async (id: string): Promise<void> => {
  const token = getCookie('atk') || localStorage.getItem('auth_token');
  await apiPost<void>(`/resumes/${id}/unpublish`, {
    headers: { ...(token && { 'Authorization': `Bearer ${token}` }) },
  });
};
```

## fetchPublicResumeBySlug (no auth needed)

```typescript
export const fetchPublicResumeBySlug = async (slug: string): Promise<PublicResumeDto> => {
  return apiGet<PublicResumeDto>(`/resumes/public/${slug}`);
};
```

**Key changes:**

- Use `/resumes` path instead of `${CORE_API_BASE}/resumes`
- Remove `credentials: 'include'` (handled by apiGet/apiPost/etc)
- Remove `Content-Type` header (handled by API functions)
- Use proper TypeScript generics
