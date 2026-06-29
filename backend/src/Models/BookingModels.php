<?php

namespace App\Models;

use PDO;

class BookingModels
{
    public function __construct(private PDO $pdo) {}

    public function create(array $data): int
    {
        $stmt = $this->pdo->prepare(
            'INSERT INTO Booking (learner_id, tutor_id, skill_id, schedule_time, status, price)
             VALUES (:learner_id, :tutor_id, :skill_id, :schedule_time, :status, :price)'
        );
        $stmt->execute([
            ':learner_id'    => $data['learner_id'],
            ':tutor_id'      => $data['tutor_id'],
            ':skill_id'      => $data['skill_id'],
            ':schedule_time' => $data['schedule_time'],
            ':status'        => $data['status'] ?? 'pending',
            ':price'         => $data['price']   ?? 0,
        ]);
        return (int) $this->pdo->lastInsertId();
    }

    public function findByUserId(int $userId, string $role = 'learner'): array
    {
        if ($role === 'tutor') {
            $sql = '
                SELECT
                    b.*,
                    u.name  AS counterpart_name,
                    u.email AS counterpart_email,
                    s.name  AS skill_name
                FROM Booking b
                JOIN User  u ON u.id = b.learner_id
                JOIN Skill s ON s.id = b.skill_id
                WHERE b.tutor_id = ?
                ORDER BY b.schedule_time DESC
            ';
        } elseif ($role === 'admin') {
            $sql = '
                SELECT
                    b.*,
                    t.name  AS tutor_name,
                    l.name  AS learner_name,
                    s.name  AS skill_name,
                    t.name  AS counterpart_name
                FROM Booking b
                JOIN User  t ON t.id = b.tutor_id
                JOIN User  l ON l.id = b.learner_id
                JOIN Skill s ON s.id = b.skill_id
                ORDER BY b.schedule_time DESC
            ';
            $stmt = $this->pdo->prepare($sql);
            $stmt->execute();
            return $stmt->fetchAll();
        } else {
            $sql = '
                SELECT
                    b.*,
                    u.name  AS counterpart_name,
                    u.email AS counterpart_email,
                    u.faculty,
                    s.name  AS skill_name
                FROM Booking b
                JOIN User  u ON u.id = b.tutor_id
                JOIN Skill s ON s.id = b.skill_id
                WHERE b.learner_id = ?
                ORDER BY b.schedule_time DESC
            ';
        }

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([$userId]);
        return $stmt->fetchAll();
    }

    public function updateStatus(int $id, string $status): bool
    {
        $stmt = $this->pdo->prepare('UPDATE Booking SET status = ? WHERE id = ?');
        return $stmt->execute([$status, $id]);
    }

    public function delete(int $id): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM Booking WHERE id = ?');
        return $stmt->execute([$id]);
    }

    public function findById(int $id): ?array
    {
        $stmt = $this->pdo->prepare(
            'SELECT b.*, s.name AS skill_name
               FROM Booking b
               JOIN Skill s ON s.id = b.skill_id
              WHERE b.id = ? LIMIT 1'
        );
        $stmt->execute([$id]);
        $row = $stmt->fetch();
        return $row ?: null;
    }
}
