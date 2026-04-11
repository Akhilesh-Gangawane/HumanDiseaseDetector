import NextAuth, { NextAuthOptions } from 'next-auth'
import GoogleProvider from 'next-auth/providers/google'
import CredentialsProvider from 'next-auth/providers/credentials'
import bcrypt from 'bcryptjs'
import { supabaseServer } from '@/lib/supabaseServer'

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.events',
          access_type: 'offline',
          prompt: 'consent',
        },
      },
    }),
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
        name: { label: 'Name', type: 'text' },
        role: { label: 'Role', type: 'text' },
        isSignUp: { label: 'Is Sign Up', type: 'text' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null

        const email = credentials.email.toLowerCase().trim()
        const role = (credentials.role === 'doctor' ? 'doctor' : 'patient') as 'doctor' | 'patient'

        const { data: existing } = await supabaseServer
          .from('users')
          .select('id, email, full_name, avatar_url, role, password_hash')
          .eq('email', email)
          .single()

        if (credentials.isSignUp === 'true') {
          // Sign Up flow
          if (existing) {
            throw new Error('An account with this email already exists. Please sign in.')
          }

          // Securely hash password with bcrypt (12 rounds)
          const password_hash = await bcrypt.hash(credentials.password, 12)

          const { data: newUser, error } = await supabaseServer
            .from('users')
            .insert({
              email,
              full_name: credentials.name ?? email.split('@')[0],
              role,
              password_hash,
            })
            .select('id, email, full_name, avatar_url, role')
            .single()

          if (error || !newUser) throw new Error('Failed to create account. Please try again.')

          // Create role-specific record
          if (role === 'patient') {
            const nameParts = (newUser.full_name ?? '').split(' ')
            await supabaseServer.from('patients').insert({
              user_id: newUser.id,
              first_name: nameParts[0] ?? '',
              last_name: nameParts.slice(1).join(' ') ?? '',
            })
          } else {
            await supabaseServer.from('doctors').insert({ user_id: newUser.id })
          }

          return { id: newUser.id, email: newUser.email, name: newUser.full_name, role: newUser.role }
        } else {
          // Sign In flow
          if (!existing) throw new Error('No account found with this email. Please sign up first.')

          const storedHash = existing.password_hash
          if (!storedHash) {
            throw new Error('This account uses Google sign-in. Please use the Google button.')
          }

          // Verify with bcrypt — also handles legacy base64 hashes for migration
          let passwordValid = await bcrypt.compare(credentials.password, storedHash)

          // Legacy migration: if stored hash is base64 (not a bcrypt hash), compare and re-hash
          if (!passwordValid && !storedHash.startsWith('$2')) {
            const legacyHash = Buffer.from(credentials.password).toString('base64')
            if (legacyHash === storedHash) {
              passwordValid = true
              // Upgrade to bcrypt on next login
              const newHash = await bcrypt.hash(credentials.password, 12)
              await supabaseServer
                .from('users')
                .update({ password_hash: newHash })
                .eq('id', existing.id)
            }
          }

          if (!passwordValid) throw new Error('Incorrect password. Please try again.')

          return {
            id: existing.id,
            email: existing.email,
            name: existing.full_name,
            image: existing.avatar_url,
            role: existing.role,
          }
        }
      },
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async signIn({ user, account }) {
      if (account?.provider === 'google') {
        if (!user.email) return true
        const { data: existing } = await supabaseServer
          .from('users')
          .select('id, role')
          .eq('email', user.email)
          .single()

        if (!existing) {
          const role = 'patient'
          const { data: newUser } = await supabaseServer
            .from('users')
            .insert({
              email: user.email,
              full_name: user.name ?? null,
              avatar_url: user.image ?? null,
              role,
            })
            .select('id, role')
            .single()

          if (newUser) {
            const nameParts = (user.name ?? '').split(' ')
            await supabaseServer.from('patients').insert({
              user_id: newUser.id,
              first_name: nameParts[0] ?? '',
              last_name: nameParts.slice(1).join(' ') ?? '',
            })
            // Attach to user so jwt callback picks it up immediately
            ;(user as any).role = role
            ;(user as any).id = newUser.id
          }
        } else {
          await supabaseServer.from('users').update({
            full_name: user.name ?? null,
            avatar_url: user.image ?? null,
          }).eq('id', existing.id)
          // Attach role + id so jwt callback picks them up immediately
          ;(user as any).role = existing.role
          ;(user as any).id = existing.id
        }
      }
      return true
    },
    async jwt({ token, user, account, trigger }) {
      if (user) {
        token.name = user.name ?? token.name
        token.email = user.email ?? token.email
        token.picture = user.image ?? token.picture
        token.role = (user as any).role ?? 'patient'
        token.userId = user.id
      }
      if (account?.access_token) {
        token.access_token = account.access_token
      }
      if (trigger === 'update') {
        const { data } = await supabaseServer
          .from('users')
          .select('role, full_name, avatar_url')
          .eq('email', token.email as string)
          .single()
        if (data) {
          token.role = data.role
          token.name = data.full_name ?? token.name
          token.picture = data.avatar_url ?? token.picture
        }
      }
      return token
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.name = token.name ?? session.user.name
        session.user.email = token.email ?? session.user.email
        session.user.image = (token.picture as string) ?? session.user.image
        ;(session.user as any).role = token.role
        ;(session.user as any).id = token.userId
      }
      ;(session as any).access_token = token.access_token
      return session
    },
  },
  session: { strategy: 'jwt' },
}

const handler = NextAuth(authOptions)

export { handler as GET, handler as POST }
