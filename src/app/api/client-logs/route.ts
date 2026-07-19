import { NextResponse, type NextRequest } from 'next/server'

import { toClientLogTag } from '@/config/client-log-registry'
import {
  truncateClientLogContext,
  truncateClientLogMessage,
} from '@/app/api/client-logs/_lib/cap-client-log-payload'
import { clientLogRelayBodySchema } from '@/app/api/client-logs/_lib/client-log-relay-schema'
import { isSameOriginRelayRequest } from '@/app/api/client-logs/_lib/is-same-origin-relay-request'
import { createClient } from '@/supabase/server'
import { appLog } from '@/utils/app-logger'
import { normalizeLogContext } from '@/utils/persist-app-log'

export async function POST(request: NextRequest) {
  if (!isSameOriginRelayRequest(request)) {
    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Forbidden',
          code: 'FORBIDDEN',
          kind: 'operational',
        },
      },
      { status: 403 },
    )
  }

  try {
    let json: unknown

    try {
      json = await request.json()
    } catch {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid request body',
            code: 'VALIDATION_ERROR',
            kind: 'operational',
          },
        },
        { status: 400 },
      )
    }

    const parsed = clientLogRelayBodySchema.safeParse(json)

    if (!parsed.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            message: 'Invalid request body',
            code: 'VALIDATION_ERROR',
            kind: 'operational',
          },
        },
        { status: 400 },
      )
    }

    const { key, level, message, context } = parsed.data
    const tag = toClientLogTag(key)
    const cappedMessage = truncateClientLogMessage(message)
    const cappedContext = context
      ? truncateClientLogContext(context)
      : undefined

    let userId: string | undefined

    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      userId = user?.id
    } catch {
      // Session probe is best-effort — absence never blocks the relay.
    }

    const contextInput =
      cappedContext || userId
        ? {
            ...cappedContext,
            ...(userId ? { userId } : {}),
          }
        : undefined

    const relayContext = normalizeLogContext(contextInput)

    appLog[level](tag, cappedMessage, relayContext)

    return NextResponse.json({ success: true, data: null }, { status: 202 })
  } catch (error) {
    appLog.error('api-client-logs', 'Relay failed', error)

    return NextResponse.json(
      {
        success: false,
        error: {
          message: 'Something went wrong',
          code: 'INTERNAL_ERROR',
          kind: 'fault',
        },
      },
      { status: 500 },
    )
  }
}
