<?php
namespace App\Models;
use PDO;

final class SkillModels
{
    //used for creating objects
    //private PDO $pdo to store connection inside the class
    public function __construct(private PDO $pdo)
    {
    }

    //find record using ID
    public function find(int $id): array
    {
        $stmt = $this->pdo->prepare('SELECT * FROM Skill WHERE id = :id');
        $stmt->execute([':id' => $id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);//fetch the matched one row
        return $row === false ? null : $row; //return null if not found
    }

    //function to create new skill
    public function create(array $b): int
    {
        $sql = 'INSERT INTO Skill (name, category)
        VALUES (:name, :category)';
        $this->pdo->prepare($sql)->execute([
            ':name' => trim($b['name']),
            ':category' => trim($b['category']),
        ]);
        return (int) $this->pdo->lastInsertId();
    }

    //to update skills
    public function update(int $id, array $b): int
    {
        $sets = [];
        $args = [':id' => $id];
        foreach(['name', 'category'] as $f) {
            //check field if exist
            if(array_key_exists($f, $b)){
                $sets[] = "$f=:$f";
                $args[":$f"] = trim($b[$f]);//store the updated value
            }
        }

        if(empty($sets)){
            return 0;
        }

        $sql = 'UPDATE Skill SET ' . implode(', ', $sets) . ' WHERE id = :id';
        $stmt = $this->pdo->prepare($sql);
        $stmt->execute($args);

        return $stmt->rowCount();
    }

    public function delete(int $id): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM Skill WHERE id = :id');
        $stmt->execute(['id' => $id]);
        return $stmt->rowCount() === 1;
    }
}
