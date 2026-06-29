<?php

namespace App\Auth;

use Firebase\JWT\JWT;
use Firebase\JWT\Key;

/**
 * JWT helper — encodes and decodes tokens used by the API.
 */
final class JwtHelper
{
    private const ALGO = 'HS256';
    private const TTL  = 86400; // 24 hours

    public function __construct(private string $secret) {}

    /**
     * Create a signed JWT for the given user data.
     */
    public function encode(array $user): string
    {
        $payload = [
            'id'    => $user['id'],
            'email' => $user['email'],
            'role'  => $user['role'],
            'name'  => $user['name'],
            'iat'   => time(),
            'exp'   => time() + self::TTL,
        ];

        return JWT::encode($payload, $this->secret, self::ALGO);
    }

    /**
     * Decode and verify a JWT string.
     * Returns the payload array, or throws on failure.
     */
    public function decode(string $token): array
    {
        $decoded = JWT::decode($token, new Key($this->secret, self::ALGO));
        return (array) $decoded;
    }

    /**
     * Extract the Bearer token from an Authorization header value.
     * Returns the raw token string or null if not present.
     */
    public static function extractBearer(string $header): ?string
    {
        if (preg_match('/^Bearer\s+(\S+)$/i', $header, $m)) {
            return $m[1];
        }
        return null;
    }
}
