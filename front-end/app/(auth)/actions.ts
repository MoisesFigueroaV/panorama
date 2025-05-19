import { cookies } from 'next/headers';

export async function login(formData: FormData) {
  'use server';
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password }),
    });

    if (!response.ok) {
      throw new Error('Invalid credentials');
    }

    const { token } = await response.json();
    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return { success: true };
  } catch (error) {
    return { error: 'Invalid credentials' };
  }
}

export async function register(formData: FormData) {
  'use server';
  
  const email = formData.get('email') as string;
  const password = formData.get('password') as string;
  const name = formData.get('name') as string;
  
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_BACKEND_URL}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ email, password, name }),
    });

    if (!response.ok) {
      throw new Error('Registration failed');
    }

    const { token } = await response.json();
    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
    });

    return { success: true };
  } catch (error) {
    return { error: 'Registration failed' };
  }
}

export async function logout() {
  'use server';
  
  cookies().delete('token');
  return { success: true };
}
