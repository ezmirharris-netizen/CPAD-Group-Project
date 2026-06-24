<?php
namespace App\Models;
use PDO;

final class UserModels
{
    //used for creating objects
    //private PDO $pdo to store connection inside the class
    public function __construct(private PDO $pdo)
    {
    }

    //to return all the user from database
    public function all(string $q = '', int $limit = 0): array
    {
        $sql = 'SELECT * FROM User'; //change the placeholder to the table name
        $args = []; // to store value to be inserted into prepared statement
        if ($q !== '') {
            $sql .= ' WHERE name LIKE :q OR email LIKE :q';
            $args[':q'] = '%' . $q . '%'; //$q will be replaced with the search value
        }
        $sql .= ' ORDER BY id ASC';
        //limit the rows to be returned
        if ($limit > 0)
            $sql .= ' LIMIT ' . max(1, $limit);
        $stmt = $this->pdo->prepare($sql); //creates prepared statement to ensure security
        $stmt->execute($args);
        return $stmt->fetchAll();
    }

    //find record using ID
    public function find(int $id): ?array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM User WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch();//fetch the matched one row
        return $row === false ? null : $row; //return null if not found
    }

    //function to create new user
    public function create(array $b): int
    {
        $sql = 'INSERT INTO User (name, email, faculty, photo_url, bio)
        VALUES (:name, :email, :faculty, :photo_url, :bio)';
        $this->pdo->prepare($sql)->execute([
            ':name' => trim($b['name']),
            ':email' => trim($b['email']),
            ':faculty' => trim($b['faculty']),
            ':photo_url' => trim($b['photo_url']),
            ':bio' => trim($b['bio'] ?? 'Empty Bio'),
        ]);
        return (int) $this->pdo->lastInsertId();
    }

    //to update user
    public function update(int $id, array $b): int
    {
        $sets = [];//Store the field to be updated
        $args = [':id' => $id];//Store the value for SQL parameters
        foreach (['name', 'email', 'faculty', 'photo_url', 'bio'] as $f) {
            //check field if exist
            if (array_key_exists($f, $b)) {
                $sets[] = "$f=:$f";
                $args[":$f"] = trim($b[$f]);//store the updated value
            }
        }

        //function to validate year
        if (array_key_exists('year', $b)) {
            $sets[] = 'year=:year';
            $args[':year'] =
                (int) $b['year'];
        }
        if (!$sets)
            return 0;
        $sql = 'UPDATE User SET ' . implode(',', $sets) . ' WHERE id=:id';
        /* implode to convert the query to [],[]
        *example: 'name=:name','email=:email'
        */
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($args);
        return $stmt->rowCount();
    }

    //delete user function
    public function delete(int $id): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM User WHERE id = :id');
        $stmt->execute([':id' => $id]);
        return $stmt->rowCount() === 1;
    }

    //find the user by email for log in purposes
    public function findByEmail(string $email): ?array{
        $stmt = $this->pdo->prepare('SELECT id, name, email, password_hash FROM User WHERE email = :email');
        $stmt->execute([':email'=> mb_strtolower(trim($email))]);
        $row = $stmt->fetch();
        return $row === false ? null : $row;
    }
}
