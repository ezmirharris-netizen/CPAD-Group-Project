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

        $host     = $_ENV['DB_HOST']    ?? getenv('DB_HOST')    ?? '127.0.0.1';
        $port     = $_ENV['DB_PORT']    ?? getenv('DB_PORT')    ?? '3306';
        $dbname   = $_ENV['DB_NAME']    ?? getenv('DB_NAME')    ?? 'SkillSwap';
        $user     = $_ENV['DB_USER']    ?? getenv('DB_USER')    ?? 'root';
        $password = $_ENV['DB_PASS']    ?? getenv('DB_PASS')    ?? '';
        $charset  = $_ENV['DB_CHARSET'] ?? getenv('DB_CHARSET') ?? 'utf8mb4';

        $dsn = "mysql:host={$host};port={$port};dbname={$dbname};charset={$charset}";

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
