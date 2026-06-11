<?php

namespace App\Config;

use PDO;
use PDOException;

final class Database{
    //$pdo is a PHP Database Object variable that starts as null
    private static ?PDO $pdo = null;

    public static function get() : PDO{
        //the if statement checks if connection exist and will immediately return self::$pdo(referring to the $pdo) if one does
        if(self::$pdo) return self::$pdo;

        //data source name to tell PDO where the database is , what database and what format to use
        //the ?? means that if there is no environment set, then use the environment already set
        $dsn = sprintf(
            'mysql:host=%s;
            port=%s;
            dbname=%s;
            charset=%s',
            //$_ENV stores the environment variables
            $_ENV['DB_HOST'] ??'127.0.0.1',
            $_ENV['DB_PORT'] ?? '3306',
            $_ENV['DB_NAME'] ?? '<DB placeholder>', //replace the DB placeholder with the actual db name
            $_ENV['DB_CHARSET'] ?? 'utf8mb4'
        );
        try{
            self::$pdo = new PDO($dsn, $_ENV['DB_USER'] ?? 'root', $_ENV['DB_PASS'] ?? '', [
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, //throw error exception if something happened
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC, //ensure that the fetched data is in JSON form
                PDO::ATTR_EMULATE_PREPARES => false,//uses the default SQL query
            ]);
        } catch(PDOException $e) {
            error_log('[DB]' . $e->getMessage());
            throw new \RuntimeException('Database connection failed', 500, $e);
        }
        return self::$pdo;
    }
}
