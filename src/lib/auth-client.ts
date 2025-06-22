export interface JWTPayload {
  userId: string;
  email: string;
  role: 'ADMIN' | 'EMPLOYEE' | 'MANAGER';
  companyId: string;
  onboardingCompleted: boolean;
}

// Client-side version of getCurrentUser
export async function getCurrentUserClient(): Promise<JWTPayload | null> {
  try {
    const response = await fetch('/api/auth/me');
    if (response.ok) {
      const data = await response.json();
      return data.user;
    }
    return null;
  } catch {
    return null;
  }
} 