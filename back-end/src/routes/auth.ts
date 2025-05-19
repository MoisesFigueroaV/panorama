import { Hono } from 'hono';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { supabase } from '../lib/supabase';

dotenv.config();

const auth = new Hono()
  .route('/', new Hono()
    .post(async (c) => {
      const { email, password } = await c.req.json();
      
      const { data: user, error } = await supabase
        .from('users')
        .select('*')
        .eq('email', email)
        .single();

      if (error || !user || user.password !== password) {
        return c.json({ error: 'Invalid credentials' }, 401);
      }

      const token = jwt.sign({
        id: user.id,
        email: user.email,
        role: user.role
      }, process.env.JWT_SECRET!, {
        expiresIn: '24h',
        algorithm: 'HS256'
      });

      return c.json({ token });
    })
  )
  .route('/register', new Hono()
    .post(async (c) => {
      const { email, password, name } = await c.req.json();
      
      if (!email || !password || !name) {
        return c.json({ error: 'All fields are required' }, 400);
      }

      const { data: existingUser, error: existingError } = await supabase
        .from('users')
        .select('id')
        .eq('email', email)
        .single();

      if (existingError) {
        return c.json({ error: 'Error checking user existence' }, 500);
      }

      if (existingUser) {
        return c.json({ error: 'Email already registered' }, 400);
      }

      const { data: userData, error: insertError } = await supabase
        .from('users')
        .insert({
          email,
          password,
          name,
          role: 'user',
          created_at: new Date()
        })
        .select()
        .single();

      if (insertError) {
        return c.json({ error: 'Error creating user' }, 500);
      }

      const token = jwt.sign({
        id: userData.id,
        email,
        role: 'user'
      }, process.env.JWT_SECRET!, { 
        expiresIn: '24h',
        algorithm: 'HS256'
      });

      return c.json({ token });
    })
  );

export default auth;
