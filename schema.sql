-- Script de Criação de Modelagem para o Fórum (Fase 1)
-- Execute este script no SQL Editor do seu console Supabase para preparar a tabela.

-- 1. Criar a tabela 'duvidas'
create table if not exists public.duvidas (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  user_name text not null,
  title text not null,
  description text not null,
  category text not null,
  is_public boolean default false not null,
  status text default 'pending'::text not null, -- pending | answered | resolved
  answer_text text,
  answered_by uuid references auth.users,
  answered_at timestamptz,
  created_at timestamptz default now() not null
);

-- 2. Ativar Row Level Security (RLS)
alter table public.duvidas enable row level security;

-- 3. Política: Acesso total de leitura para os administradores
create policy "Admins can view all questions"
  on public.duvidas for select
  using (
    auth.jwt() ->> 'email' = 'samuel@amplifyugc.co'
  );

-- 4. Política: Alunos podem ver dúvidas que sejam públicas OU as criadas por eles próprios
create policy "Students can view public or own questions"
  on public.duvidas for select
  using (
    is_public = true or auth.uid() = user_id
  );

-- 5. Política: Qualquer usuário autenticado (mentorados) pode criar dúvidas vinculando o seu próprio user_id
create policy "Students can insert questions"
  on public.duvidas for insert
  with check (
    auth.uid() = user_id
  );

-- 6. Política: Apenas o administrador (Matheus) pode atualizar ou responder as dúvidas
create policy "Admins can update questions"
  on public.duvidas for update
  using (
    auth.jwt() ->> 'email' = 'samuel@amplifyugc.co'
  );
