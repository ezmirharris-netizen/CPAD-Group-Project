<?php

namespace App\Config;

use PDO;
use PDOException;

final class Database
{
    private static ?PDO $pdo = null;

    public static function get(): PDO
    {
        if (self::$pdo) return self::$pdo;

        $host     = $_ENV['PGHOST']     ?? getenv('PGHOST')     ?? '127.0.0.1';
        $port     = $_ENV['PGPORT']     ?? getenv('PGPORT')     ?? '5432';
        $dbname   = $_ENV['PGDATABASE'] ?? getenv('PGDATABASE') ?? 'postgres';
        $user     = $_ENV['PGUSER']     ?? getenv('PGUSER')     ?? 'postgres';
        $password = $_ENV['PGPASSWORD'] ?? getenv('PGPASSWORD') ?? '';

        $dsn = "pgsql:host={$host};port={$port};dbname={$dbname}";

        try {
            self::$pdo = new PDO($dsn, $user, $password, [
                PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES   => false,
            ]);
        } catch (PDOException $e) {
            error_log('[DB] ' . $e->getMessage());
            throw new \RuntimeException('Database connection failed', 500, $e);
        }

        return self::$pdo;
    }
}
