<?php
namespace App\Models;
use PDO;

final class BookingModels
{
    public function __construct(private PDO $pdo)
    {
    }

    //find booking by id
    public function findById(int $userId, string $role = 'learner'): array
    {
        $column = ($role === 'tutor') ? 'b.tutor_id' : 'b.learner_id';
        $sql = "SELECT b.booking_id, b.schedule_time, b.duration, b.status, b.total, u.name AS counterpart_name, u.photo_url AS counterpart_photo, s.name AS skill_name
        FROM Booking b
        INNER JOIN User u ON (case when :role1 = 'tutor' then b.learner_id = u.id else b.tutor_id = u.id end)
        INNER JOIN Skill s ON b.skill_id = s.id
        WHERE $column = :user_id
        ORDER BY b.schedule_time DESC";

        $stmt = $this->pdo->prepare($sql); //creates prepared statement to ensure security
        $stmt->execute([':role1' => $role, ':user_id' => $userId]);
        return $stmt->fetchAll();
    }

    //find booking by status of booking
    public function findByStatus(int $userId, string $role, string $status): array
    {
        $column = ($role === 'tutor') ? 'b.tutor_id' : 'b.learner_id';

        $sql = "SELECT b.*, s.name AS skill_name
            FROM Booking b
            INNER JOIN Skill s ON b.skill_id = s.id
            WHERE $column = :user_id AND b.status = :status
            ORDER BY b.schedule_time ASC";

        $stmt = $this->pdo->prepare($sql);
        $stmt->execute([
            ':user_id' => $userId,
            ':status' => $status
        ]);

        return $stmt->fetchAll();
    }

    //create booking
    public function create(array $b): int
    {
        $sql = 'INSERT INTO Booking (learner_id, tutor_id, skill_id, schedule_time, status)
        VALUES (:learner_id, :tutor_id, :skill_id, :schedule_time, :status)';
        $this->pdo->prepare($sql)->execute([
            ':learner_id' => (int) $b['learner_id'],
            ':tutor_id' => (int) $b['tutor_id'],
            ':skill_id' => (int) $b['skill_id'],
            ':schedule_time' => $b['schedule_time'],
            ':status' => trim($b['status'] ?? 'Pending')
        ]);
        return (int) $this->pdo->lastInsertId();
    }

    //delete user function
    public function delete(int $bookingId): bool
    {
        $stmt = $this->pdo->prepare('DELETE FROM Booking WHERE booking_id = :booking_id');
        $stmt->execute([':booking_id' => $bookingId]);
        return $stmt->rowCount() === 1;
    }
}
