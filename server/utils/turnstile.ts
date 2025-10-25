/**
 * Cloudflare Turnstile server-side verification
 * Phase 5: Security enhancement
 */

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';

export interface TurnstileVerifyResult {
  success: boolean;
  challenge_ts?: string;
  hostname?: string;
  'error-codes'?: string[];
  action?: string;
  cdata?: string;
}

/**
 * Verify Turnstile token with Cloudflare
 */
export async function verifyTurnstile(token: string, remoteip?: string): Promise<TurnstileVerifyResult> {
  const secretKey = process.env.TURNSTILE_SECRET_KEY;
  
  if (!secretKey) {
    throw new Error('TURNSTILE_SECRET_KEY not configured in environment');
  }
  
  const formData = new URLSearchParams();
  formData.append('secret', secretKey);
  formData.append('response', token);
  if (remoteip) {
    formData.append('remoteip', remoteip);
  }
  
  const response = await fetch(TURNSTILE_VERIFY_URL, {
    method: 'POST',
    body: formData,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    }
  });
  
  if (!response.ok) {
    throw new Error(`Turnstile verification failed: ${response.status} ${response.statusText}`);
  }
  
  const result = await response.json() as TurnstileVerifyResult;
  return result;
}

/**
 * Fastify middleware to require valid Turnstile token
 */
export function requireTurnstile() {
  return async (req: any, reply: any) => {
    const token = req.body?.['cf-turnstile-response'] || req.headers['x-turnstile-token'];
    
    if (!token) {
      reply.code(422);
      return {
        error: 'Validation failed',
        message: 'Turnstile token is required'
      };
    }
    
    try {
      const result = await verifyTurnstile(token, req.ip);
      
      if (!result.success) {
        reply.code(422);
        return {
          error: 'Turnstile verification failed',
          codes: result['error-codes']
        };
      }
      
      // Attach verification result to request for later use
      (req as any).turnstile = result;
    } catch (error) {
      reply.code(500);
      return {
        error: 'Turnstile verification error',
        message: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  };
}
